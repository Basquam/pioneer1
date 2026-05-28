import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type SagaPreviewEmptyStateProps = {
  index?: number;
};

export function SagaPreviewEmptyState({ index = 0 }: SagaPreviewEmptyStateProps) {
  const { activeUniverse, activeSaga } = useGame();
  const { palette } = activeUniverse;

  const allyLine = activeSaga.allyName ? ` Ally: ${activeSaga.allyName}.` : '';

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 80)} style={styles.wrap}>
      <View
        style={[
          styles.panel,
          { backgroundColor: palette.panel, borderColor: palette.panelBorder },
        ]}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>COMING SOON</Text>
        <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
          {activeSaga.title}
        </Text>
        <Text style={[styles.message, { color: palette.fog }]}>
          {activeSaga.title} is in preview on {activeUniverse.name}. Chapters and operations are not
          playable yet.{allyLine}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: GameLayout.screenContentGap,
  },
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  eyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  title: { fontFamily: GameFonts.display, fontSize: 22, letterSpacing: 1, lineHeight: 28 },
  message: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
