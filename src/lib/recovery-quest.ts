import { applyDailyStreakOnOpen, getLocalDateKey } from '@/lib/daily-streak';
import type { PlayerProgress, TaskCategory } from '@/types/narrative';

export const RECOVERY_QUEST_CATEGORIES: TaskCategory[] = ['health', 'cleaning', 'work', 'study'];

export type RecoveryQuestCopy = {
  prompt: string;
  ctaLabel: string;
  completeMessage: string;
};

const RECOVERY_COPY: Record<string, RecoveryQuestCopy> = {
  'dust-and-iron': {
    prompt: 'The trail went quiet. One small move brings Dustfall back online.',
    ctaLabel: 'START A 2-MINUTE RECOVERY QUEST',
    completeMessage: 'Back on the trail.',
  },
  neuronet: {
    prompt: 'Signal dropped. Run one small operation to stabilize the feed.',
    ctaLabel: 'START A 2-MINUTE RECOVERY QUEST',
    completeMessage: 'Signal restored.',
  },
  'neon-ashes': {
    prompt: 'The case went cold. Follow one small lead to reopen it.',
    ctaLabel: 'START A 2-MINUTE RECOVERY QUEST',
    completeMessage: 'Case reopened.',
  },
};

const DEFAULT_RECOVERY_COPY: RecoveryQuestCopy = {
  prompt: 'The trail went quiet. One small move brings it back.',
  ctaLabel: 'START A 2-MINUTE RECOVERY QUEST',
  completeMessage: 'Back on the trail.',
};

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function daysBetween(earlierKey: string, laterKey: string): number {
  const earlier = parseLocalDateKey(earlierKey);
  const later = parseLocalDateKey(laterKey);
  return Math.round((later.getTime() - earlier.getTime()) / (1000 * 60 * 60 * 24));
}

export function getRecoveryQuestCopy(universeId: string): RecoveryQuestCopy {
  return RECOVERY_COPY[universeId] ?? DEFAULT_RECOVERY_COPY;
}

export function sanitizeRecoveryQuestCompletedDates(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

/**
 * Detect a return after missing one or more local calendar days.
 * Must run before applyDailyStreakOnOpen updates lastActiveDate.
 */
export function applyRecoveryOnOpen(progress: PlayerProgress): PlayerProgress {
  const today = getLocalDateKey();

  if (!progress.lastActiveDate || progress.lastActiveDate === today) {
    return progress;
  }

  const gap = daysBetween(progress.lastActiveDate, today);
  if (gap <= 1) {
    return progress;
  }

  return {
    ...progress,
    lastMissedDate: progress.lastActiveDate,
    recoveryQuestOfferedForDate: today,
  };
}

export function applySessionOnOpen(progress: PlayerProgress): PlayerProgress {
  return applyDailyStreakOnOpen(applyRecoveryOnOpen(progress));
}

export function shouldShowRecoveryPrompt(progress: PlayerProgress, today = getLocalDateKey()): boolean {
  if (!progress.hasOnboarded) return false;

  return (
    progress.recoveryQuestOfferedForDate === today &&
    !progress.recoveryQuestCompletedDates.includes(today)
  );
}

export function shouldMarkRecoveryOnQuestComplete(
  progress: PlayerProgress,
  today = getLocalDateKey(),
): boolean {
  return (
    progress.recoveryQuestOfferedForDate === today &&
    !progress.recoveryQuestCompletedDates.includes(today)
  );
}

export function markRecoveryQuestComplete(
  progress: PlayerProgress,
  today = getLocalDateKey(),
): PlayerProgress {
  if (!shouldMarkRecoveryOnQuestComplete(progress, today)) {
    return progress;
  }

  return {
    ...progress,
    recoveryQuestCompletedDates: [...progress.recoveryQuestCompletedDates, today],
  };
}

export function getDefaultRecoveryCategory(): TaskCategory {
  return RECOVERY_QUEST_CATEGORIES[0] ?? 'health';
}

export function getDefaultRecoveryTaskTitle(category: TaskCategory): string {
  switch (category) {
    case 'health':
      return 'Take 2 minutes for water or a quick check-in';
    case 'cleaning':
      return 'Clear one visible surface';
    case 'work':
      return 'Do one small work task for 2 minutes';
    case 'study':
      return 'Open notes and study for 2 minutes';
    default:
      return 'One small 2-minute step';
  }
}
