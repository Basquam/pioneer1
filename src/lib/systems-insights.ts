import { getLastLocalDateKeys } from '@/lib/quest-calendar';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isUserQuestArchived, LOW_READINESS_THRESHOLD } from '@/lib/quest-friction';
import { CATEGORY_TO_IDENTITY_TRAIT, getIdentityTraitMeta } from '@/lib/identity-votes';
import { computeQuestReadiness, hasPrep, hasStarterMove } from '@/lib/quest-readiness';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { userQuestToBoardQuest } from '@/lib/quest-board';
import { TRAIT_TO_SUGGESTED_CATEGORIES } from '@/lib/trait-aligned-suggestions';
import type { IdentityTraitKey, PlayerProgress, TaskCategory, UserQuest } from '@/types/narrative';

export const SYSTEMS_INSIGHT_WINDOW_DAYS = 14;
export const MAX_SYSTEMS_INSIGHTS = 3;

const HEADER_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Trail Readout',
  neuronet: 'Signal Diagnostics',
  'neon-ashes': 'Case Pattern',
};

export type SystemsInsightAction =
  | 'add-quest'
  | 'open-focus-mode'
  | 'view-quest-board'
  | 'edit-identity-compass';

export type SystemsInsightCard = {
  id: string;
  title: string;
  insight: string;
  suggestedAction: string;
  action?: SystemsInsightAction;
  priority: number;
};

export type SystemsInsightSnapshot = {
  windowDateKeys: string[];
  activeIncompleteQuests: UserQuest[];
  completedInWindow: UserQuest[];
  createdInWindow: UserQuest[];
  awarenessAnswers: number;
  lowEnergyAwarenessCount: number;
  weeklyReviewCount: number;
  totalQuestsCompletedInWindow: number;
};

function parseIsoDateKey(iso: string | undefined): string | null {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return getLocalDateKey(date);
}

function isDateInWindow(dateKey: string | null | undefined, windowKeys: Set<string>): boolean {
  return Boolean(dateKey && windowKeys.has(dateKey));
}

function getActiveUserQuests(userQuests: UserQuest[]): UserQuest[] {
  return userQuests.filter((quest) => !quest.isCompleted && !isUserQuestArchived(quest));
}

function completionRate(quests: UserQuest[]): number | null {
  if (quests.length === 0) return null;
  const completed = quests.filter((quest) => quest.isCompleted).length;
  return completed / quests.length;
}

function compareCompletionRates(
  withFeature: UserQuest[],
  withoutFeature: UserQuest[],
  minSamples = 2,
  minDelta = 0.2,
): boolean {
  if (withFeature.length < minSamples || withoutFeature.length < minSamples) return false;

  const withRate = completionRate(withFeature);
  const withoutRate = completionRate(withoutFeature);
  if (withRate == null || withoutRate == null) return false;

  return withRate - withoutRate >= minDelta && withRate >= 0.5;
}

function countRecentBlocker(
  progress: PlayerProgress,
  windowKeys: Set<string>,
  blocker: string,
): number {
  return Object.entries(progress.dailyAwarenessByDate).filter(
    ([dateKey, entry]) => windowKeys.has(dateKey) && entry.selectedBlocker === blocker,
  ).length;
}

function countIdentityVotesInWindow(
  progress: PlayerProgress,
  traitKey: IdentityTraitKey,
  windowKeys: Set<string>,
): number {
  let count = 0;

  for (const event of progress.evidenceLog ?? []) {
    if (!windowKeys.has(event.date)) continue;
    if (CATEGORY_TO_IDENTITY_TRAIT[event.category] === traitKey) {
      count += 1;
    }
  }

  return count;
}

