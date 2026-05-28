import AsyncStorage from '@react-native-async-storage/async-storage';

import { DUST_AND_IRON_UNIVERSE } from '@/data/narrative/wild-west-universe';
import { findUniverse } from '@/lib/narrative-state';
import { narrativeWarn } from '@/lib/narrative-state-debug';
import type { PlayerProgress, Universe } from '@/types/narrative';
import { migrateLegacyProgress } from '@/lib/saga-progress';

const STORAGE_KEY = '@pioneer/player-progress';

const defaultUniverseId = DUST_AND_IRON_UNIVERSE.id;
const defaultSagaId = DUST_AND_IRON_UNIVERSE.sagas[0]?.id ?? '';
const defaultChapterId = DUST_AND_IRON_UNIVERSE.sagas[0]?.chapters[0]?.id ?? '';

function createDefaultSagaMaps(universe: Universe): Pick<
  PlayerProgress,
  | 'activeChapterBySagaId'
  | 'completedChapterIdsBySagaId'
  | 'completedQuestIdsBySagaId'
  | 'dismissedTauntBySagaId'
> {
  const activeChapterBySagaId: Record<string, string> = {};
  const completedChapterIdsBySagaId: Record<string, string[]> = {};
  const completedQuestIdsBySagaId: Record<string, string[]> = {};
  const dismissedTauntBySagaId: Record<string, string | null> = {};

  for (const saga of universe.sagas) {
    completedChapterIdsBySagaId[saga.id] = [];
    completedQuestIdsBySagaId[saga.id] = [];
    dismissedTauntBySagaId[saga.id] = null;
    if (saga.chapters[0]) {
      activeChapterBySagaId[saga.id] = saga.chapters[0].id;
    }
  }

  return {
    activeChapterBySagaId,
    completedChapterIdsBySagaId,
    completedQuestIdsBySagaId,
    dismissedTauntBySagaId,
  };
}

export function createInitialProgress(): PlayerProgress {
  const sagaMaps = createDefaultSagaMaps(DUST_AND_IRON_UNIVERSE);

  return {
    hasOnboarded: false,
    selectedUniverseId: defaultUniverseId,
    selectedSagaId: defaultSagaId,
    currentChapterId: defaultChapterId,
    ...sagaMaps,
    totalXp: 0,
    level: 1,
    reputation: 0,
    unlockedRewards: [],
    userQuests: [],
    villainInfluenceBySaga: {
      [defaultSagaId]: 100,
    },
    chapterCompletions: {},
    relationshipByCharacter: {},
    characterAffinity: {},
    seenChapterIntros: [],
    lastActiveDate: null,
    dailyStreak: 0,
    dailyFocusLimit: 3,
  };
}

function normalizeProgress(raw: Partial<PlayerProgress> & Record<string, unknown>): PlayerProgress {
  const base = createInitialProgress();
  const merged: PlayerProgress = {
    ...base,
    ...raw,
    unlockedRewards: raw.unlockedRewards ?? base.unlockedRewards,
    userQuests: raw.userQuests ?? base.userQuests,
    villainInfluenceBySaga: raw.villainInfluenceBySaga ?? base.villainInfluenceBySaga,
    chapterCompletions: raw.chapterCompletions ?? base.chapterCompletions,
    relationshipByCharacter: raw.relationshipByCharacter ?? base.relationshipByCharacter,
    characterAffinity: raw.characterAffinity ?? base.characterAffinity,
    seenChapterIntros: raw.seenChapterIntros ?? base.seenChapterIntros,
    lastActiveDate: raw.lastActiveDate ?? base.lastActiveDate,
    dailyStreak: raw.dailyStreak ?? base.dailyStreak,
    dailyFocusLimit: raw.dailyFocusLimit ?? base.dailyFocusLimit,
  };

  const universeForMigration = findUniverse(merged.selectedUniverseId) ?? DUST_AND_IRON_UNIVERSE;
  if (!findUniverse(merged.selectedUniverseId)) {
    narrativeWarn('Stored universe id not found during normalize', merged.selectedUniverseId);
  }

  const sagaMaps = migrateLegacyProgress(raw, universeForMigration, merged.selectedSagaId);

  return {
    ...merged,
    ...sagaMaps,
    selectedUniverseId: merged.selectedUniverseId,
    selectedSagaId: merged.selectedSagaId,
    currentChapterId: merged.currentChapterId || sagaMaps.currentChapterId,
    activeChapterBySagaId: {
      ...sagaMaps.activeChapterBySagaId,
      ...merged.activeChapterBySagaId,
    },
    villainInfluenceBySaga: {
      ...merged.villainInfluenceBySaga,
      [merged.selectedSagaId]: merged.villainInfluenceBySaga[merged.selectedSagaId] ?? 100,
    },
  };
}

export async function loadPlayerProgress(): Promise<PlayerProgress | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return normalizeProgress(JSON.parse(raw) as Partial<PlayerProgress> & Record<string, unknown>);
  } catch {
    return null;
  }
}

export async function savePlayerProgress(progress: PlayerProgress): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch {
    // Ignore write failures for now — local-only persistence.
  }
}

export async function clearPlayerProgress(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // Ignore clear failures for now.
  }
}
