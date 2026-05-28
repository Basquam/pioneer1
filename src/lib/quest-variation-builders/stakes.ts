import type { UniverseVariationType } from '@/lib/quest-variation-builders/types';

const WILD_WEST_STAKES: Record<number, string> = {
  1: 'makes its first move',
  2: 'strikes at dawn',
  3: 'sabotages the supply line',
  4: 'hunts fear in the dark',
  5: 'pushes all-in at high noon',
};

const NEURONET_STAKES: Record<number, string> = {
  1: 'flags your first route',
  2: 'scans the rainline',
  3: 'mirrors your coordinates',
  4: 'hunts hesitation in the dark grid',
  5: 'locks the final drop',
};

const NOIR_STAKES: Record<number, string> = {
  1: 'redacts the first witness',
  2: 'watches the rainline',
  3: 'vanishes a contact list',
  4: 'burns the ledger trail',
  5: 'closes the hollow room',
};

export function resolveStakesForUniverse(
  universeType: UniverseVariationType,
  chapterOrder: number,
): string {
  const table =
    universeType === 'neuronet'
      ? NEURONET_STAKES
      : universeType === 'noir'
        ? NOIR_STAKES
        : WILD_WEST_STAKES;
  return table[chapterOrder] ?? 'tightens its grip';
}
