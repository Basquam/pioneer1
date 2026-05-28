import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterCard } from '@/components/rpg/chapter-card';
import { ChapterDetailSheet } from '@/components/rpg/chapter-detail-sheet';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { SectionLabel } from '@/components/rpg/section-label';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getActiveChapterId, getChapterStatus, type ChapterStatus } from '@/lib/chapter-progress';
import type { Chapter } from '@/types/narrative';

export function StoryScreen() {
  const { activeUniverse, activeSaga, chapters, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [detailMode, setDetailMode] = useState<ChapterStatus | null>(null);
  const [sagaSwitcherVisible, setSagaSwitcherVisible] = useState(false);

  const activeChapterId = getActiveChapterId(activeSaga, playerProgress);

  const chapterRows = useMemo(
    () =>
      chapters.map((chapter) => ({
        chapter,
        status: getChapterStatus(chapter, chapters, activeSaga, playerProgress),
      })),
    [activeSaga, chapters, playerProgress],
  );

  const completedCount = chapterRows.filter((row) => row.status === 'completed').length;
  const sagaComplete = chapters.length > 0 && completedCount === chapters.length;
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);

  const handleChapterPress = (chapter: Chapter, status: ChapterStatus) => {
    if (status === 'completed') {
      setSelectedChapter(chapter);
      setDetailMode('completed');
      return;
    }

    if (status === 'locked') {
      setSelectedChapter(chapter);
      setDetailMode('locked');
    }
  };

  const closeDetail = () => {
    setSelectedChapter(null);
    setDetailMode(null);
  };

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlock}>
              <SectionHeader
                eyebrow={`${activeSaga.title.toUpperCase()} · SAGA TRAIL`}
                title="CHAPTER PROGRESS"
                right={activeUniverse.locationName}
              />
            </View>
            <Pressable
              onPress={() => setSagaSwitcherVisible(true)}
              style={[styles.switchButton, { borderColor: palette.gold }]}>
              <Text style={[styles.switchLabel, { color: palette.gold }]}>SWITCH SAGA</Text>
            </Pressable>
          </View>
        </Animated.View>

        <VillainMeter />

        <View
          style={[
            styles.progressCard,
            { backgroundColor: palette.panel, borderColor: palette.panelBorder },
          ]}>
          <Text style={[styles.progressEyebrow, { color: palette.gold }]}>
            {completedCount}/{chapters.length} CHAPTERS CLEARED
          </Text>
          {activeChapter && (
            <Text style={[styles.progressActive, { color: palette.bone }]} numberOfLines={2}>
              Now riding through: {activeChapter.title}
            </Text>
          )}
          <Text style={[styles.progressSub, { color: palette.fog }]}>{activeSaga.summary}</Text>
        </View>

        {sagaComplete && (
          <CinematicEmptyState
            title="Saga complete."
            message={`You rode every chapter of ${activeSaga.title}. The trail ends here — for now. Choose your next storyline.`}
            primaryLabel="SWITCH SAGA"
            onPrimaryPress={() => setSagaSwitcherVisible(true)}
          />
        )}

        <SectionLabel>SAGA CHAPTERS</SectionLabel>
        {chapters.length === 0 ? (
          <CinematicEmptyState
            title="No chapters available."
            message={`${activeSaga.title} doesn't have playable chapters yet. Switch to an unlocked saga or restore the default storyline.`}
            primaryLabel="SWITCH SAGA"
            onPrimaryPress={() => setSagaSwitcherVisible(true)}
          />
        ) : (
          <View style={styles.trail}>
            {chapterRows.map(({ chapter, status }, index) => (
            <View key={chapter.id} style={styles.trailRow}>
              <View style={styles.rail}>
                <View
                  style={[
                    styles.railDot,
                    {
                      backgroundColor:
                        status === 'completed'
                          ? palette.gold
                          : status === 'active'
                            ? palette.primary
                            : palette.ink,
                      borderColor: status === 'active' ? palette.gold : palette.panelBorder,
                    },
                  ]}
                />
                {index < chapterRows.length - 1 && (
                  <View
                    style={[
                      styles.railLine,
                      {
                        backgroundColor:
                          status === 'completed' ? `${palette.gold}88` : `${palette.panelBorder}88`,
                      },
                    ]}
                  />
                )}
              </View>
              <View style={styles.cardWrap}>
                <ChapterCard
                  chapter={chapter}
                  status={status}
                  index={index}
                  onPress={() => handleChapterPress(chapter, status)}
                />
              </View>
            </View>
          ))}
          </View>
        )}
      </ScreenScroll>

      <ChapterDetailSheet
        visible={detailMode !== null}
        chapter={selectedChapter}
        mode={detailMode}
        onClose={closeDetail}
      />
      <SagaSwitcherSheet
        visible={sagaSwitcherVisible}
        onClose={() => setSagaSwitcherVisible(false)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  titleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start',
    gap: 10,
  },
  titleBlock: { flex: 1, minWidth: 200 },
  switchButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-6deg' }],
    alignSelf: 'flex-start',
  },
  switchLabel: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 1.5 },
  progressCard: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  progressEyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2 },
  progressActive: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1, lineHeight: 20 },
  progressSub: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  trail: { gap: 0 },
  trailRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 16, alignItems: 'center', paddingTop: 22 },
  railDot: {
    width: 12,
    height: 12,
    borderWidth: 1,
    transform: [{ skewX: '-12deg' }],
  },
  railLine: {
    flex: 1,
    width: 2,
    minHeight: 24,
    marginTop: 4,
  },
  cardWrap: { flex: 1, minWidth: 0 },
});
