import type { BoardQuest, Chapter, PlayerProgress, QuestTemplate, Saga, UserQuest } from '@/types/narrative';

import { getDailyFocusLimit, getDailyFocusQuestIds, resolveQuestCreatedOnDate } from '@/lib/daily-focus';
import { resolveQuestRiskLevel } from '@/lib/quest-risk';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isUserQuestArchived, shouldShowFrictionReview } from '@/lib/quest-friction';
import { getLockedFocusQuestIdSet } from '@/lib/focus-lock';
import { computeQuestReadiness } from '@/lib/quest-readiness';
import { isTooMuchMotion } from '@/lib/motion-vs-action';

export type QuestBoardProgress = Pick<
  PlayerProgress,
  | 'userQuests'
  | 'completedQuestIdsBySagaId'
  | 'selectedUniverseId'
  | 'dailyFocusLimit'
  | 'focusLockedDate'
  | 'lockedFocusQuestIds'
  | 'templateQuestStartedAt'
>;

export function templateToBoardQuest(
  template: QuestTemplate,
  completedQuestIds: string[],
  templateQuestStartedAt: Record<string, string> = {},
): BoardQuest {
  const startedAt = templateQuestStartedAt[template.id];
  return {
    id: template.id,
    source: 'template',
    category: template.category,
    originalTitle: template.objective,
    narrativeTitle: template.title,
    narrativeDescription: template.dramaticHook,
    xpReward: template.xpReward,
    reputationReward: template.reputationImpact,
    reactionCharacterId: template.reactionCharacterId,
    completed: completedQuestIds.includes(template.id),
    ...(startedAt ? { startedAt, isStarted: true } : {}),
  };
}

export function userQuestToBoardQuest(
  quest: UserQuest,
  isDailyFocus = false,
  isFocusLocked = false,
): BoardQuest {
  const boardQuest: BoardQuest = {
    id: quest.id,
    source: 'user',
    category: quest.category,
    originalTitle: quest.originalTitle,
    narrativeTitle: quest.narrativeTitle,
    narrativeDescription: quest.narrativeDescription,
    xpReward: quest.xpReward,
    reputationReward: quest.reputationReward,
    reactionCharacterId: quest.reactionCharacterId,
    completed: quest.isCompleted,
    isDailyFocus,
    ...(isFocusLocked ? { isFocusLocked: true } : {}),
    ...(quest.createdOnDate ? { createdOnDate: quest.createdOnDate } : {}),
    ...(quest.starterTaskTitle ? { starterTaskTitle: quest.starterTaskTitle } : {}),
    ...(quest.prepStepTitle ? { prepStepTitle: quest.prepStepTitle } : {}),
    ...(quest.implementationIntention ? { implementationIntention: quest.implementationIntention } : {}),
    ...(quest.plannedTimeLabel ? { plannedTimeLabel: quest.plannedTimeLabel } : {}),
    ...(quest.afterCurrentHabit ? { afterCurrentHabit: quest.afterCurrentHabit } : {}),
    ...(quest.startedAt ? { startedAt: quest.startedAt, isStarted: true } : {}),
    ...(quest.afterQuestReward ? { afterQuestReward: quest.afterQuestReward } : {}),
    riskLevel: resolveQuestRiskLevel(quest.riskLevel),
    ...(quest.lastFocusDistraction ? { lastFocusDistraction: quest.lastFocusDistraction } : {}),
    ...(quest.frictionShieldAppliedAt ? { frictionShieldAppliedAt: quest.frictionShieldAppliedAt } : {}),
    ...(quest.improvedAt?.length ? { improvedAt: quest.improvedAt } : {}),
    ...(quest.readinessUpdatedAt?.length ? { readinessUpdatedAt: quest.readinessUpdatedAt } : {}),
    ...(quest.frictionReviewedAt?.length ? { frictionReviewedAt: quest.frictionReviewedAt } : {}),
    ...(quest.frictionReviews?.length ? { frictionReviews: quest.frictionReviews } : {}),
    ...(quest.focusStartedAt ? { focusStartedAt: quest.focusStartedAt } : {}),
    ...(quest.completedAt ? { completedAt: quest.completedAt } : {}),
    ...(quest.generatedFromRecurringQuestId ? { isRecurring: true } : {}),
  };

  if (!boardQuest.createdOnDate) {
    const resolvedDate = resolveQuestCreatedOnDate(quest);
    if (resolvedDate) boardQuest.createdOnDate = resolvedDate;
  }

  const readiness = computeQuestReadiness(boardQuest);
  if (readiness) {
    boardQuest.readinessScore = readiness.score;
    boardQuest.readinessChecklist = readiness.checklist;
  }

  if (shouldShowFrictionReview(boardQuest)) {
    boardQuest.showFrictionReview = true;
  }

  if (isTooMuchMotion(quest, getLocalDateKey())) {
    boardQuest.isTooMuchMotion = true;
  }

  return boardQuest;
}

export function buildBoardQuests(
  chapter: Chapter,
  saga: Saga,
  progress: QuestBoardProgress,
): BoardQuest[] {
  const completedQuestIds = progress.completedQuestIdsBySagaId[saga.id] ?? [];
  const templates = chapter.questTemplates.map((template) =>
    templateToBoardQuest(template, completedQuestIds, progress.templateQuestStartedAt),
  );

  const today = getLocalDateKey();
  const focusQuestIds = getDailyFocusQuestIds(
    progress.userQuests,
    getDailyFocusLimit(progress),
    today,
    progress.selectedUniverseId,
  );
  const lockedFocusQuestIds = getLockedFocusQuestIdSet(progress, today);

  const userQuests = progress.userQuests
    .filter(
      (quest) =>
        !isUserQuestArchived(quest) &&
        quest.sourceSagaId === saga.id &&
        quest.sourceChapterId === chapter.id,
    )
    .map((quest) =>
      userQuestToBoardQuest(
        quest,
        focusQuestIds.has(quest.id),
        lockedFocusQuestIds.has(quest.id),
      ),
    );

  return [...templates, ...userQuests];
}

export function findBoardQuest(
  boardQuests: BoardQuest[],
  questId: string,
): BoardQuest | undefined {
  return boardQuests.find((quest) => quest.id === questId);
}

export function countCompletedTemplates(
  chapter: Chapter,
  completedQuestIds: string[],
): number {
  return chapter.questTemplates.filter((template) => completedQuestIds.includes(template.id)).length;
}
