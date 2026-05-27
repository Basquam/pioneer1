import { Modal, Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { parseDialogueLine } from '@/lib/narrative-helpers';
import { useGame } from '@/hooks/use-game';
import type { Chapter } from '@/types/narrative';

type ChapterDetailSheetProps = {
  visible: boolean;
  chapter: Chapter | null;
  mode: 'completed' | 'locked' | null;
  onClose: () => void;
};

export function ChapterDetailSheet({ visible, chapter, mode, onClose }: ChapterDetailSheetProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  if (!visible || !mode) return null;

  const successDialogue = chapter ? parseDialogueLine(chapter.successDialogue) : null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onClose}>
        <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
          {mode === 'locked' ? (
            <>
              <Animated.Text entering={FadeInUp.duration(400)} style={[styles.eyebrow, { color: palette.fog }]}>
                TRAIL LOCKED
              </Animated.Text>
              <Animated.Text entering={FadeInUp.duration(450).delay(80)} style={[styles.title, { color: palette.bone }]}>
                {chapter?.title ?? 'Unknown Chapter'}
              </Animated.Text>
              <Animated.Text
                entering={FadeInUp.duration(450).delay(140)}
                style={[styles.lockedMessage, { color: palette.fog }]}>
                Complete previous chapters to unlock.
              </Animated.Text>
            </>
          ) : (
            chapter && (
              <>
                <Animated.Text entering={FadeInUp.duration(400)} style={[styles.eyebrow, { color: palette.gold }]}>
                  CHAPTER {chapter.order} · CLEARED
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(80)} style={[styles.title, { color: palette.bone }]}>
                  {chapter.title.toUpperCase()}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[styles.summary, { color: palette.fog }]}>
                  {chapter.summary}
                </Animated.Text>
                <Animated.View entering={FadeInUp.duration(450).delay(220)} style={styles.dialogueWrap}>
                  <DialoguePanel
                    line={successDialogue?.text ?? chapter.successDialogue}
                    speaker={successDialogue?.speaker}
                    badge="AFTERMATH"
                    animate={false}
                  />
                </Animated.View>
              </>
            )
          )}

          <GlowButton label="CLOSE" onPress={onClose} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 14,
    transform: [{ skewX: '-1deg' }],
  },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  title: { fontFamily: GameFonts.display, fontSize: 28, letterSpacing: 2, lineHeight: 34 },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  lockedMessage: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
    marginTop: 8,
  },
  dialogueWrap: { marginTop: 4 },
});
