import type { BoardQuest, QuestReadinessChecklist, UserQuest } from '@/types/narrative';

export type { QuestReadinessChecklist };

export type QuestReadiness = {
  score: number;
  maxScore: 4;
  checklist: QuestReadinessChecklist;
};

export const READINESS_ITEM_LABELS = ['Starter', 'Plan', 'Prep', 'Focus'] as const;

export type ReadinessItemKey = keyof QuestReadinessChecklist;

const READINESS_ITEM_KEYS: ReadinessItemKey[] = ['starter', 'plan', 'prep', 'focus'];

export function hasStarterMove(quest: Pick<UserQuest | BoardQuest, 'starterTaskTitle'>): boolean {
  return Boolean(quest.starterTaskTitle?.trim());
}

export function hasPlan(quest: Pick<UserQuest | BoardQuest, 'implementationIntention'>): boolean {
  return Boolean(quest.implementationIntention?.trim());
}

export function hasPrep(quest: Pick<UserQuest | BoardQuest, 'prepStepTitle'>): boolean {
  return Boolean(quest.prepStepTitle?.trim());
}

export function hasFocusCommitment(
  quest: Pick<BoardQuest, 'isDailyFocus' | 'isFocusLocked'>,
): boolean {
  return Boolean(quest.isDailyFocus || quest.isFocusLocked);
}

export function computeQuestReadiness(quest: BoardQuest): QuestReadiness | null {
  if (quest.source !== 'user') return null;

  const checklist: QuestReadinessChecklist = {
    starter: hasStarterMove(quest),
    plan: hasPlan(quest),
    prep: hasPrep(quest),
    focus: hasFocusCommitment(quest),
  };

  const score = READINESS_ITEM_KEYS.filter((key) => checklist[key]).length;

  return { score, maxScore: 4, checklist };
}

export function formatReadinessLabel(score: number, maxScore: number = 4): string {
  return `Readiness: ${score}/${maxScore}`;
}

/** Gentle, non-judgmental hint for the first missing readiness item. */
export function getQuestReadinessSuggestion(readiness: QuestReadiness): string | null {
  if (readiness.score >= readiness.maxScore) return null;

  const { checklist } = readiness;
  if (!checklist.starter) {
    return 'This quest may be easier if you add a starter move.';
  }
  if (!checklist.plan) {
    return 'Pin this quest to a time and place.';
  }
  if (!checklist.prep) {
    return 'A small prep step can make this easier when you return.';
  }
  if (!checklist.focus) {
    return 'Mark this as a focus quest when you want a little extra commitment.';
  }
  return null;
}

export function getReadinessItemLabel(key: ReadinessItemKey): string {
  const index = READINESS_ITEM_KEYS.indexOf(key);
  return READINESS_ITEM_LABELS[index] ?? key;
}

export type UserQuestReadinessUpdates = {
  starterTaskTitle?: string | null;
  implementationIntention?: string | null;
  prepStepTitle?: string | null;
  focusPinned?: boolean;
  originalTitle?: string | null;
  plannedTimeLabel?: string | null;
  afterCurrentHabit?: string | null;
};
