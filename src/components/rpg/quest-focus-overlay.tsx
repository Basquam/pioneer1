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
import { formatStarterMoveLine } from '@/lib/two-minute-starter';

type RitualStep = 0 | 1 | 2 | 3 | 4;

export function QuestFocusOverlay() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    focusQuest,
    closeQuestFocus,
    completeQuest,
  } = useGame();
  const { palette } = activeUniverse;
  const copy = getQuestFocusCopy(activeUniverse.id);
  const ritualCopy = getQuestStartRitualCopy(activeUniverse.id);
  const [ritualStep, setRitualStep] = useState<RitualStep>(0);
  const completePulse = useSharedValue(1);
  const ritualComplete = ritualStep === 4;

  useEffect(() => {
    setRitualStep(0);
    completePulse.value = 1;
  }, [focusQuest?.id, completePulse]);

  const completeWrapStyle = useAnimatedStyle(() => ({
    transform: [{ scale: completePulse.value }],
    opacity: ritualComplete ? 1 : 0.72,
  }));

  // #region agent log
  fetch('http://127.0.0.1:7741/ingest/fadf9cf1-36c7-4082-8b2c-abc1a1998bfb', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': 'b770d9' },
    body: JSON.stringify({
      sessionId: 'b770d9',
      runId: 'hooks-fix',
      hypothesisId: 'A',
      location: 'quest-focus-overlay.tsx:render',
      message: 'QuestFocusOverlay render after all hooks',
      data: {
        hasFocusQuest: focusQuest != null,
        focusQuestId: focusQuest?.id ?? null,
        ritualStep,
        hookCountStable: true,
      },
      timestamp: Date.now(),
    }),
  }).catch(() => {});
  // #endregion

  if (!focusQuest) return null;

  const isCompleted = focusQuest.completed;
  const ritualActive = ritualStep >= 1 && ritualStep <= 3;
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

            <View style={[styles.section, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.sectionLabel, { color: palette.gold }]}>{taskSectionLabel}</Text>
              <Text style={[styles.sectionBody, { color: palette.bone }]}>{focusQuest.originalTitle}</Text>
            </View>

            {focusQuest.starterTaskTitle ? (
              <View style={[styles.section, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.sectionLabel, { color: palette.gold }]}>STARTER MOVE</Text>
                <Text style={[styles.sectionBody, { color: palette.bone }]}>
                  {formatStarterMoveLine(focusQuest.starterTaskTitle, activeUniverse.id)}
                </Text>
              </View>
            ) : null}

            {focusQuest.implementationIntention ? (
              <View style={[styles.section, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.sectionLabel, { color: palette.gold }]}>PLAN</Text>
                <Text style={[styles.sectionBody, { color: palette.bone }]}>
                  {focusQuest.implementationIntention}
                </Text>
              </View>
            ) : null}

            {focusQuest.prepStepTitle ? (
              <View style={[styles.section, { borderColor: palette.panelBorder }]}>
                <Text style={[styles.sectionLabel, { color: palette.gold }]}>PREP</Text>
                <Text style={[styles.sectionBody, { color: palette.bone }]}>
                  {formatPrepStepLine(focusQuest.prepStepTitle)}
                </Text>
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
              </View>
            </Animated.View>
          )}

          {!isCompleted && (
            <Animated.View
              entering={FadeInDown.duration(450).delay(280)}
              style={[styles.identityCard, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.identityLabel, { color: palette.gold }]}>{copy.identityVoteLabel}</Text>
              <Text style={[styles.identityVote, { color: palette.bone }]}>
                {formatFocusIdentityVotePreview(trait.label)}
              </Text>
              <Text style={[styles.identityHint, { color: palette.fog }]}>{trait.encouragingLine}</Text>
            </Animated.View>
          )}

          {isCompleted && (
            <Animated.Text
              entering={FadeInDown.duration(450).delay(220)}
              style={[styles.completedHint, { color: palette.fog }]}>
              {copy.completedHint}
            </Animated.Text>
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
  identityCard: {
    borderWidth: 1,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  identityLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  identityVote: { fontFamily: GameFonts.ui, fontSize: 22, letterSpacing: 2 },
  identityHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.3,
    lineHeight: 15,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  completedHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingHorizontal: 8,
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
