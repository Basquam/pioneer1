import type { BoardQuest, PlayerProgress, UserQuest } from '@/types/narrative';

export const SMALLEST_STEP_PROMPT = 'Start with the smallest visible step.';

export function isUserQuestId(questId: string): boolean {
  return questId.startsWith('user-');
}

export function getQuestStartedAt(
  questId: string,
  progress: Pick<PlayerProgress, 'userQuests' | 'templateQuestStartedAt'>,
): string | undefined {
  if (isUserQuestId(questId)) {
    return progress.userQuests.find((quest) => quest.id === questId)?.startedAt;
  }
  return progress.templateQuestStartedAt[questId];
}

export function isQuestStarted(
  questId: string,
  progress: Pick<PlayerProgress, 'userQuests' | 'templateQuestStartedAt'>,
): boolean {
  return Boolean(getQuestStartedAt(questId, progress));
}

export function markQuestStarted(
  progress: PlayerProgress,
  questId: string,
  startedAt: string = new Date().toISOString(),
): PlayerProgress {
  if (isUserQuestId(questId)) {
    return {
      ...progress,
      userQuests: progress.userQuests.map((quest) =>
        quest.id === questId ? { ...quest, startedAt: quest.startedAt ?? startedAt } : quest,
      ),
    };
  }

  if (progress.templateQuestStartedAt[questId]) {
    return progress;
  }

  return {
    ...progress,
    templateQuestStartedAt: {
      ...progress.templateQuestStartedAt,
      [questId]: startedAt,
    },
  };
}

export function shouldHighlightDecisiveMoment(
  focusDecisiveMoment: boolean,
  quest: Pick<BoardQuest, 'completed'>,
): boolean {
  return focusDecisiveMoment && !quest.completed;
}

export function hasStarterMove(quest: Pick<BoardQuest | UserQuest, 'starterTaskTitle'>): boolean {
  return Boolean(quest.starterTaskTitle?.trim());
}

export function sanitizeTemplateQuestStartedAt(raw: unknown): Record<string, string> {
  if (!raw || typeof raw !== 'object') return {};

  return Object.fromEntries(
    Object.entries(raw as Record<string, unknown>).filter(
      (entry): entry is [string, string] =>
        typeof entry[0] === 'string' &&
        entry[0].length > 0 &&
        typeof entry[1] === 'string' &&
        entry[1].length > 0,
    ),
  );
}
