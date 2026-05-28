import { Modal, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { parseDialogueLine } from '@/lib/narrative-helpers';
import { territoryStatusLabel } from '@/lib/territory-map';
import type { ChapterStatus } from '@/lib/chapter-progress';
import { useGame } from '@/hooks/use-game';
import type { Chapter } from '@/types/narrative';

type ChapterDetailSheetProps = {
  visible: boolean;
  chapter: Chapter | null;
  mode: ChapterStatus | null;
  onClose: () => void;
};

export function ChapterDetailSheet({ visible, chapter, mode, onClose }: ChapterDetailSheetProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  if (!visible || !mode || !chapter) return null;

  const successDialogue = parseDialogueLine(chapter.successDialogue);
  const statusLabel = territoryStatusLabel(mode);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            {
              backgroundColor: palette.night,
              borderColor: palette.panelBorder,
              maxHeight: GameLayout.modalMaxHeight,
            },
          ]}
          onPress={(event) => event.stopPropagation()}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {mode === 'locked' ? (
              <>
                <Animated.Text entering={FadeInUp.duration(400)} style={[styles.eyebrow, { color: palette.villainGlow }]}>
                  {statusLabel}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[styles.territory, { color: palette.bone }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[styles.chapterRef, { color: palette.fog }]}>
                  Chapter {chapter.order} · {chapter.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[styles.lockedMessage, { color: palette.fog }]}>
                  Complete previous chapters to unlock.
                </Animated.Text>
              </>
            ) : mode === 'active' ? (
              <>
                <Animated.Text entering={FadeInUp.duration(400)} style={[styles.eyebrow, { color: palette.accent }]}>
                  {statusLabel}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[styles.territory, { color: palette.bone }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[styles.chapterRef, { color: palette.fog }]}>
                  Chapter {chapter.order} · {chapter.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[styles.summary, { color: palette.fog }]}>
                  {chapter.summary}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(180)}
                  style={[styles.purpose, { color: palette.accent }]}>
                  {chapter.dramaticPurpose}
                </Animated.Text>
              </>
            ) : (
              <>
                <Animated.Text entering={FadeInUp.duration(400)} style={[styles.eyebrow, { color: palette.gold }]}>
                  {statusLabel}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[styles.territory, { color: palette.bone }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[styles.chapterRef, { color: palette.fog }]}>
                  Chapter {chapter.order} · {chapter.title}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[styles.summary, { color: palette.fog }]}>
                  {chapter.summary}
                </Animated.Text>
                <Animated.View entering={FadeInUp.duration(450).delay(220)} style={styles.dialogueWrap}>
                  <DialoguePanel
                    line={successDialogue.text}
                    speaker={successDialogue.speaker}
                    badge="AFTERMATH"
                    animate={false}
                  />
                </Animated.View>
              </>
            )}

            <GlowButton label="CLOSE" onPress={onClose} />
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  content: {
    borderTopWidth: 1,
    transform: [{ skewX: '-1deg' }],
  },
  scrollContent: {
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: 24,
    paddingBottom: 36,
    gap: 14,
  },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  territory: { fontFamily: GameFonts.display, fontSize: 26, letterSpacing: 2, lineHeight: 32 },
  chapterRef: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1.5 },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 21,
    fontStyle: 'italic',
  },
  purpose: {
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
