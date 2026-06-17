import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Device from 'expo-device';

import {
  getNotificationCopy,
  getTestNotificationCopy,
  type CoachVoice,
  type NotificationPreset,
} from '@/lib/notifications/notification-messages';
import { reportNotificationError } from '@/lib/crash/questory-crash';

export const QUESTORY_NOTIFICATIONS_SUPPORTED = Platform.OS !== 'web';

export type NotificationPermissionStatus = 'granted' | 'denied' | 'undetermined' | 'unsupported';

export const QUESTORY_DAILY_MORNING_ID = 'questory-daily-morning';
export const QUESTORY_DAILY_EVENING_ID = 'questory-daily-evening';
export const QUESTORY_TEST_NOTIFICATION_ID = 'questory-test-notification';

export const QUESTORY_DAILY_MORNING_HOUR = 9;
export const QUESTORY_DAILY_MORNING_MINUTE = 0;
export const QUESTORY_DAILY_EVENING_HOUR = 20;
export const QUESTORY_DAILY_EVENING_MINUTE = 30;

export const QUESTORY_ANDROID_CHANNEL_ID = 'questory-daily';

const DAILY_REMINDERS_ENABLED_KEY = 'questory-daily-reminders-enabled';

type NotificationModule = typeof import('expo-notifications');

let notificationsModule: NotificationModule | null = null;
let androidChannelReady = false;
let behaviorConfigured = false;

async function getNotificationsModule(): Promise<NotificationModule | null> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) return null;

  if (!notificationsModule) {
    try {
      notificationsModule = await import('expo-notifications');
    } catch {
      return null;
    }
  }

  return notificationsModule;
}

export async function configureQuestoryNotificationBehavior(): Promise<void> {
  if (behaviorConfigured) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });

  behaviorConfigured = true;
}

async function ensureAndroidChannel(Notifications: NotificationModule): Promise<void> {
  if (androidChannelReady || Platform.OS !== 'android') return;

  await Notifications.setNotificationChannelAsync(QUESTORY_ANDROID_CHANNEL_ID, {
    name: 'Questory Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#D4AF37',
    sound: 'default',
  });

  androidChannelReady = true;
}

export async function getNotificationPermissionStatus(): Promise<NotificationPermissionStatus> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) return 'unsupported';

  const Notifications = await getNotificationsModule();
  if (!Notifications) return 'unsupported';

  const settings = await Notifications.getPermissionsAsync();
  if (settings.granted) return 'granted';
  if (settings.canAskAgain === false) return 'denied';
  return settings.status === 'granted' ? 'granted' : 'undetermined';
}

export async function requestNotificationPermission(): Promise<NotificationPermissionStatus> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) return 'unsupported';

  const Notifications = await getNotificationsModule();
  if (!Notifications) return 'unsupported';

  await configureQuestoryNotificationBehavior();

  const current = await Notifications.getPermissionsAsync();
  if (current.granted) {
    await ensureAndroidChannel(Notifications);
    return 'granted';
  }

  const requested = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowBadge: false,
      allowSound: true,
    },
  });

  if (requested.granted) {
    await ensureAndroidChannel(Notifications);
    return 'granted';
  }

  if (requested.canAskAgain === false) return 'denied';
  return 'undetermined';
}

export async function areDailyRemindersEnabled(): Promise<boolean> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) return false;
  const value = await AsyncStorage.getItem(DAILY_REMINDERS_ENABLED_KEY);
  return value === 'true';
}

async function setDailyRemindersEnabled(enabled: boolean): Promise<void> {
  await AsyncStorage.setItem(DAILY_REMINDERS_ENABLED_KEY, enabled ? 'true' : 'false');
}

async function schedulePresetNotification(
  Notifications: NotificationModule,
  preset: NotificationPreset,
  identifier: string,
  hour: number,
  minute: number,
  voice?: CoachVoice,
): Promise<void> {
  const copy = getNotificationCopy(preset, voice);

  await Notifications.scheduleNotificationAsync({
    identifier,
    content: {
      title: copy.title,
      body: copy.body,
      data: { type: preset, voice: copy.voice, scope: 'questory-daily' },
      ...(Platform.OS === 'android' ? { channelId: QUESTORY_ANDROID_CHANNEL_ID } : {}),
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: Platform.OS === 'android' ? QUESTORY_ANDROID_CHANNEL_ID : undefined,
    },
  });
}

