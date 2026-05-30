import { getTodayDailyAwarenessEntry } from '@/lib/daily-awareness';
import {
  filterUserQuestsByUniverse,
  getDailyFocusLimit,
  getDailyFocusQuestIds,
} from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked } from '@/lib/focus-lock';
import { isMinimumViableDayActive } from '@/lib/minimum-viable-day';
import { isQuestInTodayTab, isQuestNeedsReview, isQuestOnActiveBoard } from '@/lib/quest-lifecycle';
import { isHighRiskQuest } from '@/lib/quest-risk';
import type { DailyAwarenessBlocker, PlayerProgress } from '@/types/narrative';

export type QuestLoadLevel = 'light' | 'balanced' | 'heavy' | 'overloaded';

export type QuestLoadActionType = 'add-one-quest' | 'start-focus' | 'review-quest-load';

export type QuestLoadSuggestedAction = {
  type: QuestLoadActionType;
  label: string;
  questBoardTab?: 'review' | 'today' | 'focus';
};

export type QuestLoadMetrics = {
  activeTodayCount: number;
  focusQuestCount: number;
  highRiskActiveCount: number;
  staleReviewCount: number;
  incompleteLockedFocusCount: number;
  minimumViableDayActive: boolean;
  awarenessBlocker: DailyAwarenessBlocker | null;
};

export type QuestLoadStatus = {
  loadLevel: QuestLoadLevel;
  score: number;
  explanation: string;
  universeFlavor: string;
  suggestedAction: QuestLoadSuggestedAction;
  metrics: QuestLoadMetrics;
};

export type QuestLoadContext = {
  progress: PlayerProgress;
  universeId: string;
  today?: string;
};

const EXPLANATIONS: Record<QuestLoadLevel, string> = {
  light: 'Light load. Choose one quest and begin.',
  balanced: 'Balanced day. Lock focus and move.',
  heavy: 'Heavy board. Consider archiving or carrying only what matters.',
  overloaded: 'Too much on the board. Review old quests before adding more.',
};

const UNIVERSE_FLAVOR: Record<string, Record<QuestLoadLevel, string>> = {
  'dust-and-iron': {
    light: 'The trail is clear.',
    balanced: "The day's ride looks steady.",
    heavy: 'Too many trails crossing.',
    overloaded: 'The town board is overcrowded.',
  },
  neuronet: {
    light: 'Signal load is clean.',
    balanced: 'Operation load is stable.',
    heavy: 'Signal pressure rising.',
    overloaded: 'System overload risk.',
  },
  'neon-ashes': {
    light: 'The board is readable.',
    balanced: 'The case load is steady.',
    heavy: 'Too many leads competing.',
    overloaded: 'The case board is drowning.',
  },
};

const LOAD_LABELS: Record<QuestLoadLevel, string> = {
  light: 'LIGHT',
  balanced: 'BALANCED',
  heavy: 'HEAVY',
  overloaded: 'OVERLOADED',
};

const LOAD_SEGMENT_INDEX: Record<QuestLoadLevel, number> = {
  light: 1,
  balanced: 2,
  heavy: 3,
  overloaded: 4,
};

export function getQuestLoadLabel(loadLevel: QuestLoadLevel): string {
  return LOAD_LABELS[loadLevel];
}

export function getQuestLoadSegmentCount(loadLevel: QuestLoadLevel): number {
  return LOAD_SEGMENT_INDEX[loadLevel];
}

function getUniverseFlavor(universeId: string, loadLevel: QuestLoadLevel): string {
  return UNIVERSE_FLAVOR[universeId]?.[loadLevel] ?? UNIVERSE_FLAVOR['dust-and-iron'][loadLevel];
}

function countActiveTodayQuests(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): number {
  return filterUserQuestsByUniverse(progress.userQuests, universeId).filter(
    (quest) => !quest.isCompleted && isQuestInTodayTab(quest, today),
  ).length;
}

function countStaleReviewQuests(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): number {
  return filterUserQuestsByUniverse(progress.userQuests, universeId).filter(
    (quest) => !quest.isCompleted && isQuestNeedsReview(quest, today),
  ).length;
}

function countHighRiskActiveQuests(
  progress: PlayerProgress,
  universeId: string,
  today: string,
): number {
  return filterUserQuestsByUniverse(progress.userQuests, universeId).filter(
    (quest) =>
      !quest.isCompleted &&
      isQuestOnActiveBoard(quest, today) &&
      isHighRiskQuest(quest.riskLevel),
  ).length;
}

