import { getLocalDateKey } from '@/lib/daily-streak';
import { resolveQuestCreatedOnDate } from '@/lib/daily-focus';
import {
  isBoardQuestInTodayTab,
  isBoardQuestNeedsReview,
  QUEST_LIFECYCLE_NEEDS_DECISION_COPY,
} from '@/lib/quest-lifecycle';
import { resolveQuestRiskLevel } from '@/lib/quest-risk';
import type { QuestBoardEntry } from '@/lib/quest-chain';
import type { BoardQuest, QuestRiskLevel, TaskCategory } from '@/types/narrative';

export type QuestBoardTab =
  | 'today'
  | 'review'
  | 'focus'
  | 'chapter'
  | 'inbox'
  | 'recurring'
  | 'completed';

export type QuestBoardSourceFilter = 'user' | 'chapter' | 'recurring' | 'chain';

export type QuestBoardRiskFilter = 'all' | QuestRiskLevel;

export type QuestBoardReadinessFilter = 'all' | 'ready' | 'building' | 'none';

export type QuestBoardFilters = {
  category: TaskCategory | null;
  risk: QuestBoardRiskFilter;
  readiness: QuestBoardReadinessFilter;
  source: QuestBoardSourceFilter | null;
};

export const DEFAULT_QUEST_BOARD_FILTERS: QuestBoardFilters = {
  category: null,
  risk: 'all',
  readiness: 'all',
  source: null,
};

export const QUEST_BOARD_TAB_ORDER: QuestBoardTab[] = [
  'today',
  'review',
  'focus',
  'chapter',
  'inbox',
  'recurring',
  'completed',
];

const CHAPTER_TAB_LABELS: Record<string, string> = {
  'dust-and-iron': 'Bounties',
  neuronet: 'Operations',
  'neon-ashes': 'Leads',
};

const COMPLETED_LOOKBACK_DAYS = 7;

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getChapterBoardTabLabel(universeId: string): string {
  return CHAPTER_TAB_LABELS[universeId] ?? CHAPTER_TAB_LABELS['dust-and-iron'];
}

export function getQuestBoardTabLabel(tab: QuestBoardTab, universeId: string): string {
  switch (tab) {
    case 'today':
      return 'Today';
    case 'review':
      return 'Needs Review';
    case 'focus':
      return 'Focus';
    case 'chapter':
      return getChapterBoardTabLabel(universeId);
    case 'inbox':
      return 'Inbox';
    case 'recurring':
      return 'Recurring';
    case 'completed':
      return 'Completed';
  }
}

export function getQuestBoardSourceType(quest: BoardQuest): QuestBoardSourceFilter {
  if (quest.source === 'template') return 'chapter';
  if (quest.parentQuestId || quest.isQuestChainParent) return 'chain';
  if (quest.generatedFromRecurringQuestId || quest.isRecurring) return 'recurring';
  return 'user';
}

export function hasActiveQuestBoardFilters(filters: QuestBoardFilters): boolean {
  return (
    filters.category != null ||
    filters.risk !== 'all' ||
    filters.readiness !== 'all' ||
    filters.source != null
  );
}

export function matchesQuestBoardFilters(quest: BoardQuest, filters: QuestBoardFilters): boolean {
  if (filters.category && quest.category !== filters.category) return false;

  if (filters.source) {
    if (getQuestBoardSourceType(quest) !== filters.source) return false;
  }

  if (filters.risk !== 'all') {
    if (quest.source !== 'user') return false;
    if (resolveQuestRiskLevel(quest.riskLevel) !== filters.risk) return false;
  }

  if (filters.readiness !== 'all') {
    if (quest.source !== 'user') return false;
    const score = quest.readinessScore ?? 0;
    if (filters.readiness === 'ready' && score < 3) return false;
    if (filters.readiness === 'building' && (score < 1 || score > 2)) return false;
    if (filters.readiness === 'none' && score > 0) return false;
  }

  return true;
}

