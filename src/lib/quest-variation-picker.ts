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

export type PickQuestVariationOptions = {
  excludeVariationIds?: string[];
  excludeNarrativeTitle?: string;
  preferredIntensity?: QuestTemplateVariation['intensity'];
};

/** Prefer variations not used recently; rotate deterministically among eligible options. */
export function pickQuestVariation(
  variations: QuestTemplateVariation[],
  recentQuests: UserQuest[],
  chapterId: string,
  category: TaskCategory,
  options?: PickQuestVariationOptions,
): QuestTemplateVariation | null {
  if (variations.length === 0) return null;

  const recentIds = getRecentVariationIds(recentQuests, chapterId, category);
  const blockedIds = new Set([...recentIds, ...(options?.excludeVariationIds ?? [])]);

  let candidates = variations.filter((variation) => !blockedIds.has(variation.id));

  if (options?.preferredIntensity) {
    const intensityMatches = candidates.filter(
      (variation) => variation.intensity === options.preferredIntensity,
    );
    if (intensityMatches.length > 0) {
      candidates = intensityMatches;
    }
  }

  if (candidates.length === 0) {
    const lastUsed = recentIds[recentIds.length - 1];
    candidates = variations.filter((variation) => variation.id !== lastUsed);
  }

  if (candidates.length === 0) {
    candidates = variations;
  }

  const rotationIndex =
    countCategoryQuests(recentQuests, chapterId, category) % candidates.length;

  let picked = candidates[rotationIndex] ?? candidates[0] ?? null;

  if (picked && options?.excludeNarrativeTitle) {
    const alternate = candidates.find((variation) => variation.id !== picked?.id);
    if (alternate) {
      picked = alternate;
    }
  }

  return picked;
}
