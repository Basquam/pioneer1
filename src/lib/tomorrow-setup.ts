import { getLocalDateKey, getTomorrowDateKey } from '@/lib/daily-streak';
import { applyKeepQuestForTomorrow } from '@/lib/daily-shutdown';
import { getActiveInboxItems, captureQuestInboxItemForDate } from '@/lib/quest-inbox';
import { shouldGenerateRecurringToday } from '@/lib/recurring-quests';
import { isQuestOnActiveBoard } from '@/lib/quest-lifecycle';
import type {
  PlayerProgress,
  TaskCategory,
  TomorrowSetupEntry,
  TomorrowSetupKind,
  UserQuest,
} from '@/types/narrative';

export type TomorrowSetupInput =
  | { kind: 'skip' }
  | {
      kind: 'first-quest';
      questId?: string;
      taskTitle?: string;
      inboxItemId?: string;
    }
  | { kind: 'captured-task'; taskTitle: string }
  | { kind: 'environment-step'; prepStepTitle: string }
  | { kind: 'when-where-plan'; implementationIntention: string };

export type TomorrowQuestOptionKind = 'user-quest' | 'inbox' | 'recurring-template' | 'suggested';

export type TomorrowQuestOption = {
  id: string;
  kind: TomorrowQuestOptionKind;
  title: string;
  subtitle: string;
  questId?: string;
  inboxItemId?: string;
  recurringTemplateId?: string;
  suggestedTitle?: string;
  suggestedCategory?: TaskCategory;
};

export type TomorrowSetupCopy = {
  shutdownPrompt: string;
  nextDayHeadline: string;
};

export type PreparedTodayDisplay = {
  headline: string;
  cueLine: string;
  ctaLabel: string | null;
  hasQuestAction: boolean;
  hasSetupCue: boolean;
};

const UNIVERSE_COPY: Record<string, TomorrowSetupCopy> = {
  'dust-and-iron': {
    shutdownPrompt: 'Lay the trail before sunrise.',
    nextDayHeadline: 'The trail was marked yesterday.',
  },
  neuronet: {
    shutdownPrompt: 'Preload tomorrow’s protocol.',
    nextDayHeadline: 'Protocol preloaded.',
  },
  'neon-ashes': {
    shutdownPrompt: 'Pin tomorrow’s first lead.',
    nextDayHeadline: 'A lead is already on the board.',
  },
};

export const ENVIRONMENT_PREP_EXAMPLES = [
  'Put notebook on desk',
  'Place workout clothes somewhere visible',
  'Fill water bottle before bed',
  'Clear one surface',
  'Open the document you need',
] as const;

const SETUP_KINDS = new Set<TomorrowSetupKind>([
  'first-quest',
  'captured-task',
  'environment-step',
  'when-where-plan',
]);

export function getTomorrowSetupCopy(universeId: string): TomorrowSetupCopy {
  return UNIVERSE_COPY[universeId] ?? UNIVERSE_COPY['dust-and-iron'];
}

export function getTomorrowSetupForDate(
  progress: Pick<PlayerProgress, 'tomorrowSetupByDate'>,
  dateKey: string = getLocalDateKey(),
): TomorrowSetupEntry | null {
  return progress.tomorrowSetupByDate?.[dateKey] ?? null;
}

export function hasTomorrowSetupForToday(
  progress: Pick<PlayerProgress, 'tomorrowSetupByDate'>,
  today: string = getLocalDateKey(),
): boolean {
  return getTomorrowSetupForDate(progress, today) != null;
}

function resolveCarriedToDate(quest: UserQuest): string | undefined {
  return quest.carriedToDate ?? quest.carryForwardDate ?? quest.snoozedUntilDate;
}

