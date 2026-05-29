import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatNextMilestoneLabel,
  getAllTraitBecomingProgress,
} from '@/lib/identity-milestones';
import { isDesiredIdentityTrait } from '@/lib/identity-compass';
import { getTotalIdentityVotes } from '@/lib/identity-votes';

export function BecomingPathPanel() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const votes = playerProgress.identityVotes;
  const desiredTraits = playerProgress.desiredIdentityTraits ?? [];
  const total = getTotalIdentityVotes(votes);
  const traits = getAllTraitBecomingProgress(votes);

  return (
    <View style={styles.panel}>
      {total === 0 ? (
        <Text style={[styles.emptyHint, { color: palette.fog }]}>
          Clear quests to collect identity evidence. Votes never go down — missed quests never remove them.
        </Text>
      ) : null}

      <View style={styles.traitList}>
        {traits.map((entry) => {
          const tierLabel = entry.currentTier?.label ?? 'Awaiting';
          const showProgress = entry.nextTier !== null;
          const isDesired = isDesiredIdentityTrait(entry.trait.key, desiredTraits);

          return (
            <View
              key={entry.trait.key}
              style={[
                styles.traitRow,
                {
                  borderColor: isDesired ? palette.gold : palette.panelBorder,
                  backgroundColor: isDesired ? `${palette.primary}33` : palette.panel,
                },
              ]}>
              <View style={styles.traitHeader}>
                <View style={styles.traitTitleWrap}>
                  <Text style={[styles.traitName, { color: palette.bone }]} numberOfLines={1}>
                    {entry.trait.label}
                  </Text>
                  {isDesired ? (
                    <Text style={[styles.compassBadge, { color: palette.gold }]}>COMPASS</Text>
                  ) : null}
                </View>
                <Text style={[styles.voteCount, { color: palette.gold }]}>{entry.voteCount}</Text>
              </View>

              <View style={styles.tierRow}>
                <Text style={[styles.tierLabel, { color: palette.accent }]}>{tierLabel}</Text>
                <Text style={[styles.nextLabel, { color: palette.fog }]}>
                  {formatNextMilestoneLabel(entry)}
                </Text>
              </View>

              {showProgress ? (
                <View style={[styles.progressTrack, { backgroundColor: palette.night }]}>
                  <View
                    style={[
                      styles.progressFill,
                      {
                        width: `${Math.round(entry.progressToNext * 100)}%`,
                        backgroundColor: palette.gold,
                      },
                    ]}
                  />
                </View>
              ) : null}

              <Text style={[styles.identitySentence, { color: palette.fog }]} numberOfLines={2}>
                {entry.identitySentence}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

/** @deprecated Use BecomingPathPanel — kept as alias for imports during transition. */
export const IdentityEvidencePanel = BecomingPathPanel;

const styles = StyleSheet.create({
  panel: { gap: 10 },
  emptyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  traitList: { gap: 8 },
  traitRow: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  traitHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  traitTitleWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 0,
  },
  compassBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
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
  tierRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  tierLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  nextLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.3,
    textAlign: 'right',
    flex: 1,
  },
  progressTrack: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  identitySentence: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
