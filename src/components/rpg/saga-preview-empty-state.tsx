import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PanelChrome } from '@/components/rpg/panel-chrome';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { getPanelShadow, skewTransform } from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

type SagaPreviewEmptyStateProps = {
  index?: number;
};

export function SagaPreviewEmptyState({ index = 0 }: SagaPreviewEmptyStateProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;

  const allyLine = activeSaga.allyName ? ` Ally: ${activeSaga.allyName}.` : '';
  const requirementLabel = activeSaga.unlockRequirementLabel ?? 'Coming Soon';

  return (
    <Animated.View entering={FadeInDown.duration(500).delay(index * 80)} style={styles.wrap}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: palette.panel,
            borderColor: palette.panelBorder,
            transform: skewTransform(visualTheme.cardSkew),
          },
          getPanelShadow(palette, visualTheme),
        ]}>
        <PanelChrome palette={palette} theme={visualTheme} />
        <Text style={[styles.eyebrow, { color: palette.accent }]}>
          {requirementLabel.toUpperCase()}
        </Text>
        <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
          {activeSaga.title}
        </Text>
        <Text style={[styles.message, { color: palette.fog }]}>
          {activeSaga.title} is preview-only on {activeUniverse.name}. Story{' '}
          {ui.templateQuestLabel.toLowerCase()}s are not playable yet.{allyLine}
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
