import { StyleSheet, Text, View } from 'react-native';

import { HqActionGrid, type HqActionGridItem } from '@/components/rpg/hq-action-grid';
import { HqGuideTransmission } from '@/components/rpg/hq-guide-transmission';
import { HqMissionHero } from '@/components/rpg/hq-mission-hero';
import { HqCompactStatsRow } from '@/components/rpg/hq-threat-card';
import { GameLayout } from '@/constants/layout';
import { useGame } from '@/hooks/use-game';
import type { MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

type HqStoryConsoleProps = {
  earlyHq?: boolean;
  guideContext: MascotGuideContextId | null;
  onGuideAction?: () => void;
  onPrimaryMissionPress: () => void;
  actionItems: HqActionGridItem[];
};

export function HqStoryConsole({
  earlyHq = false,
  guideContext,
  onGuideAction,
  onPrimaryMissionPress,
  actionItems,
}: HqStoryConsoleProps) {
  const { activeUniverse, activeSaga, currentChapter, player } = useGame();
  const skin = getUniverseSkin(activeUniverse.id);
  const isProtocol = skin.id === 'neuronet';
  const statsEyebrow = isProtocol ? 'SIGNAL STATUS' : 'FIELD READOUT';

  return (
    <View style={styles.console}>
      <View style={styles.identityBar}>
        <View style={styles.identityTop}>
          <View style={styles.brandRow}>
            <Text style={styles.universeMark}>{activeUniverse.icon}</Text>
            <Text style={[QuestoryTypography.sectionEyebrow, { color: skin.accentPrimary, fontSize: 11 }]}>
              QUESTORY
            </Text>
          </View>
          <Text style={[QuestoryTypography.caption, styles.meta, { color: QuestoryTheme.colors.text.muted }]}>
            LVL {player.level} · REP {player.reputation}
          </Text>
        </View>
        <View style={styles.chipRow}>
          <Chip label={activeUniverse.name} accent={skin.accentPrimary} />
          <Chip label={activeSaga.title} />
          {currentChapter ? (
            <Chip
              label={isProtocol ? `Sector ${currentChapter.order}` : `Ch ${currentChapter.order}`}
              accent={skin.accentSecondary}
            />
          ) : null}
        </View>
      </View>

      <HqMissionHero earlyHq={earlyHq} onPrimaryPress={onPrimaryMissionPress} />

      {!earlyHq ? (
        <>
          <Text style={[QuestoryTypography.sectionEyebrow, styles.sectionEyebrow, { color: skin.accentPrimary }]}>
            {statsEyebrow}
          </Text>
          <HqCompactStatsRow />
        </>
      ) : null}

      {guideContext ? (
        <>
          <Text style={[QuestoryTypography.sectionEyebrow, styles.sectionEyebrow, { color: skin.accentPrimary }]}>
            INCOMING TRANSMISSION
          </Text>
          <HqGuideTransmission contextId={guideContext} onAction={onGuideAction} />
        </>
      ) : null}

      <HqActionGrid universeId={activeUniverse.id} items={actionItems} />
    </View>
  );
}

function Chip({ label, accent }: { label: string; accent?: string }) {
  return (
    <View
      style={[
        styles.chip,
        { backgroundColor: accent ? `${accent}22` : 'rgba(255,255,255,0.07)' },
      ]}>
      <Text
        style={[
          QuestoryTypography.caption,
          { color: accent ?? QuestoryTheme.colors.text.secondary, fontSize: 10, letterSpacing: 0.8 },
        ]}
        numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  console: {
    gap: GameLayout.screenContentGap,
    paddingBottom: 4,
  },
  identityBar: {
    gap: 8,
    paddingVertical: 2,
  },
  identityTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  universeMark: {
    fontSize: 16,
    lineHeight: 20,
  },
  meta: {
    letterSpacing: 1.2,
    fontSize: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    maxWidth: '100%',
  },
  sectionEyebrow: {
    letterSpacing: 3,
    fontSize: 10,
    marginTop: 2,
  },
});
