import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { type Href, router } from 'expo-router';

import { UNIVERSES } from '@/data/narrative/universes';
import {
  findUniverse,
  getDefaultSaga,
  getDefaultUniverse,
  resolveNarrativeState,
  restoreDefaultStoryProgress,
} from '@/lib/narrative-state';
import { narrativeWarn } from '@/lib/narrative-state-debug';
import { applyDailyStreakOnOpen, getLocalDateKey } from '@/lib/daily-streak';
import { recordChapterCompleted, recordQuestCompleted } from '@/lib/weekly-recap';
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
import { triggerQuestCompleteHaptic } from '@/lib/quest-haptics';
import {
  getChapterRewards,
  sumChapterTemplateRewards,
  unlockChapterRewards,
} from '@/lib/chapter-rewards';
import {
  appendSagaCompletedChapter,
  appendSagaCompletedQuest,
  getSagaActiveChapterId,
  getSagaCompletedQuestIds,
  getSagaDismissedTauntChapterId,
  setSagaActiveChapter,
} from '@/lib/saga-progress';
import {
  applyDevSwitchToDustAndIron,
  applyDevSwitchToNeonAshes,
  applyDevSwitchToNeuroNet,
  applyUniverseSelection,
  applyUniverseSagaSwitch,
  isSagaInPreview,
  NEON_ASHES_UNIVERSE_UNLOCK_ID,
  NEURONET_UNIVERSE_UNLOCK_ID,
} from '@/lib/dev-universe-switch';
import { isSagaUnlocked, isUniverseUnlocked, unlockRewardIds } from '@/lib/reward-unlocks';
import { getUniverseUiCopy } from '@/lib/universe-ui-copy';
import type {
  BoardQuest,
  Chapter,
  ChapterCompleteState,
  NarrativeCharacter,
  NarrativeMoment,
  PlayerProgress,
  QuestCompleteState,
  Saga,
  TaskCategory,
  Universe,
  UserQuest,
} from '@/types/narrative';

export type XpBurst = { id: string; amount: number };

