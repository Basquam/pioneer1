import AsyncStorage from '@react-native-async-storage/async-storage';

import { DUST_AND_IRON_UNIVERSE, getUniverse } from '@/data/narrative/wild-west-universe';
import type { Chapter, PlayerProgress, Saga, Universe } from '@/types/narrative';
import { migrateLegacyProgress } from '@/lib/saga-progress';

const STORAGE_KEY = '@pioneer/player-progress';

const defaultUniverseId = DUST_AND_IRON_UNIVERSE.id;
const defaultSagaId = DUST_AND_IRON_UNIVERSE.sagas[0]?.id ?? '';
const defaultChapterId = DUST_AND_IRON_UNIVERSE.sagas[0]?.chapters[0]?.id ?? '';

function getSaga(universe: Universe, sagaId: string): Saga {
  return (
    universe.sagas.find((s) => s.id === sagaId) ??
    universe.sagas.find((s) => s.status === 'available') ??
    universe.sagas[0]
  );
}

function getChapter(saga: Saga, chapterId: string): Chapter {
  return saga.chapters.find((c) => c.id === chapterId) ?? saga.chapters[0];
}

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
  };

  const universe = getUniverse(merged.selectedUniverseId);
  const sagaMaps = migrateLegacyProgress(raw, universe, merged.selectedSagaId);
  const saga = getSaga(universe, merged.selectedSagaId);
  const chapter = getChapter(saga, sagaMaps.currentChapterId);

  return {
    ...merged,
    ...sagaMaps,
    selectedUniverseId: universe.id,
    selectedSagaId: saga.id,
    currentChapterId: chapter.id,
    activeChapterBySagaId: {
      ...sagaMaps.activeChapterBySagaId,
      [saga.id]: chapter.id,
    },
    villainInfluenceBySaga: {
      ...merged.villainInfluenceBySaga,
      [saga.id]: merged.villainInfluenceBySaga[saga.id] ?? 100,
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
