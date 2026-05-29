import type { BoardQuest, Chapter, PlayerProgress, QuestTemplate, Saga, UserQuest } from '@/types/narrative';

import { getDailyFocusLimit, getDailyFocusQuestIds } from './daily-focus';

export type QuestBoardProgress = Pick<
  PlayerProgress,
  'userQuests' | 'completedQuestIdsBySagaId' | 'selectedUniverseId' | 'dailyFocusLimit'
>;

export function templateToBoardQuest(
  template: QuestTemplate,
  completedQuestIds: string[],
): BoardQuest {
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
  };
}

export function userQuestToBoardQuest(quest: UserQuest, isDailyFocus = false): BoardQuest {
  return {
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
    ...(quest.starterTaskTitle ? { starterTaskTitle: quest.starterTaskTitle } : {}),
    ...(quest.prepStepTitle ? { prepStepTitle: quest.prepStepTitle } : {}),
    ...(quest.implementationIntention ? { implementationIntention: quest.implementationIntention } : {}),
  };
}

export function buildBoardQuests(
  chapter: Chapter,
  saga: Saga,
  progress: QuestBoardProgress,
): BoardQuest[] {
  const completedQuestIds = progress.completedQuestIdsBySagaId[saga.id] ?? [];
  const templates = chapter.questTemplates.map((template) =>
    templateToBoardQuest(template, completedQuestIds),
  );

  const focusQuestIds = getDailyFocusQuestIds(
    progress.userQuests,
    getDailyFocusLimit(progress),
    undefined,
    progress.selectedUniverseId,
  );

  const userQuests = progress.userQuests
    .filter((quest) => quest.sourceSagaId === saga.id && quest.sourceChapterId === chapter.id)
    .map((quest) => userQuestToBoardQuest(quest, focusQuestIds.has(quest.id)));

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
