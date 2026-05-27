import type { Chapter, PlayerProgress, Saga, Universe } from '@/types/narrative';

type LegacyPlayerProgress = Partial<PlayerProgress> & {
  completedChapterIds?: string[];
  completedQuestIds?: string[];
  dismissedTauntForChapterId?: string | null;
};

export function getSagaCompletedChapterIds(saga: Saga, progress: PlayerProgress): string[] {
  return progress.completedChapterIdsBySagaId[saga.id] ?? [];
}

export function getSagaCompletedQuestIds(saga: Saga, progress: PlayerProgress): string[] {
  return progress.completedQuestIdsBySagaId[saga.id] ?? [];
}

export function getSagaActiveChapterId(saga: Saga, progress: PlayerProgress): string {
  const stored = progress.activeChapterBySagaId[saga.id];
  if (stored && saga.chapters.some((chapter) => chapter.id === stored)) {
    return stored;
  }

  if (saga.chapters.length === 0) {
    return progress.currentChapterId;
  }

  const completedIds = getSagaCompletedChapterIds(saga, progress);
  const nextChapter = saga.chapters.find((chapter) => !completedIds.includes(chapter.id));
  return nextChapter?.id ?? saga.chapters[saga.chapters.length - 1]!.id;
}

export function getSagaDismissedTauntChapterId(
  sagaId: string,
  progress: PlayerProgress,
): string | null {
  return progress.dismissedTauntBySagaId[sagaId] ?? null;
}

export function setSagaActiveChapter(
  progress: PlayerProgress,
  sagaId: string,
  chapterId: string,
): PlayerProgress {
  return {
    ...progress,
    selectedSagaId: sagaId,
    currentChapterId: chapterId,
    activeChapterBySagaId: {
      ...progress.activeChapterBySagaId,
      [sagaId]: chapterId,
    },
  };
}

export function appendSagaCompletedChapter(
  progress: PlayerProgress,
  sagaId: string,
  chapterId: string,
): PlayerProgress {
  const sagaCompleted = progress.completedChapterIdsBySagaId[sagaId] ?? [];
  if (sagaCompleted.includes(chapterId)) return progress;

  return {
    ...progress,
    completedChapterIdsBySagaId: {
      ...progress.completedChapterIdsBySagaId,
      [sagaId]: [...sagaCompleted, chapterId],
    },
  };
}

export function appendSagaCompletedQuest(
  progress: PlayerProgress,
  sagaId: string,
  questId: string,
): PlayerProgress {
  const sagaCompleted = progress.completedQuestIdsBySagaId[sagaId] ?? [];
  if (sagaCompleted.includes(questId)) return progress;

  return {
    ...progress,
    completedQuestIdsBySagaId: {
      ...progress.completedQuestIdsBySagaId,
      [sagaId]: [...sagaCompleted, questId],
    },
  };
}

export function migrateLegacyProgress(
  raw: LegacyPlayerProgress,
  universe: Universe,
  selectedSagaId: string,
): Pick<
  PlayerProgress,
  | 'activeChapterBySagaId'
  | 'completedChapterIdsBySagaId'
  | 'completedQuestIdsBySagaId'
  | 'dismissedTauntBySagaId'
  | 'currentChapterId'
> {
  const activeChapterBySagaId: Record<string, string> = { ...(raw.activeChapterBySagaId ?? {}) };
  const completedChapterIdsBySagaId: Record<string, string[]> = {
    ...(raw.completedChapterIdsBySagaId ?? {}),
  };
  const completedQuestIdsBySagaId: Record<string, string[]> = {
    ...(raw.completedQuestIdsBySagaId ?? {}),
  };
  const dismissedTauntBySagaId: Record<string, string | null> = {
    ...(raw.dismissedTauntBySagaId ?? {}),
  };

  const legacyCompletedChapterIds = raw.completedChapterIds ?? [];
  const legacyCompletedQuestIds = raw.completedQuestIds ?? [];

  for (const saga of universe.sagas) {
    const sagaChapterIds = new Set(saga.chapters.map((chapter) => chapter.id));

    if (!completedChapterIdsBySagaId[saga.id]?.length && legacyCompletedChapterIds.length > 0) {
      completedChapterIdsBySagaId[saga.id] = legacyCompletedChapterIds.filter((id) =>
        sagaChapterIds.has(id),
      );
    }

    if (!completedChapterIdsBySagaId[saga.id]) {
      completedChapterIdsBySagaId[saga.id] = [];
    }

    if (!completedQuestIdsBySagaId[saga.id]?.length && legacyCompletedQuestIds.length > 0) {
      completedQuestIdsBySagaId[saga.id] = legacyCompletedQuestIds.filter((questId) =>
        saga.chapters.some((chapter) => chapter.questTemplates.some((template) => template.id === questId)),
      );
    }

    if (!completedQuestIdsBySagaId[saga.id]) {
      completedQuestIdsBySagaId[saga.id] = [];
    }

    if (!activeChapterBySagaId[saga.id] && saga.chapters.length > 0) {
      if (
        saga.id === selectedSagaId &&
        raw.currentChapterId &&
        sagaChapterIds.has(raw.currentChapterId)
      ) {
        activeChapterBySagaId[saga.id] = raw.currentChapterId;
      } else {
        const completed = completedChapterIdsBySagaId[saga.id] ?? [];
        const nextChapter = saga.chapters.find((chapter) => !completed.includes(chapter.id));
        activeChapterBySagaId[saga.id] =
          nextChapter?.id ?? saga.chapters[saga.chapters.length - 1]!.id;
      }
    }

    if (
      raw.dismissedTauntForChapterId &&
      sagaChapterIds.has(raw.dismissedTauntForChapterId) &&
      dismissedTauntBySagaId[saga.id] === undefined
    ) {
      dismissedTauntBySagaId[saga.id] = raw.dismissedTauntForChapterId;
    }

    if (dismissedTauntBySagaId[saga.id] === undefined) {
      dismissedTauntBySagaId[saga.id] = null;
    }
  }

  const selectedSaga = universe.sagas.find((saga) => saga.id === selectedSagaId) ?? universe.sagas[0];
  const currentChapterId =
    (selectedSaga && activeChapterBySagaId[selectedSaga.id]) ||
    raw.currentChapterId ||
    selectedSaga?.chapters[0]?.id ||
    '';

  return {
    activeChapterBySagaId,
    completedChapterIdsBySagaId,
    completedQuestIdsBySagaId,
    dismissedTauntBySagaId,
    currentChapterId,
  };
}

export function deriveCompletedChapterIds(chapters: Chapter[], activeChapterId: string): string[] {
  const activeChapter = chapters.find((chapter) => chapter.id === activeChapterId);
  if (!activeChapter) return [];

  return chapters.filter((chapter) => chapter.order < activeChapter.order).map((chapter) => chapter.id);
}

export function getSagaActiveChapter(saga: Saga, progress: PlayerProgress): Chapter | undefined {
  const chapterId = getSagaActiveChapterId(saga, progress);
  return saga.chapters.find((chapter) => chapter.id === chapterId);
}
