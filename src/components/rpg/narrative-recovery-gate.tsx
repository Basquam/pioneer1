import type { ReactNode } from 'react';

import { StoryRecoveryScreen } from '@/components/screens/story-recovery-screen';
import { useGame } from '@/hooks/use-game';

type NarrativeRecoveryGateProps = {
  children: ReactNode;
};

export function NarrativeRecoveryGate({ children }: NarrativeRecoveryGateProps) {
  const { narrativeStateValid, isHydrated } = useGame();

  if (!isHydrated) {
    return null;
  }

  if (!narrativeStateValid) {
    return <StoryRecoveryScreen />;
  }

  return children;
}
