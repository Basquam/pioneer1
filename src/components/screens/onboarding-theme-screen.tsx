import { type Href, router } from 'expo-router';
import { ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ThemeCard } from '@/components/rpg/theme-card';
import { THEME_LIST } from '@/data/themes';
import { useGame } from '@/hooks/use-game';

export function OnboardingThemeScreen() {
  const { activeThemeId, selectTheme } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <SectionHeader
          eyebrow="SELECT WORLD"
          title="CHOOSE YOUR SAGA"
        />
      </Animated.View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {THEME_LIST.map((t, i) => (
          <ThemeCard
            key={t.id}
            theme={t}
            selected={activeThemeId === t.id}
            index={i}
            onPress={() => selectTheme(t.id)}
          />
        ))}
      </ScrollView>
      <GlowButton
        label="LOCK IN WORLD"
        onPress={() => router.push('/onboarding/intro' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginVertical: 12 },
  scrollContent: { paddingBottom: 8 },
});
