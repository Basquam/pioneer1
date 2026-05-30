import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PanelChrome } from '@/components/rpg/panel-chrome';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
  getPanelShadow,
  skewTransform,
} from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getFocusLockCopy } from '@/lib/focus-lock';
import {
  formatReadinessLabel,
  getQuestReadinessSuggestion,
} from '@/lib/quest-readiness';
import { formatQuestRiskCardLine, resolveQuestRiskLevel } from '@/lib/quest-risk';
import {
  MOTION_GUARD_CARD_CTA,
  MOTION_GUARD_CARD_PROMPT,
} from '@/lib/motion-vs-action';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { formatChainProgressLabel, isQuestChainParentBlocked, isQuestChainSplittable, shouldHighlightQuestChainSplit } from '@/lib/quest-chain';
import { formatPreQuestRitualCardLine } from '@/lib/pre-quest-ritual';
import { formatQuestReminderCue } from '@/lib/quest-reminders';
import { isFeatureUnlocked } from '@/lib/feature-discovery';
import type { BoardQuest } from '@/types/narrative';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuestCardProps = {
  quest: BoardQuest;
  index: number;
  variant?: 'default' | 'chain-child';
};

export function QuestCard({ quest, index, variant = 'default' }: QuestCardProps) {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    playerProgress,
    completeQuest,
    openQuestFocus,
    startQuestNow,
    openImproveQuest,
    openFrictionReview,
    openSplitQuestChain,
  } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const showFocusMode = isFeatureUnlocked(playerProgress, 'focusMode');
  const showQuestReadiness = isFeatureUnlocked(playerProgress, 'questReadiness');
  const showFrictionReview = isFeatureUnlocked(playerProgress, 'frictionReview');
  const showQuestChain = isFeatureUnlocked(playerProgress, 'questChain');
  const scale = useSharedValue(1);
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (quest.completed) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.wrapper,
          {
            borderColor: goldAccent,
            backgroundColor: `${accentColor}22`,
            transform: skewTransform(visualTheme.cardSkew),
          },
          getPanelShadow(palette, visualTheme),
        ]}>
        <Text style={[styles.stamp, { color: goldAccent }]}>CLEARED</Text>
        {quest.source === 'user' && quest.isDailyFocus && (
          <Text style={[styles.focusStamp, { color: goldAccent }]}>{ui.focusQuestLabel}</Text>
        )}
        <Text style={[styles.doneTitle, { color: palette.fog }]}>{quest.narrativeTitle}</Text>
        {quest.source === 'user' && (
          <Text style={[styles.doneReal, { color: palette.fog }]}>{quest.originalTitle}</Text>
        )}
      </Animated.View>
    );
  }

  const categoryMeta = getTaskCategoryMeta(quest.category);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const lockedFocus = quest.isFocusLocked === true;
  const resolvedRisk = resolveQuestRiskLevel(quest.riskLevel);
  const showRisk = quest.source === 'user' && resolvedRisk !== 'standard';
  const readinessSuggestion =
    quest.readinessScore != null && quest.readinessChecklist
      ? getQuestReadinessSuggestion({
          score: quest.readinessScore,
          maxScore: 4,
          checklist: quest.readinessChecklist,
        })
      : null;

  const isChainChild = variant === 'chain-child' || quest.parentQuestId != null;
  const isChainParent = quest.isQuestChainParent === true;
  const chainBlocked = isQuestChainParentBlocked(quest);
  const canSplit = quest.source === 'user' && isQuestChainSplittable({
    id: quest.id,
    isCompleted: quest.completed,
    isQuestChainParent: quest.isQuestChainParent,
    parentQuestId: quest.parentQuestId,
  });
  const highlightSplit = canSplit && shouldHighlightQuestChainSplit(quest);
  const reminderCue = quest.source === 'user' ? formatQuestReminderCue(quest) : null;

  const handlePress = () => {
    if (chainBlocked) return;
    scale.value = withSpring(0.94, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    completeQuest(quest.id);
  };

  const handleFocusPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openQuestFocus(quest.id);
  };

  const handleImprovePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openImproveQuest(quest.id);
  };

  const handleFrictionPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openFrictionReview(quest.id);
  };

  const handleStartNowPress = () => {
    startQuestNow(quest.id);
  };

  const handleStartFirstMovePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    startQuestNow(quest.id);
  };

  const handleSplitPress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    openSplitQuestChain(quest.id);
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 100).springify()}
      onPress={handlePress}
      style={[
        styles.wrapper,
        isChainChild && styles.wrapperChainChild,
        cardStyle,
        {
          backgroundColor: lockedFocus ? `${palette.primary}44` : palette.panel,
          borderColor: lockedFocus ? goldAccent : panelBorder,
          borderWidth: lockedFocus ? Math.max(visualTheme.panelBorderWidth, 2) : visualTheme.panelBorderWidth,
          transform: skewTransform(visualTheme.cardSkew),
        },
        getPanelShadow(palette, visualTheme),
      ]}>
      <PanelChrome palette={palette} theme={visualTheme} />
      <View style={[styles.accent, { backgroundColor: accentColor, width: visualTheme.accentLineWidth }]} />
      <View style={[styles.inner, visualTheme.cardSkew !== 0 && styles.innerUnskew]}>
        <View style={styles.topRow}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: palette.primary }]}>
              <Text style={[styles.badgeText, { color: palette.bone }]} numberOfLines={1}>
                {categoryMeta.icon} {categoryMeta.label.toUpperCase()}
              </Text>
            </View>
            {lockedFocus && (
              <View style={[styles.badge, { backgroundColor: palette.primary, borderWidth: 1, borderColor: goldAccent }]}>
                <Text style={[styles.badgeText, { color: goldAccent }]} numberOfLines={1}>
                  {focusLockCopy.lockedQuestBadge}
                </Text>
              </View>
            )}
            {!lockedFocus && quest.source === 'user' && quest.isDailyFocus && (
              <View style={[styles.badge, { backgroundColor: goldAccent }]}>
                <Text style={[styles.badgeText, { color: palette.void }]} numberOfLines={1}>
                  {ui.focusQuestLabel}
                </Text>
              </View>
            )}
            {quest.source === 'user' && quest.isRecurring && (
              <View style={[styles.badge, { backgroundColor: palette.primary, borderWidth: 1, borderColor: palette.accent }]}>
                <Text style={[styles.badgeText, { color: palette.accent }]} numberOfLines={1}>
                  RECURRING
                </Text>
              </View>
            )}
            {quest.isStarted && (
              <View style={[styles.badge, { backgroundColor: palette.night, borderWidth: 1, borderColor: palette.accent }]}>
                <Text style={[styles.badgeText, { color: palette.accent }]} numberOfLines={1}>
                  STARTED
                </Text>
              </View>
            )}
            {isChainChild && quest.chainStepOrder != null && (
              <View style={[styles.badge, { backgroundColor: palette.night, borderWidth: 1, borderColor: palette.gold }]}>
                <Text style={[styles.badgeText, { color: palette.gold }]} numberOfLines={1}>
                  STEP {quest.chainStepOrder}
                </Text>
              </View>
            )}
            {isChainParent && (
              <View style={[styles.badge, { backgroundColor: palette.primary, borderWidth: 1, borderColor: palette.gold }]}>
                <Text style={[styles.badgeText, { color: palette.bone }]} numberOfLines={1}>
                  CHAIN
                </Text>
              </View>
            )}
          </View>
          {!isChainParent ? (
            <Text style={[styles.xp, { color: goldAccent }]} numberOfLines={1}>
              +{quest.xpReward} XP
            </Text>
          ) : null}
        </View>

        <Text style={[styles.title, { color: palette.bone }]} numberOfLines={3}>
          {quest.narrativeTitle}
        </Text>

        {isChainParent && quest.chainProgress ? (
          <Text style={[styles.chainProgress, { color: palette.gold }]}>
            {formatChainProgressLabel(quest.chainProgress.completed, quest.chainProgress.total)}
          </Text>
        ) : null}

        {isChainChild && quest.chainTitle ? (
          <Text style={[styles.chainChildHint, { color: palette.fog }]} numberOfLines={1}>
            Part of: {quest.chainTitle}
          </Text>
        ) : null}

        {quest.source === 'user' && quest.routineFreshnessHint ? (
          <Text style={[styles.freshnessHint, { color: palette.fog }]} numberOfLines={2}>
            {quest.routineFreshnessHint}
          </Text>
        ) : null}

        <View style={styles.realRow}>
          <Text style={[styles.realLabel, { color: palette.fog }]}>
            {quest.source === 'user' ? ui.realTaskLabel : ui.templateQuestLabel}
          </Text>
          <Text style={[styles.realTask, { color: goldAccent }]} numberOfLines={2}>
            {quest.originalTitle}
          </Text>
        </View>

        {quest.source === 'user' && showQuestReadiness && (quest.readinessScore != null || showRisk) && (
          <View style={[styles.metaRow, { borderTopColor: 'rgba(255,255,255,0.08)' }]}>
            {quest.readinessScore != null && (
              <Text style={[styles.metaLine, { color: palette.gold }]}>
                {formatReadinessLabel(quest.readinessScore)}
              </Text>
            )}
            {showRisk && (
              <Text style={[styles.metaLine, { color: palette.fog }]} numberOfLines={1}>
                {formatQuestRiskCardLine(resolvedRisk, activeUniverse.id)}
              </Text>
            )}
            {readinessSuggestion ? (
              <Text style={[styles.metaHint, { color: palette.fog }]} numberOfLines={2}>
                {readinessSuggestion}
              </Text>
            ) : null}
          </View>
        )}

        {quest.source === 'user' && quest.preQuestRitual?.trim() ? (
          <Text style={[styles.ritualLine, { color: palette.fog }]} numberOfLines={2}>
            {formatPreQuestRitualCardLine(quest.preQuestRitual, activeUniverse.id)}
          </Text>
        ) : null}

        {reminderCue ? (
          <Text style={[styles.cueLine, { color: palette.fog }]} numberOfLines={1}>
            {reminderCue}
          </Text>
        ) : null}

        {quest.source === 'user' && quest.isTooMuchMotion && (
          <View style={[styles.motionGuardBox, { borderColor: palette.accent, backgroundColor: `${palette.primary}33` }]}>
            <Text style={[styles.motionGuardPrompt, { color: palette.bone }]}>{MOTION_GUARD_CARD_PROMPT}</Text>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleStartFirstMovePress();
              }}
              style={[styles.motionGuardButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[styles.motionGuardButtonText, { color: palette.bone }]}>{MOTION_GUARD_CARD_CTA}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.actionRow}>
          {showFocusMode ? (
          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              handleFocusPress();
            }}
            style={[styles.focusButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
            <Text style={[styles.focusButtonText, { color: palette.bone }]}>START FOCUS</Text>
          </Pressable>
          ) : null}

          {quest.source === 'user' && !quest.isStarted && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleStartNowPress();
              }}
              style={[styles.secondaryButton, { borderColor: palette.accent, backgroundColor: palette.night }]}>
              <Text style={[styles.secondaryButtonText, { color: palette.bone }]}>START NOW</Text>
            </Pressable>
          )}

          {quest.source === 'user' && !isChainChild && showQuestReadiness && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleImprovePress();
              }}
              style={[styles.secondaryButton, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
              <Text style={[styles.secondaryButtonText, { color: palette.fog }]}>IMPROVE</Text>
            </Pressable>
          )}

          {canSplit && showQuestChain && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleSplitPress();
              }}
              style={[
                styles.secondaryButton,
                {
                  borderColor: highlightSplit ? palette.gold : palette.panelBorder,
                  backgroundColor: highlightSplit ? palette.primary : palette.night,
                },
              ]}>
              <Text
                style={[
                  styles.secondaryButtonText,
                  { color: highlightSplit ? palette.bone : palette.fog },
                ]}>
                SPLIT
              </Text>
            </Pressable>
          )}

          {quest.source === 'user' && quest.showFrictionReview && showFrictionReview && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleFrictionPress();
              }}
              style={[styles.secondaryButton, { borderColor: palette.accent, backgroundColor: palette.night }]}>
              <Text style={[styles.secondaryButtonText, { color: palette.accent }]}>FRICTION</Text>
            </Pressable>
          )}

          {!chainBlocked ? (
            <Text style={[styles.tap, { color: palette.accent }]}>TAP TO COMPLETE ›</Text>
          ) : (
            <Text style={[styles.tap, { color: palette.fog }]}>CLEAR ALL STEPS ›</Text>
          )}
        </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 16,
  },
  wrapperChainChild: {
    marginBottom: 8,
    paddingVertical: 14,
    borderStyle: 'dashed',
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  inner: { paddingLeft: 8, gap: 8, minWidth: 0 },
  innerUnskew: { transform: [{ skewX: '2deg' }] },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, minWidth: 0 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, transform: [{ skewX: '-8deg' }], maxWidth: '100%' },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  xp: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2, flexShrink: 0 },
  title: { fontFamily: GameFonts.display, fontSize: 18, lineHeight: 24 },
  chainProgress: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    lineHeight: 15,
  },
  chainChildHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  freshnessHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
    marginTop: -2,
  },
  realRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, flexShrink: 0 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1, flex: 1, minWidth: 120, lineHeight: 18 },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  metaLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
  },
  metaHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  ritualLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
    marginTop: 2,
  },
  cueLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.35,
    lineHeight: 14,
    marginTop: 2,
    opacity: 0.85,
  },
  motionGuardBox: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    marginTop: 2,
  },
  motionGuardPrompt: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  motionGuardButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-6deg' }],
  },
  motionGuardButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  focusButton: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-6deg' }],
  },
  focusButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  secondaryButton: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
    transform: [{ skewX: '-6deg' }],
  },
  secondaryButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  tap: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, textAlign: 'right', flex: 1 },
  stamp: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  focusStamp: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, marginTop: 2 },
  doneTitle: { fontFamily: GameFonts.displayRegular, fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  doneReal: { fontFamily: GameFonts.uiSemi, fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
});
