import { type Href, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingIntroScreen() {
  const { theme, completeOnboarding } = useGame();
  const [lineIndex, setLineIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [showStart, setShowStart] = useState(false);
  const lines = theme.introLines;

  useEffect(() => {
    if (lineIndex >= lines.length - 1 && typingDone) {
      const t = setTimeout(() => setShowStart(true), 500);
      return () => clearTimeout(t);
    }
    setShowStart(false);
  }, [lineIndex, lines.length, typingDone]);

  const advance = useCallback(() => {
    if (!typingDone || lineIndex >= lines.length - 1) return;
    setLineIndex((i) => i + 1);
    setTypingDone(false);
  }, [lineIndex, lines.length, typingDone]);

  const handleTypingComplete = useCallback(() => setTypingDone(true), []);

  const handleStart = () => {
    completeOnboarding();
    router.replace('/(game)/hq' as Href);
  };

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <SectionHeader eyebrow={theme.chapterTitle} title={theme.locationName.toUpperCase()} />
      <VillainMeter />

      <View style={styles.dialogueArea}>
        <DialoguePanel
          key={lineIndex}
          line={lines[lineIndex]}
          badge="PROLOGUE"
          onTypingComplete={handleTypingComplete}
        />
        {typingDone && !showStart && lineIndex < lines.length - 1 && (
          <Animated.Text entering={FadeIn} exiting={FadeOut} style={[styles.tap, { color: theme.colors.gold }]}>
            TAP TO CONTINUE ›
          </Animated.Text>
        )}
      </View>

      {typingDone && !showStart && (
        <PressableOverlay onPress={advance} />
      )}

      {showStart && (
        <GlowButton
          label="ENTER HQ"
          hint="CLAIM YOUR FIRST BOUNTIES"
          onPress={handleStart}
        />
      )}
    </ScreenShell>
  );
}

function PressableOverlay({ onPress }: { onPress: () => void }) {
  return (
    <View
      style={StyleSheet.absoluteFill}
      onStartShouldSetResponder={() => true}
      onResponderRelease={onPress}
    />
  );
}

const styles = StyleSheet.create({
  dialogueArea: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 16,
    gap: 12,
  },
  tap: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 3,
    textAlign: 'right',
  },
  hiddenBtn: { height: 0, overflow: 'hidden' },
});
