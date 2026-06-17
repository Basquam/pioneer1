import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useAmbientAudio } from '@/context/ambient-audio-context';
import { useGame } from '@/hooks/use-game';

export function SoundEffectsToggle() {
  const { activeUniverse } = useGame();
  const { soundEffectsEnabled, setSoundEffectsEnabled } = useAmbientAudio();
  const { palette } = activeUniverse;

  const handleToggle = () => {
    void Haptics.selectionAsync();
    setSoundEffectsEnabled(!soundEffectsEnabled);
  };

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.panel,
        {
          backgroundColor: palette.panel,
          borderColor: soundEffectsEnabled ? palette.gold : palette.panelBorder,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: palette.gold }]}>SOUND EFFECTS</Text>
          <Text style={[styles.hint, { color: palette.fog }]}>
            Quest completions, chapter milestones, and story unlock chimes.
          </Text>
        </View>
        <View
          style={[
            styles.stateBadge,
            {
              backgroundColor: soundEffectsEnabled ? `${palette.primary}44` : palette.ink,
              borderColor: soundEffectsEnabled ? palette.gold : palette.panelBorder,
            },
          ]}>
          <Text style={[styles.stateLabel, { color: soundEffectsEnabled ? palette.bone : palette.fog }]}>
            {soundEffectsEnabled ? 'ON' : 'OFF'}
          </Text>
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
  stateBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    transform: [{ skewX: '-6deg' }],
    flexShrink: 0,
  },
  stateLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
});
