import type { TaskCategory, QuestTemplateVariation, UserQuest } from '@/types/narrative';

const RECENT_VARIATION_LOOKBACK = 3;

export function getRecentVariationIds(
  recentQuests: UserQuest[],
  chapterId: string,
  category: TaskCategory,
): string[] {
  return recentQuests
    .filter(
      (quest) =>
        quest.sourceChapterId === chapterId &&
        quest.category === category &&
        Boolean(quest.usedVariationId),
    )
    .slice(-RECENT_VARIATION_LOOKBACK)
    .map((quest) => quest.usedVariationId as string);
}

export function countCategoryQuests(
  recentQuests: UserQuest[],
  chapterId: string,
  category: TaskCategory,
): number {
  return recentQuests.filter(
    (quest) => quest.sourceChapterId === chapterId && quest.category === category,
  ).length;
}

/** Prefer variations not used recently; rotate deterministically among eligible options. */
export function pickQuestVariation(
  variations: QuestTemplateVariation[],
  recentQuests: UserQuest[],
  chapterId: string,
  category: TaskCategory,
): QuestTemplateVariation | null {
  if (variations.length === 0) return null;

  const recentIds = getRecentVariationIds(recentQuests, chapterId, category);
  let candidates = variations.filter((variation) => !recentIds.includes(variation.id));

  if (candidates.length === 0) {
    const lastUsed = recentIds[recentIds.length - 1];
    candidates = variations.filter((variation) => variation.id !== lastUsed);
  }

  if (candidates.length === 0) {
    candidates = variations;
  }

  const rotationIndex =
    countCategoryQuests(recentQuests, chapterId, category) % candidates.length;
  return candidates[rotationIndex] ?? candidates[0] ?? null;
}
