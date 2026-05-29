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
import { IdentityCompassPicker } from '@/components/rpg/identity-compass-picker';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { isValidDesiredIdentitySelection } from '@/lib/identity-compass';
import type { IdentityTraitKey } from '@/types/narrative';

type IdentityCompassSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function IdentityCompassSheet({ visible, onClose }: IdentityCompassSheetProps) {
  const { activeUniverse, playerProgress, setDesiredIdentityTraits } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const [selectedTraits, setSelectedTraits] = useState<IdentityTraitKey[]>(
    playerProgress.desiredIdentityTraits ?? [],
  );

  useEffect(() => {
    if (!visible) return;
    setSelectedTraits(playerProgress.desiredIdentityTraits ?? []);
  }, [visible, playerProgress.desiredIdentityTraits]);

  const canSave = isValidDesiredIdentitySelection(selectedTraits);

  const handleSave = () => {
    if (!canSave) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setDesiredIdentityTraits(selectedTraits);
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
              <Text style={[styles.eyebrow, { color: palette.gold }]}>IDENTITY COMPASS</Text>
              <Pressable onPress={onClose} hitSlop={12}>
                <Text style={[styles.close, { color: palette.fog }]}>✕</Text>
              </Pressable>
            </View>

            <Text style={[styles.title, { color: palette.bone }]}>Edit Identity Compass</Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>
              Choose the traits you want your quests to reinforce first. You still gain votes in every
              trait — this only changes emphasis.
            </Text>

            <IdentityCompassPicker
              selectedTraits={selectedTraits}
              onChange={setSelectedTraits}
              showFlavor={false}
            />

            <GlowButton
              label="SAVE COMPASS"
              hint={canSave ? 'Update your priority traits' : 'Choose 1–3 traits'}
              onPress={handleSave}
            />
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
});
