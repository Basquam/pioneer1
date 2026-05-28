import { type Href, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingWelcomeScreen() {
  const { activeUniverse } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="BEGIN"
            hint="SEE HOW IT WORKS"
            onPress={() => router.push('/onboarding/premise' as Href)}
          />
        }>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
          <SectionHeader eyebrow="PIONEER" title="YOUR LIFE\nBECOMES LEGEND" />
          <Text style={[styles.body, { color: activeUniverse.palette.fog }]}>
            Turn daily life into a cinematic saga. Bounties drive the chapter. You write the quests.
          </Text>
        </Animated.View>
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: GameLayout.screenContentGap, paddingTop: 24, minHeight: 280 },
  body: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
});
