import { type Href, router } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { SagaCard } from '@/components/rpg/saga-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { useGame } from '@/hooks/use-game';
import { getSagaUnlockHint, isSagaUnlocked } from '@/lib/reward-unlocks';

export function OnboardingSagaScreen() {
  const { activeUniverse, activeSaga, playerProgress, selectSaga } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="BEGIN PROLOGUE"
            hint={`MEET ${activeUniverse.mentorName.toUpperCase()}`}
            onPress={() => router.push('/onboarding/intro' as Href)}
          />
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader
            eyebrow={`${activeUniverse.name.toUpperCase()} · SAGA SELECTION`}
            title="CHOOSE YOUR PATH"
          />
        </Animated.View>

        {activeUniverse.sagas.map((saga, index) => (
          <SagaCard
            key={saga.id}
            saga={saga}
            palette={activeUniverse.palette}
            selected={activeSaga.id === saga.id}
            unlocked={isSagaUnlocked(saga, playerProgress.unlockedRewards)}
            unlockHint={getSagaUnlockHint(saga)}
            index={index}
            onPress={() => selectSaga(saga.id)}
          />
        ))}
      </OnboardingScroll>
    </ScreenShell>
  );
}
