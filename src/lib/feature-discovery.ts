import { getLocalDateKey } from '@/lib/daily-streak';
import { LOW_READINESS_THRESHOLD } from '@/lib/quest-friction';
import { computeQuestReadiness } from '@/lib/quest-readiness';
import { userQuestToBoardQuest } from '@/lib/quest-board';
import { isQuestNeedsReview, isQuestOnActiveBoard } from '@/lib/quest-lifecycle';
import { isHighRiskQuest } from '@/lib/quest-risk';
import type { PlayerProgress, FeatureDiscoveryKey, FeatureDiscoveryFlags, FeatureDiscoveryState } from '@/types/narrative';

export type { FeatureDiscoveryKey, FeatureDiscoveryFlags, FeatureDiscoveryState } from '@/types/narrative';

export const DISCOVERY_TIER_BY_FEATURE: Record<FeatureDiscoveryKey, number> = {
  focusMode: 1,
  identityVotes: 1,
  starterMove: 2,
  prepStep: 2,
  rewardRitual: 2,
  riskLevel: 3,
  questReadiness: 3,
  frictionReview: 4,
  questChain: 4,
  recurringQuest: 5,
  tomorrowSetup: 5,
  weeklyReview: 6,
  systemsInsight: 6,
  coachTips: 6,
};

export const FEATURE_INTRO_HINTS: Record<FeatureDiscoveryKey, string> = {
  starterMove: 'A tiny first move makes starting easier.',
  prepStep: 'A small prep step reduces friction when you return.',
  rewardRitual: 'A brief reward ritual can close the loop gently.',
  riskLevel: 'Risk level helps match quest size to your capacity.',
  focusMode: 'Focus mode gives one quest a clear starting lane.',
  frictionReview: 'Friction review helps when a quest keeps stalling.',
  questChain: 'Split big quests into smaller linked steps.',
  recurringQuest: 'Recurring quests turn habits into steady routines.',
  tomorrowSetup: 'Prime tomorrow with one prepared first move.',
  weeklyReview: 'Weekly review helps you adjust without judgment.',
  coachTips: 'Contextual tips surface tools at useful moments.',
  identityVotes: 'Each completion is a vote for who you are becoming.',
  questReadiness: 'Readiness shows what might make a quest easier to start.',
  systemsInsight: 'Systems insight connects patterns across your quests.',
};

export const FEATURE_UNLOCK_TEASERS: Record<number, string> = {
  1: 'Unlocks after your first completed quest.',
  2: 'Unlocks after you create a few quests.',
  3: 'Unlocks when a quest feels high-risk or unclear.',
  4: 'Unlocks when a quest needs a lifecycle decision.',
  5: 'Unlocks after you complete quests on multiple days.',
  6: 'Unlocks after about a week of activity.',
};

const ALL_FEATURE_KEYS = Object.keys(DISCOVERY_TIER_BY_FEATURE) as FeatureDiscoveryKey[];

export function createDefaultFeatureDiscoveryState(
  progress?: Pick<PlayerProgress, 'userQuests' | 'activityByDate' | 'completedQuestIdsBySagaId'>,
): FeatureDiscoveryState {
  const guidedDiscoveryEnabled = progress
    ? inferGuidedDiscoveryDefault(progress)
    : true;

  return {
    guidedDiscoveryEnabled,
    showAdvancedTools: false,
    discovered: {},
    introduced: {},
    currentTier: progress ? computeDiscoveryTier(progress as PlayerProgress) : 0,
  };
}

function inferGuidedDiscoveryDefault(
  progress: Pick<PlayerProgress, 'userQuests' | 'activityByDate' | 'completedQuestIdsBySagaId'>,
): boolean {
  if (hasCompletedAnyQuest(progress)) return false;
  if (progress.userQuests.length >= 2) return false;
  if (countQuestCompletionDays(progress) >= 2) return false;
  return true;
}

