import type { Chapter, PlayerProgress, Saga } from '@/types/narrative';

import {
  getSagaActiveChapterId,
  getSagaCompletedChapterIds,
} from './saga-progress';

export type ChapterStatus = 'completed' | 'active' | 'locked';

export function getActiveChapterId(saga: Saga, progress: PlayerProgress): string {
  return getSagaActiveChapterId(saga, progress);
}

export function getChapterStatus(
  chapter: Chapter,
  chapters: Chapter[],
  saga: Saga,
  progress: PlayerProgress,
): ChapterStatus {
  const completedChapterIds = getSagaCompletedChapterIds(saga, progress);
  const activeChapterId = getActiveChapterId(saga, progress);

  if (completedChapterIds.includes(chapter.id)) return 'completed';
  if (chapter.id === activeChapterId) return 'active';

  const activeChapter = chapters.find((item) => item.id === activeChapterId);
  if (!activeChapter) return chapter.order === 1 ? 'active' : 'locked';

  return chapter.order > activeChapter.order ? 'locked' : 'locked';
}

export function getSagaEntryChapterId(saga: Saga, progress: PlayerProgress): string {
  return getSagaActiveChapterId(saga, progress);
}

export function getCompletedChapterCountForSaga(saga: Saga, progress: PlayerProgress): number {
  return getSagaCompletedChapterIds(saga, progress).length;
}