function isActiveBoardQuest(quest: BoardQuest, today: string): boolean {
  if (quest.completed) return false;
  if (quest.lifecycleStatus === 'archived' || quest.lifecycleStatus === 'completed') return false;
  if (quest.lifecycleStatus === 'snoozed' && quest.snoozedUntilDate && quest.snoozedUntilDate > today) {
    return false;
  }
  return true;
}

function entryHasActiveQuest(entry: QuestBoardEntry, today: string): boolean {
  if (entry.kind === 'chain') {
    return (
      isActiveBoardQuest(entry.parent, today) ||
      entry.children.some((child) => isActiveBoardQuest(child, today))
    );
  }
  return isActiveBoardQuest(entry.quest, today);
}

function entryIsInTodayTab(entry: QuestBoardEntry, today: string): boolean {
  if (entry.kind === 'chain') {
    return (
      isBoardQuestInTodayTab(entry.parent, today) ||
      entry.children.some((child) => isBoardQuestInTodayTab(child, today))
    );
  }
  return isBoardQuestInTodayTab(entry.quest, today);
}

function entryNeedsReview(entry: QuestBoardEntry, today: string): boolean {
  if (entry.kind === 'chain') {
    return (
      isBoardQuestNeedsReview(entry.parent, today) ||
      entry.children.some((child) => isBoardQuestNeedsReview(child, today))
    );
  }
  return isBoardQuestNeedsReview(entry.quest, today);
}

function flattenBoardEntries(entries: QuestBoardEntry[]): BoardQuest[] {
  const quests: BoardQuest[] = [];
  for (const entry of entries) {
    if (entry.kind === 'chain') {
      quests.push(entry.parent, ...entry.children);
    } else {
      quests.push(entry.quest);
    }
  }
  return quests;
}

function entryMatchesFilters(entry: QuestBoardEntry, filters: QuestBoardFilters): boolean {
  if (entry.kind === 'chain') {
    return [entry.parent, ...entry.children].some((quest) => matchesQuestBoardFilters(quest, filters));
  }
  return matchesQuestBoardFilters(entry.quest, filters);
}

export function filterQuestBoardEntries(
  entries: QuestBoardEntry[],
  filters: QuestBoardFilters,
): QuestBoardEntry[] {
  if (!hasActiveQuestBoardFilters(filters)) return entries;
  return entries.filter((entry) => entryMatchesFilters(entry, filters));
}

export function filterBoardQuests(quests: BoardQuest[], filters: QuestBoardFilters): BoardQuest[] {
  if (!hasActiveQuestBoardFilters(filters)) return quests;
  return quests.filter((quest) => matchesQuestBoardFilters(quest, filters));
}

/** Lower score = higher priority on Today tab. */
export function getTodayQuestPriority(quest: BoardQuest, today: string = getLocalDateKey()): number {
  if (quest.completed) return 10_000;

  let score = 0;
  if (quest.isFocusLocked) score -= 500;
  if (quest.isDailyFocus) score -= 400;
  if (quest.isStarted) score -= 300;
  const carriedTo = quest.carriedToDate ?? quest.carryForwardDate;
  if (carriedTo === today) score -= 280;
  if (quest.reminderEnabled) score -= 200;
  if (quest.source === 'template') score -= 150;

  const createdOn = quest.createdOnDate ?? '';
  if (createdOn === today) score -= 50;

  return score;
}

export function compareTodayBoardQuests(a: BoardQuest, b: BoardQuest, today: string = getLocalDateKey()): number {
  const priorityDiff = getTodayQuestPriority(a, today) - getTodayQuestPriority(b, today);
  if (priorityDiff !== 0) return priorityDiff;

  const createdDiff = (b.createdOnDate ?? '').localeCompare(a.createdOnDate ?? '');
  if (createdDiff !== 0) return createdDiff;

  return a.narrativeTitle.localeCompare(b.narrativeTitle);
}

