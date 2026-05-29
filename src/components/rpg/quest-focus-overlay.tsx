import * as Haptics from 'expo-haptics';
import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
} from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { CollapsibleSection } from '@/components/rpg/collapsible-section';
import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getIdentityTraitMeta, getTraitForCategory } from '@/lib/identity-votes';
import { getCharacter, pickCharacterLine } from '@/lib/narrative-helpers';
import { formatPrepStepLine } from '@/lib/quest-prep';
import {
  formatFocusIdentityVotePreview,
  getQuestFocusClearedLabel,
  getQuestFocusCopy,
  getQuestFocusSourceLabel,
  getQuestStartRitualCopy,
  getRitualFirstMoveLine,
  getRitualMissionLine,
  shortenMotivationLine,
} from '@/lib/quest-focus-mode';
import {
  hasStarterMove,
  shouldHighlightDecisiveMoment,
  SMALLEST_STEP_PROMPT,
} from '@/lib/decisive-moment';
import { getAfterQuestRewardCopy } from '@/lib/after-quest-reward';
import {
  DISTRACTION_SHIELD_OPTIONS,
  getDistractionShieldSuggestion,
} from '@/lib/distraction-shield';
import { formatStarterMoveLine } from '@/lib/two-minute-starter';
import { formatQuestRiskFocusLine, resolveQuestRiskLevel } from '@/lib/quest-risk';
import type { QuestDistractionType } from '@/types/narrative';

type RitualStep = 0 | 1 | 2 | 3 | 4;

