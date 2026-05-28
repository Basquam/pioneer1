import { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type ChapterIntroSceneProps = {
  visible: boolean;
  onComplete: () => void;
};

export function ChapterIntroScene({ visible, onComplete }: ChapterIntroSceneProps) {
  const { activeUniverse, currentChapter } = useGame();
  const { palette } = activeUniverse;
  const beats = currentChapter?.introScene ?? [];
  const [beatIndex, setBeatIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);

  useEffect(() => {
    if (!visible || !currentChapter) return;
    setBeatIndex(0);
    setTypingDone(false);
  }, [visible, currentChapter?.id, currentChapter]);

  const beat = beats[beatIndex];
  const isLast = beatIndex >= beats.length - 1;

  const handleAdvance = useCallback(() => {
    if (!typingDone) return;
    if (isLast) {
      setBeatIndex(0);
      setTypingDone(false);
      onComplete();
      return;
    }
    setBeatIndex((i) => i + 1);
    setTypingDone(false);
  }, [isLast, onComplete, typingDone]);

  if (!visible || !currentChapter || !beat) return null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]}>
        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.content}>
          <Text style={[styles.chapterLabel, { color: palette.accent }]}>
            CHAPTER {currentChapter.order} · {currentChapter.title.toUpperCase()}
          </Text>
          <Text style={[styles.summary, { color: palette.fog }]}>{currentChapter.summary}</Text>

          <CharacterDialoguePanel
            key={`${currentChapter.id}-${beatIndex}`}
            beat={beat}
            onTypingComplete={() => setTypingDone(true)}
          />

          {typingDone && !isLast && (
            <Pressable onPress={handleAdvance} style={styles.tapArea}>
              <Text style={[styles.tapHint, { color: palette.gold }]}>TAP TO CONTINUE ›</Text>
            </Pressable>
          )}

          {typingDone && isLast && (
            <GlowButton label="BEGIN CHAPTER" hint="VIEW CHAPTER BOUNTIES" onPress={handleAdvance} />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', padding: 20, paddingBottom: 36 },
  content: { gap: 14 },
  chapterLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
  },
  tapArea: { alignItems: 'flex-end', paddingVertical: 8 },
  tapHint: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
});
