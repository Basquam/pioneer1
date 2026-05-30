import { getTodayDailyAwarenessEntry } from '@/lib/daily-awareness';
import { getDailyFocusLimit, getDailyFocusQuestIds } from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked } from '@/lib/focus-lock';
import { LOW_READINESS_THRESHOLD } from '@/lib/quest-friction';
import {
  hasCompletedQuestToday,
  isMinimumViableDayActive,
} from '@/lib/minimum-viable-day';
import { computeQuestReadiness, hasStarterMove } from '@/lib/quest-readiness';
import { userQuestToBoardQuest } from '@/lib/quest-board';
import {
  isQuestInTodayTab,
  isQuestNeedsReview,
  isQuestOnActiveBoard,
} from '@/lib/quest-lifecycle';
import { getQuestLoadStatus } from '@/lib/quest-load';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { computeRoutineMaintenanceSummary } from '@/lib/routine-maintenance';
import {
  getPreparedTodayDisplay,
  getTomorrowSetupForDate,
  hasTomorrowSetupForToday,
} from '@/lib/tomorrow-setup';
import type { PlayerProgress, UserQuest } from '@/types/narrative';

export type CoachTipActionType =
  | 'add-starter-move'
  | 'improve-quest'
  | 'review-quest'
  | 'review-quest-load'
  | 'activate-minimum-day'
  | 'review-routines'
  | 'start-focus'
  | 'start-prepared-quest';

export type CoachTip = {
  id: string;
  title: string;
  message: string;
  ctaLabel?: string;
  actionType?: CoachTipActionType;
  targetQuestId?: string;
  priority: number;
  dismissible: boolean;
  universeFlavorLabel: string;
};

export type ContextualCoachTipContext = {
  progress: PlayerProgress;
  universeId: string;
  today?: string;
};

const UNIVERSE_FLAVOR_LABEL: Record<string, string> = {
  'dust-and-iron': 'Trail Advice',
  neuronet: 'Signal Guidance',
  'neon-ashes': 'Case Note',
};

const TIP_IDS = {
  HIGH_RISK_NO_STARTER: 'high-risk-no-starter',
  LOW_READINESS: 'low-readiness',
  QUEST_NEEDS_REVIEW: 'quest-needs-review',
  BOARD_OVERLOADED: 'board-overloaded',
  LOW_ENERGY_MINIMUM_DAY: 'low-energy-minimum-day',
  STALE_ROUTINES: 'stale-routines',
  NO_QUEST_COMPLETED_TODAY: 'no-quest-completed-today',
  TOMORROW_SETUP_READY: 'tomorrow-setup-ready',
} as const;

function getUniverseFlavorLabel(universeId: string): string {
  return UNIVERSE_FLAVOR_LABEL[universeId] ?? UNIVERSE_FLAVOR_LABEL['dust-and-iron'];
}

function filterUniverseQuests(userQuests: UserQuest[], universeId: string): UserQuest[] {
  return userQuests.filter((quest) => quest.sourceUniverseId === universeId);
}

function getActiveTodayQuests(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): UserQuest[] {
  return filterUniverseQuests(progress.userQuests, universeId).filter(
    (quest) =>
      !quest.isCompleted &&
      isQuestOnActiveBoard(quest, today) &&
      isQuestInTodayTab(quest, today),
  );
}