export function QuestFocusOverlay() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    focusQuest,
    focusDecisiveMoment,
    closeQuestFocus,
    completeQuest,
    recordFocusDistraction,
  } = useGame();
  const { palette } = activeUniverse;
  const copy = getQuestFocusCopy(activeUniverse.id);
  const ritualCopy = getQuestStartRitualCopy(activeUniverse.id);
  const rewardCopy = getAfterQuestRewardCopy(activeUniverse.id);
  const [ritualStep, setRitualStep] = useState<RitualStep>(0);
  const [selectedDistraction, setSelectedDistraction] = useState<QuestDistractionType | null>(null);
  const [shieldExpanded, setShieldExpanded] = useState(false);
  const completePulse = useSharedValue(1);
  const ritualComplete = ritualStep === 4;

  useEffect(() => {
    setRitualStep(0);
    setSelectedDistraction(focusQuest?.lastFocusDistraction ?? null);
    setShieldExpanded(Boolean(focusQuest?.lastFocusDistraction));
    completePulse.value = 1;
  }, [focusQuest?.id, focusQuest?.lastFocusDistraction, completePulse]);

  const completeWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completePulse.value }],
    opacity: ritualComplete ? 1 : 0.72,
  }));

  if (!focusQuest) return null;

  const isCompleted = focusQuest.completed;
  const showDecisiveHighlight = shouldHighlightDecisiveMoment(focusDecisiveMoment, focusQuest);
  const showDecisiveStarter = showDecisiveHighlight && hasStarterMove(focusQuest);
  const ritualActive = ritualStep >= 1 && ritualStep <= 3;
  const hasRewardRitual = Boolean(focusQuest.afterQuestReward?.trim());
  const sourceLabel = getQuestFocusSourceLabel(focusQuest, ui);
  const clearedLabel = getQuestFocusClearedLabel(focusQuest, ui);
  const taskSectionLabel =
    focusQuest.source === 'user' ? ui.realTaskLabel : ui.templateQuestLabel;
  const character = getCharacter(activeSaga, focusQuest.reactionCharacterId);
  const motivationLine = character
    ? shortenMotivationLine(pickCharacterLine(character, 'questComplete', focusQuest.id.length))
    : shortenMotivationLine(ui.questCompleteFallbackLine);
  const trait = getIdentityTraitMeta(getTraitForCategory(focusQuest.category));

  const handleComplete = () => {
    if (isCompleted) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    completeQuest(focusQuest.id);
    closeQuestFocus();
  };

  const handleStartRitual = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRitualStep(1);
  };

  const handleAdvanceRitual = () => {
    void Haptics.selectionAsync();
    setRitualStep((current) => {
      const next = Math.min(4, current + 1) as RitualStep;
      if (next === 4) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        completePulse.value = withSequence(
          withSpring(1.08, { damping: 8, stiffness: 220 }),
          withSpring(1, { damping: 12, stiffness: 180 }),
        );
      }
      return next;
    });
  };

  const handleSelectDistraction = (type: QuestDistractionType) => {
    void Haptics.selectionAsync();
    setSelectedDistraction(type);
    setShieldExpanded(true);
    if (focusQuest.source === 'user') {
      recordFocusDistraction(focusQuest.id, type);
    }
  };

  const hasQuestSupports =
    Boolean(focusQuest.starterTaskTitle && !showDecisiveStarter) ||
    Boolean(focusQuest.implementationIntention) ||
    Boolean(focusQuest.prepStepTitle) ||
    hasRewardRitual;

  const ritualStepContent =
    ritualStep === 1
      ? getRitualMissionLine(focusQuest)
      : ritualStep === 2
        ? getRitualFirstMoveLine(focusQuest)
        : null;

  const ritualStepPrompt =
    ritualStep === 1
      ? ritualCopy.step1Prompt
      : ritualStep === 2
        ? ritualCopy.step2Prompt
        : ritualCopy.step3Prompt;

  const ritualAdvanceLabel =
    ritualStep === 3 ? ritualCopy.step3Prompt.toUpperCase() : ritualCopy.advanceLabel;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={closeQuestFocus}>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}f5` }]}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled">
          <Animated.View entering={FadeIn.duration(300)} style={styles.header}>
            <Text style={[styles.eyebrow, { color: palette.gold }]}>QUEST FOCUS</Text>
            <Pressable onPress={closeQuestFocus} hitSlop={12}>
              <Text style={[styles.exitTop, { color: palette.fog }]}>{copy.exitLabel}</Text>
            </Pressable>
          </Animated.View>

          <Animated.Text
            entering={FadeInDown.duration(400).delay(80)}
            style={[styles.tagline, { color: palette.fog }]}>
            {copy.tagline}
          </Animated.Text>

          {showDecisiveHighlight && (
            <Animated.View
              entering={FadeInDown.duration(420).delay(120)}
              style={[
                styles.decisiveCard,
                {
                  backgroundColor: `${palette.primary}cc`,
                  borderColor: palette.gold,
                },
              ]}>
              {showDecisiveStarter ? (
                <>
                  <Text style={[styles.decisiveLabel, { color: palette.gold }]}>START HERE</Text>
                  <Text style={[styles.decisiveBody, { color: palette.bone }]}>
                    {formatStarterMoveLine(focusQuest.starterTaskTitle!, activeUniverse.id)}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={[styles.decisivePrompt, { color: palette.bone }]}>
                    {SMALLEST_STEP_PROMPT}
                  </Text>
                  <Text style={[styles.decisiveBody, { color: palette.fog }]}>
                    {focusQuest.originalTitle}
                  </Text>
                </>
              )}
            </Animated.View>
          )}

          <Animated.View
            entering={FadeInDown.duration(450).delay(140)}
            style={[
              styles.questCard,
              {
                backgroundColor: palette.panel,
                borderColor: isCompleted ? palette.fog : palette.gold,
                opacity: isCompleted ? 0.88 : 1,
              },
            ]}>
            <View style={styles.sourceRow}>
              <Text style={[styles.sourceLabel, { color: palette.gold }]}>{sourceLabel}</Text>
              {isCompleted && (
                <Text style={[styles.clearedStamp, { color: palette.gold }]}>{clearedLabel}</Text>
              )}
            </View>

            <Text style={[styles.narrativeTitle, { color: palette.bone }]}>{focusQuest.narrativeTitle}</Text>

            {focusQuest.source === 'user' && resolveQuestRiskLevel(focusQuest.riskLevel) !== 'standard' && (
              <Text style={[styles.riskFocusLine, { color: palette.fog }]}>
                {formatQuestRiskFocusLine(
                  resolveQuestRiskLevel(focusQuest.riskLevel),
                  activeUniverse.id,
                )}
              </Text>
            )}

            <View style={[styles.section, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.sectionLabel, { color: palette.gold }]}>{taskSectionLabel}</Text>
              <Text style={[styles.sectionBody, { color: palette.bone }]}>{focusQuest.originalTitle}</Text>
            </View>

            {hasQuestSupports && !isCompleted ? (
              <View style={[styles.supportsBlock, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.supportsLabel, { color: palette.gold }]}>QUEST SUPPORTS</Text>

                {focusQuest.starterTaskTitle && !showDecisiveStarter ? (
                  <View style={styles.supportItem}>
                    <Text style={[styles.supportItemLabel, { color: palette.fog }]}>Starter move</Text>
                    <Text style={[styles.supportItemBody, { color: palette.bone }]}>
                      {formatStarterMoveLine(focusQuest.starterTaskTitle, activeUniverse.id)}
                    </Text>
                  </View>
                ) : null}

                {focusQuest.implementationIntention ? (
                  <View style={styles.supportItem}>
                    <Text style={[styles.supportItemLabel, { color: palette.fog }]}>When / where plan</Text>
                    <Text style={[styles.supportItemBody, { color: palette.bone }]}>
                      {focusQuest.implementationIntention}
                    </Text>
                  </View>
                ) : null}

                {focusQuest.prepStepTitle ? (
                  <View style={styles.supportItem}>
                    <Text style={[styles.supportItemLabel, { color: palette.fog }]}>Prep step</Text>
                    <Text style={[styles.supportItemBody, { color: palette.bone }]}>
                      {formatPrepStepLine(focusQuest.prepStepTitle)}
                    </Text>
                  </View>
                ) : null}

                {hasRewardRitual ? (
                  <View style={styles.supportItem}>
                    <Text style={[styles.supportItemLabel, { color: palette.fog }]}>Reward ritual</Text>
                    <Text style={[styles.supportItemBody, { color: palette.bone }]}>
                      {focusQuest.afterQuestReward}
                    </Text>
                    <Text style={[styles.supportItemHint, { color: palette.fog }]}>
                      {rewardCopy.universeHint}
                    </Text>
                  </View>
                ) : null}
              </View>
            ) : null}
          </Animated.View>

          {!isCompleted && character && (
            <Animated.View
              entering={FadeInDown.duration(450).delay(220)}
              style={[styles.motivationCard, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
              <CharacterPortrait character={character} />
              <View style={styles.motivationBody}>
                <Text style={[styles.motivationBadge, { color: palette.gold }]}>{copy.motivationBadge}</Text>
                <Text style={[styles.motivationName, { color: palette.bone }]}>{character.name}</Text>
                <Text style={[styles.motivationLine, { color: palette.bone }]}>{motivationLine}</Text>
                <View style={[styles.identityInline, { borderColor: palette.panelBorder }]}>
                  <Text style={[styles.identityLabel, { color: palette.gold }]}>{copy.identityVoteLabel}</Text>
                  <Text style={[styles.identityVote, { color: palette.bone }]}>
                    {formatFocusIdentityVotePreview(trait.label)}
                  </Text>
                  <Text style={[styles.identityHint, { color: palette.fog }]}>{trait.encouragingLine}</Text>
                </View>
              </View>
            </Animated.View>
          )}

          {isCompleted && (
            <Animated.Text
              entering={FadeInDown.duration(450).delay(220)}
              style={[styles.completedHint, { color: palette.fog }]}>
              {copy.completedHint}
            </Animated.Text>
          )}

          {!isCompleted && (
            <Animated.View entering={FadeInDown.duration(450).delay(300)}>
              <CollapsibleSection
                title="Distraction shield"
                hint="Optional — what might pull you away?"
                expanded={shieldExpanded}
                onToggle={() => setShieldExpanded((open) => !open)}
                palette={palette}>
                <View style={styles.shieldOptions}>
                  {DISTRACTION_SHIELD_OPTIONS.map((option) => {
                    const selected = selectedDistraction === option.type;
                    return (
                      <Pressable
                        key={option.type}
                        onPress={() => handleSelectDistraction(option.type)}
                        style={[
                          styles.shieldChip,
                          {
                            borderColor: selected ? palette.gold : palette.panelBorder,
                            backgroundColor: selected ? palette.primary : palette.night,
                          },
                        ]}>
                        <Text style={[styles.shieldChipText, { color: selected ? palette.bone : palette.fog }]}>
                          {option.label}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {selectedDistraction ? (
                  <View style={[styles.shieldSuggestionBox, { borderColor: palette.gold, backgroundColor: `${palette.primary}44` }]}>
                    <Text style={[styles.shieldSuggestionLabel, { color: palette.gold }]}>TRY THIS SHIELD</Text>
                    <Text style={[styles.shieldSuggestionText, { color: palette.bone }]}>
                      {getDistractionShieldSuggestion(selectedDistraction)}
                    </Text>
                  </View>
                ) : (
                  <Text style={[styles.shieldHint, { color: palette.fog }]}>
                    Pick one if it helps — or leave this closed and begin.
                  </Text>
                )}
              </CollapsibleSection>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(450).delay(340)} style={styles.actions}>
            {!isCompleted && ritualActive && (
              <Animated.View
                key={`ritual-step-${ritualStep}`}
                entering={FadeInDown.duration(280)}
                style={[styles.ritualCard, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
                <Text style={[styles.ritualStepLabel, { color: palette.gold }]}>
                  STEP {ritualStep} / 3
                </Text>
                <Text style={[styles.ritualPrompt, { color: palette.bone }]}>{ritualStepPrompt}</Text>
                {ritualStepContent ? (
                  <Text style={[styles.ritualContent, { color: palette.fog }]}>{ritualStepContent}</Text>
                ) : (
                  <Text style={[styles.ritualBreath, { color: palette.fog }]}>
                    Take one breath. Then begin.
                  </Text>
                )}
                <Pressable
                  onPress={handleAdvanceRitual}
                  style={[styles.ritualAdvance, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                  <Text style={[styles.ritualAdvanceText, { color: palette.bone }]}>
                    {ritualAdvanceLabel}
                  </Text>
                </Pressable>
              </Animated.View>
            )}

            {!isCompleted && ritualComplete && (
              <Animated.Text entering={FadeIn.duration(250)} style={[styles.ritualReady, { color: palette.accent }]}>
                {ritualCopy.readyHint}
              </Animated.Text>
            )}

            {!isCompleted && ritualStep === 0 && (
              <Pressable
                onPress={handleStartRitual}
                style={[styles.ritualStart, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                <Text style={[styles.ritualStartText, { color: palette.bone }]}>
                  {ritualCopy.startButtonLabel}
                </Text>
              </Pressable>
            )}

            {!isCompleted && (
              <Animated.View style={completeWrapStyle}>
                <GlowButton
                  label={copy.completeLabel}
                  hint={
                    ritualComplete
                      ? 'You are ready to complete'
                      : 'Optional — skip the ritual anytime'
                  }
                  onPress={handleComplete}
                />
              </Animated.View>
            )}

            <Pressable onPress={closeQuestFocus} style={styles.exitLink}>
              <Text style={[styles.exitText, { color: palette.fog }]}>{copy.exitLabel}</Text>
            </Pressable>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: GameLayout.modalVerticalPadding,
    paddingBottom: GameLayout.modalVerticalPadding + 24,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 3 },
  exitTop: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  tagline: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  decisiveCard: {
    borderWidth: 2,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  decisiveLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
  },
  decisivePrompt: {
    fontFamily: GameFonts.ui,
    fontSize: 15,
    lineHeight: 22,
    letterSpacing: 0.3,
    fontStyle: 'italic',
  },
  decisiveBody: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
  },
  questCard: {
    borderWidth: 2,
    padding: 18,
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  sourceLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  clearedStamp: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2 },
  narrativeTitle: {
    fontFamily: GameFonts.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 0.5,
  },
  riskFocusLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.5,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  section: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 4,
  },
  sectionLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  sectionBody: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
    lineHeight: 20,
  },
  supportsBlock: {
    borderTopWidth: 1,
    paddingTop: 10,
    gap: 10,
  },
  supportsLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  supportItem: { gap: 3 },
  supportItemLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  supportItemBody: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  supportItemHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  motivationCard: {
    borderWidth: 1,
    padding: 16,
    flexDirection: 'row',
    gap: 14,
    alignItems: 'flex-start',
    transform: [{ skewX: '-2deg' }],
  },
  motivationBody: { flex: 1, gap: 6, minWidth: 0 },
  motivationBadge: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  motivationName: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  motivationLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  identityInline: {
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
    gap: 4,
  },
  identityLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  identityVote: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 1.5 },
  identityHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  completedHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  shieldOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shieldChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-2deg' }],
  },
  shieldChipText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
  },
  shieldSuggestionBox: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    marginTop: 2,
  },
  shieldSuggestionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  shieldSuggestionText: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  shieldHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  actions: { gap: 12, marginTop: 4 },
  ritualStart: {
    borderWidth: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  ritualStartText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 2,
  },
  ritualCard: {
    borderWidth: 1,
    padding: 16,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  ritualStepLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  ritualPrompt: {
    fontFamily: GameFonts.ui,
    fontSize: 16,
    letterSpacing: 0.5,
    lineHeight: 22,
  },
  ritualContent: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  ritualBreath: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  ritualAdvance: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    marginTop: 4,
    transform: [{ skewX: '-4deg' }],
  },
  ritualAdvanceText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 2,
  },
  ritualReady: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  exitLink: { alignItems: 'center', paddingVertical: 8 },
  exitText: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 2 },
});
