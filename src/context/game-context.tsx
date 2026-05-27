import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { getUniverse, UNIVERSES } from '@/data/narrative/wild-west-universe';
import { convertTaskToUserQuest, createUserQuestId } from '@/lib/convert-task-to-quest';
import {
  affinityToTier,
  getCharacter,
  pickCharacterLine,
} from '@/lib/narrative-helpers';
import { computeLevel, rankForLevel } from '@/lib/level';
import {
  clearPlayerProgress,
  createInitialProgress,
  loadPlayerProgress,
  savePlayerProgress,
} from '@/lib/player-progress-storage';
import { buildBoardQuests, countCompletedTemplates, findBoardQuest } from '@/lib/quest-board';
import { getSagaEntryChapterId } from '@/lib/chapter-progress';
import { sumChapterTemplateRewards } from '@/lib/chapter-rewards';
import { isSagaUnlocked, unlockRewardIds } from '@/lib/reward-unlocks';
import type {
  BoardQuest,
  Chapter,
  ChapterCompleteState,
  NarrativeCharacter,
  NarrativeMoment,
  PlayerProgress,
  Saga,
  TaskCategory,
  Universe,
} from '@/types/narrative';

export type XpBurst = { id: string; amount: number };

type GameContextValue = {
  universes: Universe[];
  activeUniverse: Universe;
  activeSaga: Saga;
  characters: NarrativeCharacter[];
  currentChapter: Chapter;
  chapters: Chapter[];
  quests: BoardQuest[];
  hasOnboarded: boolean;
  playerProgress: PlayerProgress;
  player: {
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpToNext: number;
    xpProgress: number;
    rank: string;
    reputation: number;
    stats: { grit: number; focus: number; legend: number };
  };
  storyLine: string;
  villainInfluence: number;
  xpBurst: XpBurst | null;
  narrativeMoment: NarrativeMoment | null;
  chapterComplete: ChapterCompleteState | null;
  showChapterIntro: boolean;
  completedQuestCount: number;
  allQuestsComplete: boolean;
  selectUniverse: (universeId: string) => void;
  selectSaga: (sagaId: string) => void;
  switchSaga: (sagaId: string, options?: { forceFirstChapter?: boolean }) => void;
  completeOnboarding: () => void;
  addUserQuest: (originalTitle: string, category: TaskCategory) => void;
  completeQuest: (questId: string) => void;
  dismissXpBurst: () => void;
  markChapterIntroSeen: () => void;
  dismissNarrativeMoment: () => void;
  continueFromChapterComplete: () => void;
  startUnlockedSagaFromChapterComplete: (sagaId: string, entryChapterId: string) => void;
  maybeShowVillainTaunt: () => void;
  resetProgress: () => Promise<void>;
  isHydrated: boolean;
};

