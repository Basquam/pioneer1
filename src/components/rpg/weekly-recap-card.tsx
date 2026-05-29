import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { formatStreakDays } from '@/lib/daily-streak';
import { computeWeeklyRecap, getLocalWeekKey } from '@/lib/weekly-recap';
import {
  formatHelpedFactorsSummary,
  formatSlowdownFactorLabel,
  getWeeklyReviewEntry,
  getWeeklyReviewFlavorLine,
  getWeeklyReviewRecommendation,
  WEEKLY_REVIEW_HELPED_OPTIONS,
  WEEKLY_REVIEW_SLOWDOWN_OPTIONS,
} from '@/lib/weekly-review';
import {
  formatDesiredTraitWeeklyLine,
  getDesiredTraitWeeklyProgress,
} from '@/lib/identity-compass';
import type { WeeklyReviewHelpedFactor, WeeklyReviewSlowdownFactor } from '@/types/narrative';

export function WeeklyRecapCard() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, playerProgress, submitWeeklyReview } = useGame();
  const { palette } = activeUniverse;

  const weekKey = useMemo(() => getLocalWeekKey(), []);
  const savedReview = useMemo(
    () => getWeeklyReviewEntry(playerProgress, weekKey),
    [playerProgress, weekKey],
  );

  const [helpedDraft, setHelpedDraft] = useState<WeeklyReviewHelpedFactor[]>([]);
  const [slowdownDraft, setSlowdownDraft] = useState<WeeklyReviewSlowdownFactor | null>(null);

  const recap = useMemo(
    () => computeWeeklyRecap(playerProgress, activeSaga.id, new Date(), activeUniverse.id),
    [activeSaga.id, activeUniverse.id, playerProgress],
  );
  const desiredTraitProgress = useMemo(
    () => getDesiredTraitWeeklyProgress(playerProgress),
    [playerProgress],
  );

  const isQuietWeek =
    recap.questsCompleted === 0 &&
    recap.xpEarned === 0 &&
    recap.reputationEarned === 0 &&
    recap.chaptersCompleted === 0;

  const activeReview = savedReview;
  const recommendation = activeReview
    ? getWeeklyReviewRecommendation(activeReview.slowdownFactor)
    : slowdownDraft
      ? getWeeklyReviewRecommendation(slowdownDraft)
      : null;
  const flavorLine = getWeeklyReviewFlavorLine(activeUniverse.id);

  const toggleHelped = (factor: WeeklyReviewHelpedFactor) => {
    void Haptics.selectionAsync();
    setHelpedDraft((current) =>
      current.includes(factor) ? current.filter((item) => item !== factor) : [...current, factor],
    );
  };

  const selectSlowdown = (factor: WeeklyReviewSlowdownFactor) => {
    void Haptics.selectionAsync();
    setSlowdownDraft(factor);
  };

  const handleSaveReview = () => {
    if (!slowdownDraft) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    submitWeeklyReview(helpedDraft, slowdownDraft);
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(80)}
      style={[
        styles.card,
        { backgroundColor: palette.panel, borderColor: palette.gold },
      ]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />

      <View style={styles.inner}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>WEEKLY REVIEW</Text>
        <Text style={[styles.weekLabel, { color: palette.fog }]}>{recap.weekLabel}</Text>
        <Text style={[styles.flavor, { color: palette.bone }]}>{recap.flavorLine}</Text>

        {desiredTraitProgress ? (
          <Text style={[styles.compassLine, { color: palette.gold }]}>
            {formatDesiredTraitWeeklyLine(desiredTraitProgress)}
          </Text>
        ) : null}

        {isQuietWeek ? (
          <Text style={[styles.quietHint, { color: palette.fog }]}>
            {ui.weeklyRecapQuietHint}
          </Text>
        ) : (
          <>
            <View style={styles.statsGrid}>
              <RecapStat label="CLEARED" value={String(recap.questsCompleted)} palette={palette} />
              <RecapStat label="XP EARNED" value={`+${recap.xpEarned}`} palette={palette} />
              <RecapStat
                label={ui.reputationLabel}
                value={`+${recap.reputationEarned}`}
                palette={palette}
              />
              <RecapStat
                label={ui.weeklyRecapSectorsLabel}
                value={String(recap.chaptersCompleted)}
                palette={palette}
              />
            </View>

            <View style={[styles.highRiskRow, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.highRiskLabel, { color: palette.fog }]}>
                High-risk quests completed this week
              </Text>
              <Text style={[styles.highRiskValue, { color: palette.bone }]}>
                {recap.highRiskQuestsCompleted}
              </Text>
            </View>
          </>
        )}

        <View style={[styles.streakRow, { borderColor: palette.panelBorder }]}>
          <Text style={[styles.streakLabel, { color: palette.accent }]}>DAILY STREAK</Text>
          <Text style={[styles.streakValue, { color: palette.gold }]}>
            {formatStreakDays(recap.dailyStreak)}
          </Text>
        </View>

        <View style={[styles.reviewSection, { borderColor: palette.panelBorder }]}>
          <Text style={[styles.reviewEyebrow, { color: palette.gold }]}>REFLECTION</Text>

          {activeReview ? (
            <View style={styles.savedReview}>
              <View style={styles.reflectionBlock}>
                <Text style={[styles.reflectionQuestion, { color: palette.fog }]}>
                  What helped you this week?
                </Text>
                <Text style={[styles.reflectionAnswer, { color: palette.bone }]}>
                  {formatHelpedFactorsSummary(activeReview.helpedFactors)}
                </Text>
              </View>

              <View style={styles.reflectionBlock}>
                <Text style={[styles.reflectionQuestion, { color: palette.fog }]}>
                  What slowed you down?
                </Text>
                <Text style={[styles.reflectionAnswer, { color: palette.bone }]}>
                  {formatSlowdownFactorLabel(activeReview.slowdownFactor)}
                </Text>
              </View>

              <View style={[styles.recommendationBox, { borderColor: palette.gold, backgroundColor: palette.night }]}>
                <Text style={[styles.recommendationLabel, { color: palette.gold }]}>TRY NEXT WEEK</Text>
                <Text style={[styles.recommendationText, { color: palette.bone }]}>{recommendation}</Text>
                <Text style={[styles.recommendationFlavor, { color: palette.fog }]}>{flavorLine}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.reviewForm}>
              <Text style={[styles.reflectionQuestion, { color: palette.bone }]}>
                What helped you this week?
              </Text>
              <View style={styles.optionGrid}>
                {WEEKLY_REVIEW_HELPED_OPTIONS.map((option) => {
                  const selected = helpedDraft.includes(option.factor);
                  return (
                    <Pressable
                      key={option.factor}
                      onPress={() => toggleHelped(option.factor)}
                      style={[
                        styles.optionChip,
                        {
                          borderColor: selected ? palette.gold : palette.panelBorder,
                          backgroundColor: selected ? palette.primary : palette.night,
                        },
                      ]}>
                      <Text style={[styles.optionText, { color: selected ? palette.bone : palette.fog }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={[styles.reflectionQuestion, { color: palette.bone, marginTop: 4 }]}>
                What slowed you down?
              </Text>
              <View style={styles.optionGrid}>
                {WEEKLY_REVIEW_SLOWDOWN_OPTIONS.map((option) => {
                  const selected = slowdownDraft === option.factor;
                  return (
                    <Pressable
                      key={option.factor}
                      onPress={() => selectSlowdown(option.factor)}
                      style={[
                        styles.optionChip,
                        {
                          borderColor: selected ? palette.gold : palette.panelBorder,
                          backgroundColor: selected ? palette.primary : palette.night,
                        },
                      ]}>
                      <Text style={[styles.optionText, { color: selected ? palette.bone : palette.fog }]}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {recommendation && (
                <View
                  style={[
                    styles.recommendationBox,
                    { borderColor: palette.gold, backgroundColor: palette.night },
                  ]}>
                  <Text style={[styles.recommendationLabel, { color: palette.gold }]}>TRY NEXT WEEK</Text>
                  <Text style={[styles.recommendationText, { color: palette.bone }]}>{recommendation}</Text>
                  <Text style={[styles.recommendationFlavor, { color: palette.fog }]}>{flavorLine}</Text>
                </View>
              )}

              <Pressable
                onPress={handleSaveReview}
                disabled={!slowdownDraft}
                style={[
                  styles.saveButton,
                  {
                    borderColor: slowdownDraft ? palette.gold : palette.panelBorder,
                    opacity: slowdownDraft ? 1 : 0.5,
                  },
                ]}>
                <Text style={[styles.saveButtonText, { color: palette.bone }]}>SAVE WEEKLY REVIEW</Text>
              </Pressable>
            </View>
          )}
        </View>
      </View>
    </Animated.View>
  );
}

function RecapStat({
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

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  inner: { padding: 18, paddingLeft: 22, gap: 10, transform: [{ skewX: '2deg' }] },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  weekLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  compassLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.4,
    lineHeight: 16,
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
  highRiskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 8,
  },
  highRiskLabel: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    flex: 1,
  },
  highRiskValue: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 1 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
    gap: 8,
  },
  streakLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  streakValue: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1 },
  reviewSection: {
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
    marginTop: 2,
  },
  reviewEyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  reviewForm: { gap: 8 },
  savedReview: { gap: 10 },
  reflectionBlock: { gap: 4 },
  reflectionQuestion: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 16,
  },
  reflectionAnswer: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-2deg' }],
  },
  optionText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
  },
  recommendationBox: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
    marginTop: 4,
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
  recommendationFlavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  saveButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
    transform: [{ skewX: '-2deg' }],
  },
  saveButtonText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
  },
});
