import { type Href, router } from 'expo-router';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingWelcomeScreen() {
  const { activeUniverse } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <SectionHeader eyebrow="PIONEER" title="YOUR TASKS\nBECOME LEGENDS" />
        <Text style={[styles.body, { color: activeUniverse.palette.fog }]}>
          Turn real life into a cinematic RPG. Every chore is a bounty. Every habit is a chapter.
        </Text>
      </Animated.View>
      <GlowButton
        label="BEGIN"
        hint="SEE HOW IT WORKS"
        onPress={() => router.push('/onboarding/premise' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, gap: 20, paddingTop: 24 },
  body: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 26,
    fontStyle: 'italic',
  },
});
