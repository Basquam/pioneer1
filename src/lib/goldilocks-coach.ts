import { getLastLocalDateKeys } from '@/lib/quest-calendar';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isUserQuestArchived, LOW_READINESS_THRESHOLD } from '@/lib/quest-friction';
import { isQuestChainSplittable } from '@/lib/quest-chain';
import { computeQuestReadiness, hasStarterMove } from '@/lib/quest-readiness';
import { isHighRiskQuest, resolveQuestRiskLevel } from '@/lib/quest-risk';
import { userQuestToBoardQuest } from '@/lib/quest-board';
import type { PlayerProgress, QuestRiskLevel, QuestStyleProfile, UserQuest } from '@/types/narrative';

export const GOLDILOCKS_COACH_WINDOW_DAYS = 14;

const UNIVERSE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Choose a trail that tests you, not one that breaks the horse.',
  neuronet: 'Tune the operation load before the signal collapses.',
  'neon-ashes': 'Follow a lead sharp enough to matter, not sharp enough to bleed you dry.',
};

export type GoldilocksCoachAction =
  | 'split-high-risk'
  | 'add-starter-move'
  | 'add-standard-quest'
  | 'add-high-risk-quest'
  | 'view-quest-board';

export type GoldilocksRecommendation = {
  id: string;
  title: string;
  insight: string;
  suggestedAction: string;
  action?: GoldilocksCoachAction;
  targetQuestId?: string;
  priority: number;
};

export type GoldilocksCoachSnapshot = {
  windowDateKeys: string[];
  recentUserQuests: UserQuest[];
  activeIncompleteQuests: UserQuest[];
  completedInWindow: UserQuest[];
  createdInWindow: UserQuest[];
  highRiskIncomplete: UserQuest[];
  lowReadinessIncomplete: UserQuest[];
  completedByRisk: Record<QuestRiskLevel, number>;
  abandonedHighRisk: UserQuest[];
};

function parseIsoDateKey(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return getLocalDateKey(date);
}

function getActiveUserQuests(userQuests: UserQuest[]): UserQuest[] {
  return userQuests.filter((quest) => !quest.isCompleted && !isUserQuestArchived(quest));
}

function isRecentUserQuest(
  quest: UserQuest,
  windowKeySet: Set<string>,
  completedInWindowIds: Set<string>,
): boolean {
  return (
    windowKeySet.has(quest.createdOnDate ?? '') ||
    completedInWindowIds.has(quest.id) ||
    (!quest.isCompleted && !isUserQuestArchived(quest))
  );
}

function getReadinessScore(quest: UserQuest): number | null {
  const readiness = computeQuestReadiness(userQuestToBoardQuest(quest));
  return readiness?.score ?? null;
}

function isLowReadinessQuest(quest: UserQuest): boolean {
  const score = getReadinessScore(quest);
  return score != null && score <= LOW_READINESS_THRESHOLD;
}

function isAbandonedHighRiskQuest(quest: UserQuest): boolean {
  if (quest.isCompleted || isUserQuestArchived(quest)) return false;
  if (!isHighRiskQuest(quest.riskLevel)) return false;

  const touched =
    Boolean(quest.focusStartedAt) ||
    Boolean(quest.startedAt) ||
    Boolean(quest.frictionReviews?.length);

  if (!touched) return false;

  const lastFriction = quest.frictionReviews?.[quest.frictionReviews.length - 1];
  if (lastFriction?.reason === 'too-big' || lastFriction?.reason === 'low-energy') {
    return true;
  }

  return Boolean(quest.focusStartedAt || quest.startedAt);
}

function buildSnapshot(progress: PlayerProgress, referenceDate = new Date()): GoldilocksCoachSnapshot {
  const windowDateKeys = getLastLocalDateKeys(GOLDILOCKS_COACH_WINDOW_DAYS, referenceDate);
  const windowKeySet = new Set(windowDateKeys);

  const completedInWindow = progress.userQuests.filter((quest) =>
    windowKeySet.has(parseIsoDateKey(quest.completedAt) ?? ''),
  );
  const completedInWindowIds = new Set(completedInWindow.map((quest) => quest.id));
  const createdInWindow = progress.userQuests.filter((quest) =>
    windowKeySet.has(quest.createdOnDate ?? ''),
  );
  const activeIncompleteQuests = getActiveUserQuests(progress.userQuests);
  const recentUserQuests = progress.userQuests.filter((quest) =>
    isRecentUserQuest(quest, windowKeySet, completedInWindowIds),
  );

  const highRiskIncomplete = activeIncompleteQuests.filter((quest) => isHighRiskQuest(quest.riskLevel));
  const lowReadinessIncomplete = activeIncompleteQuests.filter(isLowReadinessQuest);
  const abandonedHighRisk = recentUserQuests.filter(isAbandonedHighRiskQuest);

  const completedByRisk: Record<QuestRiskLevel, number> = {
    low: 0,
    standard: 0,
    high: 0,
  };

  for (const quest of completedInWindow) {
    const risk = resolveQuestRiskLevel(quest.riskLevel);
    completedByRisk[risk] += 1;
  }

  return {
    windowDateKeys,
    recentUserQuests,
    activeIncompleteQuests,
    completedInWindow,
    createdInWindow,
    highRiskIncomplete,
    lowReadinessIncomplete,
    completedByRisk,
    abandonedHighRisk,
  };
}

