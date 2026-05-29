import {
  getIdentityTraitMeta,
  IDENTITY_TRAIT_KEYS,
  type IdentityTraitMeta,
} from '@/lib/identity-votes';
import type { IdentityTraitKey, IdentityVotes } from '@/types/narrative';

export type IdentityMilestoneTierId =
  | 'spark'
  | 'emerging'
  | 'proven'
  | 'embodied'
  | 'legendary';

export type IdentityMilestoneTier = {
  id: IdentityMilestoneTierId;
  label: string;
  threshold: number;
};

export const IDENTITY_MILESTONE_TIERS: IdentityMilestoneTier[] = [
  { id: 'spark', label: 'Spark', threshold: 1 },
  { id: 'emerging', label: 'Emerging', threshold: 5 },
  { id: 'proven', label: 'Proven', threshold: 15 },
  { id: 'embodied', label: 'Embodied', threshold: 30 },
  { id: 'legendary', label: 'Legendary', threshold: 60 },
];

const UNIVERSE_MILESTONE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Another mark on the badge.',
  neuronet: 'Another signal in your identity.',
  'neon-ashes': 'Another clue in the case of who you are.',
};

export type TraitBecomingProgress = {
  trait: IdentityTraitMeta;
  voteCount: number;
  currentTier: IdentityMilestoneTier | null;
  nextTier: IdentityMilestoneTier | null;
  progressToNext: number;
  votesToNext: number | null;
  identitySentence: string;
};

export type IdentityMilestoneUnlock = {
  traitLabel: string;
  tierLabel: string;
  headline: string;
  universeFlavorLine: string;
};

export function getMilestoneTierForVotes(voteCount: number): IdentityMilestoneTier | null {
  if (voteCount < 1) return null;

  let current: IdentityMilestoneTier | null = null;
  for (const tier of IDENTITY_MILESTONE_TIERS) {
    if (voteCount >= tier.threshold) {
      current = tier;
    }
  }
  return current;
}

export function getNextMilestoneTier(voteCount: number): IdentityMilestoneTier | null {
  for (const tier of IDENTITY_MILESTONE_TIERS) {
    if (voteCount < tier.threshold) {
      return tier;
    }
  }
  return null;
}

export function detectIdentityMilestoneUnlock(
  previousVotes: number,
  newVotes: number,
): IdentityMilestoneTier | null {
  const previousTier = getMilestoneTierForVotes(previousVotes);
  const newTier = getMilestoneTierForVotes(newVotes);
  if (!newTier) return null;
  if (!previousTier || newTier.threshold > previousTier.threshold) {
    return newTier;
  }
  return null;
}

export function formatMilestoneHeadline(traitLabel: string, tierLabel: string): string {
  return `${traitLabel} · ${tierLabel}`;
}

export function getUniverseMilestoneFlavorLine(universeId: string): string {
  return UNIVERSE_MILESTONE_FLAVOR[universeId] ?? UNIVERSE_MILESTONE_FLAVOR['dust-and-iron'];
}

export function buildIdentityMilestoneUnlock(
  traitKey: IdentityTraitKey,
  tier: IdentityMilestoneTier,
  universeId: string,
): IdentityMilestoneUnlock {
  const trait = getIdentityTraitMeta(traitKey);
  return {
    traitLabel: trait.label,
    tierLabel: tier.label,
    headline: formatMilestoneHeadline(trait.label, tier.label),
    universeFlavorLine: getUniverseMilestoneFlavorLine(universeId),
  };
}

export function getTraitBecomingProgress(
  traitKey: IdentityTraitKey,
  voteCount: number,
): TraitBecomingProgress {
  const trait = getIdentityTraitMeta(traitKey);
  const currentTier = getMilestoneTierForVotes(voteCount);
  const nextTier = getNextMilestoneTier(voteCount);

  if (!nextTier) {
    return {
      trait,
      voteCount,
      currentTier,
      nextTier: null,
      progressToNext: currentTier ? 1 : 0,
      votesToNext: null,
      identitySentence: trait.encouragingLine,
    };
  }

  const previousThreshold = currentTier?.threshold ?? 0;
  const span = nextTier.threshold - previousThreshold;
  const progress = span > 0 ? Math.min(1, (voteCount - previousThreshold) / span) : 0;

  return {
    trait,
    voteCount,
    currentTier,
    nextTier,
    progressToNext: progress,
    votesToNext: Math.max(0, nextTier.threshold - voteCount),
    identitySentence: trait.encouragingLine,
  };
}

export function getAllTraitBecomingProgress(votes: IdentityVotes): TraitBecomingProgress[] {
  return IDENTITY_TRAIT_KEYS.map((key) => getTraitBecomingProgress(key, votes[key] ?? 0));
}

export function formatNextMilestoneLabel(progress: TraitBecomingProgress): string {
  if (!progress.nextTier) {
    return progress.currentTier ? `${progress.currentTier.label} — max tier` : 'Complete a quest to begin';
  }

  if (!progress.currentTier) {
    return `${progress.votesToNext ?? 0} to ${progress.nextTier.label}`;
  }

  return `${progress.votesToNext ?? 0} to ${progress.nextTier.label}`;
}
