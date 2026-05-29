import { getLocalDateKey } from '@/lib/daily-streak';
import { EMPTY_ACTIVITY } from '@/lib/player-progress-sanitize';
import type { DailyActivity, PlayerProgress } from '@/types/narrative';

export const QUEST_CALENDAR_DAYS = 30;

export const QUEST_CALENDAR_EXPLANATION =
  'Small wins become easier to trust when you can see them.';

const CALENDAR_HEADER_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Marks on the trail.',
  neuronet: 'Signal trace history.',
  'neon-ashes': 'Case activity board.',
};

export type QuestCalendarIntensity = 'none' | 'light' | 'medium' | 'strong';

export type QuestCalendarDay = {
  dateKey: string;
  dayOfMonth: number;
  weekdayLabel: string;
  activity: DailyActivity;
  intensity: QuestCalendarIntensity;
  isToday: boolean;
};

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function getQuestCalendarHeaderFlavor(universeId: string): string {
  return CALENDAR_HEADER_FLAVOR[universeId] ?? CALENDAR_HEADER_FLAVOR['dust-and-iron'];
}

export function getQuestCalendarIntensity(questsCompleted: number): QuestCalendarIntensity {
  if (questsCompleted <= 0) return 'none';
  if (questsCompleted === 1) return 'light';
  if (questsCompleted <= 3) return 'medium';
  return 'strong';
}

export function getLastLocalDateKeys(count: number, referenceDate = new Date()): string[] {
  const keys: string[] = [];

  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const day = new Date(referenceDate);
    day.setDate(referenceDate.getDate() - offset);
    keys.push(getLocalDateKey(day));
  }

  return keys;
}

export function formatQuestCalendarDayLabel(dateKey: string): string {
  return parseLocalDateKey(dateKey).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function formatQuestCalendarWeekdayShort(dateKey: string): string {
  return parseLocalDateKey(dateKey).toLocaleDateString(undefined, { weekday: 'narrow' });
}

export function getActivityForDate(
  activityByDate: PlayerProgress['activityByDate'],
  dateKey: string,
): DailyActivity {
  return activityByDate?.[dateKey] ?? EMPTY_ACTIVITY;
}

export function buildQuestCalendarDays(
  activityByDate: PlayerProgress['activityByDate'],
  referenceDate = new Date(),
): QuestCalendarDay[] {
  const todayKey = getLocalDateKey(referenceDate);

  return getLastLocalDateKeys(QUEST_CALENDAR_DAYS, referenceDate).map((dateKey) => {
    const activity = getActivityForDate(activityByDate, dateKey);

    return {
      dateKey,
      dayOfMonth: parseLocalDateKey(dateKey).getDate(),
      weekdayLabel: formatQuestCalendarWeekdayShort(dateKey),
      activity,
      intensity: getQuestCalendarIntensity(activity.questsCompleted),
      isToday: dateKey === todayKey,
    };
  });
}

export function formatEmptyDayDetailMessage(): string {
  return 'No quests logged this day.';
}
