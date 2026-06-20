import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterCard } from '@/components/rpg/chapter-card';
import { ChapterDetailSheet } from '@/components/rpg/chapter-detail-sheet';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { SagaPreviewEmptyState } from '@/components/rpg/saga-preview-empty-state';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionLabel } from '@/components/rpg/section-label';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { QuestorySectionHeader } from '@/components/ui/questory-section-header';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { QuestoryTheme } from '@/theme/questory-theme';
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseCardVariant, getUniverseSkin } from '@/theme/universe-skins';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getActiveChapterId, getChapterStatus, type ChapterStatus } from '@/lib/chapter-progress';
import { getCrewCodeLines } from '@/lib/crew-code';
import { getSagaEndingRecord } from '@/lib/saga-ending-resolver';
import type { Chapter } from '@/types/narrative';

export function StoryScreen() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, chapters, isSagaPreview, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
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
  const sagaEnding = getSagaEndingRecord(playerProgress, activeSaga.id);
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);
  const crewCodeLines = useMemo(() => getCrewCodeLines(activeSaga), [activeSaga]);

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
          <QuestoryCard variant="elevated" contentStyle={styles.campaignHeader}>
            <View style={styles.titleRow}>
              <View style={styles.titleBlock}>
                <QuestoryStatusPill label="CAMPAIGN DOSSIER" tone="accent" />
                <QuestorySectionHeader
                  eyebrow={`${activeSaga.title.toUpperCase()} · SAGA TRAIL`}
                  title={ui.storyTitle}
                  right={activeUniverse.locationName}
                />
              </View>
              <Pressable
                onPress={() => setSagaSwitcherVisible(true)}
                style={[styles.switchButton, { borderColor: skin.accentPrimary, backgroundColor: `${skin.accentPrimary}18` }]}>
                <Text style={[QuestoryTypography.caption, { color: skin.accentPrimary, letterSpacing: 1.5 }]}>SWITCH SAGA</Text>
              </Pressable>
            </View>
          </QuestoryCard>
        </Animated.View>

        <VillainMeter />

        <QuestoryCard variant={getUniverseCardVariant(activeUniverse.id)} contentStyle={styles.progressCard}>
          <QuestoryProgressBar
            progress={chapters.length > 0 ? completedCount / chapters.length : 0}
            label={ui.sectorsClearedLabel(completedCount, chapters.length)}
          />
          {activeChapter && (
            <>
              <QuestoryStatusPill label="ACTIVE MISSION" tone="accent" />
              <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone }]} numberOfLines={2}>
                {ui.activeSectorLine(activeChapter.title)}
              </Text>
            </>
          )}
          <Text style={[QuestoryTypography.flavor, { color: palette.fog }]}>{activeSaga.summary}</Text>
          {crewCodeLines.length > 0 ? (
            <View style={[styles.crewCodeBlock, { borderColor: palette.panelBorder }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.gold, letterSpacing: 2 }]}>CREW CODE</Text>
              {crewCodeLines.map((line) => (
                <Text key={line} style={[QuestoryTypography.flavor, { color: palette.bone, fontSize: 12, lineHeight: 17 }]}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null}
          {sagaEnding ? (
            <View style={[styles.endingBlock, { borderColor: palette.panelBorder }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.gold, letterSpacing: 2 }]}>SAGA ENDING</Text>
              <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone }]}>{sagaEnding.title}</Text>
              <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 12, lineHeight: 17 }]}>
                {sagaEnding.summary}
              </Text>
            </View>
          ) : null}
        </QuestoryCard>

        {sagaComplete && (
          <CinematicEmptyState
            title={ui.sagaCompleteTitle}
            message={ui.sagaCompleteMessage(activeSaga.title)}
            primaryLabel="SWITCH SAGA"
            onPrimaryPress={() => setSagaSwitcherVisible(true)}
          />
        )}

        <SectionLabel>{ui.sagaSectorsLabel}</SectionLabel>
        {isSagaPreview ? (
          <SagaPreviewEmptyState />
        ) : chapters.length === 0 ? (
          <CinematicEmptyState
            title={ui.noChaptersTitle}
            message={`${activeSaga.title} ${ui.noChaptersMessage}`}
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
                          ? skin.accentPrimary
                          : status === 'active'
                            ? skin.accentSecondary
                            : palette.ink,
                      borderColor: status === 'active' ? skin.accentPrimary : palette.panelBorder,
                      borderWidth: status === 'active' ? 2 : 1,
                      ...(status === 'active' ? QuestoryTheme.shadow.glowGold : {}),
                    },
                  ]}
                />
                {index < chapterRows.length - 1 && (
                  <View
                    style={[
                      styles.railLine,
                      {
                        backgroundColor:
                          status === 'completed' ? `${skin.accentPrimary}88` : `${palette.panelBorder}66`,
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
  campaignHeader: { gap: 8 },
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
    alignSelf: 'flex-start',
  },
  progressCard: { gap: 10 },
  crewCodeBlock: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    gap: 6,
  },
  endingBlock: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    gap: 6,
  },
  trail: { gap: 0 },
  trailRow: { flexDirection: 'row', gap: 12 },
  rail: { width: 16, alignItems: 'center', paddingTop: 22 },
  railDot: {
    width: 14,
    height: 14,
    borderWidth: 1,
  },
  railLine: {
    flex: 1,
    width: 3,
    minHeight: 28,
    marginTop: 4,
  },
  cardWrap: { flex: 1, minWidth: 0 },
});
