import type { Chapter, ChapterReward } from '@/types/narrative';

import { unlockRewardIds } from '@/lib/reward-unlocks';

export function getChapterRewards(chapter: Chapter): ChapterReward[] {
  return chapter.chapterRewards;
}

export function sumChapterTemplateRewards(chapter: Chapter): { xp: number; reputation: number } {
  return chapter.questTemplates.reduce(
    (acc, template) => ({
      xp: acc.xp + template.xpReward,
      reputation: acc.reputation + template.reputationImpact,
    }),
    { xp: 0, reputation: 0 },
  );
}

export function unlockChapterRewards(
  unlockedRewards: string[],
  rewards: ChapterReward[],
): string[] {
  return rewards.reduce(
    (ids, reward) => unlockRewardIds(ids, reward.id),
    unlockedRewards,
  );
}

export function findStoryUnlockReward(
  rewards: ChapterReward[],
): ChapterReward | undefined {
  return rewards.find((reward) => reward.type === 'storyUnlock');
}
