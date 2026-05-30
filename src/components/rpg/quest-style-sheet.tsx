import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import {
  QuestStylePicker,
  questStyleSelectionFromProfile,
} from '@/components/rpg/quest-style-picker';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import {
  createQuestStyleProfileUpdate,
  isValidQuestStyleSelection,
  QUEST_STYLE_SETTINGS_SUBTITLE,
  QUEST_STYLE_SETTINGS_TITLE,
} from '@/lib/quest-style-profile';
import type { QuestStyleKey } from '@/types/narrative';

type QuestStyleSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function QuestStyleSheet({ visible, onClose }: QuestStyleSheetProps) {
  const { activeUniverse, playerProgress, setQuestStyleProfile } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  const [primaryStyle, setPrimaryStyle] = useState<QuestStyleKey | null>(null);
  const [secondaryStyle, setSecondaryStyle] = useState<QuestStyleKey | null>(null);

  useEffect(() => {
    if (!visible) return;
    const selection = questStyleSelectionFromProfile(playerProgress.questStyleProfile);
    setPrimaryStyle(selection.primary);
    setSecondaryStyle(selection.secondary);
  }, [visible, playerProgress.questStyleProfile]);

  const canSave = isValidQuestStyleSelection(primaryStyle, secondaryStyle);

  const handleSave = () => {
    if (!primaryStyle || !canSave) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setQuestStyleProfile(createQuestStyleProfileUpdate(primaryStyle, secondaryStyle));
    onClose();
  };

  const handleClear = () => {
    void Haptics.selectionAsync();
    setQuestStyleProfile({});
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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>QUEST STYLE</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>{QUEST_STYLE_SETTINGS_TITLE}</Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>{QUEST_STYLE_SETTINGS_SUBTITLE}</Text>

            <QuestStylePicker
              primaryStyle={primaryStyle}
              secondaryStyle={secondaryStyle}
              onPrimaryChange={setPrimaryStyle}
              onSecondaryChange={setSecondaryStyle}
            />

            <GlowButton
              label="SAVE STYLE"
              hint={canSave ? 'Personalize suggestions and defaults' : 'Choose a primary style'}
              onPress={handleSave}
            />

            {playerProgress.questStyleProfile?.primaryStyle ? (
              <Pressable onPress={handleClear} style={styles.clearButton}>
                <Text style={[styles.clearLabel, { color: palette.fog }]}>Clear style calibration</Text>
              </Pressable>
            ) : null}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  dismissArea: { flex: 1 },
  sheet: {
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    maxHeight: '88%',
  },
  content: { padding: 20, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  close: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 22,
    lineHeight: 28,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  clearButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  clearLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
  },
});
