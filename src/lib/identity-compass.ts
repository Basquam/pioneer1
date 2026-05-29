import { getCurrentWeekDateKeys } from '@/lib/weekly-recap';
import {
  getIdentityTraitMeta,
  IDENTITY_TRAIT_KEYS,
  type IdentityTraitMeta,
} from '@/lib/identity-votes';
import type { IdentityTraitKey, PlayerProgress } from '@/types/narrative';

export const MIN_DESIRED_IDENTITY_TRAITS = 1;
export const MAX_DESIRED_IDENTITY_TRAITS = 3;

export const IDENTITY_COMPASS_ONBOARDING_TITLE = 'What kind of person are you becoming?';
export const IDENTITY_COMPASS_ONBOARDING_SUBTITLE =
  'Every quest casts a vote. Choose the traits you want to reinforce first.';

const COMPASS_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Choose the badge you want to earn through action.',
  neuronet: 'Choose the signal you want to strengthen.',
  'neon-ashes': 'Choose the truth you want your actions to prove.',
};

/** First-person compass card copy shown during setup. */
export const IDENTITY_COMPASS_CARD_COPY: Record<IdentityTraitKey, string> = {
  organized: 'I create order when life gets noisy.',
  resilient: 'I return even when things get hard.',
  curious: 'I keep learning and gathering knowledge.',
  reliable: 'I show up when the mission needs me.',
  selfRespecting: 'I take care of the body that carries me.',
  connected: 'I maintain the bonds that matter.',
  builder: 'I create instead of only consuming.',
  prepared: 'I make tomorrow easier before it arrives.',
};

export function getIdentityCompassFlavor(universeId: string): string {
  return COMPASS_FLAVOR[universeId] ?? COMPASS_FLAVOR['dust-and-iron'];
}

export function getIdentityCompassCardCopy(traitKey: IdentityTraitKey): string {
  return IDENTITY_COMPASS_CARD_COPY[traitKey];
}

export function sanitizeDesiredIdentityTraits(raw: unknown): IdentityTraitKey[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<IdentityTraitKey>();
  const result: IdentityTraitKey[] = [];

  for (const entry of raw) {
    if (typeof entry !== 'string' || !IDENTITY_TRAIT_KEYS.includes(entry as IdentityTraitKey)) {
      continue;
    }
    const traitKey = entry as IdentityTraitKey;
    if (seen.has(traitKey)) continue;
    seen.add(traitKey);
    result.push(traitKey);
    if (result.length >= MAX_DESIRED_IDENTITY_TRAITS) break;
  }

  return result;
}

export function toggleDesiredIdentityTrait(
  current: IdentityTraitKey[],
  traitKey: IdentityTraitKey,
): IdentityTraitKey[] {
  if (current.includes(traitKey)) {
    return current.filter((key) => key !== traitKey);
  }

  if (current.length >= MAX_DESIRED_IDENTITY_TRAITS) {
    return current;
  }

  return [...current, traitKey];
}

export function isDesiredIdentityTrait(
  traitKey: IdentityTraitKey,
  desiredTraits: IdentityTraitKey[] | undefined,
): boolean {
  return desiredTraits?.includes(traitKey) ?? false;
}

export function traitLabelToKey(label: string | undefined): IdentityTraitKey | null {
  if (!label) return null;

  for (const key of IDENTITY_TRAIT_KEYS) {
    if (getIdentityTraitMeta(key).label === label) {
      return key;
    }
  }

  return null;
}

export function isDesiredIdentityTraitLabel(
  label: string | undefined,
  desiredTraits: IdentityTraitKey[] | undefined,
): boolean {
  const traitKey = traitLabelToKey(label);
  return traitKey != null && isDesiredIdentityTrait(traitKey, desiredTraits);
}

export function formatDesiredIdentityHighlight(traitKey: IdentityTraitKey): string {
  const meta = getIdentityTraitMeta(traitKey);
  return `You reinforced ${meta.label} — a trait you're building toward.`;
}

export type DesiredTraitWeeklyProgress = {
  traitKey: IdentityTraitKey;
  trait: IdentityTraitMeta;
  count: number;
};

export function getDesiredTraitWeeklyProgress(
  progress: Pick<PlayerProgress, 'evidenceLog' | 'desiredIdentityTraits'>,
  date = new Date(),
): DesiredTraitWeeklyProgress | null {
  const desired = progress.desiredIdentityTraits ?? [];
  if (desired.length === 0) return null;

  const weekKeys = new Set(getCurrentWeekDateKeys(date));
  const counts = new Map<IdentityTraitKey, number>();

  for (const event of progress.evidenceLog ?? []) {
    if (!weekKeys.has(event.date)) continue;

    const traitKey = traitLabelToKey(event.identityTraitGained);
    if (!traitKey || !desired.includes(traitKey)) continue;

    counts.set(traitKey, (counts.get(traitKey) ?? 0) + 1);
  }

  let top: DesiredTraitWeeklyProgress | null = null;

  for (const traitKey of desired) {
    const count = counts.get(traitKey) ?? 0;
    if (count <= 0) continue;

    if (!top || count > top.count) {
      top = {
        traitKey,
        trait: getIdentityTraitMeta(traitKey),
        count,
      };
    }
  }

  return top;
}

export function formatDesiredTraitWeeklyLine(progress: DesiredTraitWeeklyProgress): string {
  const voteLabel = progress.count === 1 ? 'vote' : 'votes';
  return `Compass focus: ${progress.trait.label} gained ${progress.count} ${voteLabel} this week.`;
}

export function isValidDesiredIdentitySelection(traits: IdentityTraitKey[]): boolean {
  return (
    traits.length >= MIN_DESIRED_IDENTITY_TRAITS && traits.length <= MAX_DESIRED_IDENTITY_TRAITS
  );
}
