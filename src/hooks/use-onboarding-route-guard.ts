import { type Href, router } from 'expo-router';
import { useEffect, useState } from 'react';

import { useGame } from '@/hooks/use-game';
import {
  getOnboardingResumeHref,
  resolveOnboardingStep,
  shouldRedirectOnboardingRoute,
} from '@/lib/onboarding-flow';
import type { OnboardingStepId } from '@/types/narrative';

/**
 * Ensures onboarding routes stay on the canonical path after refresh or deep links.
 * Allows back navigation to earlier steps; redirects only when ahead of saved progress.
 */
export function useOnboardingRouteGuard(step: OnboardingStepId): boolean {
  const { isHydrated, hasOnboarded, playerProgress } = useGame();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!isHydrated) {
      setReady(false);
      return;
    }

    if (hasOnboarded) {
      router.replace('/(game)/hq' as Href);
      setReady(false);
      return;
    }

    const resumeStep = resolveOnboardingStep(playerProgress);
    if (shouldRedirectOnboardingRoute(step, resumeStep)) {
      router.replace(getOnboardingResumeHref(playerProgress));
      setReady(false);
      return;
    }

    setReady(true);
  }, [hasOnboarded, isHydrated, playerProgress, step]);

  return ready;
}
