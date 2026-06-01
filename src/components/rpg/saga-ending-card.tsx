import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import type { ResolvedSagaEnding } from '@/types/narrative';

type SagaEndingCardProps = {
  ending: ResolvedSagaEnding;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
  };
  delay?: number;
};

export function SagaEndingCard({ ending, palette, delay = 680 }: SagaEndingCardProps) {
  return (
    <Animated.View
      entering={FadeInUp.duration(500).delay(delay)}
      style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>SAGA ENDING</Text>
      <Text style={[styles.title, { color: palette.bone }]}>{ending.title}</Text>
      <Text style={[styles.summary, { color: palette.fog }]}>{ending.summary}</Text>
      {ending.universeFlavorLine ? (
        <Text style={[styles.flavor, { color: palette.gold }]}>{ending.universeFlavorLine}</Text>
      ) : null}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2.5,
    textAlign: 'center',
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 22,
    letterSpacing: 1,
    lineHeight: 28,
    textAlign: 'center',
  },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  flavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
