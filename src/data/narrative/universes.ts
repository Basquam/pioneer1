import { DUST_AND_IRON_UNIVERSE } from '@/data/narrative/wild-west-universe';
import { NEURONET_UNIVERSE } from '@/data/narrative/neuronet-universe';
import type { Universe } from '@/types/narrative';

export { DUST_AND_IRON_UNIVERSE, NEURONET_UNIVERSE };

export const UNIVERSES: Universe[] = [DUST_AND_IRON_UNIVERSE, NEURONET_UNIVERSE];

export function getUniverse(universeId: string): Universe {
  const universe = UNIVERSES.find((u) => u.id === universeId);
  if (!universe) {
    throw new Error(`Universe not found: ${universeId}`);
  }
  return universe;
}