export function computeTomorrowQuestOptions(
  progress: PlayerProgress,
  universeId: string,
  today: string = getLocalDateKey(),
): TomorrowQuestOption[] {
  const tomorrow = getTomorrowDateKey(today);
  const options: TomorrowQuestOption[] = [];
  const seen = new Set<string>();

  for (const quest of progress.userQuests) {
    if (quest.isCompleted || quest.sourceUniverseId !== universeId) continue;
    if (!isQuestOnActiveBoard(quest, today) && resolveCarriedToDate(quest) !== tomorrow) continue;

    const carriedTo = resolveCarriedToDate(quest);
    const isCarried = carriedTo === tomorrow;
    if (!isCarried && !isQuestOnActiveBoard(quest, today)) continue;

    options.push({
      id: quest.id,
      kind: 'user-quest',
      title: quest.originalTitle,
      subtitle: isCarried ? 'Carried to tomorrow' : 'Open quest',
      questId: quest.id,
    });
    seen.add(quest.id);
  }

  for (const template of progress.recurringQuestTemplates) {
    if (!template.isActive) continue;
    if (!shouldGenerateRecurringToday(template, tomorrow)) continue;

    options.push({
      id: `recurring:${template.id}`,
      kind: 'recurring-template',
      title: template.originalTitle,
      subtitle: 'Routine due tomorrow',
      recurringTemplateId: template.id,
      suggestedTitle: template.originalTitle,
      suggestedCategory: template.category,
    });
  }

  for (const item of getActiveInboxItems(progress.questInbox)) {
    options.push({
      id: item.id,
      kind: 'inbox',
      title: item.title,
      subtitle: 'Inbox item',
      inboxItemId: item.id,
    });
  }

  options.push({
    id: 'suggested-tiny',
    kind: 'suggested',
    title: 'One small start',
    subtitle: 'Suggested tiny quest',
    suggestedTitle: 'Take one small step forward',
    suggestedCategory: 'health',
  });

  return options;
}

export function formatTomorrowImplementationIntention(
  task: string,
  time: string,
  location: string,
): string {
  const trimmedTask = task.trim();
  const trimmedTime = time.trim();
  const trimmedLocation = location.trim();
  return `I will ${trimmedTask} at ${trimmedTime} in ${trimmedLocation}.`.replace(/\s+/g, ' ');
}

export function recordTomorrowSetup(
  progress: PlayerProgress,
  input: TomorrowSetupInput,
  preparedOnDate: string = getLocalDateKey(),
): PlayerProgress {
  if (input.kind === 'skip') return progress;

  const targetDate = getTomorrowDateKey(preparedOnDate);
  let next = progress;

  const baseEntry: TomorrowSetupEntry = {
    date: targetDate,
    preparedOnDate,
    preparedAt: new Date().toISOString(),
    kind: input.kind,
  };

  let entry: TomorrowSetupEntry = baseEntry;

  switch (input.kind) {
    case 'first-quest': {
      if (input.questId) {
        entry = {
          ...baseEntry,
          selectedTomorrowQuestId: input.questId,
        };
        next = {
          ...next,
          userQuests: next.userQuests.map((quest) =>
            quest.id === input.questId ? applyKeepQuestForTomorrow(quest, preparedOnDate) : quest,
          ),
        };
      } else if (input.inboxItemId) {
        const item = next.questInbox.find((inboxItem) => inboxItem.id === input.inboxItemId);
        entry = {
          ...baseEntry,
          plannedTomorrowInboxItemId: input.inboxItemId,
          plannedTomorrowTaskTitle: item?.title,
        };
        next = {
          ...next,
          questInbox: next.questInbox.map((inboxItem) =>
            inboxItem.id === input.inboxItemId
              ? { ...inboxItem, targetDate }
              : inboxItem,
          ),
        };
      } else if (input.taskTitle?.trim()) {
        entry = {
          ...baseEntry,
          plannedTomorrowTaskTitle: input.taskTitle.trim(),
        };
      }
      break;
    }
    case 'captured-task': {
      const trimmed = input.taskTitle.trim();
      if (!trimmed) return progress;
      const captured = captureQuestInboxItemForDate(next.questInbox, trimmed, targetDate);
      const created = captured.find(
        (item) => item.title === trimmed && item.targetDate === targetDate && item.status === 'inbox',
      );
      entry = {
        ...baseEntry,
        plannedTomorrowTaskTitle: trimmed,
        ...(created ? { plannedTomorrowInboxItemId: created.id } : {}),
      };
      next = { ...next, questInbox: captured };
      break;
    }
    case 'environment-step': {
      const trimmed = input.prepStepTitle.trim();
      if (!trimmed) return progress;
      entry = {
        ...baseEntry,
        tomorrowPrepStepTitle: trimmed,
      };
      break;
    }
    case 'when-where-plan': {
      const trimmed = input.implementationIntention.trim();
      if (!trimmed) return progress;
      entry = {
        ...baseEntry,
        tomorrowImplementationIntention: trimmed,
      };
      break;
    }
  }

  return {
    ...next,
    tomorrowSetupByDate: {
      ...(next.tomorrowSetupByDate ?? {}),
      [targetDate]: entry,
    },
  };
}

