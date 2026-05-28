import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatIdentityEvidenceSummary,
  getRankedIdentityEvidence,
  getTotalIdentityVotes,
} from '@/lib/identity-votes';

export function IdentityEvidencePanel() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const votes = playerProgress.identityVotes;
  const total = getTotalIdentityVotes(votes);
  const evidence = getRankedIdentityEvidence(votes);

  return (
    <View style={[styles.panel, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
      <Text style={[styles.summary, { color: palette.fog }]}>
        {formatIdentityEvidenceSummary(votes)}
      </Text>

      {total === 0 ? (
        <Text style={[styles.emptyHint, { color: palette.fog }]}>
          Clear quests to collect identity evidence. Missed quests never remove votes.
        </Text>
      ) : (
        <View style={styles.traitList}>
          {evidence.map((entry) => (
            <View
              key={entry.trait.key}
              style={[styles.traitRow, { borderColor: palette.panelBorder }]}>
              <View style={styles.traitHeader}>
                <Text style={[styles.traitName, { color: palette.bone }]} numberOfLines={1}>
                  {entry.trait.label}
                </Text>
                <Text style={[styles.voteCount, { color: palette.gold }]}>{entry.voteCount}</Text>
              </View>
              <Text style={[styles.encouragingLine, { color: palette.fog }]} numberOfLines={2}>
                {entry.trait.encouragingLine}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  emptyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  traitList: { gap: 8 },
  traitRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  traitName: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 1,
    flex: 1,
  },
  voteCount: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    letterSpacing: 1,
    minWidth: 28,
    textAlign: 'right',
  },
  encouragingLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
    fontStyle: 'italic',
  },
});
