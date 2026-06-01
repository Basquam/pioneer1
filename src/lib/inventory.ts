import { getInventoryItemDefinition, isInventoryItemId } from '@/constants/inventory-items';
import { getLocalDateKey } from '@/lib/daily-streak';
import type {
  EquippedItemsLoadout,
  InventoryDailyEffectsEntry,
  InventoryItemId,
  InventoryItemSource,
  ItemSlot,
  PlayerInventoryItem,
  PlayerProgress,
} from '@/types/narrative';

export function hasInventoryItem(
  progress: Pick<PlayerProgress, 'inventoryItems'>,
  itemId: InventoryItemId,
): boolean {
  return (progress.inventoryItems ?? []).some((entry) => entry.itemId === itemId);
}

export function grantInventoryItem(
  progress: PlayerProgress,
  itemId: InventoryItemId,
  source: InventoryItemSource,
  earnedAt: string = new Date().toISOString(),
): { progress: PlayerProgress; granted: boolean } {
  if (!isInventoryItemId(itemId) || !getInventoryItemDefinition(itemId)) {
    return { progress, granted: false };
  }

  if (hasInventoryItem(progress, itemId)) {
    return { progress, granted: false };
  }

  const entry: PlayerInventoryItem = {
    itemId,
    earnedAt,
    source,
    isNew: true,
  };

  return {
    progress: {
      ...progress,
      inventoryItems: [...(progress.inventoryItems ?? []), entry],
    },
    granted: true,
  };
}

export function markInventoryItemSeen(
  progress: PlayerProgress,
  itemId: InventoryItemId,
): PlayerProgress {
  const items = progress.inventoryItems ?? [];
  if (!items.some((entry) => entry.itemId === itemId && entry.isNew)) return progress;

  return {
    ...progress,
    inventoryItems: items.map((entry) =>
      entry.itemId === itemId ? { ...entry, isNew: false } : entry,
    ),
  };
}

export function markAllInventoryItemsSeen(progress: PlayerProgress): PlayerProgress {
  const items = progress.inventoryItems ?? [];
  if (!items.some((entry) => entry.isNew)) return progress;

  return {
    ...progress,
    inventoryItems: items.map((entry) => ({ ...entry, isNew: false })),
  };
}

export function getEquippedLoadout(
  progress: Pick<PlayerProgress, 'equippedItemsByUniverseId'>,
  universeId: string,
): EquippedItemsLoadout {
  return progress.equippedItemsByUniverseId?.[universeId] ?? {};
}

export function getEquippedItemInSlot(
  progress: PlayerProgress,
  universeId: string,
  slot: ItemSlot,
): InventoryItemId | undefined {
  return getEquippedLoadout(progress, universeId)[slot];
}

export function equipInventoryItem(
  progress: PlayerProgress,
  universeId: string,
  slot: ItemSlot,
  itemId: InventoryItemId,
): PlayerProgress {
  if (!hasInventoryItem(progress, itemId)) return progress;

  const definition = getInventoryItemDefinition(itemId);
  if (!definition || definition.slot !== slot) return progress;
  if (definition.universeId && definition.universeId !== universeId) return progress;

  const current = getEquippedLoadout(progress, universeId);
  const nextLoadout: EquippedItemsLoadout = { ...current, [slot]: itemId };

  return {
    ...progress,
    equippedItemsByUniverseId: {
      ...(progress.equippedItemsByUniverseId ?? {}),
      [universeId]: nextLoadout,
    },
    inventoryItems: (progress.inventoryItems ?? []).map((entry) =>
      entry.itemId === itemId ? { ...entry, isNew: false } : entry,
    ),
  };
}

export function unequipInventorySlot(
  progress: PlayerProgress,
  universeId: string,
  slot: ItemSlot,
): PlayerProgress {
  const current = getEquippedLoadout(progress, universeId);
  if (!current[slot]) return progress;

  const nextLoadout = { ...current };
  delete nextLoadout[slot];

  return {
    ...progress,
    equippedItemsByUniverseId: {
      ...(progress.equippedItemsByUniverseId ?? {}),
      [universeId]: nextLoadout,
    },
  };
}

