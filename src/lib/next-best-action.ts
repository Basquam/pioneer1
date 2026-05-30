import { shouldShowDailyAwarenessCheck, getTodayDailyAwarenessEntry } from '@/lib/daily-awareness';
import { getDailyShutdownEntry, shouldShowDailyShutdownPrompt } from '@/lib/daily-shutdown';
import { countTodayUserQuests } from '@/lib/daily-focus';
import { isQuestStarted } from '@/lib/decisive-moment';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked } from '@/lib/focus-lock';
import { getActiveInboxItems } from '@/lib/quest-inbox';
import { isQuestNeedsReview, isQuestOnActiveBoard } from '@/lib/quest-lifecycle';
import { isMonthlyReviewClosed } from '@/lib/monthly-review';
import {
  getMinimumViableDayCopy,
  hasCompletedQuestToday,
  isMinimumViableDayActive,
  isMinimumViableDaySecuredToday,
  pickSuggestedSmallQuest,
  shouldSuggestMvdFromAwarenessBlocker,
} from '@/lib/minimum-viable-day';
import { shouldShowRecoveryPrompt } from '@/lib/recovery-quest';
import { computeWeeklyRecap, getLocalWeekKey } from '@/lib/weekly-recap';
import { getWeeklyReviewEntry } from '@/lib/weekly-review';
import type { PlayerProgress, UserQuest } from '@/types/narrative';

export type NextBestActionType =
  | 'recovery-quest'
  | 'daily-awareness'
  | 'activate-minimum-day'
  | 'do-one-small-quest'
  | 'locked-focus'
  | 'continue-started'
  | 'review-stale'
  | 'convert-inbox'
  | 'add-quest'
  | 'advance-story'
  | 'daily-shutdown'
  | 'weekly-review'
  | 'monthly-review'
  | 'open-quest-board';

export type NextBestAction = {
  id: string;
  priority: number;
  title: string;
  description: string;
  ctaLabel: string;
  actionType: NextBestActionType;
  targetQuestId?: string;
  targetInboxItemId?: string;
  route?: '/(game)/quests' | '/(game)/profile' | '/(game)/hq';
  questBoardTab?: 'review' | 'chapter' | 'today';
  universeFlavor: string;
};

export type NextBestActionContext = {
  progress: PlayerProgress;
  universeId: string;
  remainingChapterBounties: number;
  today?: string;
  now?: Date;
};

const UNIVERSE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Next move on the trail.',
  neuronet: 'Next executable action.',
  'neon-ashes': 'Next lead to follow.',
};

const EVENING_HOUR = 17;

function getUniverseFlavor(universeId: string): string {
  return UNIVERSE_FLAVOR[universeId] ?? UNIVERSE_FLAVOR['dust-and-iron'];
}

function isEvening(now: Date): boolean {
  return now.getHours() >= EVENING_HOUR;
}

function isLastDaysOfMonth(now: Date, daysFromEnd = 3): boolean {
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return now.getDate() > lastDay - daysFromEnd;
}

function filterUniverseQuests(
  userQuests: UserQuest[],
  universeId: string,
): UserQuest[] {
  return userQuests.filter((quest) => quest.sourceUniverseId === universeId);
}

function findLockedFocusIncompleteQuest(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): UserQuest | null {
  if (!isTodayFocusLocked(progress, today)) return null;

  for (const questId of progress.lockedFocusQuestIds) {
    const quest = progress.userQuests.find((entry) => entry.id === questId);
    if (
      quest &&
      quest.sourceUniverseId === universeId &&
      !quest.isCompleted &&
      isQuestOnActiveBoard(quest, today)
    ) {
      return quest;
    }
  }

  return null;
}

function findStartedIncompleteQuest(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): UserQuest | null {
  const candidates = filterUniverseQuests(progress.userQuests, universeId)
    .filter(
      (quest) =>
        !quest.isCompleted &&
        isQuestOnActiveBoard(quest, today) &&
        isQuestStarted(quest.id, progress),
    )
    .sort((left, right) => {
      const leftStarted = progress.userQuests.find((q) => q.id === left.id)?.startedAt ?? '';
      const rightStarted = progress.userQuests.find((q) => q.id === right.id)?.startedAt ?? '';
      return rightStarted.localeCompare(leftStarted);
    });

  return candidates[0] ?? null;
}

function countStaleReviewQuests(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): number {
  return filterUniverseQuests(progress.userQuests, universeId).filter((quest) =>
    isQuestNeedsReview(quest, today),
  ).length;
}

