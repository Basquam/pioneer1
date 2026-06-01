import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { CoachMascotTip } from '@/components/rpg/coach-mascot-tip';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { getQuestSuiteById, resolveAddQuestSuitePrefill } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { ONBOARDING_FIRST_QUEST_PLACEHOLDERS } from '@/lib/onboarding-flow';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import { suggestTaskCategory } from '@/lib/suggest-task-category';
import type { UserQuest } from '@/types/narrative';

export function OnboardingFirstQuestScreen() {
  const {
    activeUniverse,
    playerProgress,
    createOnboardingFirstQuest,
    beginOnboardingFirstQuestFocus,
    onboardingFirstQuest,
  } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');
  const [createdQuest, setCreatedQuest] = useState<UserQuest | null>(onboardingFirstQuest);
  const [placeholderIndex] = useState(() =>
    Math.floor(Math.random() * ONBOARDING_FIRST_QUEST_PLACEHOLDERS.length),
  );

  const trimmedTitle = title.trim();
  const suggestedCategory = useMemo(
    () => (trimmedTitle ? suggestTaskCategory(trimmedTitle) : null),
    [trimmedTitle],
  );
  const suggestedSuiteId = useMemo(
    () =>
      resolveAddQuestSuitePrefill({
        category: suggestedCategory,
        activeSuiteId: playerProgress.activeSuiteId,
        title: trimmedTitle,
      }),
    [playerProgress.activeSuiteId, suggestedCategory, trimmedTitle],
  );
  const categoryMeta = suggestedCategory ? getTaskCategoryMeta(suggestedCategory) : null;
  const suiteMeta = suggestedSuiteId ? getQuestSuiteById(suggestedSuiteId) : null;

  useEffect(() => {
    if (onboardingFirstQuest) {
      setCreatedQuest(onboardingFirstQuest);
    }
  }, [onboardingFirstQuest]);

  useEffect(() => {
    if (onboardingFirstQuest?.isCompleted) {
      router.replace('/(game)/hq' as Href);
    }
  }, [onboardingFirstQuest?.isCompleted]);

  const handleCreate = () => {
    if (!trimmedTitle || createdQuest) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const quest = createOnboardingFirstQuest(trimmedTitle);
    if (quest) {
      setCreatedQuest(quest);
    }
  };

  const handleStartFocus = () => {
    if (!createdQuest) return;
    beginOnboardingFirstQuestFocus(createdQuest.id);
    router.replace('/(game)/hq' as Href);
  };

  const placeholder = ONBOARDING_FIRST_QUEST_PLACEHOLDERS[placeholderIndex] ?? ONBOARDING_FIRST_QUEST_PLACEHOLDERS[0];

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          createdQuest ? (
            <GlowButton label="START FOCUS" hint="BEGIN YOUR FIRST QUEST" onPress={handleStartFocus} />
          ) : (
            <GlowButton
              label="CREATE QUEST"
              hint={trimmedTitle ? 'WEAVE IT INTO THE SAGA' : 'Enter a small real task'}
              onPress={handleCreate}
            />
          )
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader
            eyebrow="FIRST QUEST"
            title="TURN ONE REAL TASK INTO YOUR FIRST QUEST"
          />
        </Animated.View>

        <Text style={[styles.subtitle, { color: palette.fog }]}>
          Keep it small. One visible move is enough.
        </Text>

        <CoachMascotTip context={{ kind: 'onboarding-first-quest' }} />

        {!createdQuest ? (
          <>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={placeholder}
              placeholderTextColor={`${palette.fog}88`}
              autoFocus
              style={[
                styles.input,
                { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.panel },
              ]}
            />

            {trimmedTitle && categoryMeta ? (
              <View style={[styles.suggestionBox, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
                <Text style={[styles.suggestionLabel, { color: palette.gold }]}>SUGGESTED</Text>
                <Text style={[styles.suggestionLine, { color: palette.bone }]}>
                  {categoryMeta.realWorldLabel}
                  {suiteMeta ? ` · ${suiteMeta.shortLabel}` : ''}
                </Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={[styles.createdCard, { borderColor: palette.gold, backgroundColor: palette.panel }]}>
            <Text style={[styles.realLabel, { color: palette.accent }]}>YOUR TASK</Text>
            <Text style={[styles.realTask, { color: palette.bone }]}>{createdQuest.originalTitle}</Text>
            <View style={[styles.divider, { backgroundColor: palette.panelBorder }]} />
            <Text style={[styles.narrativeLabel, { color: palette.gold }]}>YOUR QUEST</Text>
            <Text style={[styles.narrativeTitle, { color: palette.bone }]}>{createdQuest.narrativeTitle}</Text>
            <Text style={[styles.narrativeDescription, { color: palette.fog }]}>
              {createdQuest.narrativeDescription}
            </Text>
          </View>
        )}
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: -4,
  },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: GameFonts.ui,
    fontSize: 16,
    lineHeight: 22,
    transform: [{ skewX: '-2deg' }],
  },
  suggestionBox: {
    borderWidth: 1,
    padding: 10,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  suggestionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  suggestionLine: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 0.3,
  },
  createdCard: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 15, lineHeight: 21 },
  divider: { height: 1, marginVertical: 4 },
  narrativeLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  narrativeTitle: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28 },
  narrativeDescription: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
});
