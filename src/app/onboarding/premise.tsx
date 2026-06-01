import { OnboardingPremiseScreen } from '@/components/screens/onboarding-premise-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';

export default function OnboardingPremiseRoute() {
  const ready = useOnboardingRouteGuard('premise');
  if (!ready) return null;
  return <OnboardingPremiseScreen />;
}
