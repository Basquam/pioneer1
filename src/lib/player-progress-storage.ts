import AsyncStorage from '@react-native-async-storage/async-storage';

import { DUST_AND_IRON_UNIVERSE, getUniverse } from '@/data/narrative/wild-west-universe';
import { deriveCompletedChapterIds } from '@/lib/chapter-progress';
import type { Chapter, PlayerProgress, Saga, Universe } from '@/types/narrative';

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

export function createInitialProgress(): PlayerProgress {
  return {
    hasOnboarded: false,
    selectedUniverseId: defaultUniverseId,
    selectedSagaId: defaultSagaId,
    currentChapterId: defaultChapterId,
    totalXp: 0,
    level: 1,
    reputation: 0,
    completedQuestIds: [],
    completedChapterIds: [],
    unlockedRewards: [],
    userQuests: [],
    villainInfluenceBySaga: {
      [defaultSagaId]: 100,
    },
    chapterCompletions: {},
    relationshipByCharacter: {},
    characterAffinity: {},
    seenChapterIntros: [],
    dismissedTauntForChapterId: null,
  };
}

function normalizeProgress(raw: Partial<PlayerProgress>): PlayerProgress {
  const base = createInitialProgress();
  const merged: PlayerProgress = {
    ...base,
    ...raw,
    completedQuestIds: raw.completedQuestIds ?? base.completedQuestIds,
    completedChapterIds: raw.completedChapterIds ?? base.completedChapterIds,
    unlockedRewards: raw.unlockedRewards ?? base.unlockedRewards,
    userQuests: raw.userQuests ?? base.userQuests,
    villainInfluenceBySaga: raw.villainInfluenceBySaga ?? base.villainInfluenceBySaga,
    chapterCompletions: raw.chapterCompletions ?? base.chapterCompletions,
    relationshipByCharacter: raw.relationshipByCharacter ?? base.relationshipByCharacter,
    characterAffinity: raw.characterAffinity ?? base.characterAffinity,
    seenChapterIntros: raw.seenChapterIntros ?? base.seenChapterIntros,
  };

  const universe = getUniverse(merged.selectedUniverseId);
  const saga = getSaga(universe, merged.selectedSagaId);
  const chapter = getChapter(saga, merged.currentChapterId);

  return {
    ...merged,
    selectedUniverseId: universe.id,
    selectedSagaId: saga.id,
    currentChapterId: chapter.id,
    completedChapterIds:
      raw.completedChapterIds ?? deriveCompletedChapterIds(saga.chapters, chapter.id),
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
    return normalizeProgress(JSON.parse(raw) as Partial<PlayerProgress>);
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