type GameContextValue = {
  universes: Universe[];
  activeUniverse: Universe;
  activeSaga: Saga;
  characters: NarrativeCharacter[];
  currentChapter: Chapter | null;
  chapters: Chapter[];
  quests: BoardQuest[];
  narrativeStateValid: boolean;
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
  questComplete: QuestCompleteState | null;
  questCreated: UserQuest | null;
  addQuestSheetOpen: boolean;
  showChapterIntro: boolean;
  completedQuestCount: number;
  allQuestsComplete: boolean;
  isSagaPreview: boolean;
  selectUniverse: (universeId: string) => void;
  selectSaga: (sagaId: string) => void;
  switchSaga: (sagaId: string, options?: { forceFirstChapter?: boolean }) => void;
  completeOnboarding: () => void;
  addUserQuest: (originalTitle: string, category: TaskCategory) => void;
  openAddQuestSheet: () => void;
  closeAddQuestSheet: () => void;
  viewCreatedQuestOnBoard: () => void;
  addAnotherQuest: () => void;
  completeQuest: (questId: string) => void;
  dismissXpBurst: () => void;
  markChapterIntroSeen: () => void;
  dismissNarrativeMoment: () => void;
  dismissQuestComplete: () => void;
  continueFromChapterComplete: () => void;
  startUnlockedSagaFromChapterComplete: (sagaId: string, entryChapterId: string) => void;
  maybeShowVillainTaunt: () => void;
  resetProgress: () => Promise<void>;
  restoreDefaultStory: () => void;
  devAddXp: (amount: number) => void;
  devCompleteCurrentChapter: () => void;
  devUnlockVultureGangChapters: () => void;
  devUnlockIronRailwayCompany: () => void;
  devUnlockNeuroNet: () => void;
  devUnlockNeonAshes: () => void;
  devSwitchToNeuroNet: () => void;
  devSwitchToNeonAshes: () => void;
  devSwitchToDustAndIron: () => void;
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

export function GameProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<PlayerProgress>(createInitialProgress);
  const [isHydrated, setIsHydrated] = useState(false);
  const [xpBurst, setXpBurst] = useState<XpBurst | null>(null);
  const [narrativeMoment, setNarrativeMoment] = useState<NarrativeMoment | null>(null);
  const [chapterComplete, setChapterComplete] = useState<ChapterCompleteState | null>(null);
  const [questComplete, setQuestComplete] = useState<QuestCompleteState | null>(null);
  const [questCreated, setQuestCreated] = useState<UserQuest | null>(null);
  const [addQuestSheetOpen, setAddQuestSheetOpen] = useState(false);
  const pendingChapterCompleteRef = useRef<ChapterCompleteState | null>(null);

  useEffect(() => {
    let active = true;

    loadPlayerProgress().then((saved) => {
      if (!active) return;
      const base = saved ?? createInitialProgress();
      setProgress(applyDailyStreakOnOpen(base));
      setIsHydrated(true);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state !== 'active') return;
      setProgress((prev) => applyDailyStreakOnOpen(prev));
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    void savePlayerProgress(progress);
  }, [isHydrated, progress]);

  const resolvedNarrative = useMemo(() => resolveNarrativeState(progress), [progress]);
  const narrativeStateValid = resolvedNarrative.isValid;
  const activeUniverse = resolvedNarrative.universe ?? getDefaultUniverse();
  const activeSaga = resolvedNarrative.saga ?? getDefaultSaga();
  const currentChapter = resolvedNarrative.chapter;
  const chapters = activeSaga.chapters;
  const characters = activeSaga.characters;
  const isSagaPreview = isSagaInPreview(activeSaga);
  const sagaCompletedQuestIds = getSagaCompletedQuestIds(activeSaga, progress);

  useEffect(() => {
    if (!isHydrated || narrativeStateValid) return;
    narrativeWarn('Narrative state invalid after hydrate', resolvedNarrative.issues);
  }, [isHydrated, narrativeStateValid, resolvedNarrative.issues]);

  const quests = useMemo(
    () =>
      currentChapter ? buildBoardQuests(currentChapter, activeSaga, progress) : [],
    [activeSaga, currentChapter, progress],
  );

  const completedQuestCount = quests.filter((q) => q.completed).length;
  const completedTemplateCount = currentChapter
    ? countCompletedTemplates(currentChapter, sagaCompletedQuestIds)
    : 0;
  const allQuestsComplete =
    currentChapter !== null &&
    currentChapter.questTemplates.length > 0 &&
    completedTemplateCount === currentChapter.questTemplates.length;

  const levelInfo = computeLevel(progress.totalXp);
  const rank = rankForLevel(activeSaga.rankTitles, levelInfo.level);
  const villainInfluence = progress.villainInfluenceBySaga[activeSaga.id] ?? 100;

  const storyLine = currentChapter
    ? allQuestsComplete
      ? currentChapter.successDialogue
      : currentChapter.introDialogue
    : '';
  const showChapterIntro =
    currentChapter !== null &&
    !progress.seenChapterIntros.includes(currentChapter.id) &&
    chapterComplete === null;

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
    setProgress((prev) => {
      const universe = findUniverse(universeId);
      if (!universe || !isUniverseUnlocked(universe, prev.unlockedRewards)) return prev;

      return applyUniverseSelection(prev, universe.id);
    });
  }, []);

  const selectSaga = useCallback(
    (sagaId: string) => {
      setProgress((prev) => {
        const universe = findUniverse(prev.selectedUniverseId) ?? activeUniverse;
        const saga = getSaga(universe, sagaId);
        if (!saga || !isSagaUnlocked(saga, prev.unlockedRewards)) return prev;

        return applyUniverseSagaSwitch(prev, universe.id, saga.id);
      });
    },
    [activeUniverse],
  );

  const switchSaga = useCallback(
    (sagaId: string, options?: { forceFirstChapter?: boolean }) => {
      setProgress((prev) => {
        const universe = findUniverse(prev.selectedUniverseId) ?? activeUniverse;
        const saga = getSaga(universe, sagaId);
        if (!saga || !isSagaUnlocked(saga, prev.unlockedRewards)) return prev;

        if (options?.forceFirstChapter && saga.chapters.length > 0) {
          return applyUniverseSagaSwitch(prev, universe.id, saga.id, saga.chapters[0]!.id);
        }

        return applyUniverseSagaSwitch(prev, universe.id, saga.id);
      });
    },
    [activeUniverse],
  );

  const completeOnboarding = useCallback(() => {
    setProgress((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

  const addUserQuest = useCallback(
    (originalTitle: string, category: TaskCategory) => {
      const trimmed = originalTitle.trim();
      if (!trimmed || !currentChapter) return;

      const converted = convertTaskToUserQuest(
        trimmed,
        category,
        activeUniverse,
        activeSaga,
        currentChapter,
      );

      const quest: UserQuest = {
        ...converted,
        id: createUserQuestId(),
        isCompleted: false,
        createdOnDate: getLocalDateKey(),
      };

      setProgress((prev) => ({
        ...prev,
        userQuests: [...prev.userQuests, quest],
      }));
      setAddQuestSheetOpen(false);
      setQuestCreated(quest);
    },
    [activeSaga, activeUniverse, currentChapter],
  );

  const openAddQuestSheet = useCallback(() => {
    setAddQuestSheetOpen(true);
  }, []);

  const closeAddQuestSheet = useCallback(() => {
    setAddQuestSheetOpen(false);
  }, []);

  const viewCreatedQuestOnBoard = useCallback(() => {
    setQuestCreated(null);
    router.push('/(game)/quests' as Href);
  }, []);

  const addAnotherQuest = useCallback(() => {
    setQuestCreated(null);
    setAddQuestSheetOpen(true);
  }, []);

  const markChapterIntroSeen = useCallback(() => {
    if (!currentChapter) return;

    setProgress((prev) => ({
      ...prev,
      seenChapterIntros: prev.seenChapterIntros.includes(currentChapter.id)
        ? prev.seenChapterIntros
        : [...prev.seenChapterIntros, currentChapter.id],
    }));
  }, [currentChapter]);

  const maybeShowVillainTaunt = useCallback(() => {
    if (!currentChapter) return;
    if (narrativeMoment) return;
    if (allQuestsComplete) return;
    if (getSagaDismissedTauntChapterId(activeSaga.id, progress) === currentChapter.id) return;

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
    currentChapter,
    narrativeMoment,
    progress.dismissedTauntBySagaId,
  ]);

  const completeQuest = useCallback(
    (questId: string) => {
      if (!currentChapter) return;
      if (questComplete || chapterComplete) return;

      const boardQuest = findBoardQuest(quests, questId);
      if (!boardQuest || boardQuest.completed) return;

      triggerQuestCompleteHaptic();

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
          ? [...sagaCompletedQuestIds, questId]
          : sagaCompletedQuestIds;

      const chapterDoneCount = countCompletedTemplates(currentChapter, updatedCompletedIds);

      setProgress((prev) => {
        const withQuestCompletion =
          boardQuest.source === 'template'
            ? appendSagaCompletedQuest(prev, activeSaga.id, questId)
            : prev;

        return recordQuestCompleted(
          {
            ...withQuestCompletion,
            userQuests:
              boardQuest.source === 'user'
                ? prev.userQuests.map((quest) =>
                    quest.id === questId ? { ...quest, isCompleted: true } : quest,
                  )
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
          },
          boardQuest.xpReward,
          boardQuest.reputationReward,
        );
      });

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
          newRewards: getChapterRewards(currentChapter),
        };
      }

      const reactor = getCharacter(activeSaga, charId);
      const ui = getUniverseUiCopy(activeUniverse);
      setQuestComplete({
        questId,
        source: boardQuest.source,
        narrativeTitle: boardQuest.narrativeTitle,
        earnedXp: boardQuest.xpReward,
        earnedReputation: boardQuest.reputationReward,
        characterId: charId,
        characterLine: reactor
          ? pickCharacterLine(reactor, 'questComplete', updatedCompletedIds.length)
          : ui.questCompleteFallbackLine,
      });
    },
    [activeSaga, activeUniverse, chapterComplete, currentChapter, progress, questComplete, quests, sagaCompletedQuestIds],
  );

  const dismissQuestComplete = useCallback(() => {
    setQuestComplete((current) => {
      if (!current) return null;

      const pendingChapter = pendingChapterCompleteRef.current;
      pendingChapterCompleteRef.current = null;
      if (pendingChapter) {
        if (pendingChapter.newRewards?.length) {
          setProgress((prev) => ({
            ...prev,
            unlockedRewards: unlockChapterRewards(
              prev.unlockedRewards,
              pendingChapter.newRewards!,
            ),
          }));
        }
        setChapterComplete(pendingChapter);
      }

      return null;
    });
  }, []);

  const dismissNarrativeMoment = useCallback(() => {
    setNarrativeMoment((moment) => {
      if (!moment) return null;

      if (moment.type === 'villain_taunt' && currentChapter) {
        setProgress((prev) => ({
          ...prev,
          dismissedTauntBySagaId: {
            ...prev.dismissedTauntBySagaId,
            [activeSaga.id]: currentChapter.id,
          },
        }));
      }

      return null;
    });
  }, [activeSaga.id, currentChapter]);

  const finalizeChapterComplete = useCallback(
    (options?: { switchToSagaId?: string; entryChapterId?: string }) => {
      setChapterComplete((current) => {
        if (!current) return null;

        setProgress((prev) => {
          let next = appendSagaCompletedChapter(prev, activeSaga.id, current.chapterId);

          if (options?.switchToSagaId) {
            const targetSaga = getSaga(activeUniverse, options.switchToSagaId);
            const chapterId =
              options.entryChapterId ??
              targetSaga.chapters[0]?.id ??
              getSagaActiveChapterId(targetSaga, next);

            next = setSagaActiveChapter(next, targetSaga.id, chapterId);
            next = {
              ...next,
              dismissedTauntBySagaId: {
                ...next.dismissedTauntBySagaId,
                [targetSaga.id]: null,
              },
              villainInfluenceBySaga: {
                ...next.villainInfluenceBySaga,
                [targetSaga.id]: next.villainInfluenceBySaga[targetSaga.id] ?? 100,
              },
            };
            return recordChapterCompleted(next);
          }

          if (current.nextChapterId) {
            next = setSagaActiveChapter(next, activeSaga.id, current.nextChapterId);
            next = {
              ...next,
              dismissedTauntBySagaId: {
                ...next.dismissedTauntBySagaId,
                [activeSaga.id]: null,
              },
            };
          }

          return recordChapterCompleted(next);
        });

        return null;
      });
    },
    [activeSaga.id, activeUniverse],
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

  const devAddXp = useCallback((amount: number) => {
    if (!__DEV__) return;
    setProgress((prev) => {
      const nextTotalXp = prev.totalXp + amount;
      return { ...prev, totalXp: nextTotalXp, level: computeLevel(nextTotalXp).level };
    });
  }, []);

  const devCompleteCurrentChapter = useCallback(() => {
    if (!__DEV__ || !currentChapter) return;

    const templateIds = currentChapter.questTemplates.map((template) => template.id);
    const nextChapter = activeSaga.chapters.find(
      (chapter) => chapter.order === currentChapter.order + 1,
    );

    setProgress((prev) => {
      let next = appendSagaCompletedChapter(prev, activeSaga.id, currentChapter.id);
      const sagaQuestIds = new Set([
        ...(next.completedQuestIdsBySagaId[activeSaga.id] ?? []),
        ...templateIds,
      ]);

      next = {
        ...next,
        completedQuestIdsBySagaId: {
          ...next.completedQuestIdsBySagaId,
          [activeSaga.id]: [...sagaQuestIds],
        },
        unlockedRewards: unlockChapterRewards(
          next.unlockedRewards,
          getChapterRewards(currentChapter),
        ),
        seenChapterIntros: next.seenChapterIntros.includes(currentChapter.id)
          ? next.seenChapterIntros
          : [...next.seenChapterIntros, currentChapter.id],
        chapterCompletions: {
          ...next.chapterCompletions,
          [currentChapter.id]: currentChapter.questTemplates.length,
        },
      };

      if (nextChapter) {
        next = setSagaActiveChapter(next, activeSaga.id, nextChapter.id);
      }

      return next;
    });
  }, [activeSaga, currentChapter]);

  const devUnlockVultureGangChapters = useCallback(() => {
    if (!__DEV__) return;

    const vultureSaga = activeUniverse.sagas.find((saga) => saga.id === 'vulture-gang');
    if (!vultureSaga || vultureSaga.chapters.length === 0) return;

    const allChapterIds = vultureSaga.chapters.map((chapter) => chapter.id);
    const allQuestIds = vultureSaga.chapters.flatMap((chapter) =>
      chapter.questTemplates.map((template) => template.id),
    );
    const lastChapterId = vultureSaga.chapters[vultureSaga.chapters.length - 1]!.id;

    setProgress((prev) => {
      let unlockedRewards = prev.unlockedRewards;
      for (const chapter of vultureSaga.chapters) {
        unlockedRewards = unlockChapterRewards(unlockedRewards, getChapterRewards(chapter));
      }

      const next: PlayerProgress = {
        ...prev,
        completedChapterIdsBySagaId: {
          ...prev.completedChapterIdsBySagaId,
          'vulture-gang': allChapterIds,
        },
        completedQuestIdsBySagaId: {
          ...prev.completedQuestIdsBySagaId,
          'vulture-gang': allQuestIds,
        },
        unlockedRewards,
        activeChapterBySagaId: {
          ...prev.activeChapterBySagaId,
          'vulture-gang': lastChapterId,
        },
      };

      return activeSaga.id === 'vulture-gang'
        ? setSagaActiveChapter(next, 'vulture-gang', lastChapterId)
        : next;
    });
  }, [activeSaga.id, activeUniverse.sagas]);

  const devUnlockIronRailwayCompany = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => ({
      ...prev,
      unlockedRewards: unlockRewardIds(prev.unlockedRewards, 'high-noon-story-unlock'),
    }));
  }, []);

  const devUnlockNeuroNet = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => ({
      ...prev,
      unlockedRewards: unlockRewardIds(prev.unlockedRewards, NEURONET_UNIVERSE_UNLOCK_ID),
    }));
  }, []);

  const devUnlockNeonAshes = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => ({
      ...prev,
      unlockedRewards: unlockRewardIds(prev.unlockedRewards, NEON_ASHES_UNIVERSE_UNLOCK_ID),
    }));
  }, []);

  const devSwitchToNeonAshes = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => applyDevSwitchToNeonAshes(prev));
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    pendingChapterCompleteRef.current = null;
  }, []);

  const devSwitchToNeuroNet = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => applyDevSwitchToNeuroNet(prev));
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    pendingChapterCompleteRef.current = null;
  }, []);

  const devSwitchToDustAndIron = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => applyDevSwitchToDustAndIron(prev));
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    pendingChapterCompleteRef.current = null;
  }, []);

  const restoreDefaultStory = useCallback(() => {
    setProgress((prev) => restoreDefaultStoryProgress(prev));
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    pendingChapterCompleteRef.current = null;
  }, []);

  const resetProgress = useCallback(async () => {
    await clearPlayerProgress();
    const fresh = createInitialProgress();
    setProgress(fresh);
    setXpBurst(null);
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    setQuestCreated(null);
    setAddQuestSheetOpen(false);
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
      narrativeStateValid,
      playerProgress: progress,
      player,
      storyLine,
      villainInfluence,
      xpBurst,
      narrativeMoment,
      chapterComplete,
      questComplete,
      questCreated,
      addQuestSheetOpen,
      showChapterIntro,
      completedQuestCount,
      allQuestsComplete,
      isSagaPreview,
      selectUniverse,
      selectSaga,
      switchSaga,
      completeOnboarding,
      addUserQuest,
      openAddQuestSheet,
      closeAddQuestSheet,
      viewCreatedQuestOnBoard,
      addAnotherQuest,
      completeQuest,
      dismissXpBurst,
      markChapterIntroSeen,
      dismissNarrativeMoment,
      dismissQuestComplete,
      continueFromChapterComplete,
      startUnlockedSagaFromChapterComplete,
      maybeShowVillainTaunt,
      resetProgress,
      restoreDefaultStory,
      devAddXp,
      devCompleteCurrentChapter,
      devUnlockVultureGangChapters,
      devUnlockIronRailwayCompany,
      devUnlockNeuroNet,
      devUnlockNeonAshes,
      devSwitchToNeuroNet,
      devSwitchToNeonAshes,
      devSwitchToDustAndIron,
      isHydrated,
    }),
    [
      activeSaga,
      activeUniverse,
      addAnotherQuest,
      addQuestSheetOpen,
      addUserQuest,
      allQuestsComplete,
      chapters,
      characters,
      chapterComplete,
      closeAddQuestSheet,
      completeOnboarding,
      completeQuest,
      completedQuestCount,
      continueFromChapterComplete,
      currentChapter,
      devAddXp,
      devCompleteCurrentChapter,
      devUnlockIronRailwayCompany,
      devUnlockNeuroNet,
      devUnlockNeonAshes,
      devSwitchToNeuroNet,
      devSwitchToNeonAshes,
      devSwitchToDustAndIron,
      devUnlockVultureGangChapters,
      dismissNarrativeMoment,
      dismissQuestComplete,
      dismissXpBurst,
      isHydrated,
      isSagaPreview,
      markChapterIntroSeen,
      maybeShowVillainTaunt,
      narrativeMoment,
      openAddQuestSheet,
      player,
      narrativeStateValid,
      progress,
      questComplete,
      questCreated,
      quests,
      resetProgress,
      restoreDefaultStory,
      selectSaga,
      selectUniverse,
      showChapterIntro,
      startUnlockedSagaFromChapterComplete,
      storyLine,
      switchSaga,
      viewCreatedQuestOnBoard,
      villainInfluence,
      xpBurst,
    ],
  );

  if (!isHydrated) {
    return null;
  }

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
