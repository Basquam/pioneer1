import { Modal, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { parseDialogueLine } from '@/lib/narrative-helpers';
import { useGame } from '@/hooks/use-game';

export function ChapterCompleteOverlay() {
  const { activeUniverse, chapterComplete, continueFromChapterComplete } = useGame();
  const { palette } = activeUniverse;

  if (!chapterComplete) return null;

  const dialogue = parseDialogueLine(chapterComplete.successDialogue);
  const hasNextChapter = chapterComplete.nextChapterId !== null;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}f2` }]}>
        <View style={[styles.vignetteTop, { backgroundColor: palette.primary }]} />
        <View style={[styles.vignetteBottom, { backgroundColor: palette.accent }]} />

        <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
          <Animated.Text
            entering={ZoomIn.duration(650).delay(120)}
            style={[styles.stamp, { color: palette.gold, borderColor: palette.gold }]}>
            CHAPTER COMPLETE
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(550).delay(220)} style={styles.titleBlock}>
            <Text style={[styles.chapterEyebrow, { color: palette.accent }]}>
              CHAPTER {chapterComplete.chapterOrder}
            </Text>
            <Text style={[styles.chapterTitle, { color: palette.bone }]}>
              {chapterComplete.chapterTitle.toUpperCase()}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(380)} style={styles.dialogueWrap}>
            <DialoguePanel
              line={dialogue.text}
              speaker={dialogue.speaker}
              badge="VICTORY"
              animate
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(520)} style={styles.rewardsRow}>
            <RewardStat label="XP EARNED" value={`+${chapterComplete.earnedXp}`} palette={palette} />
            <View style={[styles.rewardDivider, { backgroundColor: palette.panelBorder }]} />
            <RewardStat
              label="REPUTATION"
              value={`+${chapterComplete.earnedReputation}`}
              palette={palette}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(640)} style={styles.buttonWrap}>
            <GlowButton
              label="CONTINUE"
              hint={hasNextChapter ? 'RIDE INTO THE NEXT CHAPTER' : 'RETURN TO DUSTFALL'}
              onPress={continueFromChapterComplete}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function RewardStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { gold: string; fog: string; bone: string };
}) {
  return (
    <View style={styles.rewardStat}>
      <Text style={[styles.rewardLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.rewardValue, { color: palette.gold }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 36,
  },
  vignetteTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    opacity: 0.12,
    transform: [{ rotate: '-18deg' }],
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 240,
    height: 240,
    opacity: 0.1,
    transform: [{ rotate: '12deg' }],
  },
  content: { gap: 18 },
  stamp: {
    alignSelf: 'center',
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 5,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 6,
    transform: [{ skewX: '-8deg' }],
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  chapterEyebrow: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  chapterTitle: {
    fontFamily: GameFonts.display,
    fontSize: 32,
    letterSpacing: 3,
    textAlign: 'center',
    lineHeight: 38,
  },
  dialogueWrap: { marginTop: 4 },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 8,
    transform: [{ skewX: '-2deg' }],
  },
  rewardStat: { alignItems: 'center', gap: 4, minWidth: 120 },
  rewardLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardValue: { fontFamily: GameFonts.ui, fontSize: 24, letterSpacing: 2 },
  rewardDivider: { width: 1, height: 36 },
  buttonWrap: { marginTop: 8 },
});