export function sanitizeFeatureDiscoveryState(
  raw: unknown,
  progress?: PlayerProgress,
): FeatureDiscoveryState {
  const base = createDefaultFeatureDiscoveryState(progress);

  if (!raw || typeof raw !== 'object') return base;

  const record = raw as Record<string, unknown>;
  const guidedDiscoveryEnabled =
    typeof record.guidedDiscoveryEnabled === 'boolean'
      ? record.guidedDiscoveryEnabled
      : base.guidedDiscoveryEnabled;
  const showAdvancedTools =
    typeof record.showAdvancedTools === 'boolean' ? record.showAdvancedTools : false;

  const discovered = sanitizeFeatureFlags(record.discovered);
  const introduced = sanitizeIntroduced(record.introduced);
  const currentTier =
    typeof record.currentTier === 'number' && Number.isFinite(record.currentTier)
      ? Math.max(0, Math.min(6, Math.floor(record.currentTier)))
      : base.currentTier;

  return {
    guidedDiscoveryEnabled,
    showAdvancedTools,
    discovered,
    introduced,
    currentTier,
  };
}

function sanitizeFeatureFlags(raw: unknown): FeatureDiscoveryFlags {
  if (!raw || typeof raw !== 'object') return {};

  const result: FeatureDiscoveryFlags = {};
  for (const key of ALL_FEATURE_KEYS) {
    if ((raw as Record<string, unknown>)[key] === true) {
      result[key] = true;
    }
  }
  return result;
}

function sanitizeIntroduced(raw: unknown): Partial<Record<FeatureDiscoveryKey, string>> {
  if (!raw || typeof raw !== 'object') return {};

  const result: Partial<Record<FeatureDiscoveryKey, string>> = {};
  for (const key of ALL_FEATURE_KEYS) {
    const value = (raw as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.length > 0) {
      result[key] = value;
    }
  }
  return result;
}

export function getFeatureDiscoveryState(progress: PlayerProgress): FeatureDiscoveryState {
  return sanitizeFeatureDiscoveryState(progress.featureDiscoveryState, progress);
}

export function isGuidedFeatureDiscoveryActive(progress: PlayerProgress): boolean {
  const state = getFeatureDiscoveryState(progress);
  return state.guidedDiscoveryEnabled && !state.showAdvancedTools;
}

export function countQuestCompletionDays(
  progress: Pick<PlayerProgress, 'activityByDate'>,
): number {
  return Object.values(progress.activityByDate ?? {}).filter(
    (activity) => (activity?.questsCompleted ?? 0) > 0,
  ).length;
}

export function hasCompletedAnyQuest(
  progress: Pick<PlayerProgress, 'userQuests' | 'completedQuestIdsBySagaId'>,
): boolean {
  if (progress.userQuests.some((quest) => quest.isCompleted)) return true;
  return Object.values(progress.completedQuestIdsBySagaId ?? {}).some(
    (questIds) => questIds.length > 0,
  );
}

function hasHighRiskOrLowReadinessQuest(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): boolean {
  return progress.userQuests.some((quest) => {
    if (quest.isCompleted) return false;
    if (isHighRiskQuest(quest.riskLevel)) return true;

    const readiness = computeQuestReadiness(userQuestToBoardQuest(quest));
    return readiness != null && readiness.score <= LOW_READINESS_THRESHOLD;
  });
}

function hasStaleQuest(progress: PlayerProgress, today: string = getLocalDateKey()): boolean {
  return progress.userQuests.some(
    (quest) => !quest.isCompleted && isQuestNeedsReview(quest, today),
  );
}

export function computeDiscoveryTier(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): number {
  if (countQuestCompletionDays(progress) >= 7) return 6;
  if (countQuestCompletionDays(progress) >= 2) return 5;
  if (hasStaleQuest(progress, today)) return 4;
  if (hasHighRiskOrLowReadinessQuest(progress, today)) return 3;
  if (progress.userQuests.length >= 2) return 2;
  if (hasCompletedAnyQuest(progress)) return 1;
  return 0;
}

