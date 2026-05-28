import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getRecoveryQuestCopy } from '@/lib/recovery-quest';

export function RecoveryQuestBanner() {
  const { activeUniverse, showRecoveryPrompt, openRecoveryQuestSheet } = useGame();
  const { palette } = activeUniverse;

  if (!showRecoveryPrompt) return null;

  const copy = getRecoveryQuestCopy(activeUniverse.id);

  return (
    <View style={[styles.banner, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <Text style={[styles.prompt, { color: palette.bone }]}>{copy.prompt}</Text>
      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          openRecoveryQuestSheet();
        }}
        style={[styles.cta, { backgroundColor: palette.primary, borderColor: palette.gold }]}>
        <Text style={[styles.ctaText, { color: palette.bone }]}>{copy.ctaLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    padding: 14,
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  prompt: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
