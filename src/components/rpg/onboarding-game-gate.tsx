import { type Href, router, usePathname } from 'expo-router';
import { useEffect, type ReactNode } from 'react';

import { useGame } from '@/hooks/use-game';
import { getOnboardingResumeHref } from '@/lib/onboarding-flow';

/** Keeps non-HQ game tabs behind onboarding until the first-run flow completes. */
export function OnboardingGameGate({ children }: { children: ReactNode }) {
  const { isHydrated, hasOnboarded, playerProgress } = useGame();
  const pathname = usePathname();

  useEffect(() => {
    if (!isHydrated || hasOnboarded) return;

    const onHqRoute = pathname.includes('/hq');
    if (onHqRoute) return;

    router.replace(getOnboardingResumeHref(playerProgress));
  }, [hasOnboarded, isHydrated, pathname, playerProgress]);

  return children;
}
