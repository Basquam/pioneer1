import { Platform } from 'react-native';
import * as Device from 'expo-device';

import { configureQuestoryNotificationBehavior } from '@/lib/notifications/notification-service';

import {
  buildQuestReminderId,
  getQuestReminderNotificationCopy,
  resolveQuestReminderSchedule,
  shouldScheduleQuestReminder,
} from '@/lib/quest-reminders';
import { sanitizeReminderPreferences } from '@/lib/reminder-preferences';
import type { PlayerProgress, ReminderPreferences, UserQuest } from '@/types/narrative';

export const LOCAL_REMINDERS_SUPPORTED = Platform.OS !== 'web';

type NotificationModule = typeof import('expo-notifications');

let notificationsModule: NotificationModule | null = null;
let channelReady = false;

async function getNotificationsModule(): Promise<NotificationModule | null> {
  if (!LOCAL_REMINDERS_SUPPORTED) return null;
  if (!Device.isDevice && Platform.OS !== 'web') {
    // Simulators can still schedule in many cases, but physical device is the target.
  }

  if (!notificationsModule) {
    try {
      notificationsModule = await import('expo-notifications');
    } catch {
      return null;
    }
  }

  return notificationsModule;
}

export async function configureLocalNotifications(): Promise<void> {
  await configureQuestoryNotificationBehavior();

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  // Quest cues keep a lighter handler preference when Questory behavior is already configured.
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

async function ensureAndroidChannel(Notifications: NotificationModule): Promise<void> {
  if (channelReady || Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync('quest-cues', {
    name: 'Quest Cues',
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 120],
    lightColor: '#D4AF37',
  });

  channelReady = true;
}

export async function getLocalReminderPermissionStatus(): Promise<
  'granted' | 'denied' | 'undetermined' | 'unsupported'
> {
  if (!LOCAL_REMINDERS_SUPPORTED) return 'unsupported';

  const Notifications = await getNotificationsModule();
  if (!Notifications) return 'unsupported';

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return 'granted';
  if (settings.canAskAgain === false) return 'denied';
  return settings.status === 'granted' ? 'granted' : 'undetermined';
}

export async function requestLocalReminderPermissions(): Promise<boolean> {
  if (!LOCAL_REMINDERS_SUPPORTED) return false;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return false;

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel(Notifications);
    return true;
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    await ensureAndroidChannel(Notifications);
  }

  return requested.granted === true;
}

export async function cancelQuestReminderNotification(questId: string): Promise<void> {
  if (!LOCAL_REMINDERS_SUPPORTED) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  try {
    await Notifications.cancelScheduledNotificationAsync(buildQuestReminderId(questId));
  } catch {
    // Ignore missing schedules.
  }
}

export async function scheduleQuestReminderNotification(
  quest: UserQuest,
  universeId: string,
  preferences: ReminderPreferences | undefined,
): Promise<string | null> {
  if (!shouldScheduleQuestReminder(quest, preferences)) {
    await cancelQuestReminderNotification(quest.id);
    return null;
  }

  if (!LOCAL_REMINDERS_SUPPORTED) return null;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return null;

  const permission = await getLocalReminderPermissionStatus();
  if (permission !== 'granted') return null;

  await ensureAndroidChannel(Notifications);

  const schedule = resolveQuestReminderSchedule(quest.reminderTime);
  if (!schedule) return null;

  const identifier = buildQuestReminderId(quest.id);
  const copy = getQuestReminderNotificationCopy(universeId);

  await cancelQuestReminderNotification(quest.id);

  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: copy.title,
        body: copy.body,
        data: { questId: quest.id, type: 'quest-cue' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: schedule.hour,
        minute: schedule.minute,
        channelId: Platform.OS === 'android' ? 'quest-cues' : undefined,
      },
    });
    return identifier;
  } catch {
    return null;
  }
}

export async function syncQuestReminderNotifications(
  progress: PlayerProgress,
  universeId: string,
): Promise<Array<{ questId: string; reminderId: string | null }>> {
  const preferences = sanitizeReminderPreferences(progress.reminderPreferences);
  const updates: Array<{ questId: string; reminderId: string | null }> = [];

  if (!preferences.remindersEnabled) {
    for (const quest of progress.userQuests) {
      if (quest.reminderId) {
        await cancelQuestReminderNotification(quest.id);
        updates.push({ questId: quest.id, reminderId: null });
      }
    }
    return updates;
  }

  for (const quest of progress.userQuests) {
    const shouldSchedule = shouldScheduleQuestReminder(quest, preferences);
    if (!shouldSchedule) {
      if (quest.reminderId) {
        await cancelQuestReminderNotification(quest.id);
        updates.push({ questId: quest.id, reminderId: null });
      }
      continue;
    }

    const reminderId = await scheduleQuestReminderNotification(quest, universeId, preferences);
    if (reminderId !== quest.reminderId) {
      updates.push({ questId: quest.id, reminderId });
    }
  }

  return updates;
}

export async function cancelAllQuestReminderNotifications(userQuests: UserQuest[]): Promise<void> {
  await Promise.all(userQuests.map((quest) => cancelQuestReminderNotification(quest.id)));
}
