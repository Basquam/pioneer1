import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';

import {
  areDailyRemindersEnabled,
  cancelAllQuestoryScheduledNotifications,
  getNotificationPermissionStatus,
  permissionStatusLabel,
  requestNotificationPermission,
  scheduleQuestoryDailyReminders,
  scheduleTestNotification,
  type NotificationPermissionStatus,
} from '@/lib/notifications/notification-service';
import {
  trackDailyRemindersScheduled,
  trackNotificationDisabled,
  trackNotificationEnabled,
  trackNotificationPermissionRequested,
  trackNotificationPermissionResult,
  trackNotificationTestSent,
} from '@/lib/analytics/questory-analytics';

type UseNotificationsResult = {
  permissionStatus: NotificationPermissionStatus;
  permissionLabel: string;
  dailyRemindersEnabled: boolean;
  isBusy: boolean;
  feedback: string | null;
  refresh: () => Promise<void>;
  requestPermission: () => Promise<NotificationPermissionStatus>;
  scheduleDailyReminders: () => Promise<boolean>;
  cancelNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<boolean>;
  clearFeedback: () => void;
};

export function useNotifications(): UseNotificationsResult {
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermissionStatus>('undetermined');
  const [dailyRemindersEnabled, setDailyRemindersEnabled] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const [status, enabled] = await Promise.all([
      getNotificationPermissionStatus(),
      areDailyRemindersEnabled(),
    ]);
    setPermissionStatus(status);
    setDailyRemindersEnabled(enabled);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const requestPermission = useCallback(async () => {
    setIsBusy(true);
    try {
      trackNotificationPermissionRequested();
      const status = await requestNotificationPermission();
      setPermissionStatus(status);
      trackNotificationPermissionResult({ permission_status: status });
      return status;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const scheduleDailyReminders = useCallback(async () => {
    setIsBusy(true);
    setFeedback(null);
    try {
      let status = await getNotificationPermissionStatus();
      if (status !== 'granted') {
        status = await requestNotificationPermission();
        setPermissionStatus(status);
      }

      if (status === 'denied') {
        setFeedback('Notifications are blocked. Enable them in your device settings to use daily reminders.');
        return false;
      }

      if (status !== 'granted') {
        setFeedback('Daily reminders need notification permission.');
        return false;
      }

      const result = await scheduleQuestoryDailyReminders();
      if (!result.ok) {
        setFeedback(result.reason);
        return false;
      }

      setDailyRemindersEnabled(true);
      trackDailyRemindersScheduled();
      trackNotificationEnabled({ notification_type: 'morningReminder' });
      trackNotificationEnabled({ notification_type: 'eveningReminder' });
      setFeedback('Daily reminders enabled — morning at 9:00, evening at 8:30.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const cancelNotifications = useCallback(async () => {
    setIsBusy(true);
    setFeedback(null);
    try {
      await cancelAllQuestoryScheduledNotifications();
      setDailyRemindersEnabled(false);
      trackNotificationDisabled({ notification_type: 'morningReminder' });
      trackNotificationDisabled({ notification_type: 'eveningReminder' });
      setFeedback('Daily reminders disabled.');
      void Haptics.selectionAsync();
    } finally {
      setIsBusy(false);
    }
  }, []);

  const sendTestNotification = useCallback(async () => {
    setIsBusy(true);
    setFeedback(null);
    try {
      let status = await getNotificationPermissionStatus();
      if (status !== 'granted') {
        status = await requestNotificationPermission();
        setPermissionStatus(status);
      }

      if (status === 'denied') {
        setFeedback('Notifications are blocked. Enable them in your device settings to test reminders.');
        return false;
      }

      if (status !== 'granted') {
        setFeedback('Allow notifications to send a test reminder.');
        return false;
      }

      const result = await scheduleTestNotification('marcus');
      if (!result.ok) {
        setFeedback(result.reason);
        return false;
      }

      trackNotificationTestSent();
      setFeedback('Test notification scheduled — arrives in about 5 seconds.');
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return true;
    } finally {
      setIsBusy(false);
    }
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
  }, []);

  return {
    permissionStatus,
    permissionLabel: permissionStatusLabel(permissionStatus),
    dailyRemindersEnabled,
    isBusy,
    feedback,
    refresh,
    requestPermission,
    scheduleDailyReminders,
    cancelNotifications,
    sendTestNotification,
    clearFeedback,
  };
}
