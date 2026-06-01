import { OnboardingSagaScreen } from '@/components/screens/onboarding-saga-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';

export default function OnboardingSagaRoute() {
  const ready = useOnboardingRouteGuard('saga');
  if (!ready) return null;
  return <OnboardingSagaScreen />;
}
