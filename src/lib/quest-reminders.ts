import type { ReminderPreferences, UserQuest } from '@/types/narrative';

export type QuestReminderPreset = 'morning' | 'afternoon' | 'evening';

export type QuestReminderSelection = 'none' | QuestReminderPreset | 'custom';

export const QUEST_REMINDER_PRESET_OPTIONS: Array<{
  value: QuestReminderSelection;
  label: string;
}> = [
  { value: 'none', label: 'No reminder' },
  { value: 'morning', label: 'Morning' },
  { value: 'afternoon', label: 'Afternoon' },
  { value: 'evening', label: 'Evening' },
  { value: 'custom', label: 'Custom time' },
];

export const REMINDER_PRESET_SCHEDULE: Record<
  QuestReminderPreset,
  { hour: number; minute: number; label: string }
> = {
  morning: { hour: 8, minute: 30, label: 'Morning' },
  afternoon: { hour: 13, minute: 0, label: 'Afternoon' },
  evening: { hour: 19, minute: 30, label: 'Evening' },
};

const CUSTOM_TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

export const LOCAL_REMINDERS_WEB_MESSAGE = 'Local reminders work on mobile builds.';

export function buildQuestReminderId(questId: string): string {
  return `quest-cue-${questId}`;
}

export function isQuestReminderPreset(value: string | undefined): value is QuestReminderPreset {
  return value === 'morning' || value === 'afternoon' || value === 'evening';
}

export function isValidCustomReminderTime(value: string): boolean {
  return CUSTOM_TIME_PATTERN.test(value.trim());
}

export function parseCustomReminderTime(value: string): { hour: number; minute: number } | null {
  const match = value.trim().match(CUSTOM_TIME_PATTERN);
  if (!match) return null;
  return {
    hour: Number(match[1]),
    minute: Number(match[2]),
  };
}

export function formatCustomReminderTime(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function resolveQuestReminderSchedule(reminderTime: string | undefined): {
  hour: number;
  minute: number;
  label: string;
} | null {
  if (!reminderTime) return null;

  if (isQuestReminderPreset(reminderTime)) {
    return REMINDER_PRESET_SCHEDULE[reminderTime];
  }

  const custom = parseCustomReminderTime(reminderTime);
  if (!custom) return null;

  return {
    ...custom,
    label: formatCustomReminderTime(custom.hour, custom.minute),
  };
}

export function buildQuestReminderFields(
  selection: QuestReminderSelection,
  customTime = '',
): Pick<UserQuest, 'reminderEnabled' | 'reminderTime' | 'reminderLabel' | 'reminderId'> {
  if (selection === 'none') {
    return { reminderEnabled: false };
  }

  if (selection === 'custom') {
    const trimmed = customTime.trim();
    if (!isValidCustomReminderTime(trimmed)) {
      return { reminderEnabled: false };
    }

    return {
      reminderEnabled: true,
      reminderTime: trimmed,
      reminderLabel: trimmed,
    };
  }

  const preset = REMINDER_PRESET_SCHEDULE[selection];
  return {
    reminderEnabled: true,
    reminderTime: selection,
    reminderLabel: preset.label,
  };
}

export function getQuestReminderSelection(
  quest: Pick<UserQuest, 'reminderEnabled' | 'reminderTime'>,
): QuestReminderSelection {
  if (!quest.reminderEnabled || !quest.reminderTime) return 'none';
  if (isQuestReminderPreset(quest.reminderTime)) return quest.reminderTime;
  if (isValidCustomReminderTime(quest.reminderTime)) return 'custom';
  return 'none';
}

export function suggestReminderSelectionFromPlannedTime(
  plannedTimeLabel: string | undefined,
): QuestReminderPreset | null {
  if (!plannedTimeLabel?.trim()) return null;

  const normalized = plannedTimeLabel.trim().toLowerCase();

  if (normalized.includes('morning') || normalized.includes('am')) {
    return 'morning';
  }
  if (normalized.includes('afternoon') || normalized.includes('midday') || normalized.includes('lunch')) {
    return 'afternoon';
  }
  if (normalized.includes('evening') || normalized.includes('night') || normalized.includes('pm')) {
    return 'evening';
  }

  const custom = parseCustomReminderTime(plannedTimeLabel.trim());
  if (custom) {
    if (custom.hour < 12) return 'morning';
    if (custom.hour < 17) return 'afternoon';
    return 'evening';
  }

  return null;
}

export function formatQuestReminderCue(
  quest: Pick<UserQuest, 'reminderEnabled' | 'reminderLabel' | 'reminderTime'>,
): string | null {
  if (!quest.reminderEnabled) return null;

  const label =
    quest.reminderLabel?.trim() ||
    resolveQuestReminderSchedule(quest.reminderTime)?.label ||
    quest.reminderTime;

  if (!label) return null;
  return `Cue: ${label}`;
}

export function isReminderInQuietHours(
  hour: number,
  minute: number,
  preferences: ReminderPreferences | undefined,
): boolean {
  if (!preferences?.quietHoursEnabled) return false;
  if (!preferences.quietHoursStart || !preferences.quietHoursEnd) return false;

  const start = parseCustomReminderTime(preferences.quietHoursStart);
  const end = parseCustomReminderTime(preferences.quietHoursEnd);
  if (!start || !end) return false;

  const value = hour * 60 + minute;
  const startValue = start.hour * 60 + start.minute;
  const endValue = end.hour * 60 + end.minute;

  if (startValue === endValue) return false;

  if (startValue < endValue) {
    return value >= startValue && value < endValue;
  }

  return value >= startValue || value < endValue;
}

export function shouldScheduleQuestReminder(
  quest: UserQuest,
  preferences: ReminderPreferences | undefined,
): boolean {
  if (!preferences?.remindersEnabled) return false;
  if (quest.isCompleted || quest.archivedAt) return false;
  if (!quest.reminderEnabled || !quest.reminderTime) return false;

  const schedule = resolveQuestReminderSchedule(quest.reminderTime);
  if (!schedule) return false;

  return !isReminderInQuietHours(schedule.hour, schedule.minute, preferences);
}

export function createDefaultReminderPreferences(): ReminderPreferences {
  return {
    remindersEnabled: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '07:00',
  };
}

const UNIVERSE_REMINDER_COPY: Record<string, { title: string; body: string }> = {
  'dust-and-iron': {
    title: 'The trail is waiting.',
    body: 'One small ride keeps Dustfall steady.',
  },
  neuronet: {
    title: 'Signal window open.',
    body: 'Run one small operation before the feed decays.',
  },
  'neon-ashes': {
    title: 'A lead is waiting.',
    body: 'Follow one small clue before the case goes cold.',
  },
};

export function getQuestReminderNotificationCopy(universeId: string): { title: string; body: string } {
  return UNIVERSE_REMINDER_COPY[universeId] ?? UNIVERSE_REMINDER_COPY['dust-and-iron'];
}