function sortEntriesForToday(entries: QuestBoardEntry[], today: string): QuestBoardEntry[] {
  return [...entries].sort((left, right) => {
    const leftQuest = left.kind === 'chain' ? left.parent : left.quest;
    const rightQuest = right.kind === 'chain' ? right.parent : right.quest;
    return compareTodayBoardQuests(leftQuest, rightQuest, today);
  });
}

function buildTodayEntries(
  userEntries: QuestBoardEntry[],
  chapterQuests: BoardQuest[],
  today: string,
): QuestBoardEntry[] {
  const activeUserEntries = userEntries.filter(
    (entry) => entryHasActiveQuest(entry, today) && entryIsInTodayTab(entry, today),
  );

  const sortedUser = sortEntriesForToday(activeUserEntries, today);
  const sortedChapter = [...chapterQuests]
    .filter((quest) => !quest.completed)
    .sort((a, b) => compareTodayBoardQuests(a, b, today))
    .map((quest) => ({ kind: 'quest' as const, quest }));

  return [...sortedUser, ...sortedChapter];
}

function buildReviewEntries(userEntries: QuestBoardEntry[], today: string): QuestBoardEntry[] {
  return userEntries
    .filter((entry) => entryHasActiveQuest(entry, today) && entryNeedsReview(entry, today))
    .sort((left, right) => {
      const leftQuest = left.kind === 'chain' ? left.parent : left.quest;
      const rightQuest = right.kind === 'chain' ? right.parent : right.quest;
      const createdDiff = (leftQuest.createdDate ?? leftQuest.createdOnDate ?? '').localeCompare(
        rightQuest.createdDate ?? rightQuest.createdOnDate ?? '',
      );
      if (createdDiff !== 0) return createdDiff;
      return leftQuest.narrativeTitle.localeCompare(rightQuest.narrativeTitle);
    });
}

function buildFocusEntries(userEntries: QuestBoardEntry[], today: string): QuestBoardEntry[] {
  return userEntries.filter((entry) => {
    if (!entryHasActiveQuest(entry, today)) return false;
    if (entry.kind === 'chain') {
      return (
        (entry.parent.isDailyFocus || entry.parent.isFocusLocked) &&
        (!entry.parent.completed || entry.children.some((child) => !child.completed))
      );
    }
    return (
      (entry.quest.isDailyFocus || entry.quest.isFocusLocked) &&
      !entry.quest.completed
    );
  });
}

function buildRecurringEntries(userEntries: QuestBoardEntry[], today: string): QuestBoardEntry[] {
  return userEntries.filter((entry) => {
    if (!entryHasActiveQuest(entry, today)) return false;
    if (entry.kind === 'chain') {
      return (
        entry.parent.generatedFromRecurringQuestId != null ||
        entry.children.some((child) => child.generatedFromRecurringQuestId != null)
      );
    }
    return Boolean(entry.quest.generatedFromRecurringQuestId || entry.quest.isRecurring);
  });
}

export type CompletedQuestGroup = {
  dateKey: string;
  label: string;
  quests: BoardQuest[];
};

function resolveCompletedDateKey(quest: BoardQuest): string {
  if (quest.completedAt) return quest.completedAt.slice(0, 10);
  if (quest.createdOnDate) return quest.createdOnDate;
  return getLocalDateKey();
}

