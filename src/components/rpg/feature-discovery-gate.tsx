import type { ReactNode } from 'react';

import { FeatureDiscoveryTeaser } from '@/components/rpg/feature-discovery-badge';
import {
  getFeatureUnlockTeaser,
  isFeatureUnlocked,
  isGuidedFeatureDiscoveryActive,
} from '@/lib/feature-discovery';
import type { FeatureDiscoveryKey, PlayerProgress } from '@/types/narrative';

type FeatureDiscoveryGateProps = {
  progress: PlayerProgress;
  feature: FeatureDiscoveryKey;
  palette: { fog: string; panelBorder: string; panel: string };
  children: ReactNode;
};

export function FeatureDiscoveryGate({
  progress,
  feature,
  palette,
  children,
}: FeatureDiscoveryGateProps) {
  if (isFeatureUnlocked(progress, feature)) {
    return children;
  }

  if (!isGuidedFeatureDiscoveryActive(progress)) {
    return children;
  }

  return <FeatureDiscoveryTeaser message={getFeatureUnlockTeaser(feature)} palette={palette} />;
}
