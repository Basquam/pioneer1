import {
  resolveAddQuestSuitePrefill,
  suggestSuiteForCategory,
  suggestSuiteForTaskTitle,
} from '@/constants/quest-suites';
import { getInventoryItemDefinition } from '@/constants/inventory-items';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked } from '@/lib/focus-lock';
import { getEquippedLoadout, hasInventoryItem } from '@/lib/inventory';
import {
  hasPlan,
  hasStarterMove,
  type QuestReadiness,
} from '@/lib/quest-readiness';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { isMinimumViableDayActive } from '@/lib/minimum-viable-day';
import type {
  ActiveQuestItemEffectLine,
  BoardQuest,
  InventoryDailyEffectsEntry,
  InventoryItemId,
  PlayerProgress,
  QuestSuiteId,
  TaskCategory,
  UserQuest,
} from '@/types/narrative';

const MAX_QUEST_ITEM_EFFECT_LINES = 2;

function isItemEquipped(
  progress: PlayerProgress,
  universeId: string,
  itemId: InventoryItemId,
): boolean {
  const loadout = getEquippedLoadout(progress, universeId);
  return Object.values(loadout).includes(itemId);
}

function getDailyEffects(
  progress: PlayerProgress,
  today: string = getLocalDateKey(),
): InventoryDailyEffectsEntry {
  return progress.inventoryDailyEffectsByDate?.[today] ?? {};
}

function markDailyEffect(
  progress: PlayerProgress,
  today: string,
  patch: Partial<InventoryDailyEffectsEntry>,
): PlayerProgress {
  return {
    ...progress,
    inventoryDailyEffectsByDate: {
      ...(progress.inventoryDailyEffectsByDate ?? {}),
      [today]: {
        ...getDailyEffects(progress, today),
        ...patch,
      },
    },
  };
}

export function computeInventoryXpBonus(
  progress: PlayerProgress,
  universeId: string,
  baseXp: number,
  today: string = getLocalDateKey(),
): { bonusXp: number; progress: PlayerProgress } {
  if (
    !isItemEquipped(progress, universeId, 'golden-bandana') ||
    getDailyEffects(progress, today).goldenBandanaXpUsed
  ) {
    return { bonusXp: 0, progress };
  }

  const definition = getInventoryItemDefinition('golden-bandana');
  const rate = definition?.effectValue ?? 0.05;
  const bonusXp = Math.max(0, Math.round(baseXp * rate));

  return {
    bonusXp,
    progress: markDailyEffect(progress, today, { goldenBandanaXpUsed: true }),
  };
}

export function computeInventoryReputationBonus(
  progress: PlayerProgress,
  universeId: string,
  quest: Pick<BoardQuest, 'isFocusLocked'>,
  today: string = getLocalDateKey(),
): { bonusRep: number; progress: PlayerProgress } {
  if (
    !isItemEquipped(progress, universeId, 'antique-sheriff-badge') ||
    getDailyEffects(progress, today).sheriffBadgeRepUsed ||
    !isTodayFocusLocked(progress, today) ||
    !quest.isFocusLocked
  ) {
    return { bonusRep: 0, progress };
  }

  const definition = getInventoryItemDefinition('antique-sheriff-badge');
  const bonusRep = Math.min(1, definition?.effectValue ?? 1);

  return {
    bonusRep,
    progress: markDailyEffect(progress, today, { sheriffBadgeRepUsed: true }),
  };
}

export function shouldHighlightStarterFromInventory(
  progress: PlayerProgress,
  universeId: string,
  quest: Pick<BoardQuest, 'riskLevel' | 'starterTaskTitle' | 'source'>,
): boolean {
  if (quest.source !== 'user') return false;
  if (!isItemEquipped(progress, universeId, 'blue-revolver')) return false;
  return isHighRiskQuest(quest.riskLevel);
}

