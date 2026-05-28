import { DUST_AND_IRON_UNIVERSE, UNIVERSES } from '@/data/narrative/wild-west-universe';
import { setSagaActiveChapter } from '@/lib/saga-progress';
import type { Chapter, PlayerProgress, Saga, Universe } from '@/types/narrative';

import { narrativeWarn } from './narrative-state-debug';

export const DEFAULT_UNIVERSE_ID = 'dust-and-iron';
export const DEFAULT_SAGA_ID = 'vulture-gang';

export function getDefaultUniverse(): Universe {
  return DUST_AND_IRON_UNIVERSE;
}

export function getDefaultSaga(): Saga {
  return (
    DUST_AND_IRON_UNIVERSE.sagas.find((saga) => saga.id === DEFAULT_SAGA_ID) ??
    DUST_AND_IRON_UNIVERSE.sagas[0]!
  );
}

export function findUniverse(universeId: string): Universe | null {
  return UNIVERSES.find((universe) => universe.id === universeId) ?? null;
}

export function findSaga(universe: Universe, sagaId: string): Saga | null {
  return universe.sagas.find((saga) => saga.id === sagaId) ?? null;
}

export function findActiveChapter(saga: Saga, progress: PlayerProgress): Chapter | null {
  if (saga.chapters.length === 0) return null;

  const activeChapterId = progress.activeChapterBySagaId[saga.id] ?? progress.currentChapterId;
  return saga.chapters.find((chapter) => chapter.id === activeChapterId) ?? null;
}

export type ResolvedNarrativeState = {
  isValid: boolean;
  issues: string[];
  universe: Universe | null;
  saga: Saga | null;
  chapter: Chapter | null;
};

export function resolveNarrativeState(progress: PlayerProgress): ResolvedNarrativeState {
  const issues: string[] = [];

  const universe = findUniverse(progress.selectedUniverseId);
  if (!universe) {
    issues.push(`Universe not found: ${progress.selectedUniverseId}`);
    return { isValid: false, issues, universe: null, saga: null, chapter: null };
  }

  const saga = findSaga(universe, progress.selectedSagaId);
  if (!saga) {
    issues.push(`Saga not found: ${progress.selectedSagaId}`);
    return { isValid: false, issues, universe, saga: null, chapter: null };
  }

  if (saga.chapters.length === 0) {
    issues.push(`Saga has no chapters: ${saga.id}`);
    return { isValid: false, issues, universe, saga, chapter: null };
  }

  const chapter = findActiveChapter(saga, progress);
  if (!chapter) {
    const activeChapterId = progress.activeChapterBySagaId[saga.id] ?? progress.currentChapterId;
    issues.push(`Active chapter not found: ${activeChapterId}`);
    return { isValid: false, issues, universe, saga, chapter: null };
  }

  return { isValid: true, issues, universe, saga, chapter };
}

export function restoreDefaultStoryProgress(progress: PlayerProgress): PlayerProgress {
  const universe = getDefaultUniverse();
  const saga = getDefaultSaga();
  const chapter = saga.chapters[0];

  if (!chapter) {
    narrativeWarn('Default saga has no chapters');
    return {
      ...progress,
      selectedUniverseId: universe.id,
      selectedSagaId: saga.id,
      currentChapterId: '',
    };
  }

  return setSagaActiveChapter(
    {
      ...progress,
      selectedUniverseId: universe.id,
      villainInfluenceBySaga: {
        ...progress.villainInfluenceBySaga,
        [saga.id]: progress.villainInfluenceBySaga[saga.id] ?? 100,
      },
    },
    saga.id,
    chapter.id,
  );
}
