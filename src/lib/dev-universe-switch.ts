import {
  NEON_ASHES_DEFAULT_SAGA_ID,
  NEON_ASHES_UNIVERSE_UNLOCK_ID,
} from '@/data/narrative/neon-ashes-universe';
import {
  NEURONET_DEFAULT_SAGA_ID,
  NEURONET_UNIVERSE_UNLOCK_ID,
} from '@/data/narrative/neuronet-universe';
import { DEFAULT_SAGA_ID, DEFAULT_UNIVERSE_ID, findSaga, findUniverse } from '@/lib/narrative-state';
import { isSagaUnlocked } from '@/lib/reward-unlocks';
import { getSagaActiveChapterId, setSagaActiveChapter } from '@/lib/saga-progress';
import type { PlayerProgress, Saga, Universe } from '@/types/narrative';

export { NEURONET_UNIVERSE_UNLOCK_ID, NEURONET_DEFAULT_SAGA_ID };
export { NEON_ASHES_UNIVERSE_UNLOCK_ID, NEON_ASHES_DEFAULT_SAGA_ID };

export type DevUniverseSnapshot = {
  universeId: string;
  sagaId: string;
  chapterId: string;
};

export function snapshotUniverseProgress(progress: PlayerProgress): DevUniverseSnapshot {
  return {
    universeId: progress.selectedUniverseId,
    sagaId: progress.selectedSagaId,
    chapterId: progress.currentChapterId,
  };
}

export function resolveSagaForUniverse(universe: Universe, progress: PlayerProgress): Saga {
  const rememberedId = progress.lastSagaByUniverseId[universe.id];
  if (rememberedId) {
    const remembered = findSaga(universe, rememberedId);
    if (remembered && isSagaUnlocked(remembered, progress.unlockedRewards)) {
      return remembered;
    }
  }

  const unlocked = universe.sagas.find((saga) => isSagaUnlocked(saga, progress.unlockedRewards));
  if (unlocked) return unlocked;

  return universe.sagas[0]!;
}

function resolveChapterIdForSaga(
  progress: PlayerProgress,
  universeId: string,
  sagaId: string,
  preferredChapterId?: string,
): string | null {
  const universe = findUniverse(universeId);
  if (!universe) return null;

  const saga = findSaga(universe, sagaId);
  if (!saga || saga.chapters.length === 0) return null;

  if (preferredChapterId && saga.chapters.some((chapter) => chapter.id === preferredChapterId)) {
    return preferredChapterId;
  }

  const activeChapterId = getSagaActiveChapterId(saga, progress);
  if (activeChapterId && saga.chapters.some((chapter) => chapter.id === activeChapterId)) {
    return activeChapterId;
  }

  return saga.chapters[0]?.id ?? null;
}

export function applyUniverseSagaSwitch(
  progress: PlayerProgress,
  universeId: string,
  sagaId: string,
  preferredChapterId?: string,
): PlayerProgress {
  const universe = findUniverse(universeId);
  if (!universe) return progress;

  const saga = findSaga(universe, sagaId);
  if (!saga) return progress;

  const chapterId = resolveChapterIdForSaga(
    progress,
    universeId,
    sagaId,
    preferredChapterId,
  );

  const base = {
    ...progress,
    selectedUniverseId: universeId,
    selectedSagaId: sagaId,
    lastSagaByUniverseId: {
      ...progress.lastSagaByUniverseId,
      [universeId]: sagaId,
    },
    villainInfluenceBySaga: {
      ...progress.villainInfluenceBySaga,
      [sagaId]: progress.villainInfluenceBySaga[sagaId] ?? 100,
    },
  };

  if (!chapterId) {
    return {
      ...base,
      currentChapterId: '',
    };
  }

  return setSagaActiveChapter(base, sagaId, chapterId);
}

export function applyDevSwitchToNeonAshes(progress: PlayerProgress): PlayerProgress {
  const unlocked = progress.unlockedRewards.includes(NEON_ASHES_UNIVERSE_UNLOCK_ID)
    ? progress.unlockedRewards
    : [...progress.unlockedRewards, NEON_ASHES_UNIVERSE_UNLOCK_ID];

  const withUnlock = { ...progress, unlockedRewards: unlocked };
  const universe = findUniverse('neon-ashes');
  if (!universe) return withUnlock;

  const saga = findSaga(universe, NEON_ASHES_DEFAULT_SAGA_ID) ?? resolveSagaForUniverse(universe, withUnlock);
  const firstChapterId = saga.chapters[0]?.id;
  return applyUniverseSagaSwitch(withUnlock, 'neon-ashes', saga.id, firstChapterId);
}

export function applyDevSwitchToNeuroNet(progress: PlayerProgress): PlayerProgress {
  const unlocked = progress.unlockedRewards.includes(NEURONET_UNIVERSE_UNLOCK_ID)
    ? progress.unlockedRewards
    : [...progress.unlockedRewards, NEURONET_UNIVERSE_UNLOCK_ID];

  const withUnlock = { ...progress, unlockedRewards: unlocked };
  const universe = findUniverse('neuronet');
  if (!universe) return withUnlock;

  const saga = resolveSagaForUniverse(universe, withUnlock);
  return applyUniverseSagaSwitch(withUnlock, 'neuronet', saga.id);
}

export function applyDevSwitchToDustAndIron(progress: PlayerProgress): PlayerProgress {
  const universe = findUniverse(DEFAULT_UNIVERSE_ID);
  if (!universe) return progress;

  const saga = resolveSagaForUniverse(universe, progress);
  return applyUniverseSagaSwitch(progress, DEFAULT_UNIVERSE_ID, saga.id);
}

export function isSagaInPreview(saga: { chapters: unknown[] }): boolean {
  return saga.chapters.length === 0;
}

export function applyUniverseSelection(
  progress: PlayerProgress,
  universeId: string,
): PlayerProgress {
  const universe = findUniverse(universeId);
  if (!universe) return progress;

  const saga = resolveSagaForUniverse(universe, progress);
  return applyUniverseSagaSwitch(progress, universe.id, saga.id);
}
