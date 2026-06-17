import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useNotifications } from '@/hooks/useNotifications';
import { QUESTORY_NOTIFICATIONS_SUPPORTED } from '@/lib/notifications/notification-service';

export function NotificationSettingsPanel() {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const {
    permissionLabel,
    dailyRemindersEnabled,
    isBusy,
    feedback,
    scheduleDailyReminders,
    cancelNotifications,
    sendTestNotification,
  } = useNotifications();

  if (!QUESTORY_NOTIFICATIONS_SUPPORTED) {
    return (
      <View style={styles.wrap}>
        <Text style={[styles.title, { color: palette.bone }]}>Daily Reminders</Text>
        <Text style={[styles.subtitle, { color: palette.fog }]}>
          Local notifications are available on iOS and Android builds, not in the web app.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: palette.bone }]}>Daily Reminders</Text>
      <Text style={[styles.subtitle, { color: palette.fog }]}>
        Local Sasha & Marcus reminders to return and clear a quest — no backend required.
      </Text>

      <View style={[styles.statusRow, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.statusLabel, { color: palette.fog }]}>Permission</Text>
        <Text style={[styles.statusValue, { color: palette.bone }]}>{permissionLabel}</Text>
      </View>

      <View style={[styles.statusRow, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.statusLabel, { color: palette.fog }]}>Daily reminders</Text>
        <Text style={[styles.statusValue, { color: dailyRemindersEnabled ? palette.gold : palette.fog }]}>
          {dailyRemindersEnabled ? 'On · 9:00 & 20:30' : 'Off'}
        </Text>
      </View>

      <View style={styles.actions}>
        <ActionButton
          label="ENABLE DAILY REMINDERS"
          hint="Morning 9:00 · Evening 8:30"
          onPress={() => void scheduleDailyReminders()}
          disabled={isBusy}
          palette={palette}
          accent
        />
        <ActionButton
          label="DISABLE REMINDERS"
          hint="Cancel scheduled daily reminders"
          onPress={() => void cancelNotifications()}
          disabled={isBusy || !dailyRemindersEnabled}
          palette={palette}
        />
        <ActionButton
          label="SEND TEST NOTIFICATION"
          hint="Marcus message in ~5 seconds"
          onPress={() => void sendTestNotification()}
          disabled={isBusy}
          palette={palette}
        />
      </View>

      {feedback ? (
        <Text style={[styles.feedback, { color: palette.accent }]}>{feedback}</Text>
      ) : null}
    </View>
  );
}

function ActionButton({
  label,
  hint,
  onPress,
  disabled,
  palette,
  accent = false,
}: {
  label: string;
  hint: string;
  onPress: () => void;
  disabled?: boolean;
  palette: {
    bone: string;
    fog: string;
    gold: string;
    panel: string;
    panelBorder: string;
    primary: string;
  };
  accent?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        {
          borderColor: accent ? palette.gold : palette.panelBorder,
          backgroundColor: accent ? `${palette.primary}44` : palette.panel,
          opacity: disabled ? 0.55 : 1,
        },
      ]}>
      <Text style={[styles.buttonLabel, { color: palette.bone }]}>{label}</Text>
      <Text style={[styles.buttonHint, { color: palette.fog }]}>{hint}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  statusRow: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  statusLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  statusValue: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.4,
    flexShrink: 1,
    textAlign: 'right',
  },
  actions: {
    gap: 6,
  },
  button: {
    borderWidth: 1,
    padding: 10,
    gap: 3,
    transform: [{ skewX: '-2deg' }],
  },
  buttonLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
  },
  buttonHint: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
  },
  feedback: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
});