function countIncompleteLockedFocusQuests(
  progress: PlayerProgress,
  today: string,
): number {
  if (!isTodayFocusLocked(progress, today)) return 0;

  return progress.lockedFocusQuestIds.filter((questId) => {
    const quest = progress.userQuests.find((entry) => entry.id === questId);
    return quest != null && !quest.isCompleted;
  }).length;
}

function computeQuestLoadScore(metrics: QuestLoadMetrics, focusLimit: number): number {
  let score = 0;

  score += metrics.activeTodayCount * 11;
  score += metrics.staleReviewCount * 9;
  score += Math.max(0, metrics.highRiskActiveCount - 1) * 12;
  score += metrics.incompleteLockedFocusCount * 6;
  score += Math.max(0, metrics.focusQuestCount - focusLimit) * 8;

  if (metrics.awarenessBlocker === 'too-many-tasks') score += 12;
  if (metrics.awarenessBlocker === 'low-energy') score += 8;
  if (metrics.minimumViableDayActive) score += 12;

  return Math.min(100, Math.max(0, score));
}

function resolveLoadLevel(metrics: QuestLoadMetrics, score: number): QuestLoadLevel {
  const combinedActive = metrics.activeTodayCount + metrics.staleReviewCount;
  const thresholdShift =
    (metrics.minimumViableDayActive ? 2 : 0) +
    (metrics.awarenessBlocker === 'too-many-tasks' ? 1 : 0);
  const adjustedActive = combinedActive + thresholdShift;

  if (adjustedActive >= 9 || score >= 85) return 'overloaded';
  if (
    adjustedActive >= 6 ||
    score >= 60 ||
    metrics.highRiskActiveCount >= 2 ||
    (metrics.highRiskActiveCount >= 1 && adjustedActive >= 4)
  ) {
    return 'heavy';
  }
  if (adjustedActive >= 3 || score >= 28) return 'balanced';
  return 'light';
}

function buildSuggestedAction(
  loadLevel: QuestLoadLevel,
  metrics: QuestLoadMetrics,
  progress: PlayerProgress,
  universeId: string,
  today: string,
): QuestLoadSuggestedAction {
  if (loadLevel === 'heavy' || loadLevel === 'overloaded') {
    return {
      type: 'review-quest-load',
      label: 'REVIEW QUEST LOAD',
      questBoardTab: metrics.staleReviewCount > 0 ? 'review' : 'today',
    };
  }

  if (loadLevel === 'light') {
    return {
      type: 'add-one-quest',
      label: 'ADD ONE QUEST',
    };
  }

  const focusLimit = getDailyFocusLimit(progress);
  const focusCount = getDailyFocusQuestIds(progress.userQuests, focusLimit, today, universeId).size;
  const canLock =
    !isTodayFocusLocked(progress, today) && focusCount > 0;

  if (canLock || isTodayFocusLocked(progress, today)) {
    return {
      type: 'start-focus',
      label: 'START FOCUS',
      questBoardTab: isTodayFocusLocked(progress, today) ? 'focus' : undefined,
    };
  }

  return {
    type: 'add-one-quest',
    label: 'ADD ONE QUEST',
  };
}

export function getQuestLoadStatus(context: QuestLoadContext): QuestLoadStatus {
  const today = context.today ?? getLocalDateKey();
  const { progress, universeId } = context;
  const focusLimit = getDailyFocusLimit(progress);
  const awarenessEntry = getTodayDailyAwarenessEntry(progress, today);

  const metrics: QuestLoadMetrics = {
    activeTodayCount: countActiveTodayQuests(progress, universeId, today),
    focusQuestCount: getDailyFocusQuestIds(progress.userQuests, focusLimit, today, universeId).size,
    highRiskActiveCount: countHighRiskActiveQuests(progress, universeId, today),
    staleReviewCount: countStaleReviewQuests(progress, universeId, today),
    incompleteLockedFocusCount: countIncompleteLockedFocusQuests(progress, today),
    minimumViableDayActive: isMinimumViableDayActive(progress, today),
    awarenessBlocker: awarenessEntry?.selectedBlocker ?? null,
  };

  const score = computeQuestLoadScore(metrics, focusLimit);
  const loadLevel = resolveLoadLevel(metrics, score);
  const suggestedAction = buildSuggestedAction(loadLevel, metrics, progress, universeId, today);

  return {
    loadLevel,
    score,
    explanation: EXPLANATIONS[loadLevel],
    universeFlavor: getUniverseFlavor(universeId, loadLevel),
    suggestedAction,
    metrics,
  };
}
