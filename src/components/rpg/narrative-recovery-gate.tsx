import type { ReactNode } from 'react';
import { View } from 'react-native';

import { StoryRecoveryScreen } from '@/components/screens/story-recovery-screen';
import { useGame } from '@/hooks/use-game';

type NarrativeRecoveryGateProps = {
  children: ReactNode;
};

export function NarrativeRecoveryGate({ children }: NarrativeRecoveryGateProps) {
  const { narrativeStateValid, isHydrated } = useGame();

  if (!isHydrated) {
    return <View style={{ flex: 1, backgroundColor: '#050308' }} />;
  }

  if (!narrativeStateValid) {
    return <StoryRecoveryScreen />;
  }

  return children;
}
