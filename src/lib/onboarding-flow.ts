import type { Href } from 'expo-router';

import type { PlayerProgress } from '@/types/narrative';

export const ONBOARDING_FIRST_QUEST_PLACEHOLDERS = [
  'Clean my desk',
  'Study for 20 minutes',
  'Reply to one email',
  'Drink water',
] as const;

export const ONBOARDING_FIRST_QUEST_INSIGHT =
  'Every completed quest moves the story and becomes evidence of who you are becoming.';

export function getOnboardingResumeHref(progress: PlayerProgress): Href {
  if (progress.hasOnboarded) {
    return '/(game)/hq' as Href;
  }

  const hasIncompleteOnboardingQuest = progress.userQuests.some((quest) => !quest.isCompleted);
  if (hasIncompleteOnboardingQuest || progress.onboardingSuiteComplete) {
    return '/onboarding/first-quest' as Href;
  }

  return '/onboarding' as Href;
}