export async function scheduleQuestoryDailyReminders(): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) {
    return { ok: false, reason: 'Local notifications are not available on web.' };
  }

  const permission = await getNotificationPermissionStatus();
  if (permission !== 'granted') {
    return {
      ok: false,
      reason: 'Notification permission is required to schedule daily reminders.',
    };
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return { ok: false, reason: 'Notifications are unavailable on this device.' };
  }

  await configureQuestoryNotificationBehavior();
  await ensureAndroidChannel(Notifications);
  await cancelQuestoryDailyReminders();

  try {
    await schedulePresetNotification(
      Notifications,
      'morningReminder',
      QUESTORY_DAILY_MORNING_ID,
      QUESTORY_DAILY_MORNING_HOUR,
      QUESTORY_DAILY_MORNING_MINUTE,
      'sasha',
    );
    await schedulePresetNotification(
      Notifications,
      'eveningReminder',
      QUESTORY_DAILY_EVENING_ID,
      QUESTORY_DAILY_EVENING_HOUR,
      QUESTORY_DAILY_EVENING_MINUTE,
      'marcus',
    );
    await setDailyRemindersEnabled(true);
    return { ok: true };
  } catch (err) {
    reportNotificationError(err, { action: 'schedule_daily_reminders' });
    return { ok: false, reason: 'Could not schedule daily reminders. Please try again.' };
  }
}

export async function cancelQuestoryDailyReminders(): Promise<void> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) return;

  const Notifications = await getNotificationsModule();
  if (!Notifications) return;

  await Promise.all([
    Notifications.cancelScheduledNotificationAsync(QUESTORY_DAILY_MORNING_ID).catch(() => undefined),
    Notifications.cancelScheduledNotificationAsync(QUESTORY_DAILY_EVENING_ID).catch(() => undefined),
  ]);

  await setDailyRemindersEnabled(false);
}

/** Cancels Questory daily reminders only — does not affect per-quest cue notifications. */
export async function cancelAllQuestoryScheduledNotifications(): Promise<void> {
  await cancelQuestoryDailyReminders();
}

export async function scheduleTestNotification(
  voice: CoachVoice = 'marcus',
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) {
    return { ok: false, reason: 'Local notifications are not available on web.' };
  }

  if (!Device.isDevice && Platform.OS === 'android') {
    // Android emulators can still receive local notifications in many setups.
  }

  const permission = await getNotificationPermissionStatus();
  if (permission !== 'granted') {
    return {
      ok: false,
      reason: 'Allow notifications first, then send a test reminder.',
    };
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return { ok: false, reason: 'Notifications are unavailable on this device.' };
  }

  await configureQuestoryNotificationBehavior();
  await ensureAndroidChannel(Notifications);

  const copy = getTestNotificationCopy(voice);

  try {
    await Notifications.cancelScheduledNotificationAsync(QUESTORY_TEST_NOTIFICATION_ID).catch(() => undefined);
    await Notifications.scheduleNotificationAsync({
      identifier: QUESTORY_TEST_NOTIFICATION_ID,
      content: {
        title: copy.title,
        body: copy.body,
        data: { type: 'testNotification', voice: copy.voice, scope: 'questory-daily' },
        ...(Platform.OS === 'android' ? { channelId: QUESTORY_ANDROID_CHANNEL_ID } : {}),
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5,
        channelId: Platform.OS === 'android' ? QUESTORY_ANDROID_CHANNEL_ID : undefined,
      },
    });
    return { ok: true };
  } catch (err) {
    reportNotificationError(err, { action: 'schedule_test_notification' });
    return { ok: false, reason: 'Could not schedule the test notification.' };
  }
}

export async function schedulePresetLocalNotification(
  preset: NotificationPreset,
  options?: { voice?: CoachVoice; delaySeconds?: number },
): Promise<{ ok: true } | { ok: false; reason: string }> {
  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) {
    return { ok: false, reason: 'Local notifications are not available on web.' };
  }

  const permission = await getNotificationPermissionStatus();
  if (permission !== 'granted') {
    return { ok: false, reason: 'Notification permission is required.' };
  }

  const Notifications = await getNotificationsModule();
  if (!Notifications) {
    return { ok: false, reason: 'Notifications are unavailable on this device.' };
  }

  await configureQuestoryNotificationBehavior();
  await ensureAndroidChannel(Notifications);

  const copy = getNotificationCopy(preset, options?.voice);
  const identifier = `questory-preset-${preset}-${Date.now()}`;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: copy.title,
        body: copy.body,
        data: { type: preset, voice: copy.voice, scope: 'questory-daily' },
        ...(Platform.OS === 'android' ? { channelId: QUESTORY_ANDROID_CHANNEL_ID } : {}),
      },
      trigger: options?.delaySeconds
        ? {
            type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
            seconds: options.delaySeconds,
            channelId: Platform.OS === 'android' ? QUESTORY_ANDROID_CHANNEL_ID : undefined,
          }
        : null,
    });
    return { ok: true };
  } catch (err) {
    reportNotificationError(err, { action: 'schedule_preset_notification', reason: preset });
    return { ok: false, reason: 'Could not schedule the notification.' };
  }
}

export function permissionStatusLabel(status: NotificationPermissionStatus): string {
  switch (status) {
    case 'granted':
      return 'Allowed';
    case 'denied':
      return 'Denied — enable in system settings';
    case 'undetermined':
      return 'Not requested yet';
    case 'unsupported':
      return 'Unavailable on this platform';
  }
}
