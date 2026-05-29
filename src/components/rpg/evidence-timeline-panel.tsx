import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatEvidenceRewards,
  getUniverseEvidenceFlavorLine,
  groupEvidenceByDate,
} from '@/lib/evidence-log';
import { isDesiredIdentityTraitLabel } from '@/lib/identity-compass';
import { getTaskCategoryMeta } from '@/lib/task-categories';

export function EvidenceTimelinePanel() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const groups = groupEvidenceByDate(playerProgress.evidenceLog);

  if (groups.length === 0) {
    return (
      <Text style={[styles.emptyHint, { color: palette.fog }]}>
        Complete quests to start building evidence.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {groups.map((group) => (
        <View key={group.date} style={styles.dateGroup}>
          <Text style={[styles.dateLabel, { color: palette.gold }]}>{group.label}</Text>

          {group.events.map((event) => {
            const categoryMeta = getTaskCategoryMeta(event.category);
            const flavorLine = getUniverseEvidenceFlavorLine(event.universeId);
            const isDesired = isDesiredIdentityTraitLabel(
              event.identityTraitGained,
              playerProgress.desiredIdentityTraits,
            );

            return (
              <View
                key={event.id}
                style={[
                  styles.eventRow,
                  {
                    borderColor: isDesired ? palette.gold : palette.panelBorder,
                    backgroundColor: isDesired ? `${palette.primary}22` : palette.panel,
                  },
                ]}>
                <Text style={[styles.questTitle, { color: palette.bone }]} numberOfLines={2}>
                  {event.questTitle}
                </Text>

                {event.originalTaskTitle ? (
                  <Text style={[styles.originalTask, { color: palette.fog }]} numberOfLines={1}>
                    {event.originalTaskTitle}
                  </Text>
                ) : null}

                <View style={styles.metaRow}>
                  {event.identityTraitGained ? (
                    <Text style={[styles.traitLabel, { color: isDesired ? palette.gold : palette.accent }]}>
                      +1 {event.identityTraitGained}
                      {isDesired ? ' · Compass' : ''}
                    </Text>
                  ) : null}
                  <Text style={[styles.rewards, { color: palette.gold }]}>
                    {formatEvidenceRewards(event)}
                  </Text>
                </View>

                <Text style={[styles.categoryLine, { color: palette.fog }]}>
                  {categoryMeta.icon} {categoryMeta.label}
                  {event.source === 'chapterBounty' ? ' · Chapter bounty' : ' · Your quest'}
                </Text>

                <Text style={[styles.flavorLine, { color: palette.fog }]}>{flavorLine}</Text>
              </View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 14 },
  emptyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  dateGroup: { gap: 8 },
  dateLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
  eventRow: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  questTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  originalTask: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    flexWrap: 'wrap',
  },
  traitLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1,
  },
  rewards: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  categoryLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.3,
  },
  flavorLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
