import { getDailyFocusLimit, getDailyFocusQuestIds } from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import { hasStarterMove } from '@/lib/decisive-moment';
import { getLocalMonthKey } from '@/lib/monthly-review';
import { isQuestOnActiveBoard } from '@/lib/quest-lifecycle';
import { isHighRiskQuest, resolveQuestRiskLevel } from '@/lib/quest-risk';
import { EMPTY_ACTIVITY } from '@/lib/player-progress-sanitize';
import type {
  DailyAwarenessBlocker,
  MinimumViableDayEntry,
  MinimumViableDaySource,
  PlayerProgress,
  TaskCategory,
  UserQuest,
} from '@/types/narrative';

export const MINIMUM_VIABLE_DAY_BANNER_COPY = 'Minimum Viable Day active.';

const MVD_AWARENESS_BLOCKERS = new Set<DailyAwarenessBlocker>(['low-energy', 'emotional-resistance']);

const SMALL_QUEST_CATEGORIES = new Set<TaskCategory>(['health', 'cleaning']);

export type MinimumViableDayCopy = {
  title: string;
  completion: string;
  bannerHint: string;
};

const UNIVERSE_COPY: Record<string, MinimumViableDayCopy> = {
  'dust-and-iron': {
    title: 'Hold the town with one small ride.',
    completion: 'Minimum day secured.',
    bannerHint: 'Dustfall holds for today.',
  },
  neuronet: {
    title: 'Stabilize the signal with one small operation.',
    completion: 'Minimum day secured.',
    bannerHint: 'Signal stabilized.',
  },
  'neon-ashes': {
    title: 'Keep the case warm with one small lead.',
    completion: 'Minimum day secured.',
    bannerHint: 'The case stays open.',
  },
};

const UNIVERSE_COMPLETION_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Dustfall holds for today.',
  neuronet: 'Signal stabilized.',
  'neon-ashes': 'The case stays open.',
};

export function getMinimumViableDayCopy(universeId: string): MinimumViableDayCopy {
  return UNIVERSE_COPY[universeId] ?? UNIVERSE_COPY['dust-and-iron'];
}

export function getMinimumViableDayCompletionFlavor(universeId: string): string {
  return UNIVERSE_COMPLETION_FLAVOR[universeId] ?? UNIVERSE_COMPLETION_FLAVOR['dust-and-iron'];
}

export function shouldAutoActivateMvdFromAwareness(blocker: DailyAwarenessBlocker): boolean {
  return MVD_AWARENESS_BLOCKERS.has(blocker);
}

export function shouldSuggestMvdFromAwarenessBlocker(blocker: DailyAwarenessBlocker): boolean {
  return MVD_AWARENESS_BLOCKERS.has(blocker);
}

export function getMinimumViableDayEntry(
  progress: Pick<PlayerProgress, 'minimumViableDayByDate'>,
  today: string = getLocalDateKey(),
): MinimumViableDayEntry | null {
  return progress.minimumViableDayByDate?.[today] ?? null;
}

export function isMinimumViableDayActive(
  progress: Pick<PlayerProgress, 'minimumViableDayByDate'>,
  today: string = getLocalDateKey(),
): boolean {
  return getMinimumViableDayEntry(progress, today) != null;
}

export function isMinimumViableDaySecuredToday(
  progress: Pick<PlayerProgress, 'minimumViableDayByDate'>,
  today: string = getLocalDateKey(),
): boolean {
  const entry = getMinimumViableDayEntry(progress, today);
  return Boolean(entry?.securedAt);
}

export function hasCompletedQuestToday(
  progress: Pick<PlayerProgress, 'activityByDate'>,
  today: string = getLocalDateKey(),
): boolean {
  const activity = progress.activityByDate?.[today] ?? EMPTY_ACTIVITY;
  return activity.questsCompleted > 0;
}

export function activateMinimumViableDay(
  progress: PlayerProgress,
  source: MinimumViableDaySource = 'briefing',
  today: string = getLocalDateKey(),
): PlayerProgress {
  if (getMinimumViableDayEntry(progress, today)) return progress;

  const entry: MinimumViableDayEntry = {
    date: today,
    activatedAt: new Date().toISOString(),
    source,
  };

  return {
    ...progress,
    minimumViableDayByDate: {
      ...(progress.minimumViableDayByDate ?? {}),
      [today]: entry,
    },
  };
}

