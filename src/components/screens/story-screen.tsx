import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterCard } from '@/components/rpg/chapter-card';
import { ChapterDetailSheet } from '@/components/rpg/chapter-detail-sheet';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getActiveChapterId, getChapterStatus, type ChapterStatus } from '@/lib/chapter-progress';
import type { Chapter } from '@/types/narrative';

type DetailMode = 'completed' | 'locked';

export function StoryScreen() {
  const { activeUniverse, activeSaga, chapters, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [detailMode, setDetailMode] = useState<DetailMode | null>(null);

  const activeChapterId = getActiveChapterId(playerProgress);

  const chapterRows = useMemo(
    () =>
      chapters.map((chapter) => ({
        chapter,
        status: getChapterStatus(chapter, chapters, playerProgress),
      })),
    [chapters, playerProgress],
  );

  const completedCount = chapterRows.filter((row) => row.status === 'completed').length;
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
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader
            eyebrow={`${activeSaga.title.toUpperCase()} · SAGA TRAIL`}
            title="CHAPTER PROGRESS"
            right={activeUniverse.locationName}
          />

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
              <Text style={[styles.progressActive, { color: palette.bone }]}>
                Now riding through: {activeChapter.title}
              </Text>
            )}
            <Text style={[styles.progressSub, { color: palette.fog }]}>{activeSaga.summary}</Text>
          </View>

          <Text style={[styles.section, { color: palette.gold }]}>SAGA CHAPTERS</Text>
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
        </Animated.View>
      </ScrollView>

      <ChapterDetailSheet
        visible={detailMode !== null}
        chapter={selectedChapter}
        mode={detailMode}
        onClose={closeDetail}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 12, paddingTop: 8 },
  progressCard: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  progressEyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2 },
  progressActive: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1 },
  progressSub: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  section: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, marginTop: 8 },
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
  cardWrap: { flex: 1 },
});
