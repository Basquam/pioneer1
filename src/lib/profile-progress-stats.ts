import { UNIVERSES } from '@/data/narrative/universes';
import { getUniverseProfileLabels } from '@/constants/profile-universe-labels';
import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import { getUniverseLibraryProgress, getSagaLibraryProgress } from '@/lib/content-library-progress';
import { getRankedIdentityEvidence, getTotalIdentityVotes } from '@/lib/identity-votes';
import { computeLevel, rankForLevel } from '@/lib/level';
import { sanitizeMomentumReserve } from '@/lib/momentum-reserve';
import { getSagaActiveChapter, getSagaActiveChapterId } from '@/lib/saga-progress';
import {
  getUniverseRewards,
  getUniverseUnlockHint,
  isSagaUnlocked,
  isUniverseUnlocked,
} from '@/lib/reward-unlocks';
import type { PlayerProgress, Saga, Universe } from '@/types/narrative';

export type GlobalProfileStats = {
  level: number;
  totalXp: number;
  xpInLevel: number;
  xpToNext: number;
  xpProgress: number;
  totalQuestsCompleted: number;
  focusSessions: number;
  chaptersCompleted: number;
  identityVotesTotal: number;
  topIdentityTraitLabel: string | null;
  momentumReserve: number;
  processAchievementsCount: number;
  dailyStreak: number;
  activeDays: number;
};

export type UniverseProfileStats = {
  universeId: string;
  name: string;
  icon: string;
  unlocked: boolean;
  unlockHint?: string;
  isActive: boolean;
  standingLabel: string;
  rankLabel: string;
  progressLabel: string;
  standingValue: number;
  rankTitle: string;
  chaptersCompleted: number;
  totalChapters: number;
  sagasCompleted: number;
  playableSagas: number;
  activeSagaTitle: string | null;
  activeChapterTitle: string | null;
  storyUnlocksEarned: number;
  storyUnlocksTotal: number;
  relationshipsEngaged: number;
  relationshipsTotal: number;
};

function countCompletedChapters(progress: PlayerProgress): number {
  return Object.values(progress.completedChapterIdsBySagaId ?? {}).reduce(
    (sum, ids) => sum + (ids?.length ?? 0),
    0,
  );
}

function countCompletedQuests(progress: PlayerProgress): number {
  const templateCompleted = Object.values(progress.completedQuestIdsBySagaId ?? {}).reduce(
    (sum, ids) => sum + (ids?.length ?? 0),
    0,
  );
  const userCompleted = (progress.userQuests ?? []).filter((quest) => quest.isCompleted).length;
  return templateCompleted + userCompleted;
}

function countFocusSessions(progress: PlayerProgress): number {
  return (progress.userQuests ?? []).filter((quest) => Boolean(quest.focusStartedAt)).length;
}

function countActiveDays(progress: PlayerProgress): number {
  return Object.values(progress.activityByDate ?? {}).filter(
    (day) => (day?.questsCompleted ?? 0) > 0,
  ).length;
}

function isSagaFullyComplete(saga: Saga, progress: PlayerProgress): boolean {
  const completed = progress.completedChapterIdsBySagaId[saga.id] ?? [];
  return saga.chapters.length > 0 && completed.length >= saga.chapters.length;
}

function countUniverseReputationEarned(universeId: string, progress: PlayerProgress): number {
  return (progress.evidenceLog ?? [])
    .filter((event) => event.universeId === universeId)
    .reduce((sum, event) => sum + (event.reputationEarned ?? 0), 0);
}

function getUniverseCharacterIds(universe: Universe): Set<string> {
  const ids = new Set<string>();
  for (const saga of universe.sagas) {
    for (const character of saga.characters) {
      ids.add(character.id);
    }
  }
  return ids;
}

function resolveUniverseSaga(universe: Universe, progress: PlayerProgress, activeUniverseId: string): Saga | null {
  if (universe.id === activeUniverseId) {
    const active = universe.sagas.find((saga) => saga.id === progress.selectedSagaId);
    if (active) return active;
  }

  const lastSagaId = progress.lastSagaByUniverseId[universe.id];
  if (lastSagaId) {
    const last = universe.sagas.find((saga) => saga.id === lastSagaId);
    if (last && isSagaUnlocked(last, progress.unlockedRewards)) return last;
  }

  return universe.sagas.find((saga) => isSagaUnlocked(saga, progress.unlockedRewards)) ?? null;
}

