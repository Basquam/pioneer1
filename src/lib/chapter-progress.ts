import type { Chapter, PlayerProgress, Saga } from '@/types/narrative';

export type ChapterStatus = 'completed' | 'active' | 'locked';

export function getActiveChapterId(progress: PlayerProgress): string {
  return progress.currentChapterId;
}

export function deriveCompletedChapterIds(chapters: Chapter[], activeChapterId: string): string[] {
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);
  if (!activeChapter) return [];

  return chapters.filter((chapter) => chapter.order < activeChapter.order).map((chapter) => chapter.id);
}

export function getChapterStatus(
  chapter: Chapter,
  chapters: Chapter[],
  progress: PlayerProgress,
): ChapterStatus {
  if (progress.completedChapterIds.includes(chapter.id)) return 'completed';
  if (chapter.id === getActiveChapterId(progress)) return 'active';

  const activeChapter = chapters.find((item) => item.id === getActiveChapterId(progress));
  if (!activeChapter) return chapter.order === 1 ? 'active' : 'locked';

  return chapter.order > activeChapter.order ? 'locked' : 'locked';
}

export function getSagaEntryChapterId(saga: Saga, progress: PlayerProgress): string {
  if (saga.chapters.length === 0) return progress.currentChapterId;

  const nextChapter = saga.chapters.find(
    (chapter) => !progress.completedChapterIds.includes(chapter.id),
  );

  return nextChapter?.id ?? saga.chapters[saga.chapters.length - 1]!.id;
}

export function getCompletedChapterCountForSaga(saga: Saga, progress: PlayerProgress): number {
  const sagaChapterIds = new Set(saga.chapters.map((chapter) => chapter.id));
  return progress.completedChapterIds.filter((id) => sagaChapterIds.has(id)).length;
}