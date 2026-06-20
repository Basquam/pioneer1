import type { BoardQuest } from '@/types/narrative';

export type HqMissionStats = {
  remainingBounties: number;
  totalBounties: number;
  completedBounties: number;
  userQuestCount: number;
  bountyProgress: number;
};

export function computeHqMissionStats(quests: BoardQuest[]): HqMissionStats {
  const templates = quests.filter((quest) => quest.source === 'template');
  const userQuests = quests.filter((quest) => quest.source === 'user');
  const remainingBounties = templates.filter((quest) => !quest.completed).length;
  const totalBounties = templates.length;
  const completedBounties = totalBounties - remainingBounties;
  const userQuestCount = userQuests.filter((quest) => !quest.completed).length;
  const bountyProgress = totalBounties > 0 ? completedBounties / totalBounties : 0;

  return {
    remainingBounties,
    totalBounties,
    completedBounties,
    userQuestCount,
    bountyProgress,
  };
}
