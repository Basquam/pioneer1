import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ChapterDetailSheet } from '@/components/rpg/chapter-detail-sheet';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { SagaSwitcherSheet } from '@/components/rpg/saga-switcher-sheet';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { SectionLabel } from '@/components/rpg/section-label';
import { TerritoryMap } from '@/components/rpg/territory-map';
import { VillainMeter } from '@/components/rpg/villain-meter';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import type { ChapterStatus } from '@/lib/chapter-progress';
import { buildTerritoryNodes, type TerritoryNode } from '@/lib/territory-map';
import type { Chapter } from '@/types/narrative';

export function MapScreen() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, chapters, playerProgress } = useGame();
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [detailMode, setDetailMode] = useState<ChapterStatus | null>(null);
  const [sagaSwitcherVisible, setSagaSwitcherVisible] = useState(false);

  const territoryNodes = useMemo(
    () => buildTerritoryNodes(chapters, activeSaga, playerProgress),
    [activeSaga, chapters, playerProgress],
  );

  const reclaimedCount = territoryNodes.filter((node) => node.status === 'completed').length;
  const allTerritoriesReclaimed =
    territoryNodes.length > 0 && reclaimedCount === territoryNodes.length;

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
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader
            eyebrow={ui.mapEyebrow(activeUniverse.name)}
            title={ui.mapTitle}
            right={activeSaga.title}
          />
        </Animated.View>

        <VillainMeter />

        <Text style={[styles.hint, { color: activeUniverse.palette.fog }]}>
          {ui.mapProgressHint(reclaimedCount, chapters.length, activeUniverse.locationName)}
        </Text>

        {territoryNodes.length > 0 ? (
          <TerritoryMap
            nodes={territoryNodes}
            palette={activeUniverse.palette}
            onNodePress={handleNodePress}
          />
        ) : (
          <Text style={[styles.empty, { color: activeUniverse.palette.fog }]}>
            {ui.mapEmptyMessage}
          </Text>
        )}

        {allTerritoriesReclaimed && (
          <CinematicEmptyState
            title={ui.mapReclaimedTitle}
            message={ui.mapReclaimedMessage(activeSaga.title)}
            primaryLabel="SWITCH SAGA"
            onPrimaryPress={() => setSagaSwitcherVisible(true)}
            secondaryLabel="VIEW REWARDS"
            onSecondaryPress={() => router.push('/(game)/profile' as Href)}
          />
        )}

        <SectionLabel>MAP LEGEND</SectionLabel>
        <Text style={[styles.legendItem, { color: activeUniverse.palette.fog }]}>
          {ui.mapLegend}
        </Text>
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
  legendItem: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 0.5, lineHeight: 16 },
});