function inferDiscoveredFeatures(progress: PlayerProgress): FeatureDiscoveryFlags {
  const discovered: FeatureDiscoveryFlags = {};
  const today = getLocalDateKey();

  if (
    progress.userQuests.some((quest) => Boolean(quest.starterTaskTitle?.trim())) ||
    progress.recurringQuestTemplates.some((template) => Boolean(template.starterTaskTitle?.trim()))
  ) {
    discovered.starterMove = true;
  }

  if (
    progress.userQuests.some((quest) => Boolean(quest.prepStepTitle?.trim())) ||
    Object.values(progress.tomorrowSetupByDate ?? {}).some((entry) =>
      Boolean(entry.tomorrowPrepStepTitle?.trim()),
    )
  ) {
    discovered.prepStep = true;
  }

  if (progress.userQuests.some((quest) => Boolean(quest.afterQuestReward?.trim()))) {
    discovered.rewardRitual = true;
  }

  if (
    progress.userQuests.some(
      (quest) => quest.riskLevel != null && quest.riskLevel !== 'standard',
    ) ||
    progress.recurringQuestTemplates.some(
      (template) => template.riskLevel != null && template.riskLevel !== 'standard',
    )
  ) {
    discovered.riskLevel = true;
  }

  if (
    progress.userQuests.some(
      (quest) =>
        Boolean(quest.focusStartedAt) ||
        Boolean(quest.focusPinned) ||
        progress.lockedFocusQuestIds.includes(quest.id),
    ) ||
    Boolean(progress.focusLockedDate)
  ) {
    discovered.focusMode = true;
  }

  if (
    progress.userQuests.some((quest) => (quest.frictionReviews?.length ?? 0) > 0) ||
    progress.userQuests.some((quest) => (quest.frictionReviewedAt?.length ?? 0) > 0)
  ) {
    discovered.frictionReview = true;
  }

  if (
    progress.userQuests.some(
      (quest) => quest.isQuestChainParent === true || quest.parentQuestId != null,
    )
  ) {
    discovered.questChain = true;
  }

  if (progress.recurringQuestTemplates.length > 0) {
    discovered.recurringQuest = true;
  }

  if (Object.keys(progress.tomorrowSetupByDate ?? {}).length > 0) {
    discovered.tomorrowSetup = true;
  }

  if (Object.keys(progress.weeklyReviewByWeek ?? {}).length > 0) {
    discovered.weeklyReview = true;
  }

  if (Object.keys(progress.dismissedCoachTipsByDate ?? {}).length > 0) {
    discovered.coachTips = true;
  }

  if (Object.values(progress.identityVotes ?? {}).some((count) => (count ?? 0) > 0)) {
    discovered.identityVotes = true;
  }

  if (
    progress.userQuests.some(
      (quest) =>
        Boolean(quest.implementationIntention?.trim()) ||
        Boolean(quest.readinessUpdatedAt?.length) ||
        Boolean(quest.improvedAt?.length),
    )
  ) {
    discovered.questReadiness = true;
  }

  if (
    progress.userQuests.length >= 3 &&
    progress.userQuests.some((quest) => !quest.isCompleted && isQuestOnActiveBoard(quest, today))
  ) {
    discovered.systemsInsight = true;
  }

  return discovered;
}

function introduceFeaturesForTier(
  tier: number,
  discovered: FeatureDiscoveryFlags,
  introduced: Partial<Record<FeatureDiscoveryKey, string>>,
  now: string,
): Partial<Record<FeatureDiscoveryKey, string>> {
  const next = { ...introduced };

  for (const feature of ALL_FEATURE_KEYS) {
    if (DISCOVERY_TIER_BY_FEATURE[feature] > tier) continue;
    if (discovered[feature]) {
      delete next[feature];
      continue;
    }
    if (!next[feature]) {
      next[feature] = now;
    }
  }

  return next;
}

