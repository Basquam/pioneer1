import type { ChapterReward, ChapterRewardType, Saga, Universe } from '@/types/narrative';

export const REWARD_TYPE_LABELS: Record<ChapterRewardType, string> = {
  badge: 'BADGE',
  title: 'TITLE',
  cosmetic: 'COSMETIC',
  storyUnlock: 'STORY UNLOCK',
};

export function isSagaUnlocked(saga: Saga, unlockedRewards: string[]): boolean {
  if (saga.status === 'available') return true;
  if (!saga.requiredUnlockId) return false;
  return unlockedRewards.includes(saga.requiredUnlockId);
}

export function getSagaUnlockHint(saga: Saga): string | undefined {
  if (saga.status === 'available') return undefined;
  return saga.unlockRequirementLabel ?? 'Complete the previous saga';
}

export function unlockRewardIds(
  unlockedRewards: string[],
  rewardId: string,
): string[] {
  if (unlockedRewards.includes(rewardId)) return unlockedRewards;
  return [...unlockedRewards, rewardId];
}

export function getUniverseRewards(universe: Universe): ChapterReward[] {
  return universe.sagas.flatMap((saga) => saga.chapters.map((chapter) => chapter.chapterReward));
}

export function findRewardById(universe: Universe, rewardId: string): ChapterReward | undefined {
  return getUniverseRewards(universe).find((reward) => reward.id === rewardId);
}

export function getUnlockedRewardEntries(
  universe: Universe,
  unlockedRewardIds: string[],
): ChapterReward[] {
  const rewards = getUniverseRewards(universe);
  return unlockedRewardIds
    .map((id) => rewards.find((reward) => reward.id === id))
    .filter((reward): reward is ChapterReward => reward !== undefined);
}
