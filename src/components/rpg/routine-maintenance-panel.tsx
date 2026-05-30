import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import {
  computeRoutineMaintenanceSummary,
  formatRoutineCompletionRate,
  formatRoutineMaintenanceRecurrence,
  getRoutineMaintenanceActionLabel,
  type RoutineMaintenanceAction,
  type RoutineMaintenanceEntry,
  type RoutineMaintenanceStatus,
} from '@/lib/routine-maintenance';

export function RoutineMaintenancePanel() {
  const {
    activeUniverse,
    playerProgress,
    openEditRecurringQuest,
    pauseRecurringQuest,
    archiveRecurringQuest,
    lowerRecurringQuestDifficulty,
    addStarterToRecurringQuest,
  } = useGame();
  const { palette } = activeUniverse;

  const summary = useMemo(
    () =>
      computeRoutineMaintenanceSummary({
        progress: playerProgress,
        universeId: activeUniverse.id,
      }),
    [activeUniverse.id, playerProgress],
  );

  if (summary.activeRoutineCount === 0) {
    return (
      <View style={[styles.emptyBox, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.emptyTitle, { color: palette.bone }]}>No active routines to review</Text>
        <Text style={[styles.emptyHint, { color: palette.fog }]}>
          When you add a recurring quest, it will appear here for gentle maintenance checks.
        </Text>
      </View>
    );
  }

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(100)}
      style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />

      <View style={styles.inner}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>ROUTINE MAINTENANCE</Text>
        <Text style={[styles.flavor, { color: palette.fog }]}>{summary.universeFlavor}</Text>
        {summary.needsAttentionCount > 0 ? (
          <Text style={[styles.summaryLine, { color: palette.bone }]}>
            {summary.needsAttentionCount} routine{summary.needsAttentionCount === 1 ? '' : 's'} may benefit
            from a small adjustment.
          </Text>
        ) : (
          <Text style={[styles.summaryLine, { color: palette.bone }]}>
            Your active routines look steady.
          </Text>
        )}

        <View style={styles.list}>
          {summary.entries.map((entry) => (
            <RoutineMaintenanceRow
              key={entry.template.id}
              entry={entry}
              palette={palette}
              onAction={(action) => {
                void Haptics.selectionAsync();
                executeRoutineMaintenanceAction(entry.template.id, action, {
                  openEditRecurringQuest,
                  pauseRecurringQuest,
                  archiveRecurringQuest,
                  lowerRecurringQuestDifficulty,
                  addStarterToRecurringQuest,
                });
              }}
            />
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

function RoutineMaintenanceRow({
  entry,
  palette,
  onAction,
}: {
  entry: RoutineMaintenanceEntry;
  palette: {
    bone: string;
    fog: string;
    gold: string;
    accent: string;
    panelBorder: string;
    night: string;
    primary: string;
  };
  onAction: (action: RoutineMaintenanceAction) => void;
}) {
  const categoryMeta = getTaskCategoryMeta(entry.template.category);
  const statusColor = getStatusColor(entry.status, palette);

  const secondaryActions = entry.availableActions.filter(
    (action) => action !== entry.primaryAction && action !== 'keep-steady',
  );

  return (
    <View style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <View style={styles.rowHeader}>
        <Text style={[styles.rowTitle, { color: palette.bone }]} numberOfLines={2}>
          {entry.template.originalTitle}
        </Text>
        <Text style={[styles.statusBadge, { color: statusColor, borderColor: statusColor }]}>
          {entry.statusLabel}
        </Text>
      </View>

      <Text style={[styles.rowMeta, { color: palette.fog }]}>
        {categoryMeta.icon} {categoryMeta.label} · {formatRoutineMaintenanceRecurrence(entry.template)}
      </Text>

      <Text style={[styles.rateLine, { color: palette.gold }]}>
        Completion rate · {formatRoutineCompletionRate(entry.stats.recentCompletionRate)} recent
      </Text>

      {entry.stats.supportsDesiredIdentityTrait ? (
        <Text style={[styles.identityLine, { color: palette.accent }]}>
          Supports your desired identity path
        </Text>
      ) : null}

      <Text style={[styles.suggestion, { color: palette.bone }]}>{entry.suggestion}</Text>

      {entry.primaryAction !== 'keep-steady' ? (
        <Pressable
          onPress={() => onAction(entry.primaryAction)}
          style={[styles.primaryAction, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
          <Text style={[styles.primaryActionText, { color: palette.bone }]}>
            {getRoutineMaintenanceActionLabel(entry.primaryAction)}
          </Text>
        </Pressable>
      ) : null}

      {secondaryActions.length > 0 ? (
        <View style={styles.secondaryActions}>
          {secondaryActions.map((action) => (
            <Pressable
              key={action}
              onPress={() => onAction(action)}
              style={[styles.secondaryAction, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.secondaryActionText, { color: palette.fog }]}>
                {getRoutineMaintenanceActionLabel(action)}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function getStatusColor(
  status: RoutineMaintenanceStatus,
  palette: { gold: string; accent: string; fog: string; primary: string },
): string {
  switch (status) {
    case 'healthy':
      return palette.primary;
    case 'needs-adjustment':
      return palette.gold;
    case 'stale':
      return palette.fog;
    case 'too-heavy':
    default:
      return palette.accent;
  }
}

function executeRoutineMaintenanceAction(
  templateId: string,
  action: RoutineMaintenanceAction,
  handlers: {
    openEditRecurringQuest: (templateId: string) => void;
    pauseRecurringQuest: (templateId: string) => void;
    archiveRecurringQuest: (templateId: string) => void;
    lowerRecurringQuestDifficulty: (templateId: string) => void;
    addStarterToRecurringQuest: (templateId: string) => void;
  },
) {
  switch (action) {
    case 'edit':
      handlers.openEditRecurringQuest(templateId);
      return;
    case 'pause':
      handlers.pauseRecurringQuest(templateId);
      return;
    case 'archive':
      handlers.archiveRecurringQuest(templateId);
      return;
    case 'lower-difficulty':
      handlers.lowerRecurringQuestDifficulty(templateId);
      return;
    case 'add-starter':
      handlers.addStarterToRecurringQuest(templateId);
      return;
    case 'keep-steady':
    default:
      return;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
  },
  inner: {
    padding: 14,
    paddingLeft: 18,
    gap: 10,
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  summaryLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 17,
  },
  list: {
    gap: 10,
  },
  row: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '2deg' }],
  },
  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  rowTitle: {
    flex: 1,
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.3,
    lineHeight: 19,
  },
  statusBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  rowMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  rateLine: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  identityLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    fontStyle: 'italic',
  },
  suggestion: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  primaryAction: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 2,
  },
  primaryActionText: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 1.2,
  },
  secondaryActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  secondaryAction: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  secondaryActionText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  emptyBox: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  emptyTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 1,
  },
  emptyHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
  },
});
