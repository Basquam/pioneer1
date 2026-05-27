import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import type { Universe } from '@/types/narrative';

type ThemeCardProps = {
  universe: Universe;
  selected: boolean;
  index: number;
  onPress: () => void;
};

export function ThemeCard({ universe, selected, index, onPress }: ThemeCardProps) {
  const { palette } = universe;
  const availableSagas = universe.sagas.filter((saga) => saga.status === 'available').length;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.panel,
            borderColor: selected ? palette.gold : palette.panelBorder,
          },
        ]}>
        <Text style={styles.icon}>{universe.icon}</Text>
        <View style={styles.text}>
          <Text style={[styles.name, { color: palette.bone }]}>{universe.name}</Text>
          <Text style={[styles.tag, { color: palette.fog }]}>{universe.tagline}</Text>
          <Text style={[styles.villain, { color: palette.villainGlow }]}>
            {availableSagas} saga unlocked
          </Text>
        </View>
        {selected && (
          <View style={[styles.check, { backgroundColor: palette.primary }]}>
            <Text style={[styles.checkText, { color: palette.bone }]}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 14,
    transform: [{ skewX: '-2deg' }],
  },
  icon: { fontSize: 36 },
  text: { flex: 1, gap: 2 },
  name: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2 },
  tag: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic' },
  villain: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, marginTop: 4 },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '8deg' }],
  },
  checkText: { fontFamily: GameFonts.ui, fontSize: 16 },
});
