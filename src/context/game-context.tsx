import { createContext, useCallback, useMemo, useRef, useState, type ReactNode } from 'react';

import { DUST_AND_IRON_UNIVERSE, getUniverse, UNIVERSES } from '@/data/narrative/wild-west-universe';
import {
  affinityToTier,
  getCharacter,
  pickCharacterLine,
} from '@/lib/narrative-helpers';
import { computeLevel, rankForLevel } from '@/lib/level';
import type {
  Chapter,
  NarrativeCharacter,
  NarrativeMoment,
  PlayerProgress,
  QuestTemplate,
  Saga,
  Universe,
} from '@/types/narrative';

export type XpBurst = { id: string; amount: number };
export type QuestTemplateState = QuestTemplate & { completed: boolean };

type GameContextValue = {
  universes: Universe[];
  activeUniverse: Universe;
  activeSaga: Saga;
  characters: NarrativeCharacter[];
  currentChapter: Chapter;
  chapters: Chapter[];
  quests: QuestTemplateState[];
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
  showChapterIntro: boolean;
  completedQuestCount: number;
  allQuestsComplete: boolean;
  selectUniverse: (universeId: string) => void;
  selectSaga: (sagaId: string) => void;
  completeOnboarding: () => void;
  completeQuest: (questTemplateId: string) => void;
  dismissXpBurst: () => void;
  markChapterIntroSeen: () => void;
  dismissNarrativeMoment: () => void;
  maybeShowVillainTaunt: () => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

const defaultUniverseId = DUST_AND_IRON_UNIVERSE.id;
const defaultSagaId = DUST_AND_IRON_UNIVERSE.sagas[0]?.id ?? '';
const defaultChapterId = DUST_AND_IRON_UNIVERSE.sagas[0]?.chapters[0]?.id ?? '';

const initialProgress: PlayerProgress = {
  hasOnboarded: false,
  selectedUniverseId: defaultUniverseId,
  selectedSagaId: defaultSagaId,
  currentChapterId: defaultChapterId,
  totalXp: 0,
  level: 1,
  reputation: 0,
  completedQuestIds: [],
  villainInfluenceBySaga: {
    [defaultSagaId]: 100,
  },
  chapterCompletions: {},
  relationshipByCharacter: {},
  characterAffinity: {},
  seenChapterIntros: [],
  dismissedTauntForChapterId: null,
};

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
  const [progress, setProgress] = useState<PlayerProgress>(initialProgress);
  const [xpBurst, setXpBurst] = useState<XpBurst | null>(null);
  const [narrativeMoment, setNarrativeMoment] = useState<NarrativeMoment | null>(null);
  const pendingTransitionRef = useRef<NarrativeMoment | null>(null);

  const activeUniverse = getUniverse(progress.selectedUniverseId);
  const activeSaga = getSaga(activeUniverse, progress.selectedSagaId);
  const chapters = activeSaga.chapters;
  const currentChapter = getChapter(activeSaga, progress.currentChapterId);
  const characters = activeSaga.characters;

  const quests = useMemo(
    () =>
      currentChapter.questTemplates.map((quest) => ({
        ...quest,
        completed: progress.completedQuestIds.includes(quest.id),
      })),
    [currentChapter.questTemplates, progress.completedQuestIds],
  );

  const completedQuestCount = quests.filter((q) => q.completed).length;
  const allQuestsComplete = quests.length > 0 && completedQuestCount === quests.length;

  const levelInfo = computeLevel(progress.totalXp);
  const rank = rankForLevel(activeSaga.rankTitles, levelInfo.level);
  const villainInfluence = progress.villainInfluenceBySaga[activeSaga.id] ?? 100;

  const storyLine = allQuestsComplete ? currentChapter.successDialogue : currentChapter.introDialogue;
  const showChapterIntro = !progress.seenChapterIntros.includes(currentChapter.id);

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
      if (!saga || saga.status === 'locked' || saga.chapters.length === 0) return;
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
    [activeUniverse],
  );

  const completeOnboarding = useCallback(() => {
    setProgress((prev) => ({ ...prev, hasOnboarded: true }));
  }, []);

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
    (questTemplateId: string) => {
      const quest = currentChapter.questTemplates.find((q) => q.id === questTemplateId);
      if (!quest || progress.completedQuestIds.includes(questTemplateId)) return;

      const updatedCompletedIds = [...progress.completedQuestIds, questTemplateId];
      const updatedInfluence = Math.max(
        0,
        (progress.villainInfluenceBySaga[activeSaga.id] ?? 100) - quest.reputationImpact * 2,
      );
      const nextTotalXp = progress.totalXp + quest.xpReward;
      const nextReputation = progress.reputation + quest.reputationImpact;
      const nextLevel = computeLevel(nextTotalXp).level;

      const chapterDoneCount = currentChapter.questTemplates.filter((template) =>
        updatedCompletedIds.includes(template.id),
      ).length;

      const charId = quest.reactionCharacterId;
      const nextAffinity = (progress.characterAffinity[charId] ?? 0) + 1;

      setProgress((prev) => ({
        ...prev,
        completedQuestIds: updatedCompletedIds,
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
      if (chapterAllDone && nextChapter) {
        pendingTransitionRef.current = {
          type: 'chapter_transition',
          fromChapterId: currentChapter.id,
          toChapterId: nextChapter.id,
          title: nextChapter.title,
        };
      }

      setXpBurst({ id: `${questTemplateId}-${Date.now()}`, amount: quest.xpReward });

      const reactor = getCharacter(activeSaga, charId);
      if (reactor) {
        setNarrativeMoment({
          type: 'quest_complete',
          characterId: charId,
          line: pickCharacterLine(reactor, 'questComplete', updatedCompletedIds.length),
          questTitle: quest.title,
        });
      }
    },
    [activeSaga, currentChapter.id, currentChapter.questTemplates, progress],
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
        const pending = pendingTransitionRef.current;
        pendingTransitionRef.current = null;
        return pending;
      }

      if (moment.type === 'chapter_transition') {
        setProgress((prev) => ({
          ...prev,
          currentChapterId: moment.toChapterId,
          dismissedTauntForChapterId: null,
        }));
        return null;
      }

      return null;
    });
  }, [currentChapter.id]);

  const dismissXpBurst = useCallback(() => setXpBurst(null), []);

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
      showChapterIntro,
      completedQuestCount,
      allQuestsComplete,
      selectUniverse,
      selectSaga,
      completeOnboarding,
      completeQuest,
      dismissXpBurst,
      markChapterIntroSeen,
      dismissNarrativeMoment,
      maybeShowVillainTaunt,
    }),
    [
      activeSaga,
      activeUniverse,
      allQuestsComplete,
      chapters,
      characters,
      completeOnboarding,
      completeQuest,
      completedQuestCount,
      currentChapter,
      dismissNarrativeMoment,
      dismissXpBurst,
      markChapterIntroSeen,
      maybeShowVillainTaunt,
      narrativeMoment,
      player,
      progress,
      quests,
      selectSaga,
      selectUniverse,
      showChapterIntro,
      storyLine,
      villainInfluence,
      xpBurst,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