function isWeeklyReviewDue(progress: PlayerProgress, now: Date): boolean {
  const weekKey = getLocalWeekKey(now);
  if (getWeeklyReviewEntry(progress, weekKey)) return false;

  const recap = computeWeeklyRecap(progress, progress.selectedSagaId, now, progress.selectedUniverseId);
  const hasActivity =
    recap.questsCompleted > 0 ||
    recap.xpEarned > 0 ||
    recap.reputationEarned > 0 ||
    recap.chaptersCompleted > 0;

  if (!hasActivity) return false;

  const weekday = now.getDay();
  return weekday === 0 || weekday === 6 || recap.questsCompleted >= 3;
}

function isMonthlyReviewDue(progress: PlayerProgress, now: Date): boolean {
  const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  if (isMonthlyReviewClosed(progress, monthKey)) return false;

  const monthPrefix = `${monthKey}-`;
  const activity = progress.activityByDate ?? {};
  const hasActivity = Object.entries(activity).some(
    ([dateKey, day]) => dateKey.startsWith(monthPrefix) && day.questsCompleted > 0,
  );

  if (!hasActivity) return false;

  return isLastDaysOfMonth(now) || now.getDate() >= 15;
}

export function isNextBestActionDismissedToday(
  progress: Pick<PlayerProgress, 'dismissedNextBestActionByDate'>,
  today: string = getLocalDateKey(),
): boolean {
  return progress.dismissedNextBestActionByDate?.[today] === true;
}

export function dismissNextBestActionForToday(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): PlayerProgress {
  if (isNextBestActionDismissedToday(progress, today)) return progress;

  return {
    ...progress,
    dismissedNextBestActionByDate: {
      ...(progress.dismissedNextBestActionByDate ?? {}),
      [today]: true,
    },
  };
}

export function sanitizeDismissedNextBestActionByDate(
  raw: unknown,
): PlayerProgress['dismissedNextBestActionByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['dismissedNextBestActionByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof dateKey !== 'string' || dateKey.length === 0) continue;
    if (value === true) {
      result[dateKey] = true;
    }
  }

  return result;
}

