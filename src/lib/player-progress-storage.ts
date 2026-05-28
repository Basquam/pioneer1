import AsyncStorage from '@react-native-async-storage/async-storage';

import { DUST_AND_IRON_UNIVERSE, UNIVERSES } from '@/data/narrative/universes';
import { findUniverse } from '@/lib/narrative-state';
import { narrativeWarn } from '@/lib/narrative-state-debug';
import type { PlayerProgress } from '@/types/narrative';
import { migrateLegacyProgress } from '@/lib/saga-progress';
import {
  sanitizePersistedProgress,
  sanitizeUserQuestList,
} from '@/lib/player-progress-sanitize';

const STORAGE_KEY = '@pioneer/player-progress';

/** Players who completed Golden Route before the storyUnlock split still get HB access. */
function migrateHonestBusinessmanUnlock(unlockedRewards: string[]): string[] {
  if (
    unlockedRewards.includes('golden-route-title') &&
    !unlockedRewards.includes('honest-businessman-story-unlock')
  ) {
    return [...unlockedRewards, 'honest-businessman-story-unlock'];
  }
  return unlockedRewards;
}

const defaultUniverseId = DUST_AND_IRON_UNIVERSE.id;
const defaultSagaId = DUST_AND_IRON_UNIVERSE.sagas[0]?.id ?? '';
const defaultChapterId = DUST_AND_IRON_UNIVERSE.sagas[0]?.chapters[0]?.id ?? '';

function createDefaultLastSagaByUniverseId(): Record<string, string> {
  const result: Record<string, string> = {};
  for (const universe of UNIVERSES) {
    const defaultSaga =
      universe.sagas.find((saga) => saga.status === 'available') ?? universe.sagas[0];
    if (defaultSaga) {
      result[universe.id] = defaultSaga.id;
    }
  }
  return result;
}

function migrateLastSagaByUniverseId(
  raw: Partial<PlayerProgress>,
  merged: PlayerProgress,
): Record<string, string> {
  const defaults = createDefaultLastSagaByUniverseId();
  const stored = raw.lastSagaByUniverseId ?? {};
  const result = { ...defaults, ...stored };

  for (const universe of UNIVERSES) {
    if (merged.selectedUniverseId === universe.id && merged.selectedSagaId) {
      result[universe.id] = merged.selectedSagaId;
      continue;
    }

    const remembered = stored[universe.id];
    if (remembered && universe.sagas.some((saga) => saga.id === remembered)) {
      result[universe.id] = remembered;
      continue;
    }

    const activeSaga = universe.sagas.find((saga) => {
      const completed = merged.completedChapterIdsBySagaId[saga.id]?.length ?? 0;
      if (completed > 0) return true;
      const activeId = merged.activeChapterBySagaId[saga.id];
      const firstId = saga.chapters[0]?.id;
      return Boolean(activeId && firstId && activeId !== firstId);
    });
    if (activeSaga) {
      result[universe.id] = activeSaga.id;
    }
  }

  return result;
}

function createDefaultSagaMapsForAllUniverses(): Pick<
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

  for (const universe of UNIVERSES) {
    for (const saga of universe.sagas) {
      completedChapterIdsBySagaId[saga.id] = [];
      completedQuestIdsBySagaId[saga.id] = [];
      dismissedTauntBySagaId[saga.id] = null;
      if (saga.chapters[0]) {
        activeChapterBySagaId[saga.id] = saga.chapters[0].id;
      }
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
  const sagaMaps = createDefaultSagaMapsForAllUniverses();

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
    activityByDate: {},
    lastSagaByUniverseId: createDefaultLastSagaByUniverseId(),
  };
}

export function restorePlayerProgress(
  raw: Partial<PlayerProgress> & Record<string, unknown>,
): PlayerProgress {
  return normalizeProgress(raw);
}

function normalizeProgress(raw: Partial<PlayerProgress> & Record<string, unknown>): PlayerProgress {
  const base = createInitialProgress();
  const merged: PlayerProgress = {
    ...base,
    ...raw,
    unlockedRewards: migrateHonestBusinessmanUnlock(raw.unlockedRewards ?? base.unlockedRewards),
    userQuests: raw.userQuests ?? base.userQuests,
    villainInfluenceBySaga: raw.villainInfluenceBySaga ?? base.villainInfluenceBySaga,
    chapterCompletions: raw.chapterCompletions ?? base.chapterCompletions,
    relationshipByCharacter: raw.relationshipByCharacter ?? base.relationshipByCharacter,
    characterAffinity: raw.characterAffinity ?? base.characterAffinity,
    seenChapterIntros: raw.seenChapterIntros ?? base.seenChapterIntros,
    lastActiveDate: raw.lastActiveDate ?? base.lastActiveDate,
    dailyStreak: raw.dailyStreak ?? base.dailyStreak,
    dailyFocusLimit: raw.dailyFocusLimit ?? base.dailyFocusLimit,
    activityByDate: raw.activityByDate ?? base.activityByDate,
  };

  const universeForMigration = findUniverse(merged.selectedUniverseId) ?? DUST_AND_IRON_UNIVERSE;
  if (!findUniverse(merged.selectedUniverseId)) {
    narrativeWarn('Stored universe id not found during normalize', merged.selectedUniverseId);
  }

  const sagaMaps = migrateLegacyProgress(raw, universeForMigration, merged.selectedSagaId);
  const lastSagaByUniverseId = migrateLastSagaByUniverseId(raw, {
    ...merged,
    ...sagaMaps,
  });

  return sanitizePersistedProgress({
    ...merged,
    ...sagaMaps,
    lastSagaByUniverseId,
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
    userQuests: sanitizeUserQuestList(merged.userQuests),
  });
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
    const persisted = sanitizePersistedProgress(progress);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persisted));
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
