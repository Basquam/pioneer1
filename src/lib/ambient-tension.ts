import { getAmbientTensionAudioModule } from '@/constants/audio';
import type { RewardEvent } from '@/lib/reward-event-queue';
import { getCharacter } from '@/lib/narrative-helpers';
import type { NarrativeMoment, Saga, Universe } from '@/types/narrative';

export function getTensionAdapterKey(universeId: string): string {
  return `${universeId}::tension`;
}

/** @deprecated Prefer getTensionAdapterKey('dust-and-iron'). */
export const DUST_AND_IRON_TENSION_ADAPTER_KEY = getTensionAdapterKey('dust-and-iron');

export function isAmbientTensionActive({
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
  if (!getAmbientTensionAudioModule(universe.id)) return false;

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

/** @deprecated Use isAmbientTensionActive. */
export function isDustAndIronTensionActive(
  args: Parameters<typeof isAmbientTensionActive>[0],
): boolean {
  return args.universe.id === 'dust-and-iron' && isAmbientTensionActive(args);
}
