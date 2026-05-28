import type { PlayerProgress } from '@/types/narrative';

/** Local calendar date key (YYYY-MM-DD) in the device timezone. */
export function getLocalDateKey(date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function daysBetween(earlierKey: string, laterKey: string): number {
  const earlier = parseLocalDateKey(earlierKey);
  const later = parseLocalDateKey(laterKey);
  return Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
}

export type StreakFlavor = {
  label: string;
  shortLabel: string;
  encouragement: string;
};

const IRON_RAILWAY_SAGA_ID = 'iron-railway-company';

export function getStreakFlavor(selectedSagaId: string, universeId = 'dust-and-iron'): StreakFlavor {
  if (universeId === 'neuronet') {
    return {
      label: 'Signal Stability',
      shortLabel: 'SIGNAL STABILITY',
      encouragement: 'The grid holds steady when you return each day.',
    };
  }

  if (selectedSagaId === IRON_RAILWAY_SAGA_ID) {
    return {
      label: 'Route Reliability',
      shortLabel: 'ROUTE RELIABILITY',
      encouragement: 'The line keeps running while you keep showing up.',
    };
  }

  return {
    label: 'Town Stability',
    shortLabel: 'TOWN STABILITY',
    encouragement: 'Dustfall holds steady when you return each day.',
  };
}

export function formatStreakDays(streak: number): string {
  if (streak === 1) return '1 day';
  return `${streak} days`;
}

/**
 * Updates streak when the app is opened on a new local day.
 * - Same day: no change
 * - Consecutive day: streak + 1
 * - Missed day(s): streak resets to 1 (gentle — never zero)
 * - First visit: streak starts at 1
 */
export function applyDailyStreakOnOpen(progress: PlayerProgress): PlayerProgress {
  const today = getLocalDateKey();

  if (progress.lastActiveDate === today) {
    return progress;
  }

  let dailyStreak = 1;

  if (progress.lastActiveDate) {
    const gap = daysBetween(progress.lastActiveDate, today);
    if (gap === 1) {
      dailyStreak = Math.max(1, progress.dailyStreak + 1);
    }
  }

  return {
    ...progress,
    lastActiveDate: today,
    dailyStreak,
  };
}