export const GameContext = createContext<GameContextValue | null>(null);

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

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<PlayerProgress>(createInitialProgress);
  const [isHydrated, setIsHydrated] = useState(false);
  const [xpBurst, setXpBurst] = useState<XpBurst | null>(null);
  const [narrativeMoment, setNarrativeMoment] = useState<NarrativeMoment | null>(null);
  const [chapterComplete, setChapterComplete] = useState<ChapterCompleteState | null>(null);
  const pendingChapterCompleteRef = useRef<ChapterCompleteState | null>(null);

  useEffect(() => {
    let active = true;

    loadPlayerProgress().then((saved) => {
      if (!active) return;
      if (saved) setProgress(saved);
      setIsHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void savePlayerProgress(progress);
  }, [isHydrated, progress]);

  const activeUniverse = getUniverse(progress.selectedUniverseId);
  const activeSaga = getSaga(activeUniverse, progress.selectedSagaId);
  const chapters = activeSaga.chapters;
  const currentChapter = getChapter(activeSaga, progress.currentChapterId);
  const characters = activeSaga.characters;

  const quests = useMemo(
    () => buildBoardQuests(currentChapter, activeSaga.id, progress),
    [activeSaga.id, currentChapter, progress],
  );

  const completedQuestCount = quests.filter((q) => q.completed).length;
  const completedTemplateCount = countCompletedTemplates(currentChapter, progress.completedQuestIds);
  const allQuestsComplete =
    currentChapter.questTemplates.length > 0 &&
    completedTemplateCount === currentChapter.questTemplates.length;

  const levelInfo = computeLevel(progress.totalXp);
  const rank = rankForLevel(activeSaga.rankTitles, levelInfo.level);
  const villainInfluence = progress.villainInfluenceBySaga[activeSaga.id] ?? 100;

  const storyLine = allQuestsComplete ? currentChapter.successDialogue : currentChapter.introDialogue;
  const showChapterIntro =
    !progress.seenChapterIntros.includes(currentChapter.id) && chapterComplete === null;

  const player = useMemo(
    () => ({
      level: levelInfo.level,
      totalXp: progress.totalXp,
      xpInLevel: levelInfo.xpInLevel,
      xpToNext: levelInfo.xpToNext,
      xpProgress: levelInfo.progress,
      rank,
      reputation: progress.reputation,
      stats: {
        grit: Math.min(99, completedQuestCount * 18 + levelInfo.level * 5),
        focus: completedQuestCount,
        legend: Math.round(levelInfo.progress * 100),
      },
    }),
    [completedQuestCount, levelInfo, progress.reputation, progress.totalXp, rank],
  );

  const selectUniverse = useCallback((universeId: string) => {
    const universe = getUniverse(universeId);
    if (universe.status === 'locked') return;

    const availableSaga = universe.sagas.find((s) => s.status === 'available') ?? universe.sagas[0];
    const firstChapter = availableSaga?.chapters[0];

    setProgress((prev) => ({
      ...prev,
      selectedUniverseId: universe.id,
      selectedSagaId: availableSaga?.id ?? prev.selectedSagaId,
      currentChapterId: firstChapter?.id ?? prev.currentChapterId,
      villainInfluenceBySaga: {
        ...prev.villainInfluenceBySaga,
        ...(availableSaga ? { [availableSaga.id]: prev.villainInfluenceBySaga[availableSaga.id] ?? 100 } : {}),
      },
    }));
  }, []);

  const selectSaga = useCallback(
    (sagaId: string) => {
      const saga = getSaga(activeUniverse, sagaId);
      if (!saga || !isSagaUnlocked(saga, progress.unlockedRewards) || saga.chapters.length === 0) return;
      setProgress((prev) => ({
        ...prev,
        selectedSagaId: saga.id,
        currentChapterId: saga.chapters[0].id,
        villainInfluenceBySaga: {
          ...prev.villainInfluenceBySaga,
          [saga.id]: prev.villainInfluenceBySaga[saga.id] ?? 100,
        },
      }));
    },
    [activeUniverse, progress.unlockedRewards],
  );

  const switchSaga = useCallback(
    (sagaId: string, options?: { forceFirstChapter?: boolean }) => {
      const saga = getSaga(activeUniverse, sagaId);
      if (!saga || !isSagaUnlocked(saga, progress.unlockedRewards) || saga.chapters.length === 0) return;

      const chapterId = options?.forceFirstChapter
        ? saga.chapters[0].id
        : getSagaEntryChapterId(saga, progress);

      setProgress((prev) => ({
        ...prev,
        selectedSagaId: saga.id,
        currentChapterId: chapterId,
        dismissedTauntForChapterId: null,
        villainInfluenceBySaga: {
          ...prev.villainInfluenceBySaga,
          [saga.id]: prev.villainInfluenceBySaga[saga.id] ?? 100,
        },
      }));
    },
    [activeUniverse, progress],
  );

  const completeOnboarding = useCallback(() => {
    setProgress((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

  const addUserQuest = useCallback(
    (originalTitle: string, category: TaskCategory) => {
      const trimmed = originalTitle.trim();
      if (!trimmed) return;

      const converted = convertTaskToUserQuest(
        trimmed,
        category,
        activeUniverse,
        activeSaga,
        currentChapter,
      );

      setProgress((prev) => ({
        ...prev,
        userQuests: [
          ...prev.userQuests,
          { ...converted, id: createUserQuestId(), isCompleted: false },
        ],
      }));
    },
    [activeSaga, activeUniverse, currentChapter],
  );

  const markChapterIntroSeen = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      seenChapterIntros: prev.seenChapterIntros.includes(currentChapter.id)
        ? prev.seenChapterIntros
        : [...prev.seenChapterIntros, currentChapter.id],
    }));
  }, [currentChapter.id]);

  const maybeShowVillainTaunt = useCallback(() => {
    if (narrativeMoment) return;
    if (allQuestsComplete) return;
    if (progress.dismissedTauntForChapterId === currentChapter.id) return;

    const villain = getCharacter(activeSaga, activeSaga.villainCharacterId);
    if (!villain) return;

    const line = pickCharacterLine(villain, 'questMissed', currentChapter.order + completedQuestCount);
    setNarrativeMoment({
      type: 'villain_taunt',
      characterId: villain.id,
      line,
    });
  }, [
    activeSaga,
    allQuestsComplete,
    completedQuestCount,
    currentChapter.id,
    currentChapter.order,
    narrativeMoment,
    progress.dismissedTauntForChapterId,
  ]);

  const completeQuest = useCallback(
    (questId: string) => {
      const boardQuest = findBoardQuest(quests, questId);
      if (!boardQuest || boardQuest.completed) return;

      const updatedInfluence = Math.max(
        0,
        (progress.villainInfluenceBySaga[activeSaga.id] ?? 100) - boardQuest.reputationReward * 2,
      );
      const nextTotalXp = progress.totalXp + boardQuest.xpReward;
      const nextReputation = progress.reputation + boardQuest.reputationReward;
      const nextLevel = computeLevel(nextTotalXp).level;

      const charId = boardQuest.reactionCharacterId;
      const nextAffinity = (progress.characterAffinity[charId] ?? 0) + 1;

      const updatedCompletedIds =
        boardQuest.source === 'template'
          ? [...progress.completedQuestIds, questId]
          : progress.completedQuestIds;

      const chapterDoneCount = countCompletedTemplates(currentChapter, updatedCompletedIds);

      setProgress((prev) => ({
        ...prev,
        completedQuestIds: updatedCompletedIds,
        userQuests:
          boardQuest.source === 'user'
            ? prev.userQuests.map((q) => (q.id === questId ? { ...q, isCompleted: true } : q))
            : prev.userQuests,
        totalXp: nextTotalXp,
        level: nextLevel,
        reputation: nextReputation,
        villainInfluenceBySaga: {
          ...prev.villainInfluenceBySaga,
          [activeSaga.id]: updatedInfluence,
        },
        chapterCompletions: {
          ...prev.chapterCompletions,
          [currentChapter.id]: chapterDoneCount,
        },
        characterAffinity: {
          ...prev.characterAffinity,
          [charId]: nextAffinity,
        },
        relationshipByCharacter: {
          ...prev.relationshipByCharacter,
          [charId]: affinityToTier(nextAffinity),
        },
      }));

      const chapterAllDone = chapterDoneCount === currentChapter.questTemplates.length;
      const nextChapter = activeSaga.chapters.find((c) => c.order === currentChapter.order + 1);
      if (chapterAllDone) {
        const rewards = sumChapterTemplateRewards(currentChapter);
        pendingChapterCompleteRef.current = {
          chapterId: currentChapter.id,
          chapterOrder: currentChapter.order,
          chapterTitle: currentChapter.title,
          successDialogue: currentChapter.successDialogue,
          earnedXp: rewards.xp,
          earnedReputation: rewards.reputation,
          nextChapterId: nextChapter?.id ?? null,
          newReward: currentChapter.chapterReward,
        };
      }

      setXpBurst({ id: `${questId}-${Date.now()}`, amount: boardQuest.xpReward });

      const reactor = getCharacter(activeSaga, charId);
      if (reactor) {
        setNarrativeMoment({
          type: 'quest_complete',
          characterId: charId,
          line: pickCharacterLine(reactor, 'questComplete', updatedCompletedIds.length),
          questTitle: boardQuest.narrativeTitle,
        });
      }
    },
    [activeSaga, currentChapter, progress, quests],
  );

  const dismissNarrativeMoment = useCallback(() => {
    setNarrativeMoment((moment) => {
      if (!moment) return null;

      if (moment.type === 'villain_taunt') {
        setProgress((prev) => ({
          ...prev,
          dismissedTauntForChapterId: currentChapter.id,
        }));
        return null;
      }

      if (moment.type === 'quest_complete') {
        const pendingChapter = pendingChapterCompleteRef.current;
        pendingChapterCompleteRef.current = null;
        if (pendingChapter) {
          if (pendingChapter.newReward) {
            setProgress((prev) => ({
              ...prev,
              unlockedRewards: unlockRewardIds(prev.unlockedRewards, pendingChapter.newReward!.id),
            }));
          }
          setChapterComplete(pendingChapter);
        }
        return null;
      }

      return null;
    });
  }, [currentChapter.id]);

  const finalizeChapterComplete = useCallback(
    (options?: { switchToSagaId?: string; entryChapterId?: string }) => {
      setChapterComplete((current) => {
        if (!current) return null;

        setProgress((prev) => {
          const completedChapterIds = prev.completedChapterIds.includes(current.chapterId)
            ? prev.completedChapterIds
            : [...prev.completedChapterIds, current.chapterId];

          if (options?.switchToSagaId) {
            const targetSaga = getSaga(activeUniverse, options.switchToSagaId);
            const chapterId =
              options.entryChapterId ?? targetSaga.chapters[0]?.id ?? prev.currentChapterId;

            return {
              ...prev,
              selectedSagaId: targetSaga.id,
              currentChapterId: chapterId,
              completedChapterIds,
              dismissedTauntForChapterId: null,
              villainInfluenceBySaga: {
                ...prev.villainInfluenceBySaga,
                [targetSaga.id]: prev.villainInfluenceBySaga[targetSaga.id] ?? 100,
              },
            };
          }

          if (current.nextChapterId) {
            return {
              ...prev,
              currentChapterId: current.nextChapterId,
              completedChapterIds,
              dismissedTauntForChapterId: null,
            };
          }

          return { ...prev, completedChapterIds };
        });

        return null;
      });
    },
    [activeUniverse],
  );

  const continueFromChapterComplete = useCallback(() => {
    finalizeChapterComplete();
  }, [finalizeChapterComplete]);

  const startUnlockedSagaFromChapterComplete = useCallback(
    (sagaId: string, entryChapterId: string) => {
      finalizeChapterComplete({ switchToSagaId: sagaId, entryChapterId });
    },
    [finalizeChapterComplete],
  );

  const dismissXpBurst = useCallback(() => setXpBurst(null), []);

  const resetProgress = useCallback(async () => {
    await clearPlayerProgress();
    const fresh = createInitialProgress();
    setProgress(fresh);
    setXpBurst(null);
    setNarrativeMoment(null);
    setChapterComplete(null);
    pendingChapterCompleteRef.current = null;
    await savePlayerProgress(fresh);
  }, []);

  const value = useMemo<GameContextValue>(
    () => ({
      universes: UNIVERSES,
      activeUniverse,
      activeSaga,
      characters,
      currentChapter,
      chapters,
      quests,
      hasOnboarded: progress.hasOnboarded,
      playerProgress: progress,
      player,
      storyLine,
      villainInfluence,
      xpBurst,
      narrativeMoment,
      chapterComplete,
      showChapterIntro,
      completedQuestCount,
      allQuestsComplete,
      selectUniverse,
      selectSaga,
      switchSaga,
      completeOnboarding,
      addUserQuest,
      completeQuest,
      dismissXpBurst,
      markChapterIntroSeen,
      dismissNarrativeMoment,
      continueFromChapterComplete,
      startUnlockedSagaFromChapterComplete,
      maybeShowVillainTaunt,
      resetProgress,
      isHydrated,
    }),
    [
      activeSaga,
      activeUniverse,
      allQuestsComplete,
      chapters,
      characters,
      chapterComplete,
      completeOnboarding,
      addUserQuest,
      completeQuest,
      completedQuestCount,
      continueFromChapterComplete,
      currentChapter,
      dismissNarrativeMoment,
      dismissXpBurst,
      isHydrated,
      markChapterIntroSeen,
      maybeShowVillainTaunt,
      narrativeMoment,
      player,
      progress,
      quests,
      resetProgress,
      selectSaga,
      selectUniverse,
      showChapterIntro,
      startUnlockedSagaFromChapterComplete,
      storyLine,
      switchSaga,
      villainInfluence,
      xpBurst,
    ],
  );

  if (!isHydrated) {
    return null;
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
