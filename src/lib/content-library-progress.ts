import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import { isSagaUnlocked, isUniverseUnlocked } from '@/lib/reward-unlocks';
import type { PlayerProgress, Saga, Universe } from '@/types/narrative';

export type SagaLibraryProgress = {
  completedChapters: number;
  totalChapters: number;
  started: boolean;
};

export type UniverseLibraryProgress = {
  completedChapters: number;
  totalChapters: number;
  totalSagas: number;
  playableSagas: number;
  unlocked: boolean;
};

export function getSagaChapterTotal(saga: Saga): number {
  return saga.chapters.length;
}

export function getUniverseChapterTotal(universe: Universe): number {
  return universe.sagas.reduce((sum, saga) => sum + saga.chapters.length, 0);
}

export function getSagaLibraryProgress(saga: Saga, progress: PlayerProgress): SagaLibraryProgress {
  const completedChapters = getCompletedChapterCountForSaga(saga, progress);
  const totalChapters = saga.chapters.length;
  const activeChapterId = progress.activeChapterBySagaId[saga.id];
  const hasActiveChapter =
    Boolean(activeChapterId) &&
    saga.chapters.some((chapter) => chapter.id === activeChapterId) &&
    !progress.completedChapterIdsBySagaId[saga.id]?.includes(activeChapterId);

  return {
    completedChapters,
    totalChapters,
    started: completedChapters > 0 || hasActiveChapter,
  };
}

export function getUniverseLibraryProgress(
  universe: Universe,
  progress: PlayerProgress,
): UniverseLibraryProgress {
  const totalChapters = getUniverseChapterTotal(universe);
  const completedChapters = universe.sagas.reduce(
    (sum, saga) => sum + getCompletedChapterCountForSaga(saga, progress),
    0,
  );
  const playableSagas = universe.sagas.filter((saga) =>
    isSagaUnlocked(saga, progress.unlockedRewards),
  ).length;

  return {
    completedChapters,
    totalChapters,
    totalSagas: universe.sagas.length,
    playableSagas,
    unlocked: isUniverseUnlocked(universe, progress.unlockedRewards),
  };
}

export function formatChapterProgress(completed: number, total: number): string {
  if (total <= 0) return '0 chapters';
  return `${completed}/${total} chapters`;
}
