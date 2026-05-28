import { getLocalDateKey } from '@/lib/daily-streak';
import type { DailyActivity, PlayerProgress } from '@/types/narrative';

export type WeeklyRecapStats = {
  weekLabel: string;
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  chaptersCompleted: number;
  dailyStreak: number;
  flavorLine: string;
};

const IRON_RAILWAY_SAGA_ID = 'iron-railway-company';
const ACTIVITY_RETENTION_DAYS = 90;

const EMPTY_ACTIVITY: DailyActivity = {
  questsCompleted: 0,
  xpEarned: 0,
  reputationEarned: 0,
  chaptersCompleted: 0,
};

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

/** Current local calendar week (Sunday–Saturday) as date keys. */
export function getCurrentWeekDateKeys(date = new Date()): string[] {
  const weekStart = new Date(date);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  weekStart.setHours(12, 0, 0, 0);

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + index);
    return getLocalDateKey(day);
  });
}

export function formatWeekRange(startKey: string, endKey: string): string {
  const formatOpts: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  const start = parseLocalDateKey(startKey).toLocaleDateString(undefined, formatOpts);
  const end = parseLocalDateKey(endKey).toLocaleDateString(undefined, formatOpts);
  return `${start} – ${end}`;
}

export function getWeeklyRecapFlavor(selectedSagaId: string, universeId = 'dust-and-iron'): string {
  if (universeId === 'neuronet') {
    return 'This week, the Neon Spire held because you kept the signal alive.';
  }

  if (universeId === 'neon-ashes') {
    return 'This week, Grayhaven leaned toward truth because you kept the case alive.';
  }

  if (selectedSagaId === IRON_RAILWAY_SAGA_ID) {
    return 'This week, the line kept moving because you kept moving.';
  }

  return 'This week, Dustfall stood because you showed up.';
}

function pruneActivityByDate(
  activityByDate: Record<string, DailyActivity>,
  referenceDate = new Date(),
): Record<string, DailyActivity> {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - ACTIVITY_RETENTION_DAYS);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(activityByDate).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

function upsertDailyActivity(
  progress: PlayerProgress,
  dateKey: string,
  updater: (current: DailyActivity) => DailyActivity,
): PlayerProgress {
  const activityByDate = progress.activityByDate ?? {};
  const current = activityByDate[dateKey] ?? EMPTY_ACTIVITY;

  return {
    ...progress,
    activityByDate: pruneActivityByDate({
      ...activityByDate,
      [dateKey]: updater(current),
    }),
  };
}

export function recordQuestCompleted(
  progress: PlayerProgress,
  xpEarned: number,
  reputationEarned: number,
  dateKey: string = getLocalDateKey(),
): PlayerProgress {
  return upsertDailyActivity(progress, dateKey, (current) => ({
    questsCompleted: current.questsCompleted + 1,
    xpEarned: current.xpEarned + xpEarned,
    reputationEarned: current.reputationEarned + reputationEarned,
    chaptersCompleted: current.chaptersCompleted,
  }));
}

export function recordChapterCompleted(
  progress: PlayerProgress,
  dateKey: string = getLocalDateKey(),
): PlayerProgress {
  return upsertDailyActivity(progress, dateKey, (current) => ({
    ...current,
    chaptersCompleted: current.chaptersCompleted + 1,
  }));
}

export function computeWeeklyRecap(
  progress: PlayerProgress,
  selectedSagaId: string,
  date = new Date(),
  universeId = 'dust-and-iron',
): WeeklyRecapStats {
  const weekKeys = getCurrentWeekDateKeys(date);
  const activity = progress.activityByDate ?? {};

  let questsCompleted = 0;
  let xpEarned = 0;
  let reputationEarned = 0;
  let chaptersCompleted = 0;

  for (const dateKey of weekKeys) {
    const day = activity[dateKey];
    if (!day) continue;
    questsCompleted += day.questsCompleted;
    xpEarned += day.xpEarned;
    reputationEarned += day.reputationEarned;
    chaptersCompleted += day.chaptersCompleted;
  }

  return {
    weekLabel: formatWeekRange(weekKeys[0]!, weekKeys[6]!),
    questsCompleted,
    xpEarned,
    reputationEarned,
    chaptersCompleted,
    dailyStreak: progress.dailyStreak,
    flavorLine: getWeeklyRecapFlavor(selectedSagaId, universeId),
  };
}
