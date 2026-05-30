import { createDefaultReminderPreferences } from '@/lib/quest-reminders';
import type { ReminderPreferences } from '@/types/narrative';

const TIME_PATTERN = /^([01]?\d|2[0-3]):([0-5]\d)$/;

function sanitizeTime(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  return TIME_PATTERN.test(trimmed) ? trimmed : undefined;
}

export function sanitizeReminderPreferences(raw: unknown): ReminderPreferences {
  const defaults = createDefaultReminderPreferences();

  if (!raw || typeof raw !== 'object') {
    return defaults;
  }

  const record = raw as Record<string, unknown>;

  return {
    remindersEnabled: record.remindersEnabled === true,
    quietHoursEnabled: record.quietHoursEnabled === true,
    quietHoursStart: sanitizeTime(record.quietHoursStart) ?? defaults.quietHoursStart,
    quietHoursEnd: sanitizeTime(record.quietHoursEnd) ?? defaults.quietHoursEnd,
  };
}

export const REMINDER_PREFERENCES_TITLE = 'Reminder Preferences';
export const REMINDER_PREFERENCES_SUBTITLE =
  'Optional local cues for important quests — never required.';
