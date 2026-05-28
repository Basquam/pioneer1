import type { NarrativeCharacter, RelationshipTier } from '@/types/narrative';

import { affinityToTier, tierLabel } from './narrative-helpers';

export const AFFINITY_TIER_THRESHOLDS: Record<Exclude<RelationshipTier, 'distant'>, number> = {
  warming: 2,
  trusted: 6,
  bonded: 12,
};

export function getCharacterAffinityLabel(character: NarrativeCharacter): string {
  if (character.affinityLabel) return character.affinityLabel;
  if (character.isVillain) return 'Pressure';
  return 'Affinity';
}

export type RelationshipProgress = {
  affinity: number;
  tier: RelationshipTier;
  progress: number;
  tierFloor: number;
  tierCeiling: number;
};

export function getRelationshipProgress(affinity: number): RelationshipProgress {
  const tier = affinityToTier(affinity);

  if (tier === 'bonded') {
    return {
      affinity,
      tier,
      progress: 1,
      tierFloor: AFFINITY_TIER_THRESHOLDS.bonded,
      tierCeiling: AFFINITY_TIER_THRESHOLDS.bonded,
    };
  }

  const tierFloor = tier === 'distant' ? 0 : AFFINITY_TIER_THRESHOLDS[tier];
  const tierCeiling =
    tier === 'distant'
      ? AFFINITY_TIER_THRESHOLDS.warming
      : tier === 'warming'
        ? AFFINITY_TIER_THRESHOLDS.trusted
        : AFFINITY_TIER_THRESHOLDS.bonded;
  const span = tierCeiling - tierFloor;
  const progress = span > 0 ? Math.min(1, Math.max(0, (affinity - tierFloor) / span)) : 0;

  return { affinity, tier, progress, tierFloor, tierCeiling };
}

export function getNextTierHint(affinity: number, affinityLabel: string): string {
  const tier = affinityToTier(affinity);

  if (tier === 'bonded') {
    return `Peak ${affinityLabel.toLowerCase()} reached.`;
  }

  const nextThreshold =
    tier === 'distant'
      ? AFFINITY_TIER_THRESHOLDS.warming
      : tier === 'warming'
        ? AFFINITY_TIER_THRESHOLDS.trusted
        : AFFINITY_TIER_THRESHOLDS.bonded;
  const nextTier =
    tier === 'distant' ? 'warming' : tier === 'warming' ? 'trusted' : 'bonded';
  const remaining = Math.max(1, nextThreshold - affinity);

  return `${remaining} more ${affinityLabel.toLowerCase()} to reach ${tierLabel(nextTier)}`;
}

export function formatAffinityGain(character: NarrativeCharacter, amount = 1): string {
  const label = getCharacterAffinityLabel(character);
  const shortName = character.name.replace(/^(Sheriff|Station Master)\s+/i, '');
  return `+${amount} ${shortName} ${label.toLowerCase()}`;
}

export function formatRelationshipHeader(character: NarrativeCharacter, tier: RelationshipTier): string {
  return `${getCharacterAffinityLabel(character).toUpperCase()} · ${tierLabel(tier)}`;
}