export function getPreparedTodayDisplay(
  entry: TomorrowSetupEntry,
  universeId: string,
  progress: PlayerProgress,
): PreparedTodayDisplay {
  const copy = getTomorrowSetupCopy(universeId);
  const lines: string[] = [];

  if (entry.tomorrowPrepStepTitle) {
    lines.push(`You prepared this: ${entry.tomorrowPrepStepTitle}.`);
  }

  if (entry.tomorrowImplementationIntention) {
    lines.push(entry.tomorrowImplementationIntention);
  }

  if (entry.plannedTomorrowTaskTitle && !entry.selectedTomorrowQuestId) {
    lines.push(`First up: ${entry.plannedTomorrowTaskTitle}.`);
  }

  const questId = entry.selectedTomorrowQuestId;
  const quest =
    questId != null ? progress.userQuests.find((item) => item.id === questId) : undefined;
  if (quest && !quest.isCompleted) {
    lines.push(`First quest ready: ${quest.originalTitle}.`);
  }

  const hasQuestAction = Boolean(
    (questId && quest && !quest.isCompleted) ||
      entry.plannedTomorrowInboxItemId ||
      entry.plannedTomorrowTaskTitle,
  );

  const ctaLabel = hasQuestAction ? 'START PREPARED QUEST' : lines.length > 0 ? "USE TODAY'S SETUP" : null;

  return {
    headline: copy.nextDayHeadline,
    cueLine: lines.join(' '),
    ctaLabel,
    hasQuestAction,
    hasSetupCue: lines.length > 0,
  };
}

export function sanitizeTomorrowSetupByDate(
  raw: unknown,
): PlayerProgress['tomorrowSetupByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['tomorrowSetupByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.date !== 'string' || entry.date !== dateKey) continue;
    if (typeof entry.preparedOnDate !== 'string' || entry.preparedOnDate.length === 0) continue;
    if (typeof entry.preparedAt !== 'string' || entry.preparedAt.length === 0) continue;
    if (typeof entry.kind !== 'string' || !SETUP_KINDS.has(entry.kind as TomorrowSetupKind)) continue;

    const sanitized: TomorrowSetupEntry = {
      date: dateKey,
      preparedOnDate: entry.preparedOnDate,
      preparedAt: entry.preparedAt,
      kind: entry.kind as TomorrowSetupKind,
    };

    if (typeof entry.selectedTomorrowQuestId === 'string' && entry.selectedTomorrowQuestId.startsWith('user-')) {
      sanitized.selectedTomorrowQuestId = entry.selectedTomorrowQuestId;
    }
    if (typeof entry.plannedTomorrowTaskTitle === 'string' && entry.plannedTomorrowTaskTitle.trim().length > 0) {
      sanitized.plannedTomorrowTaskTitle = entry.plannedTomorrowTaskTitle.trim();
    }
    if (typeof entry.plannedTomorrowInboxItemId === 'string' && entry.plannedTomorrowInboxItemId.startsWith('inbox-')) {
      sanitized.plannedTomorrowInboxItemId = entry.plannedTomorrowInboxItemId;
    }
    if (typeof entry.tomorrowPrepStepTitle === 'string' && entry.tomorrowPrepStepTitle.trim().length > 0) {
      sanitized.tomorrowPrepStepTitle = entry.tomorrowPrepStepTitle.trim();
    }
    if (
      typeof entry.tomorrowImplementationIntention === 'string' &&
      entry.tomorrowImplementationIntention.trim().length > 0
    ) {
      sanitized.tomorrowImplementationIntention = entry.tomorrowImplementationIntention.trim();
    }

    result[dateKey] = sanitized;
  }

  return result;
}

export function pruneTomorrowSetupByDate(
  tomorrowSetupByDate: PlayerProgress['tomorrowSetupByDate'],
  referenceDate = new Date(),
  retentionDays = 84,
): PlayerProgress['tomorrowSetupByDate'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(tomorrowSetupByDate ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}
