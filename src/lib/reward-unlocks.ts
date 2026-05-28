import { getChapterRewards } from '@/lib/chapter-rewards';
import type { ChapterReward, ChapterRewardType, Saga, Universe } from '@/types/narrative';

export const REWARD_TYPE_LABELS: Record<ChapterRewardType, string> = {
  badge: 'BADGE',
  title: 'TITLE',
  cosmetic: 'COSMETIC',
  storyUnlock: 'STORY UNLOCK',
};

export function isUniverseUnlocked(universe: Universe, unlockedRewards: string[]): boolean {
  if (universe.status === 'available') return true;
  if (!universe.requiredUnlockId) return false;
  return unlockedRewards.includes(universe.requiredUnlockId);
}

export function getUniverseUnlockHint(universe: Universe): string | undefined {
  if (universe.status === 'available') return undefined;
  return universe.unlockRequirementLabel ?? 'Complete the previous universe';
}

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
  return universe.sagas.flatMap((saga) =>
    saga.chapters.flatMap((chapter) => getChapterRewards(chapter)),
  );
}

export function findRewardById(universe: Universe, rewardId: string): ChapterReward | undefined {
  return getUniverseRewards(universe).find((reward) => reward.id === rewardId);
}

export function getStoryUnlockSagaId(reward: ChapterReward): string | undefined {
  if (reward.type !== 'storyUnlock' || !reward.unlockTargetId) return undefined;
  return reward.unlockTargetId;
}

export function findSagaInUniverse(universe: Universe, sagaId: string): Saga | undefined {
  return universe.sagas.find((saga) => saga.id === sagaId);
}

export function resolveStoryUnlockSaga(
  universe: Universe,
  reward: ChapterReward,
): Saga | undefined {
  const sagaId = getStoryUnlockSagaId(reward);
  if (!sagaId) return undefined;
  return findSagaInUniverse(universe, sagaId);
}

export function getStartSagaCtaLabel(saga: Saga): string {
  return `START ${saga.title.toUpperCase()}`;
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