export function applyInventoryReadinessDisplayBonus(
  progress: PlayerProgress,
  universeId: string,
  quest: BoardQuest,
  readiness: QuestReadiness | null,
): QuestReadiness | null {
  if (!readiness || quest.source !== 'user') return readiness;
  if (!isItemEquipped(progress, universeId, 'railway-pocket-watch')) return readiness;
  if (!hasPlan(quest)) return readiness;

  const bonus = getInventoryItemDefinition('railway-pocket-watch')?.effectValue ?? 1;
  const score = Math.min(readiness.maxScore, readiness.score + bonus);

  return { ...readiness, score };
}

export function getInventoryRecoveryHealthBonus(
  progress: PlayerProgress,
  universeId: string,
  today: string = getLocalDateKey(),
): number {
  if (!isItemEquipped(progress, universeId, 'deputy-canteen')) return 0;
  if (!isMinimumViableDayActive(progress, today)) return 0;
  return 25;
}

export function shouldPrioritizeBusinessErrandSuite(
  progress: PlayerProgress,
  universeId: string,
): boolean {
  return isItemEquipped(progress, universeId, 'ledger-compass');
}

export function resolveInventoryAwareSuitePrefill(
  progress: PlayerProgress,
  universeId: string,
  params: {
    category: TaskCategory | null;
    activeSuiteId?: QuestSuiteId;
    title: string;
  },
): QuestSuiteId | null {
  const base = resolveAddQuestSuitePrefill(params);
  if (!shouldPrioritizeBusinessErrandSuite(progress, universeId)) return base;

  if (params.activeSuiteId === 'business' || params.activeSuiteId === 'errand') {
    return params.activeSuiteId;
  }

  const titleSuite = params.title.trim()
    ? suggestSuiteForTaskTitle(params.title.trim(), params.category ?? undefined)
    : null;
  if (titleSuite === 'business' || titleSuite === 'errand') return titleSuite;

  const categorySuite = params.category ? suggestSuiteForCategory(params.category) : null;
  if (categorySuite === 'business' || categorySuite === 'errand') return categorySuite;

  return base;
}

export function getActiveQuestItemEffectLines(
  progress: PlayerProgress,
  universeId: string,
  quest: BoardQuest,
  today: string = getLocalDateKey(),
): ActiveQuestItemEffectLine[] {
  const lines: ActiveQuestItemEffectLine[] = [];

  if (shouldHighlightStarterFromInventory(progress, universeId, quest)) {
    const definition = getInventoryItemDefinition('blue-revolver');
    if (definition) {
      lines.push({
        itemId: 'blue-revolver',
        itemName: definition.name,
        message: 'First move highlighted.',
      });
    }
  }

  if (
    isItemEquipped(progress, universeId, 'railway-pocket-watch') &&
    quest.source === 'user' &&
    hasPlan(quest)
  ) {
    const definition = getInventoryItemDefinition('railway-pocket-watch');
    if (definition) {
      lines.push({
        itemId: 'railway-pocket-watch',
        itemName: definition.name,
        message: 'Plan readiness bonus active.',
      });
    }
  }

  if (
    isItemEquipped(progress, universeId, 'deputy-canteen') &&
    isMinimumViableDayActive(progress, today) &&
    (quest.category === 'health' || quest.category === 'fitness')
  ) {
    const definition = getInventoryItemDefinition('deputy-canteen');
    if (definition) {
      lines.push({
        itemId: 'deputy-canteen',
        itemName: definition.name,
        message: 'Recovery quest prioritized.',
      });
    }
  }

  return lines.slice(0, MAX_QUEST_ITEM_EFFECT_LINES);
}

export function scoreQuestWithInventoryBonus(
  progress: PlayerProgress,
  universeId: string,
  quest: UserQuest,
  baseScore: number,
  today: string = getLocalDateKey(),
): number {
  const bonus = getInventoryRecoveryHealthBonus(progress, universeId, today);
  if (bonus <= 0) return baseScore;

  if (quest.category === 'health') return baseScore + bonus;
  if (quest.category === 'fitness') return baseScore + Math.round(bonus * 0.6);

  return baseScore;
}

