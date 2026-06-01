import { type Href, router } from 'expo-router';
import { useEffect } from 'react';

import { OnboardingWelcomeScreen } from '@/components/screens/onboarding-welcome-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';
import { useGame } from '@/hooks/use-game';
import { getOnboardingResumeHref } from '@/lib/onboarding-flow';

export default function OnboardingWelcomeRoute() {
  const { hasOnboarded, playerProgress, isHydrated } = useGame();
  const ready = useOnboardingRouteGuard('welcome');

  useEffect(() => {
    if (!isHydrated) return;
    if (hasOnboarded) {
      router.replace('/(game)/hq' as Href);
    }
  }, [hasOnboarded, isHydrated]);

  useEffect(() => {
    if (!isHydrated || hasOnboarded || !ready) return;
    const target = getOnboardingResumeHref(playerProgress);
    if (target !== '/onboarding') {
      router.replace(target);
    }
  }, [hasOnboarded, isHydrated, playerProgress, ready]);

  if (!isHydrated || !ready || hasOnboarded) {
    return null;
  }

  if (getOnboardingResumeHref(playerProgress) !== '/onboarding') {
    return null;
  }

  return <OnboardingWelcomeScreen />;
}
