import { type Href, router } from 'expo-router';
import { useEffect } from 'react';

import { OnboardingWelcomeScreen } from '@/components/screens/onboarding-welcome-screen';
import { useGame } from '@/hooks/use-game';
import { getOnboardingResumeHref } from '@/lib/onboarding-flow';

export default function OnboardingWelcomeRoute() {
  const { hasOnboarded, playerProgress, isHydrated } = useGame();

  useEffect(() => {
    if (!isHydrated) return;
    const target = getOnboardingResumeHref(playerProgress);
    if (hasOnboarded) {
      router.replace('/(game)/hq' as Href);
      return;
    }
    if (target !== '/onboarding') {
      router.replace(target);
    }
  }, [hasOnboarded, isHydrated, playerProgress]);

  if (!isHydrated || getOnboardingResumeHref(playerProgress) !== '/onboarding') {
    return null;
  }

  return <OnboardingWelcomeScreen />;
}
