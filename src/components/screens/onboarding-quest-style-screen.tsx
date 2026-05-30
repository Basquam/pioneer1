import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import {
  QuestStylePicker,
  questStyleSelectionFromProfile,
} from '@/components/rpg/quest-style-picker';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  createQuestStyleProfileUpdate,
  isValidQuestStyleSelection,
  QUEST_STYLE_SETTINGS_SUBTITLE,
} from '@/lib/quest-style-profile';
import type { QuestStyleKey } from '@/types/narrative';

export function OnboardingQuestStyleScreen() {
  const { activeUniverse, playerProgress, setQuestStyleProfile } = useGame();
  const { palette } = activeUniverse;
  const initial = questStyleSelectionFromProfile(playerProgress.questStyleProfile);
  const [primaryStyle, setPrimaryStyle] = useState<QuestStyleKey | null>(initial.primary);
  const [secondaryStyle, setSecondaryStyle] = useState<QuestStyleKey | null>(initial.secondary);

  const canContinue = isValidQuestStyleSelection(primaryStyle, secondaryStyle);

  const handleContinue = () => {
    if (!primaryStyle || !canContinue) return;
    setQuestStyleProfile(createQuestStyleProfileUpdate(primaryStyle, secondaryStyle));
    router.push('/onboarding/intro' as Href);
  };

  const handleSkip = () => {
    router.push('/onboarding/intro' as Href);
  };

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <>
            <GlowButton
              label="CONTINUE"
              hint={canContinue ? 'BEGIN PROLOGUE' : 'Choose a primary style or skip'}
              onPress={handleContinue}
            />
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipLabel, { color: palette.fog }]}>Skip for now</Text>
            </Pressable>
          </>
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="QUEST STYLE" title="HOW YOU START" />
        </Animated.View>

        <Text style={[styles.subtitle, { color: palette.fog }]}>{QUEST_STYLE_SETTINGS_SUBTITLE}</Text>

        <QuestStylePicker
          primaryStyle={primaryStyle}
          secondaryStyle={secondaryStyle}
          onPrimaryChange={setPrimaryStyle}
          onSecondaryChange={setSecondaryStyle}
        />
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
  },
});
