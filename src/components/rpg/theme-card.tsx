import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import type { StoryTheme } from '@/types/theme';

type ThemeCardProps = {
  theme: StoryTheme;
  selected: boolean;
  index: number;
  onPress: () => void;
};

export function ThemeCard({ theme, selected, index, onPress }: ThemeCardProps) {
  const { colors } = theme;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: colors.panel,
            borderColor: selected ? colors.gold : colors.panelBorder,
          },
        ]}>
        <Text style={styles.icon}>{theme.icon}</Text>
        <View style={styles.text}>
          <Text style={[styles.name, { color: colors.bone }]}>{theme.name}</Text>
          <Text style={[styles.tag, { color: colors.fog }]}>{theme.tagline}</Text>
          <Text style={[styles.villain, { color: colors.villainGlow }]}>
            vs {theme.villain.name}
          </Text>
        </View>
        {selected && (
          <View style={[styles.check, { backgroundColor: colors.primary }]}>
            <Text style={[styles.checkText, { color: colors.bone }]}>✓</Text>
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
