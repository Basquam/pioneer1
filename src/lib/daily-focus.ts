import { getLocalDateKey } from '@/lib/daily-streak';
import type { PlayerProgress, UserQuest } from '@/types/narrative';

export const DEFAULT_DAILY_FOCUS_LIMIT = 3;

function extractQuestCreatedTime(questId: string): number {
  const match = questId.match(/^user-(\d+)-/);
  return match ? Number(match[1]) : 0;
}

export function resolveQuestCreatedOnDate(quest: UserQuest): string {
  if (quest.createdOnDate) return quest.createdOnDate;
  const timestamp = extractQuestCreatedTime(quest.id);
  if (timestamp > 0) return getLocalDateKey(new Date(timestamp));
  return '';
}

export function filterUserQuestsByUniverse(
  userQuests: UserQuest[],
  universeId: string,
): UserQuest[] {
  return userQuests.filter((quest) => quest.sourceUniverseId === universeId);
}

export function getDailyFocusLimit(
  progress: Pick<PlayerProgress, 'dailyFocusLimit'>,
): number {
  return progress.dailyFocusLimit ?? DEFAULT_DAILY_FOCUS_LIMIT;
}

/** User-created quests from the given local day, oldest first. */
export function getTodayUserQuests(
  userQuests: UserQuest[],
  dateKey: string = getLocalDateKey(),
  universeId?: string,
): UserQuest[] {
  const scoped = universeId ? filterUserQuestsByUniverse(userQuests, universeId) : userQuests;
  return scoped
    .filter((quest) => resolveQuestCreatedOnDate(quest) === dateKey)
    .sort((a, b) => extractQuestCreatedTime(a.id) - extractQuestCreatedTime(b.id));
}

export function countTodayUserQuests(
  userQuests: UserQuest[],
  dateKey: string = getLocalDateKey(),
  universeId?: string,
): number {
  return getTodayUserQuests(userQuests, dateKey, universeId).length;
}

export function getDailyFocusQuestIds(
  userQuests: UserQuest[],
  limit: number = DEFAULT_DAILY_FOCUS_LIMIT,
  dateKey: string = getLocalDateKey(),
  universeId?: string,
): Set<string> {
  const todayQuests = getTodayUserQuests(userQuests, dateKey, universeId);
  return new Set(todayQuests.slice(0, limit).map((quest) => quest.id));
}

export function isDailyFocusQuest(
  questId: string,
  userQuests: UserQuest[],
  limit: number = DEFAULT_DAILY_FOCUS_LIMIT,
  dateKey: string = getLocalDateKey(),
  universeId?: string,
): boolean {
  return getDailyFocusQuestIds(userQuests, limit, dateKey, universeId).has(questId);
}

export function formatTodayFocusLabel(
  count: number,
  limit: number,
  universeId: string = 'dust-and-iron',
): string {
  if (universeId === 'neuronet') {
    return `Focus Operations: ${count} / ${limit}`;
  }
  if (universeId === 'neon-ashes') {
    return `Focus Leads: ${count} / ${limit}`;
  }
  return `Focus Quests: ${count} / ${limit}`;
}

export function getDailyFocusOverLimitMessage(
  limit: number,
  universeId: string = 'dust-and-iron',
): string {
  if (universeId === 'neuronet') {
    return `More than ${limit} operations today may dilute your Focus Operations. Continue?`;
  }
  if (universeId === 'neon-ashes') {
    return `More than ${limit} leads today may dilute your Focus Leads. Continue?`;
  }
  return `More than ${limit} quests today may dilute your Focus Quests. Continue?`;
}
