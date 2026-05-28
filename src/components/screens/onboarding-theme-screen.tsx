import { type Href, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ThemeCard } from '@/components/rpg/theme-card';
import { useGame } from '@/hooks/use-game';

export function OnboardingThemeScreen() {
  const { universes, activeUniverse, selectUniverse } = useGame();
  const canContinue = activeUniverse.status === 'available';

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="SELECT SAGA"
            hint={canContinue ? activeUniverse.name : 'Choose an unlocked universe'}
            onPress={() => router.push('/onboarding/saga' as Href)}
          />
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="UNIVERSE SELECTION" title="CHOOSE YOUR UNIVERSE" />
        </Animated.View>
        {universes.map((universe, i) => (
          <ThemeCard
            key={universe.id}
            universe={universe}
            selected={activeUniverse.id === universe.id}
            index={i}
            onPress={() => selectUniverse(universe.id)}
          />
        ))}
      </OnboardingScroll>
    </ScreenShell>
  );
}