export function markMinimumViableDaySecured(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): PlayerProgress {
  const entry = getMinimumViableDayEntry(progress, today);
  if (!entry || entry.securedAt) return progress;

  return {
    ...progress,
    minimumViableDayByDate: {
      ...(progress.minimumViableDayByDate ?? {}),
      [today]: {
        ...entry,
        securedAt: new Date().toISOString(),
      },
    },
  };
}

export function shouldMarkMinimumViableDaySecuredOnQuestComplete(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): boolean {
  return isMinimumViableDayActive(progress, today) && !isMinimumViableDaySecuredToday(progress, today);
}

function scoreQuestForMinimumViableDay(
  quest: UserQuest,
  progress: PlayerProgress,
  universeId: string,
  today: string,
): number {
  if (quest.isCompleted || !isQuestOnActiveBoard(quest, today)) return -1_000;
  if (quest.sourceUniverseId !== universeId) return -1_000;

  let score = 0;

  if (SMALL_QUEST_CATEGORIES.has(quest.category)) score += 40;
  if (hasStarterMove(quest)) score += 35;
  if (resolveQuestRiskLevel(quest.riskLevel) === 'low') score += 30;
  if (!isHighRiskQuest(quest.riskLevel)) score += 15;

  const focusIds = getDailyFocusQuestIds(
    progress.userQuests,
    getDailyFocusLimit(progress),
    today,
    universeId,
  );
  if (focusIds.has(quest.id)) score += 20;

  if (isHighRiskQuest(quest.riskLevel)) score -= 60;

  return score;
}

export function pickSuggestedSmallQuest(
  progress: PlayerProgress,
  universeId: string,
  today: string = getLocalDateKey(),
): UserQuest | null {
  const candidates = progress.userQuests
    .map((quest) => ({
      quest,
      score: scoreQuestForMinimumViableDay(quest, progress, universeId, today),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.quest.originalTitle.localeCompare(right.quest.originalTitle));

  return candidates[0]?.quest ?? null;
}

export function countMinimumDaysSecuredThisMonth(
  progress: Pick<PlayerProgress, 'minimumViableDayByDate'>,
  date = new Date(),
): number {
  const monthKey = getLocalMonthKey(date);
  const prefix = `${monthKey}-`;

  return Object.values(progress.minimumViableDayByDate ?? {}).filter(
    (entry) => entry.securedAt && entry.date.startsWith(prefix),
  ).length;
}

export function sanitizeMinimumViableDayByDate(
  raw: unknown,
): PlayerProgress['minimumViableDayByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['minimumViableDayByDate'] = {};
  const sources = new Set<MinimumViableDaySource>(['awareness', 'briefing', 'next-best-action']);

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.date !== 'string' || entry.date !== dateKey) continue;
    if (typeof entry.activatedAt !== 'string' || entry.activatedAt.length === 0) continue;

    const source =
      typeof entry.source === 'string' && sources.has(entry.source as MinimumViableDaySource)
        ? (entry.source as MinimumViableDaySource)
        : undefined;

    const securedAt =
      typeof entry.securedAt === 'string' && entry.securedAt.length > 0
        ? entry.securedAt
        : undefined;

    result[dateKey] = {
      date: dateKey,
      activatedAt: entry.activatedAt,
      ...(source ? { source } : {}),
      ...(securedAt ? { securedAt } : {}),
    };
  }

  return result;
}

export function pruneMinimumViableDayByDate(
  minimumViableDayByDate: PlayerProgress['minimumViableDayByDate'],
  referenceDate = new Date(),
  retentionDays = 365,
): PlayerProgress['minimumViableDayByDate'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(minimumViableDayByDate ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

export function getMinimumViableDayBoardPriorityAdjustments(
  minimumViableDayActive: boolean,
  quest: Pick<UserQuest, 'riskLevel' | 'starterTaskTitle' | 'category'>,
): number {
  if (!minimumViableDayActive) return 0;

  let adjustment = 0;
  if (isHighRiskQuest(quest.riskLevel)) adjustment += 400;
  if (hasStarterMove(quest)) adjustment -= 120;
  if (SMALL_QUEST_CATEGORIES.has(quest.category)) adjustment -= 100;
  if (resolveQuestRiskLevel(quest.riskLevel) === 'low') adjustment -= 80;
  return adjustment;
}
