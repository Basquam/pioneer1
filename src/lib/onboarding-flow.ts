import type { Href } from 'expo-router';

import type { OnboardingStepId, PlayerProgress } from '@/types/narrative';

export const ONBOARDING_FIRST_QUEST_PLACEHOLDERS = [
  'Clean my desk',
  'Study for 20 minutes',
  'Reply to one email',
  'Drink water',
] as const;

export const ONBOARDING_FIRST_QUEST_INSIGHT =
  'Every completed quest moves the story and becomes evidence of who you are becoming.';

/** Canonical first-run onboarding screens in order. */
export const CANONICAL_ONBOARDING_STEPS: readonly OnboardingStepId[] = [
  'welcome',
  'premise',
  'theme',
  'saga',
  'suite',
  'first-quest',
] as const;

export const ONBOARDING_STEP_HREF: Record<OnboardingStepId, Href> = {
  welcome: '/onboarding',
  premise: '/onboarding/premise',
  theme: '/onboarding/theme',
  saga: '/onboarding/saga',
  suite: '/onboarding/suite',
  'first-quest': '/onboarding/first-quest',
};

export const LEGACY_ONBOARDING_ROUTES = ['compass', 'style', 'intro'] as const;

export type LegacyOnboardingRoute = (typeof LEGACY_ONBOARDING_ROUTES)[number];

const STEP_ORDER: Record<OnboardingStepId, number> = {
  welcome: 0,
  premise: 1,
  theme: 2,
  saga: 3,
  suite: 4,
  'first-quest': 5,
};

export function getOnboardingStepOrder(step: OnboardingStepId): number {
  return STEP_ORDER[step];
}

export function isLegacyOnboardingRoute(route: string): route is LegacyOnboardingRoute {
  return (LEGACY_ONBOARDING_ROUTES as readonly string[]).includes(route);
}

export function sanitizeOnboardingStep(raw: unknown): OnboardingStepId | undefined {
  if (
    raw === 'welcome' ||
    raw === 'premise' ||
    raw === 'theme' ||
    raw === 'saga' ||
    raw === 'suite' ||
    raw === 'first-quest'
  ) {
    return raw;
  }
  return undefined;
}

export function findOnboardingFirstQuest(progress: Pick<PlayerProgress, 'userQuests' | 'hasOnboarded'>) {
  if (progress.hasOnboarded) return null;
  return progress.userQuests.find((quest) => !quest.isCompleted) ?? null;
}

export function inferOnboardingStep(progress: PlayerProgress): OnboardingStepId {
  if (findOnboardingFirstQuest(progress) || progress.onboardingSuiteComplete) {
    return 'first-quest';
  }
  return 'welcome';
}

export function resolveOnboardingStep(progress: PlayerProgress): OnboardingStepId {
  const inferred = inferOnboardingStep(progress);
  const recorded = progress.onboardingStep;
  if (!recorded) return inferred;

  return getOnboardingStepOrder(recorded) >= getOnboardingStepOrder(inferred) ? recorded : inferred;
}

export function shouldAdvanceOnboardingStep(
  current: OnboardingStepId | undefined,
  next: OnboardingStepId,
): boolean {
  if (!current) return true;
  return getOnboardingStepOrder(next) > getOnboardingStepOrder(current);
}

export function shouldRedirectOnboardingRoute(
  currentStep: OnboardingStepId,
  resumeStep: OnboardingStepId,
): boolean {
  return getOnboardingStepOrder(currentStep) > getOnboardingStepOrder(resumeStep);
}

/** Resume target for splash, welcome, and legacy redirects. */
export function getOnboardingResumeHref(progress: PlayerProgress): Href {
  if (progress.hasOnboarded) {
    return '/(game)/hq' as Href;
  }

  const completedFirstQuest =
    progress.userQuests.some((quest) => quest.isCompleted) && !findOnboardingFirstQuest(progress);
  if (completedFirstQuest) {
    return '/(game)/hq' as Href;
  }

  const step = resolveOnboardingStep(progress);
  return ONBOARDING_STEP_HREF[step];
}

/** Legacy compass/style/intro routes redirect into the canonical flow. */
export function getLegacyOnboardingRedirectHref(progress: PlayerProgress): Href {
  return getOnboardingResumeHref(progress);
}
