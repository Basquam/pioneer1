import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { universeHasAmbientAudio } from '@/constants/audio';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useAmbientAudio } from '@/context/ambient-audio-context';
import { useGame } from '@/hooks/use-game';

export function AmbientAudioToggle() {
  const { activeUniverse } = useGame();
  const { ambientEnabled, setAmbientEnabled } = useAmbientAudio();
  const { palette } = activeUniverse;

  const handleToggle = () => {
    void Haptics.selectionAsync();
    setAmbientEnabled(!ambientEnabled);
  };

  const ambientHint =
    activeUniverse.id === 'neuronet'
      ? 'Neon rain, synth hum, electric buzz, and distant city drone across the Spire.'
      : 'Distant wind, saloon murmur, and creaking wood across Dustfall.';

  if (!universeHasAmbientAudio(activeUniverse.id)) {
    return null;
  }

  return (
    <Pressable
      onPress={handleToggle}
      style={[
        styles.panel,
        {
          backgroundColor: palette.panel,
          borderColor: ambientEnabled ? palette.gold : palette.panelBorder,
        },
      ]}>
      <View style={styles.row}>
        <View style={styles.copy}>
          <Text style={[styles.label, { color: palette.gold }]}>AMBIENT AUDIO</Text>
          <Text style={[styles.hint, { color: palette.fog }]}>{ambientHint}</Text>
        </View>
        <View
          style={[
            styles.stateBadge,
            {
              backgroundColor: ambientEnabled ? `${palette.primary}44` : palette.ink,
              borderColor: ambientEnabled ? palette.gold : palette.panelBorder,
            },
          ]}>
          <Text style={[styles.stateLabel, { color: ambientEnabled ? palette.bone : palette.fog }]}>
            {ambientEnabled ? 'ON' : 'OFF'}
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
