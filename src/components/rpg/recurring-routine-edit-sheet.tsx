import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { formatRecurrenceLabel } from '@/lib/recurring-quests';

type RecurringRoutineEditSheetProps = {
  templateId: string | null;
  onClose: () => void;
};

export function RecurringRoutineEditSheet({ templateId, onClose }: RecurringRoutineEditSheetProps) {
  const { activeUniverse, playerProgress, updateRecurringQuestTemplate } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const template = useMemo(
    () => playerProgress.recurringQuestTemplates.find((entry) => entry.id === templateId) ?? null,
    [playerProgress.recurringQuestTemplates, templateId],
  );

  const [title, setTitle] = useState('');
  const [preferredTimeLabel, setPreferredTimeLabel] = useState('');

  useEffect(() => {
    if (!template) return;
    setTitle(template.originalTitle);
    setPreferredTimeLabel(template.preferredTimeLabel ?? '');
  }, [template]);

  if (!templateId || !template) return null;

  const handleSave = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    updateRecurringQuestTemplate(templateId, {
      originalTitle: trimmed,
      preferredTimeLabel: preferredTimeLabel.trim(),
    });
    onClose();
  };

  return (
    <Modal visible transparent animationType="slide" statusBarTranslucent onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}cc` }]} onPress={onClose} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardWrap}>
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: palette.panel,
              borderColor: palette.gold,
              paddingBottom: modalBottomInset,
            },
          ]}>
          <Text style={[styles.eyebrow, { color: palette.gold }]}>EDIT ROUTINE</Text>
          <Text style={[styles.recurrence, { color: palette.fog }]}>
            {formatRecurrenceLabel(template)}
          </Text>

          <Text style={[styles.label, { color: palette.accent }]}>Routine title</Text>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="What repeats?"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
            ]}
          />

          <Text style={[styles.label, { color: palette.accent }]}>Preferred time (optional)</Text>
          <TextInput
            value={preferredTimeLabel}
            onChangeText={setPreferredTimeLabel}
            placeholder="e.g. After breakfast"
            placeholderTextColor={palette.fog}
            style={[
              styles.input,
              { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
            ]}
          />

          <View style={styles.actions}>
            <GlowButton label="SAVE ROUTINE" hint="Future instances use this" onPress={handleSave} />
            <Pressable onPress={onClose} style={[styles.cancel, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.cancelText, { color: palette.fog }]}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFill,
  },
  keyboardWrap: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopWidth: 2,
    borderLeftWidth: 2,
    borderRightWidth: 2,
    padding: GameLayout.modalHorizontalPadding,
    gap: 10,
    maxHeight: '80%',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  recurrence: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.ui,
    fontSize: 14,
  },
  actions: {
    gap: 10,
    marginTop: 8,
  },
  cancel: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
  },
});
