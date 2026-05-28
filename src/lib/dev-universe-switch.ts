import {
  NEURONET_DEFAULT_SAGA_ID,
  NEURONET_UNIVERSE_UNLOCK_ID,
} from '@/data/narrative/neuronet-universe';
import { DEFAULT_SAGA_ID, DEFAULT_UNIVERSE_ID, findSaga, findUniverse } from '@/lib/narrative-state';
import { getSagaActiveChapterId, setSagaActiveChapter } from '@/lib/saga-progress';
import type { PlayerProgress } from '@/types/narrative';

export { NEURONET_UNIVERSE_UNLOCK_ID, NEURONET_DEFAULT_SAGA_ID };

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

function resolveChapterIdForSaga(
  progress: PlayerProgress,
  sagaId: string,
  preferredChapterId?: string,
): string | null {
  const universe = findUniverse(progress.selectedUniverseId);
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
    { ...progress, selectedUniverseId: universeId, selectedSagaId: sagaId },
    sagaId,
    preferredChapterId,
  );

  const base = {
    ...progress,
    selectedUniverseId: universeId,
    selectedSagaId: sagaId,
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

export function applyDevSwitchToNeuroNet(progress: PlayerProgress): PlayerProgress {
  const unlocked = progress.unlockedRewards.includes(NEURONET_UNIVERSE_UNLOCK_ID)
    ? progress.unlockedRewards
    : [...progress.unlockedRewards, NEURONET_UNIVERSE_UNLOCK_ID];

  return applyUniverseSagaSwitch(
    { ...progress, unlockedRewards: unlocked },
    'neuronet',
    NEURONET_DEFAULT_SAGA_ID,
  );
}

export function applyDevSwitchToDustAndIron(
  progress: PlayerProgress,
  snapshot?: DevUniverseSnapshot | null,
): PlayerProgress {
  if (snapshot && snapshot.universeId === DEFAULT_UNIVERSE_ID) {
    return applyUniverseSagaSwitch(
      progress,
      snapshot.universeId,
      snapshot.sagaId,
      snapshot.chapterId,
    );
  }

  return applyUniverseSagaSwitch(progress, DEFAULT_UNIVERSE_ID, DEFAULT_SAGA_ID);
}

export function isSagaInPreview(saga: { chapters: unknown[] }): boolean {
  return saga.chapters.length === 0;
}
