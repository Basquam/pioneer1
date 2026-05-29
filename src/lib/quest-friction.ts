import { resolveQuestCreatedOnDate } from '@/lib/daily-focus';
import { getLocalDateKey } from '@/lib/daily-streak';
import type { BoardQuest, QuestFrictionReason, UserQuest } from '@/types/narrative';

export const LOW_READINESS_THRESHOLD = 2;

export type FrictionReasonOption = {
  reason: QuestFrictionReason;
  label: string;
};

export type FrictionFixCopy = {
  suggestion: string;
  primaryAction: 'starter' | 'plan' | 'prep' | 'focus' | 'time' | 'habit' | 'archive';
};

export const FRICTION_REASON_OPTIONS: FrictionReasonOption[] = [
  { reason: 'too-big', label: 'Too big' },
  { reason: 'too-vague', label: 'Too vague' },
  { reason: 'wrong-time', label: 'Wrong time' },
  { reason: 'forgot', label: 'I forgot' },
  { reason: 'low-energy', label: 'Low energy' },
  { reason: 'not-important', label: 'Not important anymore' },
];

const FRICTION_FIX_COPY: Record<QuestFrictionReason, FrictionFixCopy> = {
  'too-big': {
    suggestion: 'Shrink it to the first visible move.',
    primaryAction: 'starter',
  },
  'too-vague': {
    suggestion: 'Make the next action specific.',
    primaryAction: 'plan',
  },
  'wrong-time': {
    suggestion: 'Move it to a better moment.',
    primaryAction: 'time',
  },
  forgot: {
    suggestion: 'Attach it to something you already do.',
    primaryAction: 'habit',
  },
  'low-energy': {
    suggestion: 'Lower the activation cost.',
    primaryAction: 'starter',
  },
  'not-important': {
    suggestion: 'Clearing noise is also progress.',
    primaryAction: 'archive',
  },
};

export function getFrictionFixCopy(reason: QuestFrictionReason): FrictionFixCopy {
  return FRICTION_FIX_COPY[reason];
}

export function getFrictionReasonLabel(reason: QuestFrictionReason): string {
  return FRICTION_REASON_OPTIONS.find((option) => option.reason === reason)?.label ?? reason;
}

export function isQuestCreatedBeforeToday(
  quest: Pick<UserQuest, 'id' | 'createdOnDate'>,
  today: string = getLocalDateKey(),
): boolean {
  const createdOn = resolveQuestCreatedOnDate(quest);
  return createdOn.length > 0 && createdOn < today;
}

export function shouldShowFrictionReview(
  quest: Pick<
    BoardQuest,
    'source' | 'completed' | 'readinessScore' | 'createdOnDate' | 'id'
  >,
  today: string = getLocalDateKey(),
): boolean {
  if (quest.source !== 'user' || quest.completed) return false;

  const createdBeforeToday = quest.createdOnDate
    ? quest.createdOnDate < today
    : isQuestCreatedBeforeToday({ id: quest.id, createdOnDate: quest.createdOnDate }, today);

  const lowReadiness =
    quest.readinessScore != null && quest.readinessScore <= LOW_READINESS_THRESHOLD;

  return createdBeforeToday || lowReadiness;
}

export function isUserQuestArchived(quest: Pick<UserQuest, 'archivedAt'>): boolean {
  return Boolean(quest.archivedAt?.trim());
}

export function buildHabitStackPlan(habit: string, taskTitle: string): string {
  const trimmedHabit = habit.trim();
  const trimmedTask = taskTitle.trim();
  if (!trimmedHabit) return trimmedTask;
  if (!trimmedTask) return `After ${trimmedHabit}`;
  return `After ${trimmedHabit}, I will ${trimmedTask.charAt(0).toLowerCase()}${trimmedTask.slice(1)}`;
}

export function buildTimedPlan(timeLabel: string, taskTitle: string): string {
  const trimmedTime = timeLabel.trim();
  const trimmedTask = taskTitle.trim();
  if (!trimmedTime) return trimmedTask;
  if (!trimmedTask) return trimmedTime;
  return `${trimmedTime}: ${trimmedTask}`;
}
