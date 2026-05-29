import { getLocalDateKey } from '@/lib/daily-streak';
import {
  EMPTY_ACTIVITY,
  pruneActivityByDate,
} from '@/lib/player-progress-sanitize';
import type { DailyActivity, PlayerProgress } from '@/types/narrative';

export type WeeklyRecapStats = {
  weekLabel: string;
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  chaptersCompleted: number;
  highRiskQuestsCompleted: number;
  dailyStreak: number;
  flavorLine: string;
};

const IRON_RAILWAY_SAGA_ID = 'iron-railway-company';

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

/** Local week key — Sunday start date (YYYY-MM-DD) in the user's timezone. */
export function getLocalWeekKey(date = new Date()): string {
  return getCurrentWeekDateKeys(date)[0]!;
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
  options?: { highRisk?: boolean },
): PlayerProgress {
  return upsertDailyActivity(progress, dateKey, (current) => ({
    ...current,
    questsCompleted: current.questsCompleted + 1,
    xpEarned: current.xpEarned + xpEarned,
    reputationEarned: current.reputationEarned + reputationEarned,
    highRiskQuestsCompleted:
      current.highRiskQuestsCompleted + (options?.highRisk ? 1 : 0),
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
  let highRiskQuestsCompleted = 0;

  for (const dateKey of weekKeys) {
    const day = activity[dateKey];
    if (!day) continue;
    questsCompleted += day.questsCompleted;
    xpEarned += day.xpEarned;
    reputationEarned += day.reputationEarned;
    chaptersCompleted += day.chaptersCompleted;
    highRiskQuestsCompleted += day.highRiskQuestsCompleted;
  }

  return {
    weekLabel: formatWeekRange(weekKeys[0]!, weekKeys[6]!),
    questsCompleted,
    xpEarned,
    reputationEarned,
    chaptersCompleted,
    highRiskQuestsCompleted,
    dailyStreak: progress.dailyStreak,
    flavorLine: getWeeklyRecapFlavor(selectedSagaId, universeId),
  };
}
