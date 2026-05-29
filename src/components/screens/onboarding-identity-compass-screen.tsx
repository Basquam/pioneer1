import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { IdentityCompassPicker } from '@/components/rpg/identity-compass-picker';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  IDENTITY_COMPASS_ONBOARDING_SUBTITLE,
  IDENTITY_COMPASS_ONBOARDING_TITLE,
  isValidDesiredIdentitySelection,
} from '@/lib/identity-compass';
import type { IdentityTraitKey } from '@/types/narrative';

export function OnboardingIdentityCompassScreen() {
  const { activeUniverse, playerProgress, setDesiredIdentityTraits } = useGame();
  const { palette } = activeUniverse;
  const [selectedTraits, setSelectedTraits] = useState<IdentityTraitKey[]>(
    playerProgress.desiredIdentityTraits ?? [],
  );

  const canContinue = isValidDesiredIdentitySelection(selectedTraits);

  const handleContinue = () => {
    if (!canContinue) return;
    setDesiredIdentityTraits(selectedTraits);
    router.push('/onboarding/intro' as Href);
  };

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="CONTINUE"
            hint={canContinue ? 'BEGIN PROLOGUE' : 'Choose 1–3 traits'}
            onPress={handleContinue}
          />
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="IDENTITY COMPASS" title="YOUR DESIRED SELF" />
        </Animated.View>

        <Text style={[styles.title, { color: palette.bone }]}>{IDENTITY_COMPASS_ONBOARDING_TITLE}</Text>
        <Text style={[styles.subtitle, { color: palette.fog }]}>
          {IDENTITY_COMPASS_ONBOARDING_SUBTITLE}
        </Text>

        <IdentityCompassPicker selectedTraits={selectedTraits} onChange={setSelectedTraits} />
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: GameFonts.display,
    fontSize: 22,
    lineHeight: 28,
    marginTop: 4,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 8,
  },
});
