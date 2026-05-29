import { getLocalDateKey } from '@/lib/daily-streak';
import type { DailyAwarenessBlocker, PlayerProgress } from '@/types/narrative';

export type DailyAwarenessBlockerOption = {
  blocker: DailyAwarenessBlocker;
  label: string;
};

export const DAILY_AWARENESS_BLOCKER_OPTIONS: DailyAwarenessBlockerOption[] = [
  { blocker: 'low-energy', label: 'Low energy' },
  { blocker: 'too-many-tasks', label: 'Too many tasks' },
  { blocker: 'unclear-priorities', label: 'Unclear priorities' },
  { blocker: 'messy-environment', label: 'Messy environment' },
  { blocker: 'emotional-resistance', label: 'Emotional resistance' },
  { blocker: 'ready', label: "I'm ready" },
];

const UNIVERSE_TAGLINE: Record<string, string> = {
  'dust-and-iron': 'Read the trail before you ride.',
  neuronet: 'Scan the signal before execution.',
  'neon-ashes': 'Review the case before following the lead.',
};

const BLOCKER_RECOMMENDATIONS: Record<DailyAwarenessBlocker, string> = {
  'low-energy': 'Start with a 2-minute recovery quest.',
  'too-many-tasks': "Lock today's focus around 1–3 quests.",
  'unclear-priorities': 'Pick one Focus Quest before adding more.',
  'messy-environment': 'Add a prep step before starting.',
  'emotional-resistance': 'Use Focus Mode and begin with the starter move.',
  ready: 'Choose one quest and ride.',
};

export function getDailyAwarenessTagline(universeId: string): string {
  return UNIVERSE_TAGLINE[universeId] ?? UNIVERSE_TAGLINE['dust-and-iron'];
}

export function getDailyAwarenessRecommendation(blocker: DailyAwarenessBlocker): string {
  return BLOCKER_RECOMMENDATIONS[blocker];
}

export function getTodayDailyAwarenessEntry(
  progress: Pick<PlayerProgress, 'dailyAwarenessByDate'>,
  today: string = getLocalDateKey(),
) {
  return progress.dailyAwarenessByDate[today] ?? null;
}

export function isDailyAwarenessDismissedToday(
  progress: Pick<PlayerProgress, 'dailyAwarenessDismissedDates'>,
  today: string = getLocalDateKey(),
): boolean {
  return progress.dailyAwarenessDismissedDates.includes(today);
}

export function shouldShowDailyAwarenessCheck(
  progress: Pick<
    PlayerProgress,
    'hasOnboarded' | 'dailyAwarenessByDate' | 'dailyAwarenessDismissedDates'
  >,
  today: string = getLocalDateKey(),
): boolean {
  if (!progress.hasOnboarded) return false;
  if (getTodayDailyAwarenessEntry(progress, today)) return false;
  if (isDailyAwarenessDismissedToday(progress, today)) return false;
  return true;
}

export function recordDailyAwarenessAnswer(
  progress: PlayerProgress,
  blocker: DailyAwarenessBlocker,
  today: string = getLocalDateKey(),
): PlayerProgress {
  return {
    ...progress,
    dailyAwarenessByDate: {
      ...progress.dailyAwarenessByDate,
      [today]: {
        date: today,
        selectedBlocker: blocker,
        createdAt: new Date().toISOString(),
      },
    },
  };
}

export function dismissDailyAwarenessForToday(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): PlayerProgress {
  if (isDailyAwarenessDismissedToday(progress, today)) return progress;
  if (getTodayDailyAwarenessEntry(progress, today)) return progress;

  return {
    ...progress,
    dailyAwarenessDismissedDates: [...progress.dailyAwarenessDismissedDates, today],
  };
}

export function sanitizeDailyAwarenessByDate(
  raw: unknown,
): PlayerProgress['dailyAwarenessByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const blockers = new Set(DAILY_AWARENESS_BLOCKER_OPTIONS.map((option) => option.blocker));
  const result: PlayerProgress['dailyAwarenessByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.date !== 'string' || entry.date !== dateKey) continue;
    if (typeof entry.selectedBlocker !== 'string' || !blockers.has(entry.selectedBlocker as DailyAwarenessBlocker)) {
      continue;
    }
    if (typeof entry.createdAt !== 'string' || entry.createdAt.length === 0) continue;

    result[dateKey] = {
      date: dateKey,
      selectedBlocker: entry.selectedBlocker as DailyAwarenessBlocker,
      createdAt: entry.createdAt,
    };
  }

  return result;
}

export function sanitizeDailyAwarenessDismissedDates(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}
