import { getLocalDateKey, getTomorrowDateKey } from '@/lib/daily-streak';
import {
  getDailyFocusLimit,
  getTodayUserQuests,
  isDailyFocusQuest,
  resolveQuestCreatedOnDate,
} from '@/lib/daily-focus';
import { isQuestInLockedFocus } from '@/lib/focus-lock';
import { EMPTY_ACTIVITY } from '@/lib/player-progress-sanitize';
import { isUserQuestArchived } from '@/lib/quest-friction';
import type {
  DailyShutdownEntry,
  DailyShutdownHelpedBy,
  DailyShutdownOpenQuestAction,
  DailyShutdownOpenQuestSummary,
  PlayerProgress,
  UserQuest,
} from '@/types/narrative';

export type DailyShutdownHelpedOption = {
  value: DailyShutdownHelpedBy;
  label: string;
};

export type DailyShutdownOpenQuestCategory = 'today' | 'recurring' | 'focus';

export type DailyShutdownOpenQuestItem = {
  quest: UserQuest;
  categories: DailyShutdownOpenQuestCategory[];
};

export type DailyShutdownCompletedStats = {
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  identityVotesGained: number;
  chaptersCompleted: number;
};

export type DailyShutdownUniverseCopy = {
  title: string;
  intro: string;
  completion: string;
};

export const DAILY_SHUTDOWN_HELPED_OPTIONS: DailyShutdownHelpedOption[] = [
  { value: 'focus-mode', label: 'Focus Mode' },
  { value: 'starter-move', label: 'Starter move' },
  { value: 'prep-step', label: 'Prep step' },
  { value: 'reward-ritual', label: 'Reward ritual' },
  { value: 'locked-focus', label: 'Locked focus' },
  { value: 'reminder', label: 'Reminder' },
  { value: 'character-story', label: 'Character story' },
  { value: 'nothing-yet', label: 'Nothing yet' },
];

const HELPED_BY_VALUES = new Set<DailyShutdownHelpedBy>(
  DAILY_SHUTDOWN_HELPED_OPTIONS.map((option) => option.value),
);

const OPEN_QUEST_ACTIONS = new Set<DailyShutdownOpenQuestAction>([
  'keep-tomorrow',
  'convert-starter',
  'archive',
  'leave',
]);

const UNIVERSE_COPY: Record<string, DailyShutdownUniverseCopy> = {
  'dust-and-iron': {
    title: 'Close the trail.',
    intro: 'A deputy ends the day by knowing what still rides tomorrow.',
    completion: 'Trail logged.',
  },
  neuronet: {
    title: 'End the cycle.',
    intro: 'A clean shutdown keeps the signal stable.',
    completion: 'Cycle archived.',
  },
  'neon-ashes': {
    title: 'File the case notes.',
    intro: 'A detective leaves no loose lead unnamed.',
    completion: 'Case notes filed.',
  },
};

const CATEGORY_LABELS: Record<DailyShutdownOpenQuestCategory, string> = {
  today: 'From today',
  recurring: 'Routine',
  focus: 'Focus',
};

export function getDailyShutdownCopy(universeId: string): DailyShutdownUniverseCopy {
  return UNIVERSE_COPY[universeId] ?? UNIVERSE_COPY['dust-and-iron'];
}

export function formatOpenQuestCategories(categories: DailyShutdownOpenQuestCategory[]): string {
  return categories.map((category) => CATEGORY_LABELS[category]).join(' · ');
}

export function getDailyShutdownEntry(
  progress: Pick<PlayerProgress, 'dailyShutdownByDate'>,
  dateKey: string = getLocalDateKey(),
): DailyShutdownEntry | null {
  return progress.dailyShutdownByDate?.[dateKey] ?? null;
}

export function isDailyShutdownDismissedToday(
  progress: Pick<PlayerProgress, 'dailyShutdownDismissedDates'>,
  dateKey: string = getLocalDateKey(),
): boolean {
  return progress.dailyShutdownDismissedDates?.includes(dateKey) ?? false;
}

export function shouldShowDailyShutdownPrompt(
  progress: Pick<
    PlayerProgress,
    'hasOnboarded' | 'dailyShutdownByDate' | 'dailyShutdownDismissedDates'
  >,
  dateKey: string = getLocalDateKey(),
): boolean {
  if (!progress.hasOnboarded) return false;
  if (getDailyShutdownEntry(progress, dateKey)) return false;
  if (isDailyShutdownDismissedToday(progress, dateKey)) return false;
  return true;
}

function filterActiveUserQuests(userQuests: UserQuest[], universeId: string): UserQuest[] {
  return userQuests.filter(
    (quest) =>
      quest.sourceUniverseId === universeId &&
      !quest.isCompleted &&
      !isUserQuestArchived(quest),
  );
}

export function computeDailyShutdownCompletedStats(
  progress: PlayerProgress,
  dateKey: string = getLocalDateKey(),
  universeId?: string,
): DailyShutdownCompletedStats {
  const activity = progress.activityByDate?.[dateKey] ?? EMPTY_ACTIVITY;
  const identityVotesGained = (progress.evidenceLog ?? []).filter(
    (event) =>
      event.date === dateKey &&
      Boolean(event.identityTraitGained) &&
      (!universeId || event.universeId === universeId),
  ).length;

  return {
    questsCompleted: activity.questsCompleted,
    xpEarned: activity.xpEarned,
    reputationEarned: activity.reputationEarned,
    identityVotesGained,
    chaptersCompleted: activity.chaptersCompleted,
  };
}

