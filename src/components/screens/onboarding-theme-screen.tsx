import { type Href, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ThemeCard } from '@/components/rpg/theme-card';
import { useGame } from '@/hooks/use-game';
import { isUniverseUnlocked } from '@/lib/reward-unlocks';

export function OnboardingThemeScreen() {
  const { universes, activeUniverse, playerProgress, selectUniverse } = useGame();
  const canContinue = isUniverseUnlocked(activeUniverse, playerProgress.unlockedRewards);

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="CONTINUE"
            hint={canContinue ? `NEXT: CHOOSE YOUR SAGA` : 'Choose an unlocked universe'}
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
            locked={!isUniverseUnlocked(universe, playerProgress.unlockedRewards)}
            index={i}
            onPress={() => selectUniverse(universe.id)}
          />
        ))}
      </OnboardingScroll>
    </ScreenShell>
  );
}
