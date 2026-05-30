import { resolveQuestCreatedOnDate } from '@/lib/daily-focus';
import { getLocalDateKey, getTomorrowDateKey } from '@/lib/daily-streak';
import { recordQuestCompletedAt } from '@/lib/motion-vs-action';
import type { BoardQuest, QuestLifecycleStatus, UserQuest } from '@/types/narrative';

export type QuestLifecycleAction =
  | 'carry-today'
  | 'snooze'
  | 'split'
  | 'archive'
  | 'complete'
  | 'leave';

export type SnoozePreset = 'tomorrow' | 'weekend' | 'next-week' | 'custom';

export const SNOOZE_PRESET_OPTIONS: Array<{ value: SnoozePreset; label: string }> = [
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This weekend' },
  { value: 'next-week', label: 'Next week' },
  { value: 'custom', label: 'Custom date' },
];

export const QUEST_LIFECYCLE_NEEDS_DECISION_COPY = 'This quest needs a decision.';

const UNIVERSE_REVIEW_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Old trails need a decision.',
  neuronet: 'Stale operations need routing.',
  'neon-ashes': 'Cold leads need filing.',
};

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const LIFECYCLE_STATUSES = new Set<QuestLifecycleStatus>([
  'active',
  'completed',
  'carried',
  'snoozed',
  'archived',
]);

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getQuestLifecycleReviewFlavor(universeId: string): string {
  return UNIVERSE_REVIEW_FLAVOR[universeId] ?? UNIVERSE_REVIEW_FLAVOR['dust-and-iron'];
}

export function isValidLifecycleDateKey(value: string): boolean {
  return DATE_KEY_PATTERN.test(value.trim());
}

export function resolveQuestCreatedDate(
  quest: Pick<UserQuest, 'createdDate' | 'createdOnDate' | 'id'>,
): string {
  if (quest.createdDate && DATE_KEY_PATTERN.test(quest.createdDate)) {
    return quest.createdDate;
  }
  return resolveQuestCreatedOnDate(quest);
}

export function resolveQuestCarriedToDate(
  quest: Pick<UserQuest, 'carriedToDate' | 'carryForwardDate'>,
): string | undefined {
  const value = quest.carriedToDate ?? quest.carryForwardDate;
  return value && DATE_KEY_PATTERN.test(value) ? value : undefined;
}

export function inferQuestLifecycleStatus(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): QuestLifecycleStatus {
  if (quest.isCompleted || quest.completedAt) return 'completed';
  if (quest.archivedAt) return 'archived';

  if (quest.snoozedUntilDate && quest.snoozedUntilDate > today) {
    return 'snoozed';
  }

  const carriedTo = resolveQuestCarriedToDate(quest);
  if (carriedTo === today) return 'carried';

  if (quest.status && LIFECYCLE_STATUSES.has(quest.status)) {
    if (quest.status === 'snoozed' && (!quest.snoozedUntilDate || quest.snoozedUntilDate <= today)) {
      return 'active';
    }
    if (quest.status === 'completed' && !quest.isCompleted) return 'active';
    if (quest.status === 'archived' && !quest.archivedAt) return 'active';
    return quest.status;
  }

  return 'active';
}

