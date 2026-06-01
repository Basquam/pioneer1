import { type Href, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ThemeCard } from '@/components/rpg/theme-card';
import { useGame } from '@/hooks/use-game';
import { getUniverseLibraryProgress } from '@/lib/content-library-progress';

export function OnboardingThemeScreen() {
  const { universes, activeUniverse, playerProgress, selectUniverse, recordOnboardingStep } = useGame();
  const activeLibrary = getUniverseLibraryProgress(activeUniverse, playerProgress);
  const canContinue = activeLibrary.unlocked;

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="CONTINUE"
            hint={canContinue ? `NEXT: CHOOSE YOUR SAGA` : 'Choose an unlocked universe'}
            onPress={() => {
              recordOnboardingStep('saga');
              router.push('/onboarding/saga' as Href);
            }}
          />
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="UNIVERSE LIBRARY" title="CHOOSE YOUR UNIVERSE" />
        </Animated.View>
        {universes.map((universe, i) => (
          <ThemeCard
            key={universe.id}
            universe={universe}
            selected={activeUniverse.id === universe.id}
            libraryProgress={getUniverseLibraryProgress(universe, playerProgress)}
            index={i}
            onPress={() => selectUniverse(universe.id)}
          />
        ))}
      </OnboardingScroll>
    </ScreenShell>
  );
}
