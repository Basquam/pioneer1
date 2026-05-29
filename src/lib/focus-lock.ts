import { getLocalDateKey } from '@/lib/daily-streak';
import { getDailyFocusLimit, getDailyFocusQuestIds } from '@/lib/daily-focus';
import type { PlayerProgress } from '@/types/narrative';

export type FocusLockCopy = {
  lockedMessage: string;
  lockedFlavor: string;
  lockButtonLabel: string;
  lockConfirmTitle: string;
  lockConfirmMessage: string;
  addQuestLockedHint: string;
  lockedQuestBadge: string;
};

const FOCUS_LOCK_COPY: Record<string, FocusLockCopy> = {
  'dust-and-iron': {
    lockedMessage: "Today's story is locked.",
    lockedFlavor: "Today's trail is marked.",
    lockButtonLabel: "LOCK TODAY'S FOCUS",
    lockConfirmTitle: "Lock today's story?",
    lockConfirmMessage: "Lock today's story around these focus quests?",
    addQuestLockedHint:
      "Today's focus is already locked. Extra quests will not change today's core story.",
    lockedQuestBadge: 'LOCKED FOCUS',
  },
  neuronet: {
    lockedMessage: "Today's story is locked.",
    lockedFlavor: 'Execution window locked.',
    lockButtonLabel: "LOCK TODAY'S FOCUS",
    lockConfirmTitle: 'Lock execution window?',
    lockConfirmMessage: "Lock today's story around these focus quests?",
    addQuestLockedHint:
      "Today's focus is already locked. Extra quests will not change today's core story.",
    lockedQuestBadge: 'LOCKED FOCUS',
  },
  'neon-ashes': {
    lockedMessage: "Today's story is locked.",
    lockedFlavor: 'The case board is pinned.',
    lockButtonLabel: "LOCK TODAY'S FOCUS",
    lockConfirmTitle: 'Pin the case board?',
    lockConfirmMessage: "Lock today's story around these focus quests?",
    addQuestLockedHint:
      "Today's focus is already locked. Extra quests will not change today's core story.",
    lockedQuestBadge: 'LOCKED FOCUS',
  },
};

export function getFocusLockCopy(universeId: string): FocusLockCopy {
  return FOCUS_LOCK_COPY[universeId] ?? FOCUS_LOCK_COPY['dust-and-iron'];
}

export function sanitizeLockedFocusQuestIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

export function isTodayFocusLocked(
  progress: Pick<PlayerProgress, 'focusLockedDate'>,
  today: string = getLocalDateKey(),
): boolean {
  return progress.focusLockedDate === today;
}

export function getTodayFocusQuestCount(
  progress: Pick<PlayerProgress, 'userQuests' | 'dailyFocusLimit'>,
  universeId: string,
  today: string = getLocalDateKey(),
): number {
  const limit = getDailyFocusLimit(progress);
  return getDailyFocusQuestIds(progress.userQuests, limit, today, universeId).size;
}

export function canLockTodayFocus(
  progress: Pick<PlayerProgress, 'userQuests' | 'dailyFocusLimit' | 'focusLockedDate'>,
  universeId: string,
  today: string = getLocalDateKey(),
): boolean {
  if (isTodayFocusLocked(progress, today)) return false;
  return getTodayFocusQuestCount(progress, universeId, today) > 0;
}

export function lockTodayFocus(
  progress: PlayerProgress,
  universeId: string,
  today: string = getLocalDateKey(),
): PlayerProgress {
  const limit = getDailyFocusLimit(progress);
  const lockedFocusQuestIds = Array.from(
    getDailyFocusQuestIds(progress.userQuests, limit, today, universeId),
  );

  if (lockedFocusQuestIds.length === 0) {
    return progress;
  }

  return {
    ...progress,
    focusLockedDate: today,
    lockedFocusQuestIds,
  };
}

export function unlockTodayFocus(progress: PlayerProgress): PlayerProgress {
  return {
    ...progress,
    focusLockedDate: null,
    lockedFocusQuestIds: [],
  };
}

export function isQuestInLockedFocus(
  questId: string,
  progress: Pick<PlayerProgress, 'focusLockedDate' | 'lockedFocusQuestIds'>,
  today: string = getLocalDateKey(),
): boolean {
  if (!isTodayFocusLocked(progress, today)) return false;
  return progress.lockedFocusQuestIds.includes(questId);
}

export function getLockedFocusQuestIdSet(
  progress: Pick<PlayerProgress, 'focusLockedDate' | 'lockedFocusQuestIds'>,
  today: string = getLocalDateKey(),
): Set<string> {
  if (!isTodayFocusLocked(progress, today)) return new Set();
  return new Set(progress.lockedFocusQuestIds);
}
