import type { IdentityTraitKey, IdentityVotes, TaskCategory } from '@/types/narrative';

export const IDENTITY_TRAIT_KEYS: IdentityTraitKey[] = [
  'organized',
  'resilient',
  'curious',
  'reliable',
  'selfRespecting',
  'connected',
  'builder',
  'prepared',
];

export const CATEGORY_TO_IDENTITY_TRAIT: Record<TaskCategory, IdentityTraitKey> = {
  cleaning: 'organized',
  fitness: 'resilient',
  study: 'curious',
  work: 'reliable',
  health: 'selfRespecting',
  social: 'connected',
  creative: 'builder',
  errand: 'prepared',
};

export type IdentityTraitMeta = {
  key: IdentityTraitKey;
  label: string;
  encouragingLine: string;
};

export const IDENTITY_TRAIT_META: Record<IdentityTraitKey, IdentityTraitMeta> = {
  organized: {
    key: 'organized',
    label: 'Organized',
    encouragingLine: 'You create order when life gets noisy.',
  },
  resilient: {
    key: 'resilient',
    label: 'Resilient',
    encouragingLine: 'You keep going when the trail gets rough.',
  },
  curious: {
    key: 'curious',
    label: 'Curious',
    encouragingLine: 'You keep gathering knowledge.',
  },
  reliable: {
    key: 'reliable',
    label: 'Reliable',
    encouragingLine: 'You show up when the mission needs you.',
  },
  selfRespecting: {
    key: 'selfRespecting',
    label: 'Self-Respecting',
    encouragingLine: 'You protect the energy you need.',
  },
  connected: {
    key: 'connected',
    label: 'Connected',
    encouragingLine: 'You stay woven into your people.',
  },
  builder: {
    key: 'builder',
    label: 'Builder',
    encouragingLine: 'You make things that were not there before.',
  },
  prepared: {
    key: 'prepared',
    label: 'Prepared',
    encouragingLine: 'You stay ready before the moment hits.',
  },
};

const UNIVERSE_IDENTITY_COMPLETE_LINES: Record<string, string> = {
  'dust-and-iron': "Another vote for the Deputy you're becoming.",
  neuronet: 'Another signal proving who you are.',
  'neon-ashes': "Another clue in the case of who you're becoming.",
};

const LEGACY_CATEGORY_KEYS = [
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
] as const;

export type IdentityVoteResult = {
  identityVotes: IdentityVotes;
  voteCount: number;
  trait: IdentityTraitMeta;
  voteGainLine: string;
  universeLine: string;
};

export type RankedIdentityEvidence = {
  trait: IdentityTraitMeta;
  voteCount: number;
};

export function createEmptyIdentityVotes(): IdentityVotes {
  return Object.fromEntries(
    IDENTITY_TRAIT_KEYS.map((key) => [key, 0]),
  ) as IdentityVotes;
}

export function getTraitForCategory(category: TaskCategory): IdentityTraitKey {
  return CATEGORY_TO_IDENTITY_TRAIT[category];
}

export function getIdentityTraitMeta(traitKey: IdentityTraitKey): IdentityTraitMeta {
  return IDENTITY_TRAIT_META[traitKey];
}

export function getUniverseIdentityCompleteLine(universeId: string): string {
  return UNIVERSE_IDENTITY_COMPLETE_LINES[universeId] ?? UNIVERSE_IDENTITY_COMPLETE_LINES['dust-and-iron'];
}

function migrateLegacyCategoryVotes(raw: Record<string, unknown>): IdentityVotes {
  const votes = createEmptyIdentityVotes();

  for (const category of LEGACY_CATEGORY_KEYS) {
    const value = raw[category];
    if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) continue;
    const traitKey = CATEGORY_TO_IDENTITY_TRAIT[category];
    votes[traitKey] += Math.floor(value);
  }

  return votes;
}

export function sanitizeIdentityVotes(raw: unknown): IdentityVotes {
  const base = createEmptyIdentityVotes();
  if (!raw || typeof raw !== 'object') return base;

  const record = raw as Record<string, unknown>;
  const hasTraitKeys = IDENTITY_TRAIT_KEYS.some((key) => key in record);
  const hasLegacyCategoryKeys = LEGACY_CATEGORY_KEYS.some((key) => key in record);

  if (hasLegacyCategoryKeys && !hasTraitKeys) {
    return migrateLegacyCategoryVotes(record);
  }

  for (const key of IDENTITY_TRAIT_KEYS) {
    const value = record[key];
    if (typeof value === 'number' && Number.isFinite(value) && value >= 0) {
      base[key] = Math.floor(value);
    }
  }

  return base;
}

export function castIdentityVote(
  current: IdentityVotes,
  category: TaskCategory,
  universeId: string,
): IdentityVoteResult {
  const traitKey = getTraitForCategory(category);
  const voteCount = (current[traitKey] ?? 0) + 1;
  const identityVotes = { ...current, [traitKey]: voteCount };
  const trait = getIdentityTraitMeta(traitKey);

  return {
    identityVotes,
    voteCount,
    trait,
    voteGainLine: `+1 ${trait.label}`,
    universeLine: getUniverseIdentityCompleteLine(universeId),
  };
}

export function getRankedIdentityEvidence(votes: IdentityVotes): RankedIdentityEvidence[] {
  return IDENTITY_TRAIT_KEYS.map((key) => ({
    trait: getIdentityTraitMeta(key),
    voteCount: votes[key] ?? 0,
  }))
    .filter((entry) => entry.voteCount > 0)
    .sort((a, b) => b.voteCount - a.voteCount || a.trait.label.localeCompare(b.trait.label));
}

export function getTotalIdentityVotes(votes: IdentityVotes): number {
  return IDENTITY_TRAIT_KEYS.reduce((sum, key) => sum + (votes[key] ?? 0), 0);
}

export function formatIdentityEvidenceSummary(votes: IdentityVotes): string {
  const total = getTotalIdentityVotes(votes);
  if (total === 0) {
    return 'Each cleared quest adds evidence for who you are becoming — votes never go down.';
  }

  const top = getRankedIdentityEvidence(votes)[0];
  if (!top) return `${total} identity votes recorded.`;

  return `${total} votes recorded — strongest evidence: ${top.trait.label} (${top.voteCount}).`;
}
