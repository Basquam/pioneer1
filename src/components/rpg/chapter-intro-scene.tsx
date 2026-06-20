import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

import { CharacterDialoguePanel } from '@/components/rpg/character-dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { useGame } from '@/hooks/use-game';
import { trackAnalyticsOnce } from '@/lib/analytics/analytics-dedupe';
import { trackChapterStarted } from '@/lib/analytics/questory-analytics';
import { getChapterSceneImage } from '@/lib/narrative-media';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTypography } from '@/theme/typography';

type ChapterIntroSceneProps = {
  visible: boolean;
  onComplete: () => void;
};

export function ChapterIntroScene({ visible, onComplete }: ChapterIntroSceneProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, currentChapter, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const sceneImage = currentChapter ? getChapterSceneImage(currentChapter) : null;
  const beats = currentChapter?.introScene ?? [];
  const [beatIndex, setBeatIndex] = useState(0);
  const [typingDone, setTypingDone] = useState(false);
  const [sceneFailed, setSceneFailed] = useState(false);
  const trackedChapterIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!visible || !currentChapter) return;
    if (playerProgress.seenChapterIntros.includes(currentChapter.id)) return;
    if (trackedChapterIdRef.current === currentChapter.id) return;

    trackedChapterIdRef.current = currentChapter.id;
    trackAnalyticsOnce(`chapter_started:${currentChapter.id}`, () => {
      trackChapterStarted({
        universe_id: activeUniverse.id,
        saga_id: activeSaga.id,
        chapter_id: currentChapter.id,
        chapter_index: currentChapter.order,
        level: playerProgress.level,
        reputation: playerProgress.reputation,
      });
    });
  }, [
    activeSaga.id,
    activeUniverse.id,
    currentChapter,
    playerProgress.level,
    playerProgress.reputation,
    playerProgress.seenChapterIntros,
    visible,
  ]);

  useEffect(() => {
    if (!visible || !currentChapter) return;
    setBeatIndex(0);
    setTypingDone(false);
    setSceneFailed(false);
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

  const showScene = sceneImage && !sceneFailed;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: palette.void }]}>
        {showScene ? (
          <Image
            source={sceneImage}
            style={StyleSheet.absoluteFill}
            contentFit="cover"
            onError={() => setSceneFailed(true)}
            transition={300}
          />
        ) : null}
        <LinearGradient
          colors={
            showScene
              ? ['rgba(0,0,0,0.55)', 'rgba(0,0,0,0.72)', 'rgba(5,3,8,0.95)']
              : [`${palette.void}ee`, `${palette.void}ee`]
          }
          locations={[0, 0.45, 1]}
          style={StyleSheet.absoluteFill}
        />

        <Animated.View entering={FadeIn.duration(400)} exiting={FadeOut.duration(300)} style={styles.content}>
          <QuestoryStatusPill label={ui.sectorIntroLabel(currentChapter.order, currentChapter.title)} tone="accent" />
          <Text style={[QuestoryTypography.flavor, { color: palette.fog }]}>{currentChapter.summary}</Text>

          <CharacterDialoguePanel
            key={`${currentChapter.id}-${beatIndex}`}
            beat={beat}
            onTypingComplete={() => setTypingDone(true)}
          />

          {typingDone && !isLast && (
            <Pressable onPress={handleAdvance} style={styles.tapArea}>
              <Text style={[QuestoryTypography.caption, { color: palette.gold, letterSpacing: 2 }]}>TAP TO CONTINUE ›</Text>
            </Pressable>
          )}

          {typingDone && isLast && (
            <GlowButton label={ui.beginSectorLabel} hint={ui.beginSectorHint} onPress={handleAdvance} />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', padding: 20, paddingBottom: 36 },
  content: { gap: 14 },
  tapArea: { alignItems: 'flex-end', paddingVertical: 8 },
});
