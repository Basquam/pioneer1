import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { ONBOARDING_FIRST_QUEST_INSIGHT } from '@/lib/onboarding-flow';

export function OnboardingFirstQuestInsightOverlay() {
  const { activeUniverse, showOnboardingFirstQuestInsight, dismissOnboardingFirstQuestInsight } = useGame();
  const { palette } = activeUniverse;

  if (!showOnboardingFirstQuestInsight) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]}>
        <Animated.View
          entering={FadeIn.duration(450)}
          style={[styles.card, { backgroundColor: palette.night, borderColor: palette.gold }]}>
          <Animated.Text entering={FadeInDown.duration(500).delay(80)} style={[styles.eyebrow, { color: palette.accent }]}>
            FIRST QUEST CLEARED
          </Animated.Text>
          <Animated.Text entering={FadeInDown.duration(500).delay(140)} style={[styles.body, { color: palette.bone }]}>
            {ONBOARDING_FIRST_QUEST_INSIGHT}
          </Animated.Text>
          <GlowButton label="ENTER HQ" hint="YOUR SAGA CONTINUES" onPress={dismissOnboardingFirstQuestInsight} />
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
    fontSize: 10,
    letterSpacing: 2,
  },
  body: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