export function computeGlobalProfileStats(
  progress: PlayerProgress,
  totalXp: number,
): GlobalProfileStats {
  const levelInfo = computeLevel(totalXp);
  const topTrait = getRankedIdentityEvidence(progress.identityVotes)[0]?.trait ?? null;

  return {
    level: levelInfo.level,
    totalXp,
    xpInLevel: levelInfo.xpInLevel,
    xpToNext: levelInfo.xpToNext,
    xpProgress: levelInfo.progress,
    totalQuestsCompleted: countCompletedQuests(progress),
    focusSessions: countFocusSessions(progress),
    chaptersCompleted: countCompletedChapters(progress),
    identityVotesTotal: getTotalIdentityVotes(progress.identityVotes),
    topIdentityTraitLabel: topTrait?.label ?? null,
    momentumReserve: sanitizeMomentumReserve(progress.momentumReserve),
    processAchievementsCount: progress.processAchievements?.length ?? 0,
    dailyStreak: progress.dailyStreak ?? 0,
    activeDays: countActiveDays(progress),
  };
}

export function computeUniverseProfileStats(
  universe: Universe,
  progress: PlayerProgress,
  activeUniverseId: string,
): UniverseProfileStats {
  const labels = getUniverseProfileLabels(universe.id);
  const library = getUniverseLibraryProgress(universe, progress);
  const unlocked = isUniverseUnlocked(universe, progress.unlockedRewards);
  const isActive = universe.id === activeUniverseId;
  const saga = resolveUniverseSaga(universe, progress, activeUniverseId);
  const activeChapter = saga ? getSagaActiveChapter(saga, progress) : null;
  const levelInfo = computeLevel(progress.totalXp);

  const playableSagas = universe.sagas.filter((entry) =>
    isSagaUnlocked(entry, progress.unlockedRewards),
  );
  const sagasCompleted = playableSagas.filter((entry) => isSagaFullyComplete(entry, progress)).length;

  const universeRewards = getUniverseRewards(universe);
  const storyUnlocksTotal = universeRewards.filter((reward) => reward.type === 'storyUnlock').length;
  const storyUnlocksEarned = universeRewards.filter(
    (reward) => reward.type === 'storyUnlock' && progress.unlockedRewards.includes(reward.id),
  ).length;

  const characterIds = getUniverseCharacterIds(universe);
  const relationshipsTotal = characterIds.size;
  const relationshipsEngaged = [...characterIds].filter(
    (characterId) => (progress.characterAffinity[characterId] ?? 0) > 0,
  ).length;

  const rankSaga = saga ?? playableSagas[0] ?? universe.sagas[0];
  const rankTitle = rankSaga ? rankForLevel(rankSaga.rankTitles, levelInfo.level) : '—';

  return {
    universeId: universe.id,
    name: universe.name,
    icon: universe.icon,
    unlocked,
    unlockHint: unlocked ? undefined : getUniverseUnlockHint(universe),
    isActive,
    standingLabel: labels.standing,
    rankLabel: labels.rank,
    progressLabel: labels.progress,
    standingValue: isActive ? progress.reputation : countUniverseReputationEarned(universe.id, progress),
    rankTitle,
    chaptersCompleted: library.completedChapters,
    totalChapters: library.totalChapters,
    sagasCompleted,
    playableSagas: playableSagas.length,
    activeSagaTitle: saga?.title ?? null,
    activeChapterTitle: activeChapter?.title ?? null,
    storyUnlocksEarned,
    storyUnlocksTotal,
    relationshipsEngaged,
    relationshipsTotal,
  };
}

export function listUniverseProfileStats(
  progress: PlayerProgress,
  activeUniverseId: string,
): UniverseProfileStats[] {
  return UNIVERSES.map((universe) => computeUniverseProfileStats(universe, progress, activeUniverseId));
}

export function formatProfileDate(iso: string | null | undefined): string | null {
  if (!iso) return null;
  const dateKey = iso.slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Safe saga progress snippet for universe cards. */
export function getUniverseSagaSummaries(universe: Universe, progress: PlayerProgress) {
  return universe.sagas
    .filter((saga) => isSagaUnlocked(saga, progress.unlockedRewards))
    .map((saga) => {
      const sagaProgress = getSagaLibraryProgress(saga, progress);
      const activeChapterId = getSagaActiveChapterId(saga, progress);
      const activeChapter = saga.chapters.find((chapter) => chapter.id === activeChapterId) ?? null;
      return {
        sagaId: saga.id,
        title: saga.title,
        completedChapters: sagaProgress.completedChapters,
        totalChapters: sagaProgress.totalChapters,
        activeChapterTitle: activeChapter?.title ?? null,
        complete: isSagaFullyComplete(saga, progress),
      };
    });
}
