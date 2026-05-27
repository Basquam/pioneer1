import type { Chapter, PlayerProgress } from '@/types/narrative';

import { getChapterStatus, type ChapterStatus } from './chapter-progress';

export type TerritoryNode = {
  chapter: Chapter;
  status: ChapterStatus;
};

export function buildTerritoryNodes(chapters: Chapter[], progress: PlayerProgress): TerritoryNode[] {
  return [...chapters]
    .sort((a, b) => a.order - b.order)
    .map((chapter) => ({
      chapter,
      status: getChapterStatus(chapter, chapters, progress),
    }));
}

export function territoryStatusLabel(status: ChapterStatus): string {
  switch (status) {
    case 'completed':
      return 'RECLAIMED';
    case 'active':
      return 'ACTIVE FRONT';
    case 'locked':
      return 'THREATENED';
  }
}
