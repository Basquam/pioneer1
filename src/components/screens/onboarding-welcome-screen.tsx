import { type Href, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingWelcomeScreen() {
  const { theme } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
        <SectionHeader eyebrow="WELCOME" title="YOUR TASKS\nBECOME LEGENDS" />
        <Text style={[styles.body, { color: theme.colors.fog }]}>
          Pioneer transforms real-life chores into cinematic story quests. Complete missions,
          earn XP, level up, and push back villains across five worlds.
        </Text>
        <View style={styles.features}>
          {['Story-driven quests', 'XP & leveling', 'Villain influence'].map((f) => (
            <Text key={f} style={[styles.feature, { color: theme.colors.gold }]}>
              ◆ {f}
            </Text>
          ))}
        </View>
      </Animated.View>
      <GlowButton
        label="BEGIN SAGA"
        hint="CHOOSE YOUR WORLD"
        onPress={() => router.push('/onboarding/theme' as Href)}
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
  features: { gap: 10, marginTop: 8 },
  feature: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
});