function formatCompletedGroupLabel(dateKey: string): string {
  const today = getLocalDateKey();
  if (dateKey === today) return 'Today';

  const yesterday = parseLocalDateKey(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayKey = getLocalDateKey(yesterday);
  if (dateKey === yesterdayKey) return 'Yesterday';

  return parseLocalDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function groupCompletedBoardQuests(
  quests: BoardQuest[],
  today: string = getLocalDateKey(),
  lookbackDays = COMPLETED_LOOKBACK_DAYS,
): CompletedQuestGroup[] {
  const cutoff = parseLocalDateKey(today);
  cutoff.setDate(cutoff.getDate() - lookbackDays);
  const cutoffKey = getLocalDateKey(cutoff);

  const completed = quests.filter(
    (quest) => quest.completed && quest.lifecycleStatus !== 'archived',
  );
  const groups = new Map<string, BoardQuest[]>();

  for (const quest of completed) {
    const dateKey = resolveCompletedDateKey(quest);
    if (dateKey < cutoffKey) continue;
    const bucket = groups.get(dateKey) ?? [];
    bucket.push(quest);
    groups.set(dateKey, bucket);
  }

  return Array.from(groups.entries())
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([dateKey, bucket]) => ({
      dateKey,
      label: formatCompletedGroupLabel(dateKey),
      quests: bucket.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    }));
}

export function buildQuestBoardTabContent(input: {
  tab: QuestBoardTab;
  userEntries: QuestBoardEntry[];
  chapterQuests: BoardQuest[];
  filters?: QuestBoardFilters;
  today?: string;
}): {
  entries: QuestBoardEntry[];
  chapterQuests: BoardQuest[];
  completedGroups: CompletedQuestGroup[];
} {
  const today = input.today ?? getLocalDateKey();
  const filters = input.filters ?? DEFAULT_QUEST_BOARD_FILTERS;
  const filteredUserEntries = filterQuestBoardEntries(input.userEntries, filters);
  const filteredChapterQuests = filterBoardQuests(input.chapterQuests, filters);

  switch (input.tab) {
    case 'today':
      return {
        entries: buildTodayEntries(filteredUserEntries, filteredChapterQuests, today),
        chapterQuests: [],
        completedGroups: [],
      };
    case 'review':
      return {
        entries: filterQuestBoardEntries(buildReviewEntries(input.userEntries, today), filters),
        chapterQuests: [],
        completedGroups: [],
      };
    case 'focus':
      return {
        entries: filterQuestBoardEntries(buildFocusEntries(input.userEntries, today), filters),
        chapterQuests: [],
        completedGroups: [],
      };
    case 'chapter':
      return {
        entries: [],
        chapterQuests: [...filteredChapterQuests].sort((a, b) => {
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          return compareTodayBoardQuests(a, b, today);
        }),
        completedGroups: [],
      };
    case 'recurring':
      return {
        entries: filterQuestBoardEntries(buildRecurringEntries(input.userEntries, today), filters),
        chapterQuests: [],
        completedGroups: [],
      };
    case 'completed': {
      const allQuests = [
        ...flattenBoardEntries(input.userEntries),
        ...input.chapterQuests,
      ];
      return {
        entries: [],
        chapterQuests: [],
        completedGroups: groupCompletedBoardQuests(
          filterBoardQuests(allQuests, filters),
          today,
        ),
      };
    }
    case 'inbox':
    default:
      return { entries: [], chapterQuests: [], completedGroups: [] };
  }
}

export function countQuestBoardTabItems(input: {
  tab: QuestBoardTab;
  userEntries: QuestBoardEntry[];
  chapterQuests: BoardQuest[];
  inboxCount: number;
  recurringTemplateCount: number;
  today?: string;
}): number {
  const content = buildQuestBoardTabContent({
    tab: input.tab,
    userEntries: input.userEntries,
    chapterQuests: input.chapterQuests,
    filters: DEFAULT_QUEST_BOARD_FILTERS,
    today: input.today,
  });

  switch (input.tab) {
    case 'inbox':
      return input.inboxCount;
    case 'recurring':
      return content.entries.length + input.recurringTemplateCount;
    case 'completed':
      return content.completedGroups.reduce((sum, group) => sum + group.quests.length, 0);
    case 'chapter':
      return content.chapterQuests.length;
    default:
      return content.entries.length + content.chapterQuests.length;
  }
}

export { QUEST_LIFECYCLE_NEEDS_DECISION_COPY };

export function resolveBoardQuestCreatedOnDate(quest: BoardQuest): string {
  if (quest.createdOnDate) return quest.createdOnDate;
  if (quest.source === 'user') {
    return resolveQuestCreatedOnDate({ id: quest.id, createdOnDate: quest.createdOnDate });
  }
  return '';
}
