import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterRewardBadge } from '@/components/rpg/chapter-reward-badge';
import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { useGame } from '@/hooks/use-game';
import {
  formatChapterProgress,
  type SagaLibraryProgress,
} from '@/lib/content-library-progress';
import { getCharacter } from '@/lib/narrative-helpers';
import { getSagaBannerImage, getSagaDetailImage } from '@/lib/narrative-media';
import { findRewardById } from '@/lib/reward-unlocks';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getUniverseCardVariant } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
import type { Saga, UniversePalette } from '@/types/narrative';

type SagaCardProps = {
  saga: Saga;
  palette: UniversePalette;
  selected: boolean;
  unlocked: boolean;
  unlockHint?: string;
  libraryProgress: SagaLibraryProgress;
  index: number;
  onPress: () => void;
  compact?: boolean;
};

export function SagaCard({
  saga,
  palette,
  selected,
  unlocked,
  unlockHint,
  libraryProgress,
  index,
  onPress,
  compact = false,
}: SagaCardProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse } = useGame();
  const bannerImage = getSagaBannerImage(saga);
  const detailImage = !unlocked ? getSagaDetailImage(saga) : null;
  const unlockReward =
    !unlocked && saga.requiredUnlockId
      ? findRewardById(activeUniverse, saga.requiredUnlockId)
      : undefined;
  const villainCharacter = saga.villainCharacterId
    ? getCharacter(saga, saga.villainCharacterId)
    : undefined;
  const playerRole = saga.rankTitles[0];
  const chapterLabel =
    libraryProgress.totalChapters === 1 ? 'chapter' : 'chapters';
  const showProgress = unlocked && libraryProgress.totalChapters > 0;
  const progressRatio =
    libraryProgress.totalChapters > 0
      ? libraryProgress.completedChapters / libraryProgress.totalChapters
      : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable disabled={!unlocked} onPress={onPress}>
        <QuestoryCard
          variant={selected && unlocked ? 'elevated' : getUniverseCardVariant(activeUniverse.id)}
          glow={selected && unlocked}
          style={{ opacity: unlocked ? 1 : 0.72 }}
          contentStyle={styles.cardBody}>
        {bannerImage ? (
          <NarrativeMediaFrame
            source={bannerImage}
            height={compact ? 72 : 96}
            scrim="bottom"
            style={styles.banner}
          />
        ) : null}

        {!unlocked && detailImage ? (
          <NarrativeMediaFrame
            source={detailImage}
            height={56}
            scrim="full"
            style={styles.detailStrip}
          />
        ) : null}

        <View style={styles.body}>
          <View style={styles.headerRow}>
            <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, flex: 1, minWidth: 120 }]} numberOfLines={2}>
              {saga.title}
            </Text>
            <QuestoryStatusPill
              label={unlocked ? 'UNLOCKED' : 'LOCKED'}
              tone={unlocked ? 'accent' : 'muted'}
            />
          </View>

          <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>
            {libraryProgress.totalChapters} {chapterLabel}
            {showProgress
              ? ` · ${formatChapterProgress(
                  libraryProgress.completedChapters,
                  libraryProgress.totalChapters,
                )} complete`
              : libraryProgress.totalChapters === 0
                ? ' · coming soon'
                : ''}
          </Text>

          {showProgress && (
            <QuestoryProgressBar progress={progressRatio} />
          )}

          <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2, marginTop: 6 }]}>
            YOUR ROLE
          </Text>
          <Text style={[QuestoryTypography.body, { color: palette.bone }]}>{playerRole}</Text>

          {!compact && (
            <>
              <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2, marginTop: 6 }]}>
                STORY FANTASY
              </Text>
              <Text style={[QuestoryTypography.flavor, { color: palette.fog }]} numberOfLines={2}>
                {saga.summary}
              </Text>
            </>
          )}

          {saga.allyName ? (
            <>
              <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2, marginTop: 6 }]}>
                MAIN ALLY
              </Text>
              <Text style={[QuestoryTypography.body, { color: palette.bone }]}>{saga.allyName}</Text>
            </>
          ) : null}

          {saga.villainName ? (
            <>
              <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2, marginTop: 6 }]}>
                {ui.villainLabel}
              </Text>
              <Text style={[QuestoryTypography.caption, { color: palette.villainGlow, letterSpacing: 1.5 }]}>
                {saga.villainName} · {saga.villainTitle}
              </Text>
            </>
          ) : null}

          {!unlocked && unlockHint && (
            <View style={styles.requirementRow}>
              {villainCharacter ? (
                <CharacterPortrait character={villainCharacter} size="sm" context="lockedTeaser" />
              ) : null}
              {unlockReward ? (
                <ChapterRewardBadge reward={unlockReward} palette={palette} size="sm" />
              ) : null}
              <Text style={[QuestoryTypography.caption, { color: palette.villainGlow, letterSpacing: 1.5, flex: 1 }]}>
                REQUIRES: {unlockHint.toUpperCase()}
              </Text>
            </View>
          )}

          {selected && unlocked && (
            <Text style={[QuestoryTypography.caption, { color: palette.gold, textAlign: 'right', marginTop: 8, letterSpacing: 2 }]}>
              SELECTED
            </Text>
          )}
        </View>
        </QuestoryCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardBody: { gap: 0, padding: 0, paddingLeft: 0 },
  banner: { marginBottom: 0 },
  detailStrip: { marginBottom: 0 },
  body: { padding: 16, gap: 4 },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
});
