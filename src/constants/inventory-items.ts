import type { InventoryItemDefinition, InventoryItemId } from '@/types/narrative';

/** Optional item images — app uses rarity placeholder when absent. */
export const INVENTORY_ITEM_IMAGES: Partial<Record<InventoryItemId, number>> = {};

export const INVENTORY_ITEMS: InventoryItemDefinition[] = [
  {
    id: 'antique-sheriff-badge',
    name: 'Antique Sheriff Badge',
    description: 'A worn badge that remembers every small duty completed.',
    universeId: 'dust-and-iron',
    rarity: 'rare',
    slot: 'badge',
    effectType: 'first-locked-focus-rep-bonus',
    effectValue: 1,
    effectDescription: 'First locked focus quest completed each day grants +1 extra reputation.',
    flavorText: 'Authority earned one small duty at a time.',
    image: INVENTORY_ITEM_IMAGES['antique-sheriff-badge'],
  },
  {
    id: 'golden-bandana',
    name: 'Golden Bandana',
    description: 'A bright bandana tied when the day finally begins.',
    universeId: 'dust-and-iron',
    rarity: 'uncommon',
    slot: 'cosmetic',
    effectType: 'first-daily-xp-bonus',
    effectValue: 0.05,
    effectDescription: 'First completed quest each day grants +5% XP.',
    flavorText: 'A small sign that the day has begun.',
    image: INVENTORY_ITEM_IMAGES['golden-bandana'],
  },
  {
    id: 'blue-revolver',
    name: 'Blue Revolver',
    description: 'A steady sidearm — never fired before the first move is clear.',
    universeId: 'dust-and-iron',
    rarity: 'epic',
    slot: 'tool',
    effectType: 'highlight-starter-move',
    effectDescription: 'High-risk quests highlight the starter move / first action prompt.',
    flavorText: 'The first shot is always the smallest move.',
    image: INVENTORY_ITEM_IMAGES['blue-revolver'],
  },
  {
    id: 'deputy-canteen',
    name: 'Deputy Canteen',
    description: 'A dented canteen that never leaves a deputy thirsty on the trail.',
    universeId: 'dust-and-iron',
    rarity: 'common',
    slot: 'charm',
    effectType: 'prioritize-recovery-health',
    effectDescription: 'During Minimum Viable Day or low energy, recovery and health quests are prioritized.',
    flavorText: 'Keep yourself standing before you keep the town standing.',
    image: INVENTORY_ITEM_IMAGES['deputy-canteen'],
  },
  {
    id: 'railway-pocket-watch',
    name: 'Railway Pocket Watch',
    description: 'A pocket watch that clicks when a plan has a time attached.',
    universeId: 'dust-and-iron',
    rarity: 'rare',
    slot: 'tool',
    effectType: 'readiness-plan-bonus',
    effectValue: 1,
    effectDescription: 'Quests with a when/where plan receive a small readiness bonus.',
    flavorText: 'A plan is a promise with a time attached.',
    image: INVENTORY_ITEM_IMAGES['railway-pocket-watch'],
  },
  {
    id: 'ledger-compass',
    name: 'Ledger Compass',
    description: 'A compass that points toward honest routes and open ledgers.',
    universeId: 'dust-and-iron',
    suiteId: 'business',
    rarity: 'uncommon',
    slot: 'charm',
    effectType: 'prioritize-business-errand-suite',
    effectDescription: 'Business and Errand Suite suggestions are prioritized when active.',
    flavorText: 'Every honest route starts with knowing what is owed.',
    image: INVENTORY_ITEM_IMAGES['ledger-compass'],
  },
];

const ITEMS_BY_ID = Object.fromEntries(INVENTORY_ITEMS.map((item) => [item.id, item])) as Record<
  InventoryItemId,
  InventoryItemDefinition
>;

export function getInventoryItemDefinition(itemId: string): InventoryItemDefinition | null {
  return ITEMS_BY_ID[itemId as InventoryItemId] ?? null;
}

export function isInventoryItemId(value: string): value is InventoryItemId {
  return value in ITEMS_BY_ID;
}

export function listInventoryItemDefinitions(): InventoryItemDefinition[] {
  return INVENTORY_ITEMS;
}

export const INVENTORY_RARITY_LABEL: Record<InventoryItemDefinition['rarity'], string> = {
  common: 'Common',
  uncommon: 'Uncommon',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

export const INVENTORY_SLOT_LABEL: Record<InventoryItemDefinition['slot'], string> = {
  badge: 'Badge',
  tool: 'Tool',
  charm: 'Charm',
  cosmetic: 'Cosmetic',
};
