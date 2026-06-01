import type { RewardEvent } from '@/lib/reward-event-queue';
import { getCharacter } from '@/lib/narrative-helpers';
import type { NarrativeMoment, Saga, Universe } from '@/types/narrative';

export const DUST_AND_IRON_TENSION_ADAPTER_KEY = 'dust-and-iron::tension';

export function isDustAndIronTensionActive({
  universe,
  narrativeMoment,
  isCelebrationActive,
  activeCelebration,
  activeSaga,
}: {
  universe: Universe;
  narrativeMoment: NarrativeMoment | null;
  isCelebrationActive: boolean;
  activeCelebration: RewardEvent | null;
  activeSaga: Saga;
}): boolean {
  if (universe.id !== 'dust-and-iron') return false;

  if (narrativeMoment?.type === 'villain_taunt') return true;

  if (
    isCelebrationActive &&
    activeCelebration?.type === 'characterReaction' &&
    activeCelebration.payload &&
    'characterId' in activeCelebration.payload
  ) {
    const character = getCharacter(activeSaga, activeCelebration.payload.characterId);
    if (character?.isVillain) return true;
  }

  return false;
}
