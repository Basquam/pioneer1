import { OnboardingThemeScreen } from '@/components/screens/onboarding-theme-screen';
import { useOnboardingRouteGuard } from '@/hooks/use-onboarding-route-guard';

export default function OnboardingThemeRoute() {
  const ready = useOnboardingRouteGuard('theme');
  if (!ready) return null;
  return <OnboardingThemeScreen />;
}
