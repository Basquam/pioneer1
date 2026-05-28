import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingIntroScreen() {
  const { activeUniverse, activeSaga, currentChapter, completeOnboarding, markChapterIntroSeen } =
    useGame();

  const beats = currentChapter?.introScene ?? [];
  const [beatIndex, setBeatIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [showStart, setShowStart] = useState(false);

  const beat = beats[beatIndex];
  const isLast = beatIndex >= beats.length - 1;

  useEffect(() => {
    if (!currentChapter) return;
    if (isLast && typingDone) {
      const t = setTimeout(() => setShowStart(true), 500);
      return () => clearTimeout(t);
    }
    setShowStart(false);
  }, [currentChapter, isLast, typingDone]);

  const advance = useCallback(() => {
    if (!typingDone || isLast) return;
    setBeatIndex((i) => i + 1);
    setTypingDone(false);
  }, [isLast, typingDone]);

  const handleStart = () => {
    markChapterIntroSeen();
    completeOnboarding();
    router.replace('/(game)/hq' as Href);
  };

  if (!currentChapter) {
    return null;
  }

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={showStart ? <GlowButton label="ENTER HQ" hint="CLAIM YOUR FIRST BOUNTIES" onPress={handleStart} /> : undefined}>
        <SectionHeader
          eyebrow={`PROLOGUE · ${activeSaga.title.toUpperCase()}`}
          title={activeUniverse.locationName.toUpperCase()}
        />
        <VillainMeter />

        <View style={styles.dialogueArea}>
          {beat && (
            <CharacterDialoguePanel
              key={beatIndex}
              beat={beat}
              onTypingComplete={() => setTypingDone(true)}
            />
          )}
          {typingDone && !showStart && !isLast && (
            <Animated.Text
              entering={FadeIn}
              exiting={FadeOut}
              style={[styles.tap, { color: activeUniverse.palette.gold }]}>
              TAP TO CONTINUE ›
            </Animated.Text>
          )}
        </View>
      </OnboardingScroll>

      {typingDone && !showStart && !isLast && (
        <View style={StyleSheet.absoluteFill} onStartShouldSetResponder={() => true} onResponderRelease={advance} />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  dialogueArea: {
    flexGrow: 1,
    justifyContent: 'flex-end',
    gap: GameLayout.screenContentGap,
    minHeight: 240,
    paddingBottom: GameLayout.screenContentGap,
  },
  tap: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'right',
  },
});
