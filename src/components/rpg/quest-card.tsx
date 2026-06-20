import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { SuiteBadge } from '@/components/rpg/suite-badge';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getFocusLockCopy } from '@/lib/focus-lock';
import {
  formatReadinessLabel,
  getQuestReadinessSuggestion,
} from '@/lib/quest-readiness';
import { applyInventoryReadinessDisplayBonus } from '@/lib/inventory-item-effects';
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
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseCardVariant } from '@/theme/universe-skins';
import { QuestoryTheme } from '@/theme/questory-theme';
import type { BoardQuest } from '@/types/narrative';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuestCardProps = {
  quest: BoardQuest;
  index: number;
  variant?: 'default' | 'chain-child';
};

function resolveCardVariant(quest: BoardQuest, universeId: string): 'default' | 'elevated' | 'dossier' | 'terminal' | 'danger' | 'success' {
  if (quest.completed) return 'success';
  if (quest.source === 'template') return getUniverseCardVariant(universeId);
  if (quest.isFocusLocked) return 'elevated';
  return 'default';
}

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
  const { palette } = activeUniverse;
  const showFocusMode = isFeatureUnlocked(playerProgress, 'focusMode');
  const showQuestReadiness = isFeatureUnlocked(playerProgress, 'questReadiness');
  const showFrictionReview = isFeatureUnlocked(playerProgress, 'frictionReview');
  const showQuestChain = isFeatureUnlocked(playerProgress, 'questChain');
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isChainChild = variant === 'chain-child' || quest.parentQuestId != null;
  const cardVariant = resolveCardVariant(quest, activeUniverse.id);

  if (quest.completed) {
    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <QuestoryCard variant="success" contentStyle={styles.completedContent}>
          <QuestoryStatusPill label="CLEARED" tone="success" />
          {quest.source === 'user' && quest.isDailyFocus && (
            <QuestoryStatusPill label={ui.focusQuestLabel} tone="accent" />
          )}
          <Text style={[QuestoryTypography.flavor, { color: palette.fog }]}>{quest.narrativeTitle}</Text>
          {quest.source === 'user' && (
            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>{quest.originalTitle}</Text>
          )}
        </QuestoryCard>
      </Animated.View>
    );
  }

  const categoryMeta = getTaskCategoryMeta(quest.category);
  const focusLockCopy = getFocusLockCopy(activeUniverse.id);
  const lockedFocus = quest.isFocusLocked === true;
  const resolvedRisk = resolveQuestRiskLevel(quest.riskLevel);
  const showRisk = quest.source === 'user' && resolvedRisk !== 'standard';
  const displayReadiness =
    quest.source === 'user' && quest.readinessScore != null && quest.readinessChecklist
      ? applyInventoryReadinessDisplayBonus(playerProgress, activeUniverse.id, quest, {
          score: quest.readinessScore,
          maxScore: 4,
          checklist: quest.readinessChecklist,
        })
      : null;
  const readinessSuggestion = displayReadiness
    ? getQuestReadinessSuggestion(displayReadiness)
    : null;

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
    scale.value = withSpring(0.97, { damping: 10 }, () => {
      scale.value = withSpring(1);
    });
    completeQuest(quest.id);
  };

  const secondaryBadges: Array<{ key: string; label: string; tone: 'default' | 'accent' | 'muted' }> = [];
  if (lockedFocus) {
    secondaryBadges.push({ key: 'locked', label: focusLockCopy.lockedQuestBadge, tone: 'muted' });
  } else if (quest.source === 'user' && quest.isDailyFocus) {
    secondaryBadges.push({ key: 'focus', label: ui.focusQuestLabel, tone: 'accent' });
  }
  if (isChainChild && quest.chainStepOrder != null) {
    secondaryBadges.push({ key: 'step', label: `STEP ${quest.chainStepOrder}`, tone: 'muted' });
  } else if (isChainParent) {
    secondaryBadges.push({ key: 'chain', label: 'CHAIN', tone: 'accent' });
  }
  if (quest.source === 'user' && quest.isRecurring) {
    secondaryBadges.push({ key: 'recurring', label: 'RECURRING', tone: 'accent' });
  }
  if (quest.isStarted) {
    secondaryBadges.push({ key: 'started', label: 'IN PROGRESS', tone: 'accent' });
  }
  const visibleSecondaryBadges = secondaryBadges.slice(0, 3);

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 100).springify()}
      onPress={handlePress}
      style={[cardStyle, isChainChild && styles.chainChildWrap]}>
      <QuestoryCard
        variant={cardVariant}
        glow={!isChainChild}
        contentStyle={[styles.cardContent, isChainChild && styles.chainChildContent]}>
        <View style={styles.topRow}>
          <View style={styles.badges}>
            <QuestoryStatusPill
              label={
                quest.source === 'template'
                  ? `BOUNTY · ${categoryMeta.label.toUpperCase()}`
                  : `${categoryMeta.icon} ${categoryMeta.label.toUpperCase()}`
              }
              tone={quest.source === 'template' ? 'accent' : 'default'}
            />
            {quest.source === 'user' && quest.suiteId ? (
              <SuiteBadge suiteId={quest.suiteId} palette={palette} />
            ) : null}
            {visibleSecondaryBadges.map((badge) => (
              <QuestoryStatusPill key={badge.key} label={badge.label} tone={badge.tone} />
            ))}
          </View>
          {!isChainParent ? (
            <Text style={[QuestoryTypography.statValue, { color: palette.gold, fontSize: 14 }]} numberOfLines={1}>
              +{quest.xpReward} XP
            </Text>
          ) : null}
        </View>

        <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, fontSize: 18, lineHeight: 24 }]} numberOfLines={3}>
          {quest.narrativeTitle}
        </Text>

        {isChainParent && quest.chainProgress ? (
          <Text style={[QuestoryTypography.caption, { color: palette.gold }]}>
            {formatChainProgressLabel(quest.chainProgress.completed, quest.chainProgress.total)}
          </Text>
        ) : null}

        {isChainChild && quest.chainTitle ? (
          <Text style={[QuestoryTypography.caption, { color: palette.fog }]} numberOfLines={1}>
            Part of: {quest.chainTitle}
          </Text>
        ) : null}

        {quest.source === 'user' && quest.routineFreshnessHint ? (
          <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 11 }]} numberOfLines={2}>
            {quest.routineFreshnessHint}
          </Text>
        ) : null}

        <View style={[styles.realRow, { borderTopColor: QuestoryTheme.colors.border.subtle }]}>
          <Text style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 2 }]}>
            {quest.source === 'user' ? ui.realTaskLabel : ui.templateQuestLabel}
          </Text>
          <Text style={[QuestoryTypography.body, { color: palette.gold, flex: 1 }]} numberOfLines={2}>
            {quest.originalTitle}
          </Text>
        </View>

        {quest.source === 'user' && showQuestReadiness && (displayReadiness != null || showRisk) && (
          <View style={[styles.metaRow, { borderTopColor: QuestoryTheme.colors.border.subtle }]}>
            {displayReadiness != null && (
              <Text style={[QuestoryTypography.caption, { color: palette.gold }]}>
                {formatReadinessLabel(displayReadiness.score)}
              </Text>
            )}
            {showRisk && (
              <Text style={[QuestoryTypography.caption, { color: palette.fog }]} numberOfLines={1}>
                {formatQuestRiskCardLine(resolvedRisk, activeUniverse.id)}
              </Text>
            )}
            {readinessSuggestion ? (
              <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 11 }]} numberOfLines={2}>
                {readinessSuggestion}
              </Text>
            ) : null}
          </View>
        )}

        {quest.source === 'user' && quest.preQuestRitual?.trim() ? (
          <Text style={[QuestoryTypography.caption, { color: palette.fog }]} numberOfLines={2}>
            {formatPreQuestRitualCardLine(quest.preQuestRitual, activeUniverse.id)}
          </Text>
        ) : null}

        {reminderCue ? (
          <Text style={[QuestoryTypography.caption, { color: palette.fog, opacity: 0.85 }]} numberOfLines={1}>
            {reminderCue}
          </Text>
        ) : null}

        {quest.source === 'user' && quest.isTooMuchMotion && (
          <View style={[styles.motionGuardBox, { borderColor: palette.accent, backgroundColor: `${palette.primary}33` }]}>
            <Text style={[QuestoryTypography.flavor, { color: palette.bone, fontSize: 12 }]}>{MOTION_GUARD_CARD_PROMPT}</Text>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                startQuestNow(quest.id);
              }}
              style={[styles.motionGuardButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.5 }]}>{MOTION_GUARD_CARD_CTA}</Text>
            </Pressable>
          </View>
        )}

        <View style={styles.actionRow}>
          {showFocusMode ? (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openQuestFocus(quest.id);
              }}
              style={[styles.actionButton, styles.actionPrimary, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.5 }]}>START FOCUS</Text>
            </Pressable>
          ) : null}

          {quest.source === 'user' && !quest.isStarted && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                startQuestNow(quest.id);
              }}
              style={[styles.actionButton, { borderColor: `${palette.accent}66`, backgroundColor: palette.night }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.2 }]}>START NOW</Text>
            </Pressable>
          )}

          {quest.source === 'user' && !isChainChild && showQuestReadiness && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openImproveQuest(quest.id);
              }}
              style={[styles.actionButton, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 1.2 }]}>IMPROVE</Text>
            </Pressable>
          )}

          {canSplit && showQuestChain && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openSplitQuestChain(quest.id);
              }}
              style={[
                styles.actionButton,
                {
                  borderColor: highlightSplit ? palette.gold : palette.panelBorder,
                  backgroundColor: highlightSplit ? palette.primary : palette.night,
                },
              ]}>
              <Text style={[QuestoryTypography.caption, { color: highlightSplit ? palette.bone : palette.fog, letterSpacing: 1.2 }]}>
                SPLIT
              </Text>
            </Pressable>
          )}

          {quest.source === 'user' && quest.showFrictionReview && showFrictionReview && (
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                openFrictionReview(quest.id);
              }}
              style={[styles.actionButton, { borderColor: palette.accent, backgroundColor: palette.night }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 1.2 }]}>FRICTION</Text>
            </Pressable>
          )}

          {!chainBlocked ? (
            <Text style={[QuestoryTypography.caption, { color: palette.accent, letterSpacing: 2, flex: 1, textAlign: 'right' }]}>
              TAP TO COMPLETE ›
            </Text>
          ) : (
            <Text style={[QuestoryTypography.caption, { color: palette.fog, letterSpacing: 2, flex: 1, textAlign: 'right' }]}>
              CLEAR ALL STEPS ›
            </Text>
          )}
        </View>
      </QuestoryCard>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  completedContent: { gap: 8 },
  chainChildWrap: { marginBottom: 4 },
  chainChildContent: { opacity: 0.95 },
  cardContent: { gap: 8 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, minWidth: 0 },
  realRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
    paddingTop: 8,
    borderTopWidth: 1,
  },
  metaRow: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 4,
  },
  motionGuardBox: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
  },
  motionGuardButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  actionButton: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  actionPrimary: {},
});
