import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterDetailSheet } from '@/components/rpg/chapter-detail-sheet';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { TerritoryMap } from '@/components/rpg/territory-map';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { ChapterStatus } from '@/lib/chapter-progress';
import { buildTerritoryNodes, type TerritoryNode } from '@/lib/territory-map';
import type { Chapter } from '@/types/narrative';

export function MapScreen() {
  const { activeUniverse, activeSaga, chapters, playerProgress } = useGame();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [detailMode, setDetailMode] = useState<ChapterStatus | null>(null);

  const territoryNodes = useMemo(
    () => buildTerritoryNodes(chapters, playerProgress),
    [chapters, playerProgress],
  );

  const reclaimedCount = territoryNodes.filter((node) => node.status === 'completed').length;

  const handleNodePress = (node: TerritoryNode) => {
    setSelectedChapter(node.chapter);
    setDetailMode(node.status);
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
            eyebrow={`${activeUniverse.name.toUpperCase()} · TERRITORY MAP`}
            title="FRONTIER PROGRESS"
            right={activeSaga.title}
          />

          <VillainMeter />

          <Text style={[styles.hint, { color: activeUniverse.palette.fog }]}>
            {reclaimedCount}/{chapters.length} territories reclaimed. Your discipline reshapes Dustfall.
          </Text>

          {territoryNodes.length > 0 ? (
            <TerritoryMap
              nodes={territoryNodes}
              palette={activeUniverse.palette}
              onNodePress={handleNodePress}
            />
          ) : (
            <Text style={[styles.empty, { color: activeUniverse.palette.fog }]}>
              No territory data for this saga yet.
            </Text>
          )}

          <Text style={[styles.legend, { color: activeUniverse.palette.gold }]}>MAP LEGEND</Text>
          <Text style={[styles.legendItem, { color: activeUniverse.palette.fog }]}>
            RECLAIMED — chapter cleared · ACTIVE — current front · THREAT — locked territory
          </Text>
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
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  empty: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 1,
    textAlign: 'center',
    paddingVertical: 40,
  },
  legend: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2, marginTop: 4 },
  legendItem: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 0.5, lineHeight: 16 },
});