export function refreshFeatureDiscoveryState(progress: PlayerProgress): PlayerProgress {
  const previous = getFeatureDiscoveryState(progress);
  const tier = computeDiscoveryTier(progress);
  const inferredDiscovered = {
    ...previous.discovered,
    ...inferDiscoveredFeatures(progress),
  };
  const now = new Date().toISOString();
  let introduced = introduceFeaturesForTier(
    tier,
    inferredDiscovered,
    previous.introduced,
    now,
  );

  for (const feature of ALL_FEATURE_KEYS) {
    if (inferredDiscovered[feature]) {
      delete introduced[feature];
    }
  }

  return {
    ...progress,
    featureDiscoveryState: {
      ...previous,
      discovered: inferredDiscovered,
      introduced,
      currentTier: tier,
    },
  };
}

export function isFeatureUnlocked(
  progress: PlayerProgress,
  feature: FeatureDiscoveryKey,
): boolean {
  const state = getFeatureDiscoveryState(progress);
  if (!state.guidedDiscoveryEnabled || state.showAdvancedTools) return true;
  return computeDiscoveryTier(progress) >= DISCOVERY_TIER_BY_FEATURE[feature];
}

export function isFeatureNewlyIntroduced(
  progress: PlayerProgress,
  feature: FeatureDiscoveryKey,
): boolean {
  const state = getFeatureDiscoveryState(progress);
  if (!state.guidedDiscoveryEnabled || state.showAdvancedTools) return false;
  if (state.discovered[feature]) return false;
  return Boolean(state.introduced[feature]);
}

export function shouldTryFeature(
  progress: PlayerProgress,
  feature: FeatureDiscoveryKey,
): boolean {
  return isFeatureNewlyIntroduced(progress, feature);
}

export function getFeatureIntroHint(feature: FeatureDiscoveryKey): string {
  return FEATURE_INTRO_HINTS[feature];
}

export function getFeatureUnlockTeaser(feature: FeatureDiscoveryKey): string {
  return FEATURE_UNLOCK_TEASERS[DISCOVERY_TIER_BY_FEATURE[feature]] ?? '';
}

export function markFeatureDiscovered(
  progress: PlayerProgress,
  feature: FeatureDiscoveryKey,
): PlayerProgress {
  const state = getFeatureDiscoveryState(progress);
  if (state.discovered[feature]) return progress;

  const introduced = { ...state.introduced };
  delete introduced[feature];

  return {
    ...progress,
    featureDiscoveryState: {
      ...state,
      discovered: {
        ...state.discovered,
        [feature]: true,
      },
      introduced,
    },
  };
}

export function setGuidedFeatureDiscoveryEnabled(
  progress: PlayerProgress,
  enabled: boolean,
): PlayerProgress {
  return refreshFeatureDiscoveryState({
    ...progress,
    featureDiscoveryState: {
      ...getFeatureDiscoveryState(progress),
      guidedDiscoveryEnabled: enabled,
    },
  });
}

export function setShowAdvancedFeatureTools(
  progress: PlayerProgress,
  enabled: boolean,
): PlayerProgress {
  return {
    ...progress,
    featureDiscoveryState: {
      ...getFeatureDiscoveryState(progress),
      showAdvancedTools: enabled,
    },
  };
}

export function getNewlyIntroducedFeaturesInAddQuest(
  progress: PlayerProgress,
): FeatureDiscoveryKey[] {
  const candidates: FeatureDiscoveryKey[] = [
    'starterMove',
    'prepStep',
    'rewardRitual',
    'riskLevel',
    'focusMode',
  ];

  return candidates.filter((feature) => isFeatureNewlyIntroduced(progress, feature));
}

export function getAddQuestBehaviorToolsHint(progress: PlayerProgress): string {
  const newlyIntroduced = getNewlyIntroducedFeaturesInAddQuest(progress);
  if (newlyIntroduced.length > 0) {
    return getFeatureIntroHint(newlyIntroduced[0]);
  }
  if (!isFeatureUnlocked(progress, 'starterMove')) {
    return 'Unlocks after you create a few quests.';
  }
  return 'Starter, prep, risk, and rewards — expand if helpful.';
}
