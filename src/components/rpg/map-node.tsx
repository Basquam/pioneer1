import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import type { Saga, UniversePalette } from '@/types/narrative';

type MapNodeProps = {
  saga: Saga;
  palette: UniversePalette;
  active: boolean;
  influence: number;
  onPress: () => void;
};

export function MapNode({ saga, palette, active, influence, onPress }: MapNodeProps) {
  return (
    <Animated.View entering={FadeIn.duration(400)}>
      <Pressable
        disabled={saga.status === 'locked'}
        onPress={onPress}
        style={[
          styles.node,
          {
            backgroundColor: palette.panel,
            borderColor: active ? palette.gold : palette.panelBorder,
            opacity: saga.status === 'locked' ? 0.5 : 1,
          },
        ]}>
        <Text style={styles.icon}>{saga.status === 'locked' ? '🔒' : '⚔'}</Text>
        <View style={styles.info}>
          <Text style={[styles.name, { color: palette.bone }]}>{saga.title}</Text>
          <Text style={[styles.loc, { color: palette.fog }]}>{saga.villainName}</Text>
        </View>
        <View style={styles.threat}>
          <Text style={[styles.threatLabel, { color: palette.villainGlow }]}>THREAT</Text>
          <Text style={[styles.threatVal, { color: palette.bone }]}>{influence}%</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  node: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 2,
    marginBottom: 10,
    gap: 12,
  },
  icon: { fontSize: 28 },
  info: { flex: 1 },
  name: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1 },
  loc: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  threat: { alignItems: 'flex-end' },
  threatLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2 },
  threatVal: { fontFamily: GameFonts.ui, fontSize: 18 },
});
