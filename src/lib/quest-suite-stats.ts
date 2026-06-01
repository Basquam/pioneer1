import { isQuestSuiteId } from '@/constants/quest-suites';
import type { PlayerProgress, QuestSuiteId, QuestSuiteStats } from '@/types/narrative';

export const QUESTS_PER_SUITE_LEVEL = 5;

export function createEmptyQuestSuiteStats(): QuestSuiteStats {
  return {
    questsCreated: 0,
    questsCompleted: 0,
    xpEarned: 0,
    reputationEarned: 0,
    lastCompletedAt: null,
  };
}

export function createInitialSuiteStatsById(): Partial<Record<QuestSuiteId, QuestSuiteStats>> {
  return {};
}

export function sanitizeQuestSuiteStats(raw: unknown): QuestSuiteStats | null {
  if (!raw || typeof raw !== 'object') return null;

  const stats = raw as Record<string, unknown>;
  const questsCreated = typeof stats.questsCreated === 'number' ? Math.max(0, stats.questsCreated) : 0;
  const questsCompleted =
    typeof stats.questsCompleted === 'number' ? Math.max(0, stats.questsCompleted) : 0;
  const xpEarned = typeof stats.xpEarned === 'number' ? Math.max(0, stats.xpEarned) : 0;
  const reputationEarned =
    typeof stats.reputationEarned === 'number' ? Math.max(0, stats.reputationEarned) : 0;
  const lastCompletedAt =
    typeof stats.lastCompletedAt === 'string' && stats.lastCompletedAt.length > 0
      ? stats.lastCompletedAt
      : null;

  return {
    questsCreated,
    questsCompleted,
    xpEarned,
    reputationEarned,
    lastCompletedAt,
  };
}

export function sanitizeSuiteStatsById(
  raw: unknown,
): Partial<Record<QuestSuiteId, QuestSuiteStats>> {
  if (!raw || typeof raw !== 'object') return {};

  const next: Partial<Record<QuestSuiteId, QuestSuiteStats>> = {};
  for (const [key, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!isQuestSuiteId(key)) continue;
    const sanitized = sanitizeQuestSuiteStats(value);
    if (sanitized) next[key] = sanitized;
  }

  return next;
}

export function sanitizeActiveSuiteId(raw: unknown): QuestSuiteId | undefined {
  return isQuestSuiteId(raw) ? raw : undefined;
}

export function getSuiteLevel(stats: QuestSuiteStats): number {
  const activity = stats.questsCompleted + stats.questsCreated;
  if (activity <= 0) return 1;
  return Math.min(99, Math.floor(stats.questsCompleted / QUESTS_PER_SUITE_LEVEL) + 1);
}

export function getSuiteLevelProgress(stats: QuestSuiteStats): number {
  if (stats.questsCompleted <= 0) return 0;
  const withinLevel = stats.questsCompleted % QUESTS_PER_SUITE_LEVEL;
  return withinLevel / QUESTS_PER_SUITE_LEVEL;
}

function upsertSuiteStats(
  progress: PlayerProgress,
  suiteId: QuestSuiteId,
  updater: (current: QuestSuiteStats) => QuestSuiteStats,
): PlayerProgress {
  const statsById = progress.suiteStatsById ?? {};
  const current = statsById[suiteId] ?? createEmptyQuestSuiteStats();

  return {
    ...progress,
    suiteStatsById: {
      ...statsById,
      [suiteId]: updater(current),
    },
  };
}

export function recordSuiteQuestCreated(
  progress: PlayerProgress,
  suiteId: QuestSuiteId | undefined,
): PlayerProgress {
  if (!suiteId || !isQuestSuiteId(suiteId)) return progress;

  return upsertSuiteStats(progress, suiteId, (current) => ({
    ...current,
    questsCreated: current.questsCreated + 1,
  }));
}

export function recordSuiteQuestCompleted(
  progress: PlayerProgress,
  suiteId: QuestSuiteId | undefined,
  xpEarned: number,
  reputationEarned: number,
  completedAt: string,
): PlayerProgress {
  if (!suiteId || !isQuestSuiteId(suiteId)) return progress;

  return upsertSuiteStats(progress, suiteId, (current) => ({
    ...current,
    questsCompleted: current.questsCompleted + 1,
    xpEarned: current.xpEarned + Math.max(0, xpEarned),
    reputationEarned: current.reputationEarned + Math.max(0, reputationEarned),
    lastCompletedAt: completedAt,
  }));
}

export type TopSuiteStat = {
  suiteId: QuestSuiteId;
  completed: number;
};

export function computeTopSuiteForDateRange(
  progress: PlayerProgress,
  startDateKey: string,
  endDateKey: string,
): TopSuiteStat | null {
  const counts = new Map<QuestSuiteId, number>();

  for (const quest of progress.userQuests ?? []) {
    if (!quest.isCompleted || !quest.suiteId || !isQuestSuiteId(quest.suiteId)) continue;

    const completedAt = quest.completedAt;
    if (!completedAt) continue;

    const dateKey = completedAt.slice(0, 10);
    if (dateKey < startDateKey || dateKey > endDateKey) continue;

    counts.set(quest.suiteId, (counts.get(quest.suiteId) ?? 0) + 1);
  }

  let best: TopSuiteStat | null = null;
  for (const [suiteId, completed] of counts.entries()) {
    if (!best || completed > best.completed) {
      best = { suiteId, completed };
    }
  }

  return best;
}

export function listSuiteMasteryEntries(progress: PlayerProgress): Array<{
  suiteId: QuestSuiteId;
  stats: QuestSuiteStats;
  level: number;
  progress: number;
}> {
  const statsById = progress.suiteStatsById ?? {};
  const entries: Array<{
    suiteId: QuestSuiteId;
    stats: QuestSuiteStats;
    level: number;
    progress: number;
  }> = [];

  for (const [suiteId, stats] of Object.entries(statsById)) {
    if (!isQuestSuiteId(suiteId) || !stats) continue;
    const activity = stats.questsCompleted + stats.questsCreated;
    if (activity <= 0) continue;

    entries.push({
      suiteId,
      stats,
      level: getSuiteLevel(stats),
      progress: getSuiteLevelProgress(stats),
    });
  }

  return entries.sort((a, b) => {
    if (b.stats.questsCompleted !== a.stats.questsCompleted) {
      return b.stats.questsCompleted - a.stats.questsCompleted;
    }
    return b.stats.questsCreated - a.stats.questsCreated;
  });
}
