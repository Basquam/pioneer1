import { type Href, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { ChapterRewardBadge } from '@/components/rpg/chapter-reward-badge';
import { GlowButton } from '@/components/rpg/glow-button';
import { PanelChrome } from '@/components/rpg/panel-chrome';
import { SagaEndingCard } from '@/components/rpg/saga-ending-card';
import { ScanlineOverlay } from '@/components/rpg/visual-theme-overlay';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
  skewTransform,
  type UniverseVisualTheme,
} from '@/constants/universe-visual-theme';
import { parseDialogueLine } from '@/lib/narrative-helpers';
import { getChapterSceneImageById } from '@/lib/narrative-media';
import { findStoryUnlockReward } from '@/lib/chapter-rewards';
import {
  getStartSagaCtaLabel,
  REWARD_TYPE_LABELS,
  resolveStoryUnlockSaga,
} from '@/lib/reward-unlocks';
import type { ChapterCompleteState } from '@/types/narrative';

import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

export function ChapterCompleteOverlay({ chapterComplete }: { chapterComplete: ChapterCompleteState }) {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    continueFromChapterComplete,
    startUnlockedSagaFromChapterComplete,
  } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');
  const sceneImage = getChapterSceneImageById(chapterComplete.chapterId);
  const [sceneFailed, setSceneFailed] = useState(false);
  const showScene = sceneImage && !sceneFailed;

  if (!chapterComplete) return null;

  const dialogue = parseDialogueLine(
    chapterComplete.sagaFinale?.dialogueOverride ?? chapterComplete.successDialogue,
  );
  const hasNextChapter = chapterComplete.nextChapterId !== null;
  const storyUnlockReward = chapterComplete.newRewards
    ? findStoryUnlockReward(chapterComplete.newRewards)
    : undefined;
  const unlockedSaga = storyUnlockReward
    ? resolveStoryUnlockSaga(activeUniverse, storyUnlockReward)
    : undefined;
  const unlockedSagaFirstChapterId = unlockedSaga?.chapters[0]?.id;

  const handleStartUnlockedSaga = () => {
    if (!unlockedSaga || !unlockedSagaFirstChapterId) return;
    startUnlockedSagaFromChapterComplete(unlockedSaga.id, unlockedSagaFirstChapterId, chapterComplete);
    router.replace('/(game)/hq' as Href);
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={() => continueFromChapterComplete(chapterComplete)}>
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
              ? ['rgba(0,0,0,0.5)', 'rgba(5,3,8,0.88)', 'rgba(5,3,8,0.96)']
              : [`${palette.void}f2`, `${palette.void}f2`]
          }
          locations={[0, 0.35, 1]}
          style={StyleSheet.absoluteFill}
        />
        {visualTheme.showScanlines && <ScanlineOverlay color={palette.accent} lineCount={36} />}
        <View style={[styles.vignetteTop, { backgroundColor: visualTheme.panelUsesHolographic ? palette.accent : palette.primary }]} />
        <View style={[styles.vignetteBottom, { backgroundColor: visualTheme.panelUsesHolographic ? palette.primary : palette.accent }]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
          <Animated.Text
            entering={ZoomIn.duration(650).delay(120)}
            style={[styles.stamp, { color: goldAccent, borderColor: goldAccent, transform: skewTransform(visualTheme.buttonSkew) }]}
          >
            {ui.chapterCompleteStamp}
          </Animated.Text>

          <Animated.View entering={FadeInDown.duration(550).delay(220)} style={styles.titleBlock}>
            <Text style={[styles.chapterEyebrow, { color: palette.accent }]}>
              {ui.sectorEyebrow(chapterComplete.chapterOrder)}
            </Text>
            <Text style={[styles.chapterTitle, { color: palette.bone }]} numberOfLines={3}>
              {chapterComplete.chapterTitle.toUpperCase()}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(380)} style={styles.dialogueWrap}>
            <DialoguePanel
              line={dialogue.text}
              speaker={dialogue.speaker}
              badge="VICTORY"
              portraitContext="chapterSuccess"
              animate
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(520)} style={styles.rewardsRow}>
            <RewardStat label="XP EARNED" value={`+${chapterComplete.earnedXp}`} palette={palette} goldAccent={goldAccent} />
            <View style={[styles.rewardDivider, { backgroundColor: panelBorder }]} />
            <RewardStat
              label={ui.reputationLabel}
              value={`+${chapterComplete.earnedReputation}`}
              palette={palette}
              goldAccent={goldAccent}
            />
          </Animated.View>

          {chapterComplete.newRewards?.map((reward, index) => (
            <Animated.View
              key={reward.id}
              entering={FadeInUp.duration(500).delay(600 + index * 80)}
              style={[
                styles.unlockCard,
                {
                  backgroundColor: palette.panel,
                  borderColor: goldAccent,
                  transform: skewTransform(visualTheme.cardSkew),
                },
              ]}>
              {visualTheme.panelTopHighlight && (
                <PanelChrome palette={palette} theme={visualTheme} />
              )}
              <ChapterRewardBadge reward={reward} palette={palette} size="md" />
              <Text style={[styles.unlockEyebrow, { color: goldAccent }]}>
                {reward.type === 'storyUnlock' ? 'STORY UNLOCKED' : 'NEW REWARD'}
              </Text>
              <Text style={[styles.unlockType, { color: palette.accent }]}>
                {REWARD_TYPE_LABELS[reward.type]}
              </Text>
              <Text style={[styles.unlockName, { color: palette.bone }]}>
                {reward.name}
              </Text>
            </Animated.View>
          ))}

          {chapterComplete.sagaFinale ? (
            chapterComplete.sagaFinale.dialogueOverride ? (
              <Animated.View
                entering={FadeInUp.duration(500).delay(680)}
                style={[styles.compactEnding, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                <Text style={[styles.compactEndingEyebrow, { color: palette.accent }]}>
                  SAGA ENDING · {chapterComplete.sagaFinale.title.toUpperCase()}
                </Text>
                {chapterComplete.sagaFinale.universeFlavorLine ? (
                  <Text style={[styles.compactEndingFlavor, { color: palette.gold }]}>
                    {chapterComplete.sagaFinale.universeFlavorLine}
                  </Text>
                ) : null}
              </Animated.View>
            ) : (
              <SagaEndingCard ending={chapterComplete.sagaFinale} palette={palette} />
            )
          ) : null}

          <Animated.View entering={FadeInUp.duration(500).delay(720)} style={styles.buttonWrap}>
            {unlockedSaga && unlockedSagaFirstChapterId ? (
              <>
                <GlowButton
                  label={getStartSagaCtaLabel(unlockedSaga)}
                  hint={`BEGIN ${unlockedSaga.rankTitles[0].toUpperCase()}`}
                  onPress={handleStartUnlockedSaga}
                />
                <SecondaryButton
                  label="STAY IN CURRENT SAGA"
                  hint={
                    hasNextChapter
                      ? ui.stayInSagaHint
                      : ui.stayInSagaHintHome
                  }
                  palette={palette}
                  visualTheme={visualTheme}
                  onPress={() => continueFromChapterComplete(chapterComplete)}
                />
              </>
            ) : (
              <GlowButton
                label="CONTINUE"
                hint={hasNextChapter ? ui.continueHintNext : ui.continueHintHome}
                onPress={() => continueFromChapterComplete(chapterComplete)}
              />
            )}
          </Animated.View>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function SecondaryButton({
  label,
  hint,
  palette,
  visualTheme,
  onPress,
}: {
  label: string;
  hint?: string;
  palette: { panelBorder: string; fog: string; bone: string };
  visualTheme: UniverseVisualTheme;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.secondaryButton,
        {
          borderColor: palette.panelBorder,
          transform: skewTransform(visualTheme.buttonSkew),
        },
      ]}>
      <Text style={[styles.secondaryLabel, { color: palette.bone }]}>{label}</Text>
      {hint ? <Text style={[styles.secondaryHint, { color: palette.fog }]}>{hint}</Text> : null}
    </Pressable>
  );
}

