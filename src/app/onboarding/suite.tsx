import { OnboardingSuiteScreen } from '@/components/screens/onboarding-suite-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';

export default function OnboardingSuiteRoute() {
  const ready = useOnboardingRouteGuard('suite');
  if (!ready) return null;
  return <OnboardingSuiteScreen />;
}
