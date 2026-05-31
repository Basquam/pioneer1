import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ContentProgressBar } from '@/components/rpg/content-progress-bar';
import { ChapterRewardBadge } from '@/components/rpg/chapter-reward-badge';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatChapterProgress,
  type SagaLibraryProgress,
} from '@/lib/content-library-progress';
import { getSagaBannerImage, getSagaDetailImage } from '@/lib/narrative-media';
import { findRewardById } from '@/lib/reward-unlocks';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
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
  const playerRole = saga.rankTitles[0];
  const chapterLabel =
    libraryProgress.totalChapters === 1 ? 'chapter' : 'chapters';
  const showProgress = unlocked && libraryProgress.totalChapters > 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        disabled={!unlocked}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.panel,
            borderColor: selected ? palette.gold : palette.panelBorder,
            opacity: unlocked ? 1 : 0.72,
          },
        ]}>
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
            <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
              {saga.title}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  borderColor: unlocked ? palette.gold : palette.fog,
                  backgroundColor: unlocked ? `${palette.primary}33` : `${palette.ink}88`,
                },
              ]}>
              <Text style={[styles.statusText, { color: unlocked ? palette.gold : palette.fog }]}>
                {unlocked ? 'UNLOCKED' : 'LOCKED'}
              </Text>
            </View>
          </View>

          <Text style={[styles.meta, { color: palette.fog }]}>
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
            <ContentProgressBar
              completed={libraryProgress.completedChapters}
              total={libraryProgress.totalChapters}
              palette={palette}
            />
          )}

          <Text style={[styles.label, { color: palette.accent }]}>YOUR ROLE</Text>
          <Text style={[styles.value, { color: palette.bone }]}>{playerRole}</Text>

          {!compact && (
            <>
              <Text style={[styles.label, { color: palette.accent }]}>STORY FANTASY</Text>
              <Text style={[styles.summary, { color: palette.fog }]} numberOfLines={2}>
                {saga.summary}
              </Text>
            </>
          )}

          {saga.allyName ? (
            <>
              <Text style={[styles.label, { color: palette.accent }]}>MAIN ALLY</Text>
              <Text style={[styles.value, { color: palette.bone }]}>{saga.allyName}</Text>
            </>
          ) : null}

          {saga.villainName ? (
            <>
              <Text style={[styles.label, { color: palette.accent }]}>{ui.villainLabel}</Text>
              <Text style={[styles.villain, { color: palette.villainGlow }]}>
                {saga.villainName} · {saga.villainTitle}
              </Text>
            </>
          ) : null}

        {!unlocked && unlockHint && (
          <View style={styles.requirementRow}>
            {unlockReward ? (
              <ChapterRewardBadge reward={unlockReward} palette={palette} size="sm" />
            ) : null}
            <Text style={[styles.requirement, { color: palette.villainGlow }]}>
              REQUIRES: {unlockHint.toUpperCase()}
            </Text>
          </View>
        )}

          {selected && unlocked && (
            <Text style={[styles.selected, { color: palette.gold }]}>SELECTED</Text>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  banner: { marginBottom: 0 },
  detailStrip: { marginBottom: 0 },
  body: { padding: 16, gap: 4 },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  title: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2, flex: 1, minWidth: 120 },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-8deg' }],
  },
  statusText: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  meta: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, marginBottom: 2 },
  label: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 6 },
  value: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1 },
  summary: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  villain: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  requirementRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 8 },
  requirement: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5, flex: 1 },
  selected: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'right',
    marginTop: 8,
  },
});