function recommendHighRiskHeavy(snapshot: GoldilocksCoachSnapshot): GoldilocksRecommendation | null {
  if (snapshot.highRiskIncomplete.length < 2) return null;

  const targetQuestId = pickHighRiskQuestForSplit(snapshot.highRiskIncomplete);

  return {
    id: 'high-risk-heavy',
    title: 'Load too heavy',
    insight: 'Your high-risk quests may be too heavy right now. Split one into smaller moves.',
    suggestedAction: 'This might help to split one quest into a Quest Chain.',
    action: targetQuestId ? 'split-high-risk' : 'view-quest-board',
    targetQuestId: targetQuestId ?? undefined,
    priority: 95,
  };
}

function recommendAbandonedHighRisk(snapshot: GoldilocksCoachSnapshot): GoldilocksRecommendation | null {
  const stalledHighRisk = snapshot.abandonedHighRisk.filter((quest) => !hasStarterMove(quest));
  if (stalledHighRisk.length < 1) return null;

  const needsMultiple = snapshot.abandonedHighRisk.length >= 2;
  const hasFrictionStall = snapshot.abandonedHighRisk.some((quest) =>
    quest.frictionReviews?.some((review) => review.reason === 'too-big' || review.reason === 'low-energy'),
  );

  if (!needsMultiple && !hasFrictionStall) return null;

  const targetQuestId = pickHighRiskQuestForStarter(stalledHighRisk);

  return {
    id: 'abandoned-high-risk',
    title: 'Heavy quest stall',
    insight: 'High-risk quests stall when the first move feels too big.',
    suggestedAction: 'Try a two-minute starter on your next heavy quest.',
    action: targetQuestId ? 'add-starter-move' : 'view-quest-board',
    targetQuestId: targetQuestId ?? undefined,
    priority: 88,
  };
}

function recommendLowReadiness(snapshot: GoldilocksCoachSnapshot): GoldilocksRecommendation | null {
  if (snapshot.activeIncompleteQuests.length < 2) return null;

  const lowReadinessCount = snapshot.lowReadinessIncomplete.length;
  const ratio = lowReadinessCount / snapshot.activeIncompleteQuests.length;

  if (lowReadinessCount < 2 && ratio < 0.5) return null;

  const targetQuestId = pickLowReadinessQuestForImprove(snapshot.lowReadinessIncomplete);

  return {
    id: 'low-readiness',
    title: 'Unclear first move',
    insight: 'Difficulty drops when the first move is clear.',
    suggestedAction: 'Try adding a starter move, plan, or prep step to one quest.',
    action: targetQuestId ? 'add-starter-move' : 'view-quest-board',
    targetQuestId: targetQuestId ?? undefined,
    priority: 82,
  };
}

function recommendLowRiskOnlyGrowth(snapshot: GoldilocksCoachSnapshot): GoldilocksRecommendation | null {
  const { completedByRisk, completedInWindow } = snapshot;
  if (completedInWindow.length < 2) return null;
  if (completedByRisk.low < 2) return null;
  if (completedByRisk.standard > 0 || completedByRisk.high > 0) return null;
  if (snapshot.highRiskIncomplete.length >= 2) return null;

  return {
    id: 'low-risk-steady',
    title: 'Steady pace',
    insight: 'You are steady. Try one standard quest to keep growing.',
    suggestedAction: 'This might help to add one standard-challenge quest.',
    action: 'add-standard-quest',
    priority: 75,
  };
}

function recommendStandardReadyForHigh(snapshot: GoldilocksCoachSnapshot): GoldilocksRecommendation | null {
  const standardCompleted = snapshot.completedByRisk.standard;
  if (standardCompleted < 2) return null;
  if (snapshot.highRiskIncomplete.length >= 2) return null;

  const standardRecent = snapshot.recentUserQuests.filter(
    (quest) => resolveQuestRiskLevel(quest.riskLevel) === 'standard',
  );
  const standardCompletedRecent = standardRecent.filter((quest) => quest.isCompleted).length;
  const standardCompletionRate =
    standardRecent.length > 0 ? standardCompletedRecent / standardRecent.length : 0;

  if (standardCompletionRate < 0.55) return null;
  if (snapshot.completedByRisk.high >= 1) return null;

  return {
    id: 'standard-ready-for-high',
    title: 'Room to stretch',
    insight: 'You may be ready for one harder mission.',
    suggestedAction: 'Try one carefully chosen high-risk quest when you have capacity.',
    action: 'add-high-risk-quest',
    priority: 70,
  };
}

