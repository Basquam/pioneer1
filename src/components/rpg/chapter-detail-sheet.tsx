import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { GameLayout } from '@/constants/layout';
import { getUniverseCardVariant } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
import { parseDialogueLine } from '@/lib/narrative-helpers';
import { getChapterSceneImage } from '@/lib/narrative-media';
import type { ChapterStatus } from '@/lib/chapter-progress';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import type { Chapter } from '@/types/narrative';

type ChapterDetailSheetProps = {
  visible: boolean;
  chapter: Chapter | null;
  mode: ChapterStatus | null;
  onClose: () => void;
};

export function ChapterDetailSheet({ visible, chapter, mode, onClose }: ChapterDetailSheetProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(36);

  if (!visible || !mode || !chapter) return null;

  const sceneImage = getChapterSceneImage(chapter);
  const successDialogue = parseDialogueLine(chapter.successDialogue);
  const statusLabel = ui.territoryStatusLabel(mode);

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
              paddingBottom: modalBottomInset,
            },
          ]}
          onPress={(event) => event.stopPropagation()}>
          <QuestoryCard variant={getUniverseCardVariant(activeUniverse.id)} accentStrip contentStyle={styles.dossierCard}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.scrollContent}>
            {sceneImage ? (
              <Animated.View entering={FadeInUp.duration(350)}>
                <NarrativeMediaFrame source={sceneImage} height={140} scrim="bottom" />
              </Animated.View>
            ) : null}

            {mode === 'locked' ? (
              <>
                <QuestoryStatusPill label={statusLabel} tone="muted" />
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 26, lineHeight: 32 }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 1.5 }]}>
                  {ui.sectorRef(chapter.order, chapter.title)}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 16, lineHeight: 24, marginTop: 8 }]}>
                  {ui.lockedSectorMessage}
                </Animated.Text>
              </>
            ) : mode === 'active' ? (
              <>
                <QuestoryStatusPill label={statusLabel} tone="accent" />
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 26, lineHeight: 32 }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 1.5 }]}>
                  {ui.sectorRef(chapter.order, chapter.title)}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[QuestoryTypography.flavor, { color: palette.fog }]}>
                  {chapter.summary}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(180)}
                  style={[QuestoryTypography.flavor, { color: palette.accent }]}>
                  {chapter.dramaticPurpose}
                </Animated.Text>
              </>
            ) : (
              <>
                <QuestoryStatusPill label={statusLabel} tone="success" />
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(80)}
                  style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 26, lineHeight: 32 }]}
                  numberOfLines={2}>
                  {chapter.territoryName.toUpperCase()}
                </Animated.Text>
                <Animated.Text entering={FadeInUp.duration(450).delay(120)} style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 1.5 }]}>
                  {ui.sectorRef(chapter.order, chapter.title)}
                </Animated.Text>
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(140)}
                  style={[QuestoryTypography.flavor, { color: palette.fog }]}>
                  {chapter.summary}
                </Animated.Text>
                <Animated.View entering={FadeInUp.duration(450).delay(220)} style={styles.dialogueWrap}>
                  <DialoguePanel
                    line={successDialogue.text}
                    speaker={successDialogue.speaker}
                    badge="AFTERMATH"
                    portraitContext="chapterSuccess"
                    animate={false}
                  />
                </Animated.View>
              </>
            )}

            <GlowButton label="CLOSE" onPress={onClose} />
          </ScrollView>
          </QuestoryCard>
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
    paddingTop: 8,
    gap: 14,
  },
  dossierCard: { gap: 12 },
  dialogueWrap: { marginTop: 4 },
});
