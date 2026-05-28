import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatRelationshipHeader,
  getCharacterAffinityLabel,
  getNextTierHint,
  getRelationshipProgress,
} from '@/lib/relationship-progress';
import type { NarrativeCharacter } from '@/types/narrative';

type RelationshipProgressSectionProps = {
  character: NarrativeCharacter;
  affinity?: number;
  compact?: boolean;
};

export function RelationshipProgressSection({
  character,
  affinity = 0,
  compact = false,
}: RelationshipProgressSectionProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const progress = getRelationshipProgress(affinity);
  const affinityLabel = getCharacterAffinityLabel(character);
  const header = formatRelationshipHeader(character, progress.tier);
  const nextHint = getNextTierHint(affinity, affinityLabel);
  const fillColor = character.isVillain ? palette.villainGlow : palette.gold;
  const trackColor = activeUniverse.palette.xpTrack;

  const pointsLabel =
    progress.tier === 'bonded'
      ? `${progress.affinity} pts`
      : `${progress.affinity} / ${progress.tierCeiling} pts`;

  return (
    <View style={[styles.section, compact && styles.sectionCompact]}>
      <View style={styles.headerRow}>
        <Text style={[styles.header, { color: fillColor }]}>{header}</Text>
        <Text style={[styles.points, { color: palette.fog }]}>{pointsLabel}</Text>
      </View>

      <View style={[styles.track, { backgroundColor: trackColor }]}>
        <View
          style={[
            styles.fill,
            {
              width: `${Math.round(progress.progress * 100)}%`,
              backgroundColor: fillColor,
            },
          ]}
        />
      </View>

      <Text style={[styles.hint, { color: palette.fog }]} numberOfLines={2}>
        {nextHint}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: 8,
    gap: 5,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  sectionCompact: {
    marginTop: 6,
    paddingTop: 6,
    gap: 4,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  header: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    flex: 1,
  },
  points: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
    flexShrink: 0,
  },
  track: {
    height: 6,
    overflow: 'hidden',
    borderRadius: 1,
  },
  fill: {
    height: '100%',
  },
  hint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.5,
    lineHeight: 13,
    fontStyle: 'italic',
  },
});
