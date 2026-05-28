import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type GlossaryHelpButtonProps = {
  onPress: () => void;
};

export function GlossaryHelpButton({ onPress }: GlossaryHelpButtonProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  const handlePress = () => {
    void Haptics.selectionAsync();
    onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      style={[
        styles.panel,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: palette.gold }]}>HELP / GLOSSARY</Text>
          <Text style={[styles.hint, { color: palette.fog }]}>
            Short guide to universes, quests, streaks, and other core terms.
          </Text>
        </View>
        <View style={[styles.chevron, { borderColor: palette.gold }]}>
          <Text style={[styles.chevronLabel, { color: palette.bone }]}>›</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    transform: [{ skewX: '-2deg' }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  copy: { flex: 1, minWidth: 0, gap: 4 },
  label: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
  hint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 15,
  },
  chevron: {
    borderWidth: 1,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-6deg' }],
    flexShrink: 0,
  },
  chevronLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    lineHeight: 20,
    marginTop: -2,
  },
});
