import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { MascotGuideFromContext } from '@/components/rpg/mascot-guide-card';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestorySectionHeader } from '@/components/ui/questory-section-header';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { getQuestSuiteById, resolveAddQuestSuitePrefill } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import { QuestoryTypography } from '@/theme/typography';
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
          <QuestorySectionHeader eyebrow="FIRST QUEST" title="NAME ONE REAL TASK" />
        </Animated.View>

        <Text style={[QuestoryTypography.flavor, { color: palette.fog, marginTop: -4 }]}>
          Small is fine. Vague is fine. You can always complete it.
        </Text>

        <MascotGuideFromContext
          contextId={createdQuest ? 'after_first_quest_created' : 'onboarding_first_quest'}
          screenName="/onboarding/first-quest"
        />

        {!createdQuest ? (
          <>
            <QuestoryCard contentStyle={styles.inputCard}>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder={placeholder}
                placeholderTextColor={`${palette.fog}88`}
                autoFocus
                returnKeyType="done"
                onSubmitEditing={() => {
                  if (trimmedTitle && !createdQuest) handleCreate();
                }}
                style={[
                  styles.input,
                  { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.ink },
                ]}
              />
            </QuestoryCard>

            {trimmedTitle && categoryMeta ? (
              <QuestoryCard contentStyle={styles.suggestionCard}>
                <QuestoryStatusPill label="SUGGESTED" tone="accent" />
                <Text style={[QuestoryTypography.bodySmall, { color: palette.bone }]}>
                  {categoryMeta.realWorldLabel}
                  {suiteMeta ? ` · ${suiteMeta.shortLabel}` : ''}
                </Text>
              </QuestoryCard>
            ) : null}
          </>
        ) : (
          <QuestoryCard variant="elevated" contentStyle={styles.createdCard}>
            <QuestoryStatusPill label="YOUR TASK" tone="muted" />
            <Text style={[QuestoryTypography.body, { color: palette.bone }]}>{createdQuest.originalTitle}</Text>
            <View style={[styles.divider, { backgroundColor: palette.panelBorder }]} />
            <QuestoryStatusPill label="YOUR QUEST" tone="accent" />
            <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 22, lineHeight: 28 }]}>
              {createdQuest.narrativeTitle}
            </Text>
            <Text style={[QuestoryTypography.flavor, { color: palette.fog }]}>
              {createdQuest.narrativeDescription}
            </Text>
          </QuestoryCard>
        )}
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  inputCard: { gap: 0, padding: 0, paddingLeft: 0 },
  input: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontFamily: GameFonts.ui,
    fontSize: 16,
    lineHeight: 22,
  },
  suggestionCard: { gap: 8 },
  createdCard: { gap: 8 },
  divider: { height: 1, marginVertical: 4 },
});
