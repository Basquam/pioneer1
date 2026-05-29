import { createUserQuestFromTask, type CreateUserQuestOptions } from '@/lib/convert-task-to-quest';
import { getLocalDateKey } from '@/lib/daily-streak';
import { pruneUserQuests } from '@/lib/player-progress-sanitize';
import { recordRoutineQuestSpawned } from '@/lib/routine-boredom-guard';
import type {
  Chapter,
  PlayerProgress,
  RecurrenceType,
  RecurringQuestTemplate,
  Saga,
  TaskCategory,
  Universe,
  UserQuest,
  WeekdayKey,
} from '@/types/narrative';

const TASK_CATEGORIES = new Set<TaskCategory>([
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
]);

export type RecurringQuestSetup = {
  recurrenceType: RecurrenceType;
  preferredTimeLabel?: string;
  preferredDays?: WeekdayKey[];
};

export type AddUserQuestOptions = CreateUserQuestOptions & {
  recurring?: RecurringQuestSetup;
};

export type RecurringQuestContext = {
  universe: Universe;
  saga: Saga;
  chapter: Chapter;
};

export const WEEKDAY_OPTIONS: Array<{ key: WeekdayKey; label: string }> = [
  { key: 'mon', label: 'Mon' },
  { key: 'tue', label: 'Tue' },
  { key: 'wed', label: 'Wed' },
  { key: 'thu', label: 'Thu' },
  { key: 'fri', label: 'Fri' },
  { key: 'sat', label: 'Sat' },
  { key: 'sun', label: 'Sun' },
];

const WEEKDAY_KEYS: WeekdayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