export function listOwnedInventoryItems(progress: PlayerProgress): PlayerInventoryItem[] {
  return (progress.inventoryItems ?? []).filter((entry) =>
    Boolean(getInventoryItemDefinition(entry.itemId)),
  );
}

export function sanitizeInventoryItems(raw: unknown): PlayerInventoryItem[] {
  if (!Array.isArray(raw)) return [];

  const result: PlayerInventoryItem[] = [];
  const seen = new Set<InventoryItemId>();

  for (const value of raw) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.itemId !== 'string' || !isInventoryItemId(entry.itemId)) continue;
    if (seen.has(entry.itemId)) continue;
    if (!getInventoryItemDefinition(entry.itemId)) continue;

    seen.add(entry.itemId);
    result.push({
      itemId: entry.itemId,
      earnedAt:
        typeof entry.earnedAt === 'string' && entry.earnedAt.length > 0
          ? entry.earnedAt
          : new Date().toISOString(),
      source: sanitizeInventorySource(entry.source),
      isNew: entry.isNew === true,
    });
  }

  return result;
}

function sanitizeInventorySource(raw: unknown): InventoryItemSource {
  if (
    raw === 'chapter-complete' ||
    raw === 'saga-complete' ||
    raw === 'recovery-quest' ||
    raw === 'minimum-viable-day' ||
    raw === 'dev'
  ) {
    return raw;
  }
  return 'chapter-complete';
}

export function sanitizeEquippedItemsByUniverseId(
  raw: unknown,
): PlayerProgress['equippedItemsByUniverseId'] {
  if (!raw || typeof raw !== 'object') return {};

  const slots: ItemSlot[] = ['badge', 'tool', 'charm', 'cosmetic'];
  const result: PlayerProgress['equippedItemsByUniverseId'] = {};

  for (const [universeId, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof universeId !== 'string' || !value || typeof value !== 'object') continue;

    const loadoutRaw = value as Record<string, unknown>;
    const loadout: EquippedItemsLoadout = {};

    for (const slot of slots) {
      const itemId = loadoutRaw[slot];
      if (typeof itemId === 'string' && isInventoryItemId(itemId)) {
        const definition = getInventoryItemDefinition(itemId);
        if (definition && (!definition.universeId || definition.universeId === universeId)) {
          loadout[slot] = itemId;
        }
      }
    }

    if (Object.keys(loadout).length > 0) {
      result[universeId] = loadout;
    }
  }

  return result;
}

export function sanitizeInventoryDailyEffectsByDate(
  raw: unknown,
): PlayerProgress['inventoryDailyEffectsByDate'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['inventoryDailyEffectsByDate'] = {};

  for (const [dateKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (typeof dateKey !== 'string' || !value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    const sanitized: InventoryDailyEffectsEntry = {};
    if (entry.goldenBandanaXpUsed === true) sanitized.goldenBandanaXpUsed = true;
    if (entry.sheriffBadgeRepUsed === true) sanitized.sheriffBadgeRepUsed = true;
    if (Object.keys(sanitized).length > 0) {
      result[dateKey] = sanitized;
    }
  }

  return result;
}

export function pruneInventoryDailyEffectsByDate(
  raw: PlayerProgress['inventoryDailyEffectsByDate'],
  date = new Date(),
  retentionDays = 90,
): PlayerProgress['inventoryDailyEffectsByDate'] {
  const cutoff = new Date(date);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(raw ?? {}).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

export function getInventorySourceLabel(source: InventoryItemSource): string {
  switch (source) {
    case 'chapter-complete':
      return 'Chapter cleared';
    case 'saga-complete':
      return 'Saga cleared';
    case 'recovery-quest':
      return 'Recovery quest';
    case 'minimum-viable-day':
      return 'Minimum viable day';
    case 'dev':
      return 'Dev grant';
    default:
      return 'Earned';
  }
}