function buildSnapshot(progress: PlayerProgress, referenceDate = new Date()): SystemsInsightSnapshot {
  const windowDateKeys = getLastLocalDateKeys(SYSTEMS_INSIGHT_WINDOW_DAYS, referenceDate);
  const windowKeySet = new Set(windowDateKeys);

  const activeIncompleteQuests = getActiveUserQuests(progress.userQuests);
  const completedInWindow = progress.userQuests.filter((quest) =>
    isDateInWindow(parseIsoDateKey(quest.completedAt), windowKeySet),
  );
  const createdInWindow = progress.userQuests.filter((quest) =>
    isDateInWindow(quest.createdOnDate ?? null, windowKeySet),
  );

  const awarenessAnswers = Object.keys(progress.dailyAwarenessByDate).filter((dateKey) =>
    windowKeySet.has(dateKey),
  ).length;
  const lowEnergyAwarenessCount = countRecentBlocker(progress, windowKeySet, 'low-energy');
  const weeklyReviewCount = Object.keys(progress.weeklyReviewByWeek ?? {}).length;

  const totalQuestsCompletedInWindow = windowDateKeys.reduce(
    (sum, dateKey) => sum + (progress.activityByDate?.[dateKey]?.questsCompleted ?? 0),
    0,
  );

  return {
    windowDateKeys,
    activeIncompleteQuests,
    completedInWindow,
    createdInWindow,
    awarenessAnswers,
    lowEnergyAwarenessCount,
    weeklyReviewCount,
    totalQuestsCompletedInWindow,
  };
}

function insightStarterMoves(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const recentQuests = progress.userQuests.filter((quest) => {
    const createdInWindow = snapshot.windowDateKeys.includes(quest.createdOnDate ?? '');
    const completedInWindow = snapshot.completedInWindow.some((entry) => entry.id === quest.id);
    return createdInWindow || completedInWindow;
  });

  const withStarter = recentQuests.filter((quest) => hasStarterMove(quest));
  const withoutStarter = recentQuests.filter((quest) => !hasStarterMove(quest));

  if (!compareCompletionRates(withStarter, withoutStarter)) return null;

  const weeklyHelped = Object.values(progress.weeklyReviewByWeek ?? {}).some((entry) =>
    entry.helpedFactors.includes('starter-moves'),
  );

  return {
    id: 'starter-moves-help',
    title: 'Starter moves',
    insight: 'Your data suggests starter moves help you begin.',
    suggestedAction: 'Try adding a starter move to one bigger quest.',
    action: 'view-quest-board',
    priority: weeklyHelped ? 68 : 60,
  };
}

function insightHighRiskPile(snapshot: SystemsInsightSnapshot): SystemsInsightCard | null {
  const highRiskIncomplete = snapshot.activeIncompleteQuests.filter((quest) =>
    isHighRiskQuest(quest.riskLevel),
  );

  if (highRiskIncomplete.length < 2) return null;

  return {
    id: 'high-risk-pile',
    title: 'High-risk load',
    insight: 'High-risk quests are piling up on your board.',
    suggestedAction: 'This might help to split one into a Quest Chain.',
    action: 'view-quest-board',
    priority: 80,
  };
}

function insightLowEnergy(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const lowEnergyThreshold = snapshot.awarenessAnswers >= 3 ? 2 : 1;
  const weeklySlowdown = Object.values(progress.weeklyReviewByWeek ?? {}).some(
    (entry) => entry.slowdownFactor === 'low-energy',
  );

  if (snapshot.lowEnergyAwarenessCount < lowEnergyThreshold && !weeklySlowdown) return null;

  return {
    id: 'low-energy-pattern',
    title: 'Energy pattern',
    insight: 'Low energy keeps showing up in your check-ins.',
    suggestedAction: 'Try a 2-minute recovery quest first.',
    action: 'add-quest',
    priority: weeklySlowdown ? 75 : 70,
  };
}

function insightLowReadiness(snapshot: SystemsInsightSnapshot): SystemsInsightCard | null {
  if (snapshot.activeIncompleteQuests.length < 2) return null;

  const lowReadinessQuests = snapshot.activeIncompleteQuests.filter((quest) => {
    const boardQuest = userQuestToBoardQuest(quest);
    const readiness = computeQuestReadiness(boardQuest);
    return readiness != null && readiness.score <= LOW_READINESS_THRESHOLD;
  });

  const ratio = lowReadinessQuests.length / snapshot.activeIncompleteQuests.length;
  if (lowReadinessQuests.length < 2 && ratio < 0.5) return null;

  return {
    id: 'low-readiness',
    title: 'Planning gap',
    insight: 'Your data suggests some quests may need clearer plans.',
    suggestedAction: 'Try adding a when/where plan to one quest.',
    action: 'view-quest-board',
    priority: 65,
  };
}

