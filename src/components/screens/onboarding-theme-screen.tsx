import { type Href, router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { SagaCard } from '@/components/rpg/saga-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ThemeCard } from '@/components/rpg/theme-card';
import { useGame } from '@/hooks/use-game';
import { GameLayout } from '@/constants/layout';

export function OnboardingThemeScreen() {
  const { universes, activeUniverse, selectUniverse } = useGame();
  const canContinue = activeUniverse.status === 'available';

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <SectionHeader eyebrow="UNIVERSE SELECTION" title="CHOOSE YOUR UNIVERSE" />
      </Animated.View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {universes.map((universe, i) => (
          <ThemeCard
            key={universe.id}
            universe={universe}
            selected={activeUniverse.id === universe.id}
            index={i}
            onPress={() => selectUniverse(universe.id)}
          />
        ))}
      </ScrollView>
      <GlowButton
        label="SELECT SAGA"
        hint={canContinue ? activeUniverse.name : 'Choose an unlocked universe'}
        onPress={() => router.push('/onboarding/saga' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginVertical: GameLayout.screenContentGap },
  scrollContent: { paddingBottom: 8, gap: GameLayout.screenContentGap },
});