export function createRecurringQuestId(): string {
  return `recurring-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getWeekdayKeyForDate(dateKey: string): WeekdayKey {
  return WEEKDAY_KEYS[parseLocalDateKey(dateKey).getDay()];
}

export function formatRecurrenceLabel(template: RecurringQuestTemplate): string {
  switch (template.recurrenceType) {
    case 'daily':
      return 'Daily';
    case 'monthly':
      return 'Monthly';
    case 'weekly': {
      const days = template.preferredDays?.length
        ? template.preferredDays
        : [getWeekdayKeyForDate(template.createdAt.slice(0, 10))];
      const labels = days
        .map((day) => WEEKDAY_OPTIONS.find((option) => option.key === day)?.label ?? day)
        .join(', ');
      return `Weekly · ${labels}`;
    }
  }
}

export function shouldGenerateRecurringToday(
  template: RecurringQuestTemplate,
  today: string = getLocalDateKey(),
): boolean {
  if (!template.isActive) return false;

  switch (template.recurrenceType) {
    case 'daily':
      return true;
    case 'weekly': {
      const todayWeekday = getWeekdayKeyForDate(today);
      const days = template.preferredDays?.length
        ? template.preferredDays
        : [getWeekdayKeyForDate(template.createdAt.slice(0, 10))];
      return days.includes(todayWeekday);
    }
    case 'monthly': {
      const todayDate = parseLocalDateKey(today);
      const anchorDate = parseLocalDateKey(template.createdAt.slice(0, 10));
      const anchorDay = anchorDate.getDate();
      const lastDayOfMonth = new Date(todayDate.getFullYear(), todayDate.getMonth() + 1, 0).getDate();
      const targetDay = Math.min(anchorDay, lastDayOfMonth);
      return todayDate.getDate() === targetDay;
    }
  }
}

export function hasRecurringInstanceForDate(
  userQuests: UserQuest[],
  templateId: string,
  dateKey: string,
): boolean {
  return userQuests.some(
    (quest) =>
      quest.generatedFromRecurringQuestId === templateId &&
      quest.createdOnDate === dateKey &&
      !quest.archivedAt,
  );
}

export function createRecurringQuestTemplate(
  originalTitle: string,
  category: TaskCategory,
  setup: RecurringQuestSetup,
  questOptions?: CreateUserQuestOptions,
): RecurringQuestTemplate {
  const trimmed = originalTitle.trim();

  return {
    id: createRecurringQuestId(),
    originalTitle: trimmed,
    category,
    recurrenceType: setup.recurrenceType,
    createdAt: new Date().toISOString(),
    isActive: true,
    ...(setup.preferredTimeLabel?.trim()
      ? { preferredTimeLabel: setup.preferredTimeLabel.trim() }
      : {}),
    ...(setup.preferredDays?.length ? { preferredDays: setup.preferredDays } : {}),
    ...(questOptions?.starterTaskTitle
      ? { starterTaskTitle: questOptions.starterTaskTitle.trim() }
      : {}),
    ...(questOptions?.prepStepTitle ? { prepStepTitle: questOptions.prepStepTitle.trim() } : {}),
    ...(questOptions?.afterQuestReward
      ? { afterQuestReward: questOptions.afterQuestReward.trim() }
      : {}),
    ...(questOptions?.riskLevel ? { riskLevel: questOptions.riskLevel } : {}),
  };
}

function templateToQuestOptions(template: RecurringQuestTemplate): CreateUserQuestOptions {
  return {
    generatedFromRecurringQuestId: template.id,
    ...(template.starterTaskTitle ? { starterTaskTitle: template.starterTaskTitle } : {}),
    ...(template.prepStepTitle ? { prepStepTitle: template.prepStepTitle } : {}),
    ...(template.afterQuestReward ? { afterQuestReward: template.afterQuestReward } : {}),
    ...(template.riskLevel ? { riskLevel: template.riskLevel } : {}),
    ...(template.preferredTimeLabel ? { plannedTimeLabel: template.preferredTimeLabel } : {}),
  };
}

/** Spawn today's recurring quest instances — idempotent per template + date. */
export function generateRecurringQuestInstances(
  progress: PlayerProgress,
  context: RecurringQuestContext,
  today: string = getLocalDateKey(),
): PlayerProgress {
  const templates = progress.recurringQuestTemplates.filter((template) => template.isActive);
  if (templates.length === 0) return progress;

  const { universe, saga, chapter } = context;
  let workingQuests = progress.userQuests;
  const newQuests: UserQuest[] = [];

  for (const template of templates) {
    if (!shouldGenerateRecurringToday(template, today)) continue;
    if (hasRecurringInstanceForDate(workingQuests, template.id, today)) continue;

    const quest = createUserQuestFromTask(
      template.originalTitle,
      template.category,
      universe,
      saga,
      chapter,
      workingQuests,
      templateToQuestOptions(template),
      today,
      progress,
    );

    newQuests.push(quest);
    workingQuests = [...workingQuests, quest];
  }

  if (newQuests.length === 0) return progress;

  let nextProgress: PlayerProgress = {
    ...progress,
    userQuests: pruneUserQuests([...progress.userQuests, ...newQuests]),
  };

  for (const quest of newQuests) {
    nextProgress = recordRoutineQuestSpawned(nextProgress, quest);
  }

  return nextProgress;
}

export function disableRecurringQuestTemplate(
  progress: PlayerProgress,
  templateId: string,
): PlayerProgress {
  const templates = progress.recurringQuestTemplates;
  if (!templates.some((template) => template.id === templateId && template.isActive)) {
    return progress;
  }

  return {
    ...progress,
    recurringQuestTemplates: templates.map((template) =>
      template.id === templateId ? { ...template, isActive: false } : template,
    ),
  };
}

export function isWeekdayKey(value: unknown): value is WeekdayKey {
  return typeof value === 'string' && WEEKDAY_KEYS.includes(value as WeekdayKey);
}

export function isRecurrenceType(value: unknown): value is RecurrenceType {
  return value === 'daily' || value === 'weekly' || value === 'monthly';
}

export function sanitizeRecurringQuestTemplates(raw: unknown): RecurringQuestTemplate[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((entry) => sanitizeRecurringQuestTemplate(entry))
    .filter((entry): entry is RecurringQuestTemplate => entry !== null);
}

function sanitizeRecurringQuestTemplate(raw: unknown): RecurringQuestTemplate | null {
  if (!raw || typeof raw !== 'object') return null;

  const template = raw as Record<string, unknown>;
  if (typeof template.id !== 'string' || !template.id.startsWith('recurring-')) return null;
  if (typeof template.originalTitle !== 'string' || template.originalTitle.trim().length === 0) {
    return null;
  }
  if (typeof template.category !== 'string' || !TASK_CATEGORIES.has(template.category as TaskCategory)) {
    return null;
  }
  if (!isRecurrenceType(template.recurrenceType)) return null;
  if (typeof template.createdAt !== 'string' || template.createdAt.length === 0) return null;
  if (typeof template.isActive !== 'boolean') return null;

  const sanitized: RecurringQuestTemplate = {
    id: template.id,
    originalTitle: template.originalTitle.trim(),
    category: template.category as TaskCategory,
    recurrenceType: template.recurrenceType,
    createdAt: template.createdAt,
    isActive: template.isActive,
  };

  if (typeof template.preferredTimeLabel === 'string' && template.preferredTimeLabel.length > 0) {
    sanitized.preferredTimeLabel = template.preferredTimeLabel;
  }

  if (Array.isArray(template.preferredDays)) {
    const days = template.preferredDays.filter(isWeekdayKey);
    if (days.length > 0) sanitized.preferredDays = days;
  }

  if (typeof template.starterTaskTitle === 'string' && template.starterTaskTitle.length > 0) {
    sanitized.starterTaskTitle = template.starterTaskTitle;
  }

  if (typeof template.prepStepTitle === 'string' && template.prepStepTitle.length > 0) {
    sanitized.prepStepTitle = template.prepStepTitle;
  }

  if (typeof template.afterQuestReward === 'string' && template.afterQuestReward.length > 0) {
    sanitized.afterQuestReward = template.afterQuestReward;
  }

  const riskLevel = template.riskLevel;
  if (riskLevel === 'low' || riskLevel === 'standard' || riskLevel === 'high') {
    sanitized.riskLevel = riskLevel;
  }

  return sanitized;
}
