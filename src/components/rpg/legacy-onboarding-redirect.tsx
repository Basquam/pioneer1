import { Redirect, type Href } from 'expo-router';

import { useGame } from '@/hooks/use-game';
import { getLegacyOnboardingRedirectHref } from '@/lib/onboarding-flow';

/** Legacy onboarding routes redirect into the canonical first-run flow. */
export function LegacyOnboardingRedirect() {
  const { playerProgress, isHydrated, hasOnboarded } = useGame();

  if (!isHydrated) {
    return null;
  }

  if (hasOnboarded) {
    return <Redirect href={'/(game)/hq' as Href} />;
  }

  return <Redirect href={getLegacyOnboardingRedirectHref(playerProgress)} />;
}
