import type {
  NarrativeCharacter,
  RelationshipTier,
  Saga,
} from '@/types/narrative';

export function getCharacter(saga: Saga, characterId: string): NarrativeCharacter | undefined {
  return saga.characters.find((c) => c.id === characterId);
}

export function affinityToTier(affinity: number): RelationshipTier {
  if (affinity >= 12) return 'bonded';
  if (affinity >= 6) return 'trusted';
  if (affinity >= 2) return 'warming';
  return 'distant';
}

export function tierLabel(tier: RelationshipTier): string {
  const labels: Record<RelationshipTier, string> = {
    distant: 'DISTANT',
    warming: 'WARMING',
    trusted: 'TRUSTED',
    bonded: 'BONDED',
  };
  return labels[tier];
}

export function pickLine(lines: string[], seed: number): string {
  if (lines.length === 0) return '';
  return lines[Math.abs(seed) % lines.length];
}

export function pickCharacterLine(
  character: NarrativeCharacter,
  kind: keyof NarrativeCharacter['lines'],
  seed: number,
): string {
  return pickLine(character.lines[kind], seed);
}

export function parseDialogueLine(line: string): { speaker?: string; text: string } {
  const separator = line.indexOf(':');
  if (separator === -1) return { text: line };
  return {
    speaker: line.slice(0, separator).trim(),
    text: line.slice(separator + 1).trim(),
  };
}