function RewardStat({
  label,
  value,
  palette,
  goldAccent,
}: {
  label: string;
  value: string;
  palette: { fog: string; bone: string };
  goldAccent: string;
}) {
  return (
    <View style={styles.rewardStat}>
      <Text style={[styles.rewardLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.rewardValue, { color: goldAccent }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: GameLayout.modalHorizontalPadding,
    paddingVertical: GameLayout.modalVerticalPadding,
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
  },
  titleBlock: { alignItems: 'center', gap: 6 },
  chapterEyebrow: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  chapterTitle: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    letterSpacing: 2,
    textAlign: 'center',
    lineHeight: 34,
  },
  dialogueWrap: { marginTop: 4 },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  rewardStat: { alignItems: 'center', gap: 4, minWidth: 120 },
  rewardLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardValue: { fontFamily: GameFonts.ui, fontSize: 24, letterSpacing: 2 },
  rewardDivider: { width: 1, height: 36 },
  unlockCard: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
    alignItems: 'center',
    overflow: 'hidden',
  },
  unlockEyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  unlockType: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  unlockName: { fontFamily: GameFonts.display, fontSize: 22, letterSpacing: 1, textAlign: 'center' },
  buttonWrap: { marginTop: 8, gap: 4 },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  secondaryLabel: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2, textAlign: 'center' },
  secondaryHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  compactEnding: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  compactEndingEyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
    textAlign: 'center',
  },
  compactEndingFlavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
