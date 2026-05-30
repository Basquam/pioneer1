import { getDailyFocusLimit, getDailyFocusQuestIds } from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import { traitLabelToKey } from '@/lib/identity-compass';
import {
  getIdentityTraitMeta,
  IDENTITY_TRAIT_KEYS,
  type IdentityTraitMeta,
} from '@/lib/identity-votes';
import { isQuestLifecycleArchived, isQuestNeedsReview } from '@/lib/quest-lifecycle';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { getSagaTitleById, getUniverseNameById } from '@/lib/onboarding-origin-display';
import type { IdentityTraitKey, PlayerProgress, TaskCategory, UserQuest } from '@/types/narrative';

export const MONTHLY_IDENTITY_COPY = 'Your small wins are becoming evidence.';

const MONTHLY_REPORT_TITLES: Record<string, string> = {
  'dust-and-iron': 'Frontier Season Report',
  neuronet: 'Signal Cycle Report',
  'neon-ashes': 'Monthly Case File',
};

const RETURN_TRAIL_COPY: Record<string, string> = {
  'dust-and-iron': 'You returned to the trail',
  neuronet: 'You returned to the signal',
  'neon-ashes': 'You returned to the case',
};

const MONTH_KEY_PATTERN = /^\d{4}-\d{2}$/;

export type MonthlyCategoryStat = {
  category: TaskCategory;
  label: string;
  count: number;
};

export type MonthlySeasonReportStats = {
  monthKey: string;
  monthLabel: string;
  title: string;
  identityCopy: string;
  questsCompleted: number;
  chaptersCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  identityVotesGained: number;
  strongestTrait: { trait: IdentityTraitMeta; count: number } | null;
  topCategories: MonthlyCategoryStat[];
  topUniverse: { id: string; name: string; count: number } | null;
  topSaga: { id: string; title: string; count: number } | null;
  highRiskQuestsCompleted: number;
  recurringQuestsCompleted: number;
  focusQuestsCompleted: number;
  activeDays: number;
  becomingSummary: string[];
  recommendation: string;
  isQuietMonth: boolean;
};

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getLocalMonthKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function isValidMonthKey(value: string): boolean {
  return MONTH_KEY_PATTERN.test(value.trim());
}