function insightFocusMode(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const recentQuests = progress.userQuests.filter((quest) => {
    const touchedInWindow =
      snapshot.windowDateKeys.includes(quest.createdOnDate ?? '') ||
      snapshot.completedInWindow.some((entry) => entry.id === quest.id);
    return touchedInWindow && Boolean(quest.focusStartedAt);
  });

  if (recentQuests.length < 2) return null;

  const focusCompletionRate = completionRate(recentQuests);
  const weeklyHelped = Object.values(progress.weeklyReviewByWeek ?? {}).some((entry) =>
    entry.helpedFactors.includes('focus-mode'),
  );

  if (focusCompletionRate == null || focusCompletionRate < 0.55) return null;

  return {
    id: 'focus-mode-works',
    title: 'Focus Mode',
    insight: 'Focus Mode seems to help you follow through.',
    suggestedAction: 'This might help to start there when resistance is high.',
    action: 'open-focus-mode',
    priority: weeklyHelped ? 62 : 55,
  };
}

function insightBoardOverload(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const createdCount = snapshot.createdInWindow.length;
  const completedCount = snapshot.totalQuestsCompletedInWindow;
  const activeCount = snapshot.activeIncompleteQuests.length;

  const weeklySlowdown = Object.values(progress.weeklyReviewByWeek ?? {}).some(
    (entry) => entry.slowdownFactor === 'too-many-quests',
  );

  const overloaded =
    (createdCount >= 4 && completedCount <= 1) ||
    (activeCount >= 6 && completedCount <= 2) ||
    weeklySlowdown;

  if (!overloaded) return null;

  return {
    id: 'board-overload',
    title: 'Board load',
    insight: 'Your data suggests the board may be carrying too much at once.',
    suggestedAction: "Try locking today's focus around fewer quests.",
    action: 'view-quest-board',
    priority: weeklySlowdown ? 78 : 75,
  };
}

function formatCategoryHint(category: TaskCategory): string {
  switch (category) {
    case 'creative':
      return 'creative';
    case 'errand':
      return 'preparation';
    case 'cleaning':
      return 'order-building';
    case 'fitness':
      return 'resilience';
    case 'study':
      return 'learning';
    case 'work':
      return 'follow-through';
    case 'health':
      return 'self-care';
    case 'social':
      return 'connection';
    default:
      return 'matching';
  }
}

function insightIdentityGap(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const desired = progress.desiredIdentityTraits ?? [];
  if (desired.length === 0) return null;
  if (snapshot.totalQuestsCompletedInWindow === 0 && snapshot.completedInWindow.length === 0) return null;

  const windowKeySet = new Set(snapshot.windowDateKeys);
  const voteCounts = desired.map((traitKey) => ({
    traitKey,
    count: countIdentityVotesInWindow(progress, traitKey, windowKeySet),
  }));

  const maxVotes = Math.max(...voteCounts.map((entry) => entry.count));
  const lagging = voteCounts.filter((entry) => entry.count === 0 && maxVotes >= 1);

  if (lagging.length === 0) return null;

  const traitKey = lagging[0]!.traitKey;
  const trait = getIdentityTraitMeta(traitKey);
  const category = TRAIT_TO_SUGGESTED_CATEGORIES[traitKey][0] ?? 'work';
  const categoryWord = formatCategoryHint(category);

  return {
    id: `identity-gap-${trait.key}`,
    title: 'Compass gap',
    insight: `You chose ${trait.label}, but few recent quests support it.`,
    suggestedAction: `Try adding one ${categoryWord} quest this week.`,
    action: traitKey === 'builder' ? 'add-quest' : 'edit-identity-compass',
    priority: 85,
  };
}

