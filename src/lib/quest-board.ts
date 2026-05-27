import type { BoardQuest, Chapter, PlayerProgress, QuestTemplate, UserQuest } from '@/types/narrative';

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

export function userQuestToBoardQuest(quest: UserQuest): BoardQuest {
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
  };
}

export function buildBoardQuests(
  chapter: Chapter,
  sagaId: string,
  progress: PlayerProgress,
): BoardQuest[] {
  const templates = chapter.questTemplates.map((t) =>
    templateToBoardQuest(t, progress.completedQuestIds),
  );

  const userQuests = progress.userQuests
    .filter((q) => q.sourceSagaId === sagaId && q.sourceChapterId === chapter.id)
    .map(userQuestToBoardQuest);

  return [...templates, ...userQuests];
}

export function findBoardQuest(
  boardQuests: BoardQuest[],
  questId: string,
): BoardQuest | undefined {
  return boardQuests.find((q) => q.id === questId);
}

export function countCompletedTemplates(
  chapter: Chapter,
  completedQuestIds: string[],
): number {
  return chapter.questTemplates.filter((t) => completedQuestIds.includes(t.id)).length;
}
