import { type Href, router } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { DialoguePanel } from '@/components/rpg/dialogue-panel';
import { ChapterRewardBadge } from '@/components/rpg/chapter-reward-badge';
import { GlowButton } from '@/components/rpg/glow-button';
import { SagaEndingCard } from '@/components/rpg/saga-ending-card';
import { ScanlineOverlay } from '@/components/rpg/visual-theme-overlay';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { GameLayout } from '@/constants/layout';
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
import { QuestoryTypography } from '@/theme/typography';

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
          <Animated.View entering={ZoomIn.duration(650).delay(120)} style={styles.stampWrap}>
            <QuestoryStatusPill label={ui.chapterCompleteStamp} tone="success" />
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(550).delay(220)} style={styles.titleBlock}>
            <Text style={[QuestoryTypography.sectionEyebrow, { color: palette.accent, letterSpacing: 3 }]}>
              {ui.sectorEyebrow(chapterComplete.chapterOrder)}
            </Text>
            <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, textAlign: 'center' }]} numberOfLines={3}>
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

          <Animated.View entering={FadeInUp.duration(500).delay(520)}>
            <QuestoryCard variant="elevated" contentStyle={styles.rewardsRow}>
              <RewardStat label="XP EARNED" value={`+${chapterComplete.earnedXp}`} palette={palette} goldAccent={goldAccent} />
              <View style={[styles.rewardDivider, { backgroundColor: panelBorder }]} />
              <RewardStat
                label={ui.reputationLabel}
                value={`+${chapterComplete.earnedReputation}`}
                palette={palette}
                goldAccent={goldAccent}
              />
            </QuestoryCard>
          </Animated.View>

          {chapterComplete.newRewards?.map((reward, index) => (
            <Animated.View
              key={reward.id}
              entering={FadeInUp.duration(500).delay(600 + index * 80)}>
              <QuestoryCard variant="elevated" contentStyle={styles.unlockCard}>
                <ChapterRewardBadge reward={reward} palette={palette} size="md" />
                <QuestoryStatusPill
                  label={reward.type === 'storyUnlock' ? 'STORY UNLOCKED' : 'NEW REWARD'}
                  tone="accent"
                />
                <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2 }]}>
                  {REWARD_TYPE_LABELS[reward.type]}
                </Text>
                <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 22, textAlign: 'center' }]}>
                  {reward.name}
                </Text>
              </QuestoryCard>
            </Animated.View>
          ))}

          {chapterComplete.sagaFinale ? (
            chapterComplete.sagaFinale.dialogueOverride ? (
              <Animated.View
                entering={FadeInUp.duration(500).delay(680)}
                style={[styles.compactEnding, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
                <QuestoryStatusPill
                  label={`SAGA ENDING · ${chapterComplete.sagaFinale.title.toUpperCase()}`}
                  tone="accent"
                />
                {chapterComplete.sagaFinale.universeFlavorLine ? (
                  <Text style={[QuestoryTypography.flavor, { color: palette.gold, textAlign: 'center' }]}>
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
      <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 2, textAlign: 'center' }]}>{label}</Text>
      {hint ? <Text style={[QuestoryTypography.caption, { color: palette.fog, marginTop: 4, textAlign: 'center', paddingHorizontal: 8 }]}>{hint}</Text> : null}
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
      <Text style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 2 }]}>{label}</Text>
      <Text style={[QuestoryTypography.statValue, { color: goldAccent, fontSize: 24 }]}>{value}</Text>
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
  stampWrap: { alignSelf: 'center' },
  titleBlock: { alignItems: 'center', gap: 6 },
  dialogueWrap: { marginTop: 4 },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 8,
  },
  rewardStat: { alignItems: 'center', gap: 4, minWidth: 120 },
  rewardDivider: { width: 1, height: 36 },
  unlockCard: {
    gap: 6,
    alignItems: 'center',
  },
  buttonWrap: { marginTop: 8, gap: 4 },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    marginTop: 4,
  },
  compactEnding: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
});