export function normalizeQuestLifecycleUserQuest(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): UserQuest {
  const createdDate = resolveQuestCreatedDate(quest);
  let status = inferQuestLifecycleStatus(quest, today);

  if (status === 'snoozed' && quest.snoozedUntilDate && quest.snoozedUntilDate <= today) {
    status = 'active';
  }

  const carriedToDate = resolveQuestCarriedToDate(quest);
  const normalized: UserQuest = {
    ...quest,
    status,
    createdDate,
    createdOnDate: createdDate,
    isCompleted: status === 'completed',
  };

  if (status === 'completed') {
    if (quest.completedAt) normalized.completedAt = quest.completedAt;
    delete normalized.snoozedUntilDate;
    delete normalized.carriedToDate;
    delete normalized.carryForwardDate;
    delete normalized.archivedAt;
    return normalized;
  }

  if (status === 'archived') {
    normalized.archivedAt = quest.archivedAt ?? today;
    delete normalized.snoozedUntilDate;
    delete normalized.carriedToDate;
    delete normalized.carryForwardDate;
    return normalized;
  }

  delete normalized.archivedAt;

  if (status === 'snoozed' && quest.snoozedUntilDate) {
    normalized.snoozedUntilDate = quest.snoozedUntilDate;
    delete normalized.carriedToDate;
    delete normalized.carryForwardDate;
    return normalized;
  }

  delete normalized.snoozedUntilDate;

  if (status === 'carried' && carriedToDate) {
    normalized.carriedToDate = carriedToDate;
    normalized.carryForwardDate = carriedToDate;
  } else {
    delete normalized.carriedToDate;
    delete normalized.carryForwardDate;
  }

  return normalized;
}

export function isQuestLifecycleArchived(
  quest: Pick<UserQuest, 'status' | 'archivedAt'>,
): boolean {
  return quest.status === 'archived' || Boolean(quest.archivedAt?.trim());
}

export function isQuestSnoozed(
  quest: Pick<UserQuest, 'status' | 'snoozedUntilDate'>,
  today: string = getLocalDateKey(),
): boolean {
  return (
    quest.status === 'snoozed' &&
    Boolean(quest.snoozedUntilDate && quest.snoozedUntilDate > today)
  );
}

export function isQuestOnActiveBoard(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): boolean {
  const status = quest.status ?? inferQuestLifecycleStatus(quest, today);
  if (status === 'completed' || status === 'archived') return false;
  if (isQuestSnoozed(quest, today)) return false;
  return true;
}

/** Includes completed quests (for Completed tab) but hides archived and snoozed. */
export function isQuestVisibleOnQuestBoard(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): boolean {
  if (isQuestLifecycleArchived(quest)) return false;
  if (isQuestSnoozed(quest, today)) return false;
  return true;
}

export function isQuestInTodayTab(
  quest: Pick<
    UserQuest,
    'status' | 'createdDate' | 'createdOnDate' | 'id' | 'carriedToDate' | 'carryForwardDate' | 'snoozedUntilDate' | 'isCompleted' | 'archivedAt'
  >,
  today: string = getLocalDateKey(),
): boolean {
  if (!isQuestOnActiveBoard(quest as UserQuest, today)) return false;

  const status = quest.status ?? inferQuestLifecycleStatus(quest as UserQuest, today);
  const createdDate = resolveQuestCreatedDate(quest);
  const carriedTo = resolveQuestCarriedToDate(quest);

  if (status === 'carried' && carriedTo === today) return true;
  if (status === 'active' && createdDate === today) return true;
  return false;
}

export function isQuestNeedsReview(
  quest: Pick<
    UserQuest,
    'status' | 'createdDate' | 'createdOnDate' | 'id' | 'carriedToDate' | 'carryForwardDate' | 'snoozedUntilDate' | 'isCompleted' | 'archivedAt'
  >,
  today: string = getLocalDateKey(),
): boolean {
  if (!isQuestOnActiveBoard(quest as UserQuest, today)) return false;
  if (isQuestInTodayTab(quest, today)) return false;

  const createdDate = resolveQuestCreatedDate(quest);
  return createdDate.length > 0 && createdDate < today;
}

export function isBoardQuestInTodayTab(quest: BoardQuest, today: string = getLocalDateKey()): boolean {
  if (quest.completed || quest.source === 'template') return false;
  if (quest.lifecycleStatus === 'archived' || quest.lifecycleStatus === 'completed') return false;
  if (quest.lifecycleStatus === 'snoozed' && quest.snoozedUntilDate && quest.snoozedUntilDate > today) {
    return false;
  }

  const createdDate = quest.createdDate ?? quest.createdOnDate ?? '';
  const carriedTo = quest.carriedToDate;

  if (quest.lifecycleStatus === 'carried' && carriedTo === today) return true;
  if (quest.lifecycleStatus === 'active' && createdDate === today) return true;
  return false;
}