export function pruneDismissedNextBestActionByDate(
  dismissedNextBestActionByDate: PlayerProgress['dismissedNextBestActionByDate'],
  referenceDate = new Date(),
  retentionDays = 84,
): PlayerProgress['dismissedNextBestActionByDate'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(dismissedNextBestActionByDate ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

export function getNextBestAction(context: NextBestActionContext): NextBestAction {
  const today = context.today ?? getLocalDateKey(context.now);
  const now = context.now ?? new Date();
  const { progress, universeId } = context;
  const flavor = getUniverseFlavor(universeId);
  const inboxItems = getActiveInboxItems(progress.questInbox);

  if (shouldShowRecoveryPrompt(progress, today)) {
    return {
      id: 'recovery-quest',
      priority: 1,
      title: 'Welcome back',
      description: 'One small recovery quest stabilizes the day — no penalty for the gap.',
      ctaLabel: 'START RECOVERY QUEST',
      actionType: 'recovery-quest',
      route: '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  if (shouldShowDailyAwarenessCheck(progress, today)) {
    return {
      id: 'daily-awareness',
      priority: 2,
      title: 'Check in first',
      description: 'Name what might slow you down today — then pick a move that fits.',
      ctaLabel: "CHECK TODAY'S FRICTION",
      actionType: 'daily-awareness',
      route: '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  if (shouldShowDailyAwarenessCheck(progress, today)) {
    return {
      id: 'daily-awareness',
      priority: 2,
      title: 'Check in first',
      description: 'Name what might slow you down today — then pick a move that fits.',
      ctaLabel: "CHECK TODAY'S FRICTION",
      actionType: 'daily-awareness',
      route: '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  const awarenessEntry = getTodayDailyAwarenessEntry(progress, today);
  if (
    awarenessEntry &&
    shouldSuggestMvdFromAwarenessBlocker(awarenessEntry.selectedBlocker) &&
    !isMinimumViableDayActive(progress, today)
  ) {
    const mvdCopy = getMinimumViableDayCopy(universeId);
    return {
      id: 'activate-minimum-day',
      priority: 2.5,
      title: 'Lighten today',
      description: 'Low energy still counts — one small quest is enough to hold momentum.',
      ctaLabel: 'ENABLE MINIMUM VIABLE DAY',
      actionType: 'activate-minimum-day',
      route: '/(game)/hq',
      universeFlavor: mvdCopy.title,
    };
  }

  if (
    isMinimumViableDayActive(progress, today) &&
    !isMinimumViableDaySecuredToday(progress, today) &&
    !hasCompletedQuestToday(progress, today)
  ) {
    const suggestedQuest = pickSuggestedSmallQuest(progress, universeId, today);
    const mvdCopy = getMinimumViableDayCopy(universeId);
    return {
      id: 'do-one-small-quest',
      priority: 2.6,
      title: suggestedQuest?.originalTitle ?? 'One small quest',
      description: mvdCopy.title,
      ctaLabel: 'DO ONE SMALL QUEST',
      actionType: 'do-one-small-quest',
      targetQuestId: suggestedQuest?.id,
      route: suggestedQuest ? '/(game)/quests' : '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  const lockedFocusQuest = findLockedFocusIncompleteQuest(progress, universeId, today);
  if (lockedFocusQuest) {
    return {
      id: 'locked-focus',
      priority: 3,
      title: lockedFocusQuest.originalTitle,
      description: "Today's locked focus is still open — one clear push finishes the window.",
      ctaLabel: 'START LOCKED FOCUS',
      actionType: 'locked-focus',
      targetQuestId: lockedFocusQuest.id,
      route: '/(game)/quests',
      universeFlavor: flavor,
    };
  }

  const startedQuest = findStartedIncompleteQuest(progress, universeId, today);
  if (startedQuest) {
    return {
      id: 'continue-started',
      priority: 4,
      title: startedQuest.originalTitle,
      description: 'You already started this — continuing beats restarting.',
      ctaLabel: 'CONTINUE STARTED QUEST',
      actionType: 'continue-started',
      targetQuestId: startedQuest.id,
      route: '/(game)/quests',
      universeFlavor: flavor,
    };
  }

  const staleCount = countStaleReviewQuests(progress, universeId, today);
  if (staleCount > 0) {
    return {
      id: 'review-stale',
      priority: 5,
      title: 'Quests need a decision',
      description: `${staleCount} older quest${staleCount === 1 ? '' : 's'} waiting — carry, snooze, or archive without shame.`,
      ctaLabel: 'REVIEW OLD QUESTS',
      actionType: 'review-stale',
      route: '/(game)/quests',
      questBoardTab: 'review',
      universeFlavor: flavor,
    };
  }

  if (inboxItems.length > 0) {
    const first = inboxItems[0]!;
    return {
      id: 'convert-inbox',
      priority: 6,
      title: first.title,
      description: 'A captured task is ready to become a quest.',
      ctaLabel: 'CONVERT INBOX ITEM',
      actionType: 'convert-inbox',
      targetInboxItemId: first.id,
      route: '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  const todayQuestCount = countTodayUserQuests(progress.userQuests, today, universeId);
  if (todayQuestCount === 0) {
    return {
      id: 'add-quest',
      priority: 7,
      title: 'Start with one quest',
      description: 'Today has no personal quests yet — one small win is enough to begin.',
      ctaLabel: "ADD TODAY'S QUEST",
      actionType: 'add-quest',
      route: '/(game)/quests',
      universeFlavor: flavor,
    };
  }

  if (context.remainingChapterBounties > 0) {
    return {
      id: 'advance-story',
      priority: 8,
      title: 'Story bounties remain',
      description: `${context.remainingChapterBounties} chapter mission${context.remainingChapterBounties === 1 ? '' : 's'} still open on the board.`,
      ctaLabel: 'ADVANCE THE STORY',
      actionType: 'advance-story',
      route: '/(game)/quests',
      questBoardTab: 'chapter',
      universeFlavor: flavor,
    };
  }

  if (
    isEvening(now) &&
    shouldShowDailyShutdownPrompt(progress, today) &&
    !getDailyShutdownEntry(progress, today)
  ) {
    return {
      id: 'daily-shutdown',
      priority: 9,
      title: 'Close the day',
      description: 'A quick shutdown logs what worked and clears space for tomorrow.',
      ctaLabel: 'CLOSE TODAY',
      actionType: 'daily-shutdown',
      route: '/(game)/hq',
      universeFlavor: flavor,
    };
  }

  if (isWeeklyReviewDue(progress, now)) {
    return {
      id: 'weekly-review',
      priority: 10,
      title: 'Weekly reflection',
      description: 'Your week has momentum — a short review helps next week start cleaner.',
      ctaLabel: 'REVIEW THE WEEK',
      actionType: 'weekly-review',
      route: '/(game)/profile',
      universeFlavor: flavor,
    };
  }

  if (isMonthlyReviewDue(progress, now)) {
    return {
      id: 'monthly-review',
      priority: 11,
      title: 'Season report ready',
      description: 'See how this month’s small wins became identity evidence.',
      ctaLabel: 'REVIEW THE MONTH',
      actionType: 'monthly-review',
      route: '/(game)/profile',
      universeFlavor: flavor,
    };
  }

  return {
    id: 'open-quest-board',
    priority: 12,
    title: 'Pick your next quest',
    description: 'The board has your active missions — choose one and move.',
    ctaLabel: 'OPEN QUEST BOARD',
    actionType: 'open-quest-board',
    route: '/(game)/quests',
    universeFlavor: flavor,
  };
}
