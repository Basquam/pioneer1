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

export function getDailyFocusLimit(progress: PlayerProgress): number {
  return progress.dailyFocusLimit ?? DEFAULT_DAILY_FOCUS_LIMIT;
}

/** User-created quests from the given local day, oldest first. */
export function getTodayUserQuests(
  userQuests: UserQuest[],
  dateKey: string = getLocalDateKey(),
): UserQuest[] {
  return userQuests
    .filter((quest) => resolveQuestCreatedOnDate(quest) === dateKey)
    .sort((a, b) => extractQuestCreatedTime(a.id) - extractQuestCreatedTime(b.id));
}

export function countTodayUserQuests(
  userQuests: UserQuest[],
  dateKey: string = getLocalDateKey(),
): number {
  return getTodayUserQuests(userQuests, dateKey).length;
}

export function getDailyFocusQuestIds(
  userQuests: UserQuest[],
  limit: number = DEFAULT_DAILY_FOCUS_LIMIT,
  dateKey: string = getLocalDateKey(),
): Set<string> {
  const todayQuests = getTodayUserQuests(userQuests, dateKey);
  return new Set(todayQuests.slice(0, limit).map((quest) => quest.id));
}

export function isDailyFocusQuest(
  questId: string,
  userQuests: UserQuest[],
  limit: number = DEFAULT_DAILY_FOCUS_LIMIT,
  dateKey: string = getLocalDateKey(),
): boolean {
  return getDailyFocusQuestIds(userQuests, limit, dateKey).has(questId);
}

export function formatTodayFocusLabel(count: number, limit: number): string {
  return `Today's Focus: ${count} / ${limit}`;
}

export function getDailyFocusOverLimitMessage(limit: number): string {
  return `More than ${limit} quests may dilute today's story. Continue?`;
}
