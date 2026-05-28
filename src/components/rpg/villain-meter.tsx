import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

export function VillainMeter() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, villainInfluence } = useGame();
  const { palette } = activeUniverse;
  const clamped = Math.min(100, Math.max(0, villainInfluence));
  const fill = useSharedValue(clamped / 100);

  useEffect(() => {
    fill.value = withTiming(clamped / 100, { duration: 700 });
  }, [clamped, fill]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.value }],
  }));

  const status = ui.villainMeterStatus(
    clamped > 66 ? 'high' : clamped > 33 ? 'mid' : 'low',
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.label, { color: palette.villainGlow }]}>
          {ui.villainInfluenceLabel(activeSaga.villainName)}
        </Text>
        <Text style={[styles.value, { color: palette.bone }]}>{clamped}%</Text>
      </View>
      <View style={[styles.track, { backgroundColor: `${palette.villain}88`, borderColor: `${palette.villainGlow}66` }]}>
        <Animated.View style={[styles.fill, fillStyle, { backgroundColor: palette.villainGlow }]} />
      </View>
      <Text style={[styles.status, { color: palette.fog }]}>{status}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 6 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  label: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, flex: 1 },
  value: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 2 },
  track: { height: 10, overflow: 'hidden', borderWidth: 1 },
  fill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%' },
  status: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, textAlign: 'right' },
});