function isLowReadinessQuest(quest: UserQuest): boolean {
  const readiness = computeQuestReadiness(userQuestToBoardQuest(quest));
  return readiness != null && readiness.score <= LOW_READINESS_THRESHOLD;
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

function findStartFocusQuest(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): UserQuest | null {
  const locked = findLockedFocusIncompleteQuest(progress, universeId, today);
  if (locked) return locked;

  const todayQuests = getActiveTodayQuests(progress, universeId, today);
  const focusLimit = getDailyFocusLimit(progress);
  const focusIds = getDailyFocusQuestIds(progress.userQuests, focusLimit, today, universeId);
  const dailyFocus = todayQuests.find((quest) => focusIds.has(quest.id));
  if (dailyFocus) return dailyFocus;

  return todayQuests[0] ?? null;
}

function buildCandidates(context: ContextualCoachTipContext, today: string): CoachTip[] {
  const { progress, universeId } = context;
  const flavorLabel = getUniverseFlavorLabel(universeId);
  const candidates: CoachTip[] = [];

  const todayQuests = getActiveTodayQuests(progress, universeId, today);

  const highRiskNoStarter = todayQuests.find(
    (quest) => isHighRiskQuest(quest.riskLevel) && !hasStarterMove(quest),
  );
  if (highRiskNoStarter) {
    candidates.push({
      id: TIP_IDS.HIGH_RISK_NO_STARTER,
      title: 'Make this easier to start',
      message: 'High-risk quests are easier when the first move is tiny.',
      ctaLabel: 'Add Starter Move',
      actionType: 'add-starter-move',
      targetQuestId: highRiskNoStarter.id,
      priority: 1,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  const lowReadinessQuest = todayQuests.find((quest) => isLowReadinessQuest(quest));
  if (lowReadinessQuest) {
    candidates.push({
      id: TIP_IDS.LOW_READINESS,
      title: 'This quest needs a clearer first step',
      message: 'A plan, prep step, or starter move can reduce friction.',
      ctaLabel: 'Improve Quest',
      actionType: 'improve-quest',
      targetQuestId: lowReadinessQuest.id,
      priority: 2,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  const reviewQuest = filterUniverseQuests(progress.userQuests, universeId).find(
    (quest) => !quest.isCompleted && isQuestNeedsReview(quest, today),
  );
  if (reviewQuest) {
    candidates.push({
      id: TIP_IDS.QUEST_NEEDS_REVIEW,
      title: 'This quest needs a decision',
      message: 'Carry it, shrink it, snooze it, or archive it.',
      ctaLabel: 'Review Quest',
      actionType: 'review-quest',
      targetQuestId: reviewQuest.id,
      priority: 3,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  const loadStatus = getQuestLoadStatus({ progress, universeId, today });
  if (loadStatus.loadLevel === 'overloaded') {
    candidates.push({
      id: TIP_IDS.BOARD_OVERLOADED,
      title: 'Lighten today’s load',
      message: 'A smaller board is easier to act on.',
      ctaLabel: 'Review Quest Load',
      actionType: 'review-quest-load',
      priority: 4,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  const awareness = getTodayDailyAwarenessEntry(progress, today);
  if (
    awareness?.selectedBlocker === 'low-energy' &&
    !isMinimumViableDayActive(progress, today)
  ) {
    candidates.push({
      id: TIP_IDS.LOW_ENERGY_MINIMUM_DAY,
      title: 'One small action is enough',
      message: 'Minimum Viable Day can keep momentum without pressure.',
      ctaLabel: 'Activate Minimum Day',
      actionType: 'activate-minimum-day',
      priority: 5,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  const routineSummary = computeRoutineMaintenanceSummary({ progress, universeId, today });
  const hasStaleRoutines = routineSummary.entries.some((entry) => entry.status === 'stale');
  if (hasStaleRoutines) {
    candidates.push({
      id: TIP_IDS.STALE_ROUTINES,
      title: 'Some routines may need pruning',
      message: 'Pause, shrink, or redesign routines that no longer help.',
      ctaLabel: 'Review Routines',
      actionType: 'review-routines',
      priority: 6,
      dismissible: true,
      universeFlavorLabel: flavorLabel,
    });
  }

  if (
    todayQuests.length > 0 &&
    !hasCompletedQuestToday(progress, today)
  ) {
    const focusQuest = findStartFocusQuest(progress, universeId, today);
    if (focusQuest) {
      candidates.push({
        id: TIP_IDS.NO_QUEST_COMPLETED_TODAY,
        title: 'Start with one visible move',
        message: 'You don’t need a perfect day. One completed quest counts.',
        ctaLabel: 'Start Focus',
        actionType: 'start-focus',
        targetQuestId: focusQuest.id,
        priority: 7,
        dismissible: true,
        universeFlavorLabel: flavorLabel,
      });
    }
  }

  if (hasTomorrowSetupForToday(progress, today)) {
    const entry = getTomorrowSetupForDate(progress, today);
    const display = entry
      ? getPreparedTodayDisplay(entry, universeId, progress)
      : null;
    if (entry && display?.ctaLabel) {
      candidates.push({
        id: TIP_IDS.TOMORROW_SETUP_READY,
        title: 'Tomorrow is already prepared',
        message: 'Use the setup you created yesterday.',
        ctaLabel: 'Start Prepared Quest',
        actionType: 'start-prepared-quest',
        targetQuestId: entry.selectedTomorrowQuestId,
        priority: 8,
        dismissible: true,
        universeFlavorLabel: flavorLabel,
      });
    }
  }

  return candidates;
}

export function isCoachTipDismissedToday(
  progress: Pick<PlayerProgress, 'dismissedCoachTipsByDate'>,
  tipId: string,
  today: string = getLocalDateKey(),
): boolean {
  const dismissed = progress.dismissedCoachTipsByDate?.[today];
  return Array.isArray(dismissed) && dismissed.includes(tipId);
}

export function dismissCoachTipForToday(
  progress: PlayerProgress,
  tipId: string,
  today: string = getLocalDateKey(),
): PlayerProgress {
  if (isCoachTipDismissedToday(progress, tipId, today)) return progress;

  const existing = progress.dismissedCoachTipsByDate?.[today] ?? [];

  return {
    ...progress,
    dismissedCoachTipsByDate: {
      ...(progress.dismissedCoachTipsByDate ?? {}),
      [today]: [...existing, tipId],
    },
  };
}

export function sanitizeDismissedCoachTipsByDate(
  raw: unknown,
): PlayerProgress['dismissedCoachTipsByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['dismissedCoachTipsByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof dateKey !== 'string' || dateKey.length === 0) continue;
    if (!Array.isArray(value)) continue;

    const tipIds = value.filter((item): item is string => typeof item === 'string' && item.length > 0);
    if (tipIds.length > 0) {
      result[dateKey] = tipIds;
    }
  }

  return result;
}

export function pruneDismissedCoachTipsByDate(
  dismissedCoachTipsByDate: PlayerProgress['dismissedCoachTipsByDate'],
  referenceDate = new Date(),
  retentionDays = 84,
): PlayerProgress['dismissedCoachTipsByDate'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(dismissedCoachTipsByDate ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

export function getContextualCoachTip(context: ContextualCoachTipContext): CoachTip | null {
  const today = context.today ?? getLocalDateKey();
  const candidates = buildCandidates(context, today)
    .filter((tip) => !isCoachTipDismissedToday(context.progress, tip.id, today))
    .sort((left, right) => left.priority - right.priority);

  return candidates[0] ?? null;
}
