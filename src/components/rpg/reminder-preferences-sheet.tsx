import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { requestLocalReminderPermissions } from '@/lib/local-notifications';
import { LOCAL_REMINDERS_SUPPORTED } from '@/lib/local-notifications';
import { LOCAL_REMINDERS_WEB_MESSAGE } from '@/lib/quest-reminders';
import {
  REMINDER_PREFERENCES_SUBTITLE,
  REMINDER_PREFERENCES_TITLE,
  sanitizeReminderPreferences,
} from '@/lib/reminder-preferences';
import type { ReminderPreferences } from '@/types/narrative';

type ReminderPreferencesSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function ReminderPreferencesSheet({ visible, onClose }: ReminderPreferencesSheetProps) {
  const { activeUniverse, playerProgress, setReminderPreferences } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [quietHoursEnabled, setQuietHoursEnabled] = useState(false);
  const [quietHoursStart, setQuietHoursStart] = useState('22:00');
  const [quietHoursEnd, setQuietHoursEnd] = useState('07:00');

  useEffect(() => {
    if (!visible) return;
    const prefs = sanitizeReminderPreferences(playerProgress.reminderPreferences);
    setRemindersEnabled(prefs.remindersEnabled === true);
    setQuietHoursEnabled(prefs.quietHoursEnabled === true);
    setQuietHoursStart(prefs.quietHoursStart ?? '22:00');
    setQuietHoursEnd(prefs.quietHoursEnd ?? '07:00');
  }, [visible, playerProgress.reminderPreferences]);

  const handleSave = () => {
    const next: ReminderPreferences = {
      remindersEnabled,
      quietHoursEnabled,
      quietHoursStart: quietHoursStart.trim() || '22:00',
      quietHoursEnd: quietHoursEnd.trim() || '07:00',
    };

    if (remindersEnabled && LOCAL_REMINDERS_SUPPORTED) {
      void requestLocalReminderPermissions();
    }

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setReminderPreferences(next);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.backdrop}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.night,
              borderColor: palette.panelBorder,
              maxHeight: GameLayout.modalMaxHeight,
            },
          ]}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.content, { paddingBottom: modalBottomInset }]}>
            <View style={styles.header}>
              <Text style={[styles.eyebrow, { color: palette.gold }]}>SETTINGS</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>{REMINDER_PREFERENCES_TITLE}</Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>{REMINDER_PREFERENCES_SUBTITLE}</Text>

            {!LOCAL_REMINDERS_SUPPORTED ? (
              <Text style={[styles.webNotice, { color: palette.fog }]}>{LOCAL_REMINDERS_WEB_MESSAGE}</Text>
            ) : null}

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>Enable local reminders</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>
                  Cues for quests you choose — never required.
                </Text>
              </View>
              <Switch
                value={remindersEnabled}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setRemindersEnabled(enabled);
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={remindersEnabled ? palette.gold : palette.fog}
              />
            </View>

            <View style={[styles.toggleRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.toggleCopy}>
                <Text style={[styles.toggleLabel, { color: palette.bone }]}>Quiet hours</Text>
                <Text style={[styles.toggleHint, { color: palette.fog }]}>
                  Skip cues during these hours (optional).
                </Text>
              </View>
              <Switch
                value={quietHoursEnabled}
                onValueChange={(enabled) => {
                  void Haptics.selectionAsync();
                  setQuietHoursEnabled(enabled);
                }}
                trackColor={{ false: palette.panelBorder, true: palette.primary }}
                thumbColor={quietHoursEnabled ? palette.gold : palette.fog}
              />
            </View>

            {quietHoursEnabled ? (
              <View style={[styles.quietBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
                <TextInput
                  value={quietHoursStart}
                  onChangeText={setQuietHoursStart}
                  placeholder="Start — 22:00"
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
                <TextInput
                  value={quietHoursEnd}
                  onChangeText={setQuietHoursEnd}
                  placeholder="End — 07:00"
                  placeholderTextColor={`${palette.fog}88`}
                  style={[
                    styles.input,
                    { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
                  ]}
                />
              </View>
            ) : null}

            <GlowButton
              label="SAVE PREFERENCES"
              hint={remindersEnabled ? 'Permission requested on mobile when needed' : 'Reminders stay off globally'}
              onPress={handleSave}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.72)',
  },
  dismissArea: { flex: 1 },
  sheet: {
    borderTopWidth: 1,
    transform: [{ skewX: '-1deg' }],
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.6,
  },
  close: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    padding: 4,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
  },
  webNotice: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    fontStyle: 'italic',
    lineHeight: 17,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderTopWidth: 1,
    paddingTop: 12,
  },
  toggleCopy: {
    flex: 1,
    gap: 4,
  },
  toggleLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
  },
  toggleHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  quietBox: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
  },
});