export function computeDailyShutdownOpenQuests(
  progress: PlayerProgress,
  universeId: string,
  dateKey: string = getLocalDateKey(),
): DailyShutdownOpenQuestItem[] {
  const focusLimit = getDailyFocusLimit(progress);
  const activeQuests = filterActiveUserQuests(progress.userQuests, universeId);
  const todayQuestIds = new Set(
    getTodayUserQuests(progress.userQuests, dateKey, universeId)
      .filter((quest) => !quest.isCompleted && !isUserQuestArchived(quest))
      .map((quest) => quest.id),
  );

  const items = new Map<string, DailyShutdownOpenQuestItem>();

  for (const quest of activeQuests) {
    const categories: DailyShutdownOpenQuestCategory[] = [];

    if (todayQuestIds.has(quest.id)) {
      categories.push('today');
    }
    if (quest.generatedFromRecurringQuestId) {
      categories.push('recurring');
    }
    if (
      isDailyFocusQuest(quest.id, progress.userQuests, focusLimit, dateKey, universeId) ||
      isQuestInLockedFocus(quest.id, progress, dateKey)
    ) {
      categories.push('focus');
    }

    if (categories.length === 0) continue;

    items.set(quest.id, { quest, categories });
  }

  return Array.from(items.values()).sort(
    (a, b) => resolveQuestCreatedOnDate(a.quest).localeCompare(resolveQuestCreatedOnDate(b.quest)),
  );
}

export function applyKeepQuestForTomorrow(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): UserQuest {
  const tomorrow = getTomorrowDateKey(today);
  return {
    ...quest,
    carryForwardDate: tomorrow,
    plannedTimeLabel: quest.plannedTimeLabel?.trim() || 'Tomorrow',
  };
}

export function recordDailyShutdown(
  progress: PlayerProgress,
  helpedBy: DailyShutdownHelpedBy | undefined,
  openQuestActions: DailyShutdownOpenQuestSummary[],
  dateKey: string = getLocalDateKey(),
): PlayerProgress {
  const sanitizedActions = openQuestActions.filter(
    (entry) =>
      typeof entry.questId === 'string' &&
      entry.questId.startsWith('user-') &&
      OPEN_QUEST_ACTIONS.has(entry.action),
  );

  const entry: DailyShutdownEntry = {
    date: dateKey,
    completedAt: new Date().toISOString(),
    openQuestActions: sanitizedActions,
    ...(helpedBy && HELPED_BY_VALUES.has(helpedBy) ? { helpedBy } : {}),
  };

  return {
    ...progress,
    dailyShutdownByDate: {
      ...(progress.dailyShutdownByDate ?? {}),
      [dateKey]: entry,
    },
  };
}

export function dismissDailyShutdownForToday(
  progress: PlayerProgress,
  dateKey: string = getLocalDateKey(),
): PlayerProgress {
  if (isDailyShutdownDismissedToday(progress, dateKey)) return progress;
  if (getDailyShutdownEntry(progress, dateKey)) return progress;

  return {
    ...progress,
    dailyShutdownDismissedDates: [...(progress.dailyShutdownDismissedDates ?? []), dateKey],
  };
}

export function sanitizeDailyShutdownByDate(
  raw: unknown,
): PlayerProgress['dailyShutdownByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['dailyShutdownByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.date !== 'string' || entry.date !== dateKey) continue;
    if (typeof entry.completedAt !== 'string' || entry.completedAt.length === 0) continue;

    const helpedBy =
      typeof entry.helpedBy === 'string' && HELPED_BY_VALUES.has(entry.helpedBy as DailyShutdownHelpedBy)
        ? (entry.helpedBy as DailyShutdownHelpedBy)
        : undefined;

    const openQuestActions = Array.isArray(entry.openQuestActions)
      ? entry.openQuestActions
          .map((item) => {
            if (!item || typeof item !== 'object') return null;
            const record = item as Record<string, unknown>;
            if (typeof record.questId !== 'string' || !record.questId.startsWith('user-')) return null;
            if (
              typeof record.action !== 'string' ||
              !OPEN_QUEST_ACTIONS.has(record.action as DailyShutdownOpenQuestAction)
            ) {
              return null;
            }
            return {
              questId: record.questId,
              action: record.action as DailyShutdownOpenQuestAction,
            };
          })
          .filter((item): item is DailyShutdownOpenQuestSummary => item !== null)
      : [];

    result[dateKey] = {
      date: dateKey,
      completedAt: entry.completedAt,
      openQuestActions,
      ...(helpedBy ? { helpedBy } : {}),
    };
  }

  return result;
}

export function sanitizeDailyShutdownDismissedDates(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0);
}

export function pruneDailyShutdownByDate(
  dailyShutdownByDate: PlayerProgress['dailyShutdownByDate'],
  referenceDate = new Date(),
  retentionDays = 84,
): PlayerProgress['dailyShutdownByDate'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(dailyShutdownByDate ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}
