import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getHqTutorialCopy } from '@/lib/hq-tutorial-copy';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

type HqTutorialOverlayProps = {
  visible: boolean;
  onAddQuest: () => void;
  onDismiss: () => void;
};

export function HqTutorialOverlay({ visible, onAddQuest, onDismiss }: HqTutorialOverlayProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const copy = getHqTutorialCopy(ui, activeUniverse.locationName);

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]}>
        <Animated.View
          entering={FadeIn.duration(450)}
          style={[
            styles.card,
            {
              backgroundColor: palette.night,
              borderColor: palette.gold,
              maxHeight: GameLayout.modalMaxHeight,
            },
          ]}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>{copy.eyebrow}</Text>
          <Text style={[styles.title, { color: palette.bone }]}>{copy.title}</Text>
          <Text style={[styles.intro, { color: palette.fog }]}>{copy.intro}</Text>

          <View style={styles.steps}>
            {copy.steps.map((step, index) => (
              <Animated.View
                key={step.number}
                entering={FadeInDown.duration(400).delay(80 + index * 70)}
                style={[
                  styles.step,
                  { backgroundColor: palette.panel, borderColor: palette.panelBorder },
                ]}>
                <Text style={[styles.stepNumber, { color: palette.gold }]}>{step.number}</Text>
                <View style={styles.stepCopy}>
                  <Text style={[styles.stepTitle, { color: palette.bone }]}>{step.title}</Text>
                  <Text style={[styles.stepBody, { color: palette.fog }]}>{step.body}</Text>
                </View>
              </Animated.View>
            ))}
          </View>

          <GlowButton
            label={copy.addQuestLabel}
            hint={ui.addQuestTriggerSub}
            onPress={onAddQuest}
          />

          <Pressable onPress={onDismiss} style={styles.laterButton}>
            <Text style={[styles.laterLabel, { color: palette.fog }]}>{copy.laterLabel}</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: GameLayout.modalHorizontalPadding,
    paddingVertical: GameLayout.modalVerticalPadding,
  },
  card: {
    borderWidth: 2,
    padding: 20,
    gap: 14,
    transform: [{ skewX: '-2deg' }],
  },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2.5,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    letterSpacing: 3,
    lineHeight: 32,
  },
  intro: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  steps: { gap: 8 },
  step: {
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  stepNumber: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 1,
    width: 28,
    flexShrink: 0,
  },
  stepCopy: { flex: 1, minWidth: 0, gap: 4 },
  stepTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 1.5,
  },
  stepBody: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.2,
    lineHeight: 16,
  },
  laterButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  laterLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
});
