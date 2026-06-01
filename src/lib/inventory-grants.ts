import { grantInventoryItem } from '@/lib/inventory';
import type { InventoryItemId, InventoryItemSource, PlayerProgress } from '@/types/narrative';

/** Chapter completion → inventory item grants (additive, never replaces chapter rewards). */
export const CHAPTER_INVENTORY_GRANTS: Record<string, InventoryItemId> = {
  'first-warning': 'antique-sheriff-badge',
  'broken-wagon': 'golden-bandana',
  'high-noon': 'blue-revolver',
  'first-shipment': 'railway-pocket-watch',
  'delayed-cargo': 'railway-pocket-watch',
  'golden-route': 'ledger-compass',
};

export function tryGrantInventoryForChapterComplete(
  progress: PlayerProgress,
  chapterId: string,
  source: InventoryItemSource = 'chapter-complete',
): { progress: PlayerProgress; grantedItemIds: InventoryItemId[] } {
  const itemId = CHAPTER_INVENTORY_GRANTS[chapterId];
  if (!itemId) {
    return { progress, grantedItemIds: [] };
  }

  const result = grantInventoryItem(progress, itemId, source);
  return {
    progress: result.progress,
    grantedItemIds: result.granted ? [itemId] : [],
  };
}

export function tryGrantDeputyCanteen(
  progress: PlayerProgress,
  source: 'recovery-quest' | 'minimum-viable-day',
): { progress: PlayerProgress; granted: boolean } {
  const result = grantInventoryItem(progress, 'deputy-canteen', source);
  return { progress: result.progress, granted: result.granted };
}

export function processInventoryGrantsAfterQuestComplete(
  progress: PlayerProgress,
  options: {
    chapterCompletedId?: string;
    completingRecovery?: boolean;
    securingMinimumDay?: boolean;
  },
): PlayerProgress {
  let next = progress;

  if (options.chapterCompletedId) {
    next = tryGrantInventoryForChapterComplete(next, options.chapterCompletedId).progress;
  }

  if (options.completingRecovery) {
    next = tryGrantDeputyCanteen(next, 'recovery-quest').progress;
  }

  if (options.securingMinimumDay) {
    next = tryGrantDeputyCanteen(next, 'minimum-viable-day').progress;
  }

  return next;
}