function insightPrepSteps(snapshot: SystemsInsightSnapshot, progress: PlayerProgress): SystemsInsightCard | null {
  const recentQuests = progress.userQuests.filter((quest) => {
    const createdInWindow = snapshot.windowDateKeys.includes(quest.createdOnDate ?? '');
    const completedInWindow = snapshot.completedInWindow.some((entry) => entry.id === quest.id);
    return createdInWindow || completedInWindow;
  });

  const withPrep = recentQuests.filter((quest) => hasPrep(quest));
  const withoutPrep = recentQuests.filter((quest) => !hasPrep(quest));

  if (!compareCompletionRates(withPrep, withoutPrep)) return null;

  const weeklyHelped = Object.values(progress.weeklyReviewByWeek ?? {}).some((entry) =>
    entry.helpedFactors.includes('prep-steps'),
  );

  return {
    id: 'prep-steps-help',
    title: 'Prep steps',
    insight: 'Prep steps seem to make follow-through easier for you.',
    suggestedAction: 'Try adding a prep step before one harder quest.',
    action: 'view-quest-board',
    priority: weeklyHelped ? 58 : 50,
  };
}

function insightFrictionTooBig(snapshot: SystemsInsightSnapshot): SystemsInsightCard | null {
  const tooBigReviews = snapshot.activeIncompleteQuests.filter((quest) =>
    quest.frictionReviews?.some((review) => review.reason === 'too-big'),
  );

  if (tooBigReviews.length < 1) return null;

  return {
    id: 'friction-too-big',
    title: 'Quest size',
    insight: 'Some quests feel too big when you review friction.',
    suggestedAction: 'This might help to split one into a Quest Chain.',
    action: 'view-quest-board',
    priority: 72,
  };
}

export function getSystemsInsightHeaderFlavor(universeId: string): string {
  return HEADER_FLAVOR[universeId] ?? HEADER_FLAVOR['dust-and-iron'];
}

export function hasEnoughSystemsInsightData(snapshot: SystemsInsightSnapshot): boolean {
  return (
    snapshot.totalQuestsCompletedInWindow > 0 ||
    snapshot.createdInWindow.length > 0 ||
    snapshot.awarenessAnswers > 0 ||
    snapshot.activeIncompleteQuests.length >= 2 ||
    snapshot.weeklyReviewCount > 0
  );
}

export function buildSystemsInsightSnapshot(
  progress: PlayerProgress,
  referenceDate = new Date(),
): SystemsInsightSnapshot {
  return buildSnapshot(progress, referenceDate);
}

export function generateSystemsInsights(
  progress: PlayerProgress,
  referenceDate = new Date(),
): SystemsInsightCard[] {
  const snapshot = buildSnapshot(progress, referenceDate);

  if (!hasEnoughSystemsInsightData(snapshot)) {
    return [];
  }

  const candidates = [
    insightIdentityGap(snapshot, progress),
    insightHighRiskPile(snapshot),
    insightBoardOverload(snapshot, progress),
    insightLowEnergy(snapshot, progress),
    insightLowReadiness(snapshot),
    insightFrictionTooBig(snapshot),
    insightStarterMoves(snapshot, progress),
    insightFocusMode(snapshot, progress),
    insightPrepSteps(snapshot, progress),
  ].filter((card): card is SystemsInsightCard => card != null);

  return candidates
    .sort((left, right) => right.priority - left.priority)
    .slice(0, MAX_SYSTEMS_INSIGHTS);
}

export function pickQuestIdForFocusInsight(progress: PlayerProgress): string | null {
  const active = getActiveUserQuests(progress.userQuests);
  if (active.length === 0) return null;

  const withFocusHistory = active.find((quest) => Boolean(quest.focusStartedAt));
  if (withFocusHistory) return withFocusHistory.id;

  const withStarter = active.find((quest) => hasStarterMove(quest));
  if (withStarter) return withStarter.id;

  return active[0]?.id ?? null;
}

export function formatSystemsInsightEmptyMessage(): string {
  return 'Your data suggests patterns will appear after a few more days of quests.';
}