export function formatMonthLabel(monthKey: string): string {
  if (!isValidMonthKey(monthKey)) return monthKey;
  const [year, month] = monthKey.split('-').map(Number);
  const date = new Date(year!, month! - 1, 1);
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

export function getMonthlyReportTitle(universeId: string): string {
  return MONTHLY_REPORT_TITLES[universeId] ?? MONTHLY_REPORT_TITLES['dust-and-iron'];
}

export function getMonthlyReviewSeenAt(
  progress: Pick<PlayerProgress, 'monthlyReviewSeenByMonth'>,
  monthKey: string = getLocalMonthKey(),
): string | null {
  const value = progress.monthlyReviewSeenByMonth?.[monthKey];
  return typeof value === 'string' && value.length > 0 ? value : null;
}

export function isMonthlyReviewClosed(
  progress: Pick<PlayerProgress, 'monthlyReviewSeenByMonth'>,
  monthKey: string = getLocalMonthKey(),
): boolean {
  return getMonthlyReviewSeenAt(progress, monthKey) != null;
}

export function markMonthlyReviewSeen(
  progress: PlayerProgress,
  monthKey: string = getLocalMonthKey(),
): PlayerProgress {
  if (!isValidMonthKey(monthKey)) return progress;

  return {
    ...progress,
    monthlyReviewSeenByMonth: {
      ...(progress.monthlyReviewSeenByMonth ?? {}),
      [monthKey]: new Date().toISOString(),
    },
  };
}

export function sanitizeMonthlyReviewSeenByMonth(raw: unknown): PlayerProgress['monthlyReviewSeenByMonth'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['monthlyReviewSeenByMonth'] = {};

  for (const [monthKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isValidMonthKey(monthKey)) continue;
    if (typeof value !== 'string' || value.length === 0) continue;
    result[monthKey] = value;
  }

  return result;
}

export function pruneMonthlyReviewSeenByMonth(
  monthlyReviewSeenByMonth: PlayerProgress['monthlyReviewSeenByMonth'],
  referenceDate = new Date(),
  retentionMonths = 24,
): PlayerProgress['monthlyReviewSeenByMonth'] {
  const cutoff = new Date(referenceDate);
  cutoff.setMonth(cutoff.getMonth() - retentionMonths);
  const cutoffKey = getLocalMonthKey(cutoff);

  return Object.fromEntries(
    Object.entries(monthlyReviewSeenByMonth ?? {}).filter(([monthKey]) => monthKey >= cutoffKey),
  );
}

export function getMonthDateKeys(monthKey: string): string[] {
  if (!isValidMonthKey(monthKey)) return [];

  const [year, month] = monthKey.split('-').map(Number);
  const cursor = new Date(year!, month! - 1, 1, 12, 0, 0, 0);
  const keys: string[] = [];

  while (cursor.getMonth() === month! - 1) {
    keys.push(getLocalDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return keys;
}

function isDateInMonth(dateKey: string, monthKey: string): boolean {
  return dateKey.startsWith(`${monthKey}-`);
}

function wasFocusQuestOnCompletion(quest: UserQuest, progress: PlayerProgress): boolean {
  if (quest.focusPinned) return true;

  const completedDate = quest.completedAt?.slice(0, 10);
  if (!completedDate) return false;

  if (
    progress.focusLockedDate === completedDate &&
    progress.lockedFocusQuestIds?.includes(quest.id)
  ) {
    return true;
  }

  const focusIds = getDailyFocusQuestIds(
    progress.userQuests,
    getDailyFocusLimit(progress),
    completedDate,
    quest.sourceUniverseId,
  );
  return focusIds.has(quest.id);
}

function countTraitVotesInMonth(
  progress: Pick<PlayerProgress, 'evidenceLog'>,
  monthKey: string,
): Map<IdentityTraitKey, number> {
  const counts = new Map<IdentityTraitKey, number>();

  for (const event of progress.evidenceLog ?? []) {
    if (!isDateInMonth(event.date, monthKey)) continue;
    const traitKey = traitLabelToKey(event.identityTraitGained);
    if (!traitKey) continue;
    counts.set(traitKey, (counts.get(traitKey) ?? 0) + 1);
  }

  return counts;
}

function formatTopCategoriesPhrase(categories: MonthlyCategoryStat[]): string {
  if (categories.length === 0) return 'completed quests';

  const total = categories.reduce((sum, entry) => sum + entry.count, 0);
  const labels = categories.map((entry) => entry.label.toLowerCase());

  if (labels.length === 1) {
    const suffix = total === 1 ? 'quest' : 'quests';
    return `${total} completed ${labels[0]} ${suffix}`;
  }

  if (labels.length === 2) {
    return `${total} completed ${labels[0]} and ${labels[1]} quests`;
  }

  const head = labels.slice(0, -1).join(', ');
  return `${total} completed ${head}, and ${labels[labels.length - 1]} quests`;
}

function buildBecomingSummary(
  stats: Omit<MonthlySeasonReportStats, 'becomingSummary' | 'recommendation' | 'isQuietMonth'>,
  universeId: string,
): string[] {
  const lines: string[] = [];

  if (stats.questsCompleted > 0 && stats.strongestTrait) {
    lines.push(
      `This month, you proved ${stats.strongestTrait.trait.label.toLowerCase()} through ${formatTopCategoriesPhrase(stats.topCategories)}.`,
    );
  } else if (stats.questsCompleted > 0) {
    lines.push(`This month, you cleared ${stats.questsCompleted} quests — each one evidence.`);
  }

  if (stats.strongestTrait) {
    lines.push(`Your strongest evidence was ${stats.strongestTrait.trait.label}.`);
  }

  if (stats.activeDays > 0) {
    const prefix = RETURN_TRAIL_COPY[universeId] ?? RETURN_TRAIL_COPY['dust-and-iron'];
    const timesLabel = stats.activeDays === 1 ? 'time' : 'times';
    lines.push(`${prefix} ${stats.activeDays} ${timesLabel}.`);
  }

  return lines;
}

function getMonthlyRecommendation(
  progress: PlayerProgress,
  monthKey: string,
  traitCounts: Map<IdentityTraitKey, number>,
): string {
  const staleCount = progress.userQuests.filter(
    (quest) => !quest.isCompleted && isQuestNeedsReview(quest),
  ).length;
  if (staleCount >= 3) {
    return 'Start next month with fewer active quests.';
  }

  const lowReadinessCount = progress.userQuests.filter((quest) => {
    if (quest.isCompleted || isQuestLifecycleArchived(quest)) return false;
    let score = 0;
    if (quest.starterTaskTitle?.trim()) score += 1;
    if (quest.implementationIntention?.trim()) score += 1;
    if (quest.prepStepTitle?.trim()) score += 1;
    if (quest.focusPinned) score += 1;
    return score <= 1;
  }).length;
  if (lowReadinessCount >= 2) {
    return 'Add starter moves earlier.';
  }

  const desired = progress.desiredIdentityTraits ?? [];
  if (desired.length > 0) {
    let weakest: IdentityTraitKey | null = null;
    let weakestCount = Number.POSITIVE_INFINITY;

    for (const traitKey of desired) {
      const count = traitCounts.get(traitKey) ?? 0;
      if (count < weakestCount) {
        weakest = traitKey;
        weakestCount = count;
      }
    }

    if (weakest != null && weakestCount <= 1) {
      const label = getIdentityTraitMeta(weakest).label;
      return `Add one quest next month that supports ${label}.`;
    }
  }

  const abandonedHighRisk = progress.userQuests.filter(
    (quest) =>
      !quest.isCompleted &&
      isHighRiskQuest(quest.riskLevel) &&
      (isQuestLifecycleArchived(quest) || isQuestNeedsReview(quest)),
  ).length;
  if (abandonedHighRisk >= 1) {
    return 'Split one high-risk quest before starting.';
  }

  return 'Keep choosing small quests that match who you are becoming.';
}

export function computeMonthlySeasonReport(
  progress: PlayerProgress,
  universeId: string,
  date = new Date(),
  monthKey: string = getLocalMonthKey(date),
): MonthlySeasonReportStats {
  const monthDateKeys = new Set(getMonthDateKeys(monthKey));
  const activity = progress.activityByDate ?? {};

  let questsCompleted = 0;
  let chaptersCompleted = 0;
  let xpEarned = 0;
  let reputationEarned = 0;
  let highRiskQuestsCompleted = 0;
  let activeDays = 0;

  for (const dateKey of monthDateKeys) {
    const day = activity[dateKey];
    if (!day) continue;

    if (day.questsCompleted > 0 || day.xpEarned > 0) {
      activeDays += 1;
    }

    questsCompleted += day.questsCompleted;
    xpEarned += day.xpEarned;
    reputationEarned += day.reputationEarned;
    chaptersCompleted += day.chaptersCompleted;
    highRiskQuestsCompleted += day.highRiskQuestsCompleted;
  }

  const categoryCounts = new Map<TaskCategory, number>();
  const universeCounts = new Map<string, number>();
  const sagaCounts = new Map<string, number>();
  let identityVotesGained = 0;
  const traitCounts = countTraitVotesInMonth(progress, monthKey);

  for (const event of progress.evidenceLog ?? []) {
    if (!monthDateKeys.has(event.date)) continue;

    categoryCounts.set(event.category, (categoryCounts.get(event.category) ?? 0) + 1);
    universeCounts.set(event.universeId, (universeCounts.get(event.universeId) ?? 0) + 1);
    sagaCounts.set(event.sagaId, (sagaCounts.get(event.sagaId) ?? 0) + 1);

    if (event.identityTraitGained) {
      identityVotesGained += 1;
    }
  }

  let recurringQuestsCompleted = 0;
  let focusQuestsCompleted = 0;

  for (const quest of progress.userQuests) {
    if (!quest.isCompleted || !quest.completedAt) continue;
    if (!isDateInMonth(quest.completedAt.slice(0, 10), monthKey)) continue;

    if (quest.generatedFromRecurringQuestId) {
      recurringQuestsCompleted += 1;
    }

    if (wasFocusQuestOnCompletion(quest, progress)) {
      focusQuestsCompleted += 1;
    }
  }

  let strongestTrait: MonthlySeasonReportStats['strongestTrait'] = null;
  for (const traitKey of IDENTITY_TRAIT_KEYS) {
    const count = traitCounts.get(traitKey) ?? 0;
    if (count <= 0) continue;
    if (!strongestTrait || count > strongestTrait.count) {
      strongestTrait = { trait: getIdentityTraitMeta(traitKey), count };
    }
  }

  const topCategories = [...categoryCounts.entries()]
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, 2)
    .map(([category, count]) => ({
      category,
      label: getTaskCategoryMeta(category).realWorldLabel,
      count,
    }));

  const topUniverseEntry = [...universeCounts.entries()].sort((a, b) => b[1] - a[1])[0];
  const topSagaEntry = [...sagaCounts.entries()].sort((a, b) => b[1] - a[1])[0];

  const baseStats = {
    monthKey,
    monthLabel: formatMonthLabel(monthKey),
    title: getMonthlyReportTitle(universeId),
    identityCopy: MONTHLY_IDENTITY_COPY,
    questsCompleted,
    chaptersCompleted,
    xpEarned,
    reputationEarned,
    identityVotesGained,
    strongestTrait,
    topCategories,
    topUniverse: topUniverseEntry
      ? {
          id: topUniverseEntry[0],
          name: getUniverseNameById(topUniverseEntry[0]) ?? topUniverseEntry[0],
          count: topUniverseEntry[1],
        }
      : null,
    topSaga: topSagaEntry
      ? {
          id: topSagaEntry[0],
          title: getSagaTitleById(topSagaEntry[0]) ?? topSagaEntry[0],
          count: topSagaEntry[1],
        }
      : null,
    highRiskQuestsCompleted,
    recurringQuestsCompleted,
    focusQuestsCompleted,
    activeDays,
  };

  const isQuietMonth =
    questsCompleted === 0 &&
    xpEarned === 0 &&
    reputationEarned === 0 &&
    chaptersCompleted === 0 &&
    identityVotesGained === 0;

  return {
    ...baseStats,
    becomingSummary: buildBecomingSummary(baseStats, universeId),
    recommendation: getMonthlyRecommendation(progress, monthKey, traitCounts),
    isQuietMonth,
  };
}
