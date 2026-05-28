import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useAmbientAudio } from '@/context/ambient-audio-context';
import { useGame } from '@/hooks/use-game';

export function AudioDevTools() {
  const { activeUniverse } = useGame();
  const { devTestAmbience, devStopAmbience } = useAmbientAudio();
  const { palette } = activeUniverse;

  if (!__DEV__) return null;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: `${palette.gold}10`, borderColor: palette.gold },
      ]}>
      <Text style={[styles.sectionLabel, { color: palette.gold }]}>AUDIO DEBUG</Text>
      <Text style={[styles.sectionHint, { color: palette.fog }]}>
        Dev-only controls to verify ambience playback on web and native.
      </Text>

      <Pressable
        onPress={devTestAmbience}
        style={[styles.toolButton, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
        <Text style={[styles.toolLabel, { color: palette.bone }]}>TEST AMBIENCE</Text>
        <Text style={[styles.toolHint, { color: palette.fog }]}>
          Play the {activeUniverse.name} ambient track at 0.8 volume with console logs.
        </Text>
      </Pressable>

      <Pressable
        onPress={devStopAmbience}
        style={[styles.toolButton, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.toolLabel, { color: palette.bone }]}>STOP AMBIENCE</Text>
        <Text style={[styles.toolHint, { color: palette.fog }]}>
          Pause ambience and cancel any active fade.
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  sectionLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  sectionHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 15,
    marginBottom: 4,
  },
  toolButton: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-3deg' }],
  },
  toolLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  toolHint: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 0.5, lineHeight: 13 },
});
