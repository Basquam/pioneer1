import { OnboardingFirstQuestScreen } from '@/components/screens/onboarding-first-quest-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';

export default function OnboardingFirstQuestRoute() {
  const ready = useOnboardingRouteGuard('first-quest');
  if (!ready) return null;
  return <OnboardingFirstQuestScreen />;
}