export function isBoardQuestNeedsReview(quest: BoardQuest, today: string = getLocalDateKey()): boolean {
  if (quest.completed || quest.source === 'template') return false;
  if (quest.lifecycleStatus === 'archived' || quest.lifecycleStatus === 'completed') return false;
  if (quest.lifecycleStatus === 'snoozed' && quest.snoozedUntilDate && quest.snoozedUntilDate > today) {
    return false;
  }
  if (isBoardQuestInTodayTab(quest, today)) return false;

  const createdDate = quest.createdDate ?? quest.createdOnDate ?? '';
  return createdDate.length > 0 && createdDate < today;
}

export function getThisWeekendDateKey(today: string = getLocalDateKey()): string {
  const date = parseLocalDateKey(today);
  const weekday = date.getDay();
  if (weekday === 6 || weekday === 0) return today;
  date.setDate(date.getDate() + (6 - weekday));
  return getLocalDateKey(date);
}

export function getNextWeekDateKey(today: string = getLocalDateKey()): string {
  const date = parseLocalDateKey(today);
  const weekday = date.getDay();
  const daysUntilMonday = weekday === 0 ? 1 : 8 - weekday;
  date.setDate(date.getDate() + daysUntilMonday);
  return getLocalDateKey(date);
}

export function resolveSnoozePresetDate(
  preset: SnoozePreset,
  customDate = '',
  today: string = getLocalDateKey(),
): string | null {
  switch (preset) {
    case 'tomorrow':
      return getTomorrowDateKey(today);
    case 'weekend':
      return getThisWeekendDateKey(today);
    case 'next-week':
      return getNextWeekDateKey(today);
    case 'custom': {
      const trimmed = customDate.trim();
      return isValidLifecycleDateKey(trimmed) ? trimmed : null;
    }
  }
}

export function applyCarryQuestToToday(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): UserQuest {
  return normalizeQuestLifecycleUserQuest(
    {
      ...quest,
      status: 'carried',
      carriedToDate: today,
      carryForwardDate: today,
      snoozedUntilDate: undefined,
      plannedTimeLabel: quest.plannedTimeLabel?.trim() || 'Today',
    },
    today,
  );
}

export function applySnoozeQuest(
  quest: UserQuest,
  untilDate: string,
  today: string = getLocalDateKey(),
): UserQuest {
  return normalizeQuestLifecycleUserQuest(
    {
      ...quest,
      status: 'snoozed',
      snoozedUntilDate: untilDate,
    },
    today,
  );
}

export function applyArchiveQuestLifecycle(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): UserQuest {
  return normalizeQuestLifecycleUserQuest(
    {
      ...quest,
      status: 'archived',
      archivedAt: today,
    },
    today,
  );
}

export function applyCompleteQuestLifecycle(quest: UserQuest): UserQuest {
  return normalizeQuestLifecycleUserQuest(
    recordQuestCompletedAt({
      ...quest,
      status: 'completed',
      isCompleted: true,
    }),
  );
}

export function mapLegacyShutdownAction(action: string): QuestLifecycleAction {
  switch (action) {
    case 'keep-tomorrow':
      return 'snooze';
    case 'convert-starter':
      return 'leave';
    case 'archive':
      return 'archive';
    case 'carry-today':
    case 'snooze':
    case 'split':
    case 'complete':
    case 'leave':
      return action;
    default:
      return 'leave';
  }
}

export function createUserQuestLifecycleDefaults(
  createdOnDate: string = getLocalDateKey(),
): Pick<UserQuest, 'status' | 'createdDate' | 'createdOnDate' | 'isCompleted'> {
  return {
    status: 'active',
    createdDate: createdOnDate,
    createdOnDate: createdOnDate,
    isCompleted: false,
  };
}
