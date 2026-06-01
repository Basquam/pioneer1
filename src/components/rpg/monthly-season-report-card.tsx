import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import {
  computeMonthlySeasonReport,
  getLocalMonthKey,
  isMonthlyReviewClosed,
} from '@/lib/monthly-review';
import { getTaskCategoryMeta } from '@/lib/task-categories';

export function MonthlySeasonReportCard() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, playerProgress, closeMonthlySeasonReport } = useGame();
  const { palette } = activeUniverse;

  const monthKey = useMemo(() => getLocalMonthKey(), []);
  const report = useMemo(
    () => computeMonthlySeasonReport(playerProgress, activeUniverse.id, new Date(), monthKey),
    [activeUniverse.id, monthKey, playerProgress],
  );
  const isClosed = isMonthlyReviewClosed(playerProgress, monthKey);

  const handleCloseMonth = () => {
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    closeMonthlySeasonReport(monthKey);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(120)}
      style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />

      <View style={styles.inner}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>MONTHLY REVIEW</Text>
        <Text style={[styles.title, { color: palette.bone }]}>{report.title}</Text>
        <Text style={[styles.monthLabel, { color: palette.fog }]}>{report.monthLabel}</Text>
        <Text style={[styles.identityCopy, { color: palette.bone }]}>{report.identityCopy}</Text>

        {isClosed ? (
          <Text style={[styles.closedHint, { color: palette.fog }]}>
            Month archived — your evidence stays in history.
          </Text>
        ) : null}

        {report.isQuietMonth ? (
          <Text style={[styles.quietHint, { color: palette.fog }]}>
            A quiet month still counts. When you return, each small quest adds to the record.
          </Text>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <ReportStat label="CLEARED" value={String(report.questsCompleted)} palette={palette} />
              <ReportStat label="XP EARNED" value={`+${report.xpEarned}`} palette={palette} />
              <ReportStat
                label={ui.reputationLabel}
                value={`+${report.reputationEarned}`}
                palette={palette}
              />
              <ReportStat
                label={ui.weeklyRecapSectorsLabel}
                value={String(report.chaptersCompleted)}
                palette={palette}
              />
            </View>

            <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.detailLabel, { color: palette.fog }]}>Identity votes gained</Text>
              <Text style={[styles.detailValue, { color: palette.bone }]}>
                {report.identityVotesGained}
              </Text>
            </View>

            {report.strongestTrait ? (
              <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.detailLabel, { color: palette.fog }]}>Strongest trait</Text>
                <Text style={[styles.detailValue, { color: palette.bone }]}>
                  {report.strongestTrait.trait.label} ({report.strongestTrait.count})
                </Text>
              </View>
            ) : null}

            {report.topCategories.length > 0 ? (
              <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.detailLabel, { color: palette.fog }]}>Most used category</Text>
                <Text style={[styles.detailValue, { color: palette.bone }]}>
                  {getTaskCategoryMeta(report.topCategories[0]!.category).realWorldLabel}
                  {report.topCategories.length > 1
                    ? ` · ${getTaskCategoryMeta(report.topCategories[1]!.category).realWorldLabel}`
                    : ''}
                </Text>
              </View>
            ) : null}

            {report.topSuite ? (
              <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.detailLabel, { color: palette.fog }]}>Top suite this month</Text>
                <Text style={[styles.detailValue, { color: palette.bone }]}>
                  {report.topSuite.label} ({report.topSuite.completed})
                </Text>
              </View>
            ) : null}

            {report.topUniverse ? (
              <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.detailLabel, { color: palette.fog }]}>Most active universe</Text>
                <Text style={[styles.detailValue, { color: palette.bone }]}>
                  {report.topUniverse.name} ({report.topUniverse.count})
                </Text>
              </View>
            ) : null}

            {report.topSaga ? (
              <View style={[styles.detailRow, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.detailLabel, { color: palette.fog }]}>Most active saga</Text>
                <Text style={[styles.detailValue, { color: palette.bone }]}>
                  {report.topSaga.title} ({report.topSaga.count})
                </Text>
              </View>
            ) : null}

            <View style={[styles.miniStats, { borderColor: palette.panelBorder }]}>
              <MiniStat
                label="High-risk cleared"
                value={String(report.highRiskQuestsCompleted)}
                palette={palette}
              />
              <MiniStat
                label="Routine cleared"
                value={String(report.recurringQuestsCompleted)}
                palette={palette}
              />
              <MiniStat
                label="Focus cleared"
                value={String(report.focusQuestsCompleted)}
                palette={palette}
              />
              <MiniStat
                label="Active days"
                value={String(report.activeDays)}
                palette={palette}
              />
            </View>
          </>
        )}

        {report.becomingSummary.length > 0 ? (
          <View style={[styles.summarySection, { borderColor: palette.panelBorder }]}>
            <Text style={[styles.summaryLabel, { color: palette.gold }]}>BECOMING SUMMARY</Text>
            {report.becomingSummary.map((line) => (
              <Text key={line} style={[styles.summaryLine, { color: palette.bone }]}>
                {line}
              </Text>
            ))}
          </View>
        ) : null}

        <View style={[styles.recommendationBox, { borderColor: palette.gold, backgroundColor: palette.night }]}>
          <Text style={[styles.recommendationLabel, { color: palette.gold }]}>TRY NEXT MONTH</Text>
          <Text style={[styles.recommendationText, { color: palette.bone }]}>
            {report.recommendation}
          </Text>
        </View>

        {!isClosed ? (
          <Pressable
            onPress={handleCloseMonth}
            style={[styles.closeButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
            <Text style={[styles.closeButtonText, { color: palette.bone }]}>CLOSE MONTH</Text>
            <Text style={[styles.closeButtonHint, { color: palette.fog }]}>
              Marks this report as seen — nothing is deleted.
            </Text>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

function ReportStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { gold: string; fog: string; bone: string };
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.statValue, { color: palette.bone }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

function MiniStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { fog: string; bone: string };
}) {
  return (
    <View style={styles.miniStatCell}>
      <Text style={[styles.miniStatLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.miniStatValue, { color: palette.bone }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  inner: { padding: 18, paddingLeft: 22, gap: 10, transform: [{ skewX: '2deg' }] },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  title: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28 },
  monthLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  identityCopy: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  closedHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  quietHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  statCell: {
    width: '47%',
    minWidth: 120,
    flexGrow: 1,
    gap: 2,
  },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 20, letterSpacing: 1 },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 8,
  },
  detailLabel: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    flex: 1,
  },
  detailValue: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 0.3, flexShrink: 0 },
  miniStats: {
    borderTopWidth: 1,
    paddingTop: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  miniStatCell: {
    width: '47%',
    minWidth: 130,
    flexGrow: 1,
    gap: 2,
  },
  miniStatLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.2 },
  miniStatValue: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 0.5 },
  summarySection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 6,
  },
  summaryLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  summaryLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  recommendationBox: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  recommendationLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  recommendationText: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  closeButton: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  closeButtonText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    textAlign: 'center',
  },
  closeButtonHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
