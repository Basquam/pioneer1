import type { PlayerProgress } from '@/types/narrative';

/** Lifetime quest clears before HQ shows the full operations dashboard. */
export const EARLY_HQ_COMPLETED_QUEST_THRESHOLD = 3;

export function countLifetimeCompletedQuests(
  progress: Pick<PlayerProgress, 'userQuests' | 'completedQuestIdsBySagaId'>,
): number {
  const userCompleted = progress.userQuests.filter((quest) => quest.isCompleted).length;
  const templateCompleted = Object.values(progress.completedQuestIdsBySagaId ?? {}).reduce(
    (sum, ids) => sum + (ids?.length ?? 0),
    0,
  );

  return userCompleted + templateCompleted;
}

export function isEarlyHqExperience(
  progress: Pick<PlayerProgress, 'hasOnboarded' | 'userQuests' | 'completedQuestIdsBySagaId'>,
): boolean {
  if (!progress.hasOnboarded) return false;
  return countLifetimeCompletedQuests(progress) < EARLY_HQ_COMPLETED_QUEST_THRESHOLD;
}

export function getEarlyHqWelcomeLine(
  progress: Pick<PlayerProgress, 'userQuests' | 'completedQuestIdsBySagaId'>,
): string {
  const completed = countLifetimeCompletedQuests(progress);
  if (completed <= 1) {
    return 'You cleared your first quest. Keep the next move simple.';
  }
  return 'One more quest can move the story forward.';
}