export function getGoldilocksCoachFlavor(universeId: string): string {
  return UNIVERSE_FLAVOR[universeId] ?? UNIVERSE_FLAVOR['dust-and-iron'];
}

export function hasEnoughGoldilocksCoachData(snapshot: GoldilocksCoachSnapshot): boolean {
  return (
    snapshot.completedInWindow.length > 0 ||
    snapshot.createdInWindow.length >= 2 ||
    snapshot.activeIncompleteQuests.length >= 2
  );
}

export function buildGoldilocksCoachSnapshot(
  progress: PlayerProgress,
  referenceDate = new Date(),
): GoldilocksCoachSnapshot {
  return buildSnapshot(progress, referenceDate);
}

export function generateGoldilocksRecommendation(
  progress: PlayerProgress,
  referenceDate = new Date(),
): GoldilocksRecommendation | null {
  const snapshot = buildSnapshot(progress, referenceDate);
  if (!hasEnoughGoldilocksCoachData(snapshot)) return null;

  const candidates = [
    recommendHighRiskHeavy(snapshot),
    recommendAbandonedHighRisk(snapshot),
    recommendLowReadiness(snapshot),
    recommendLowRiskOnlyGrowth(snapshot),
    recommendStandardReadyForHigh(snapshot),
  ].filter((entry): entry is GoldilocksRecommendation => entry != null);

  if (candidates.length === 0) return null;

  return candidates.sort((left, right) => right.priority - left.priority)[0] ?? null;
}

function applyGoldilocksStyleCopy(
  recommendation: GoldilocksRecommendation,
  profile: QuestStyleProfile | undefined,
): GoldilocksRecommendation {
  const styleKey = profile?.primaryStyle;
  if (!styleKey) return recommendation;

  if (styleKey === 'challenge-seeker' && recommendation.id === 'standard-ready-for-high') {
    return {
      ...recommendation,
      suggestedAction: 'Your style welcomes stretch — try one high-risk quest with a clear starter.',
    };
  }

  if (styleKey === 'recovery-mode' && recommendation.id === 'high-risk-heavy') {
    return {
      ...recommendation,
      suggestedAction: 'This might help to split or simplify before taking on heavy missions.',
    };
  }

  if (styleKey === 'quick-wins' && recommendation.id === 'low-readiness') {
    return {
      ...recommendation,
      suggestedAction: 'Try a two-minute starter so the first move stays tiny.',
    };
  }

  if (styleKey === 'deep-work' && recommendation.id === 'low-readiness') {
    return {
      ...recommendation,
      suggestedAction: 'Try adding a when/where plan and prep step before you begin.',
    };
  }

  return recommendation;
}

function adjustGoldilocksPriorityForStyle(
  recommendation: GoldilocksRecommendation,
  profile: QuestStyleProfile | undefined,
): GoldilocksRecommendation {
  const styleKey = profile?.primaryStyle;
  if (!styleKey) return recommendation;

  let priority = recommendation.priority;

  if (styleKey === 'challenge-seeker' && recommendation.id === 'standard-ready-for-high') {
    priority += 8;
  }
  if (styleKey === 'recovery-mode' && recommendation.id === 'high-risk-heavy') {
    priority += 6;
  }
  if (styleKey === 'quick-wins' && recommendation.id === 'low-readiness') {
    priority += 4;
  }

  return { ...recommendation, priority };
}

export function generateGoldilocksRecommendationWithStyle(
  progress: PlayerProgress,
  referenceDate = new Date(),
): GoldilocksRecommendation | null {
  const recommendation = generateGoldilocksRecommendation(progress, referenceDate);
  if (!recommendation) return null;

  const adjusted = adjustGoldilocksPriorityForStyle(recommendation, progress.questStyleProfile);
  return applyGoldilocksStyleCopy(adjusted, progress.questStyleProfile);
}

export function formatGoldilocksCoachEmptyMessage(): string {
  return 'Your quest load looks balanced. Keep choosing missions that fit your pace.';
}

export function pickHighRiskQuestForSplit(quests: UserQuest[]): string | null {
  const splittable = quests.find((quest) => isQuestChainSplittable(quest));
  return splittable?.id ?? quests[0]?.id ?? null;
}

export function pickHighRiskQuestForStarter(quests: UserQuest[]): string | null {
  const withoutStarter = quests.find((quest) => !hasStarterMove(quest));
  return withoutStarter?.id ?? quests[0]?.id ?? null;
}

export function pickLowReadinessQuestForImprove(quests: UserQuest[]): string | null {
  let lowest: UserQuest | null = null;
  let lowestScore = Number.POSITIVE_INFINITY;

  for (const quest of quests) {
    const score = getReadinessScore(quest);
    if (score == null) continue;
    if (score < lowestScore) {
      lowestScore = score;
      lowest = quest;
    }
  }

  return lowest?.id ?? quests[0]?.id ?? null;
}
