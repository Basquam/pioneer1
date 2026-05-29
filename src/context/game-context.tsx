import { createContext, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import * as Haptics from 'expo-haptics';
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
import { getLocalDateKey } from '@/lib/daily-streak';
import {
  canLockTodayFocus,
  isTodayFocusLocked,
  lockTodayFocus,
  unlockTodayFocus,
} from '@/lib/focus-lock';
import {
  applySessionOnOpen,
  getRecoveryQuestCopy,
  markRecoveryQuestComplete,
  shouldMarkRecoveryOnQuestComplete,
  shouldShowRecoveryPrompt,
} from '@/lib/recovery-quest';
import { recordChapterCompleted, recordQuestCompleted } from '@/lib/weekly-recap';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { createUserQuestFromTask, type CreateUserQuestOptions } from '@/lib/convert-task-to-quest';
import {
  createRecurringQuestTemplate,
  disableRecurringQuestTemplate,
  generateRecurringQuestInstances,
  type AddUserQuestOptions,
} from '@/lib/recurring-quests';
import { formatRewardRitualUnlockedLine, getAfterQuestRewardCopy } from '@/lib/after-quest-reward';
import { markQuestStarted } from '@/lib/decisive-moment';
import { castIdentityVote, getTraitForCategory } from '@/lib/identity-votes';
import {
  appendEvidenceEvent,
  buildEvidenceEventFromQuestCompletion,
} from '@/lib/evidence-log';
import {
  buildIdentityMilestoneUnlock,
  detectIdentityMilestoneUnlock,
} from '@/lib/identity-milestones';
import type { UserQuestReadinessUpdates } from '@/lib/quest-readiness';
import {
  dismissDailyAwarenessForToday,
  recordDailyAwarenessAnswer,
  shouldShowDailyAwarenessCheck,
} from '@/lib/daily-awareness';
import { recordWeeklyReview } from '@/lib/weekly-review';
import type {
  DailyAwarenessBlocker,
  QuestDistractionType,
  QuestFrictionReason,
  WeeklyReviewHelpedFactor,
  WeeklyReviewSlowdownFactor,
} from '@/types/narrative';
import {
  affinityToTier,
  getCharacter,
  pickCharacterLine,
} from '@/lib/narrative-helpers';
import { computeLevel, rankForLevel } from '@/lib/level';
import { pruneUserQuests } from '@/lib/player-progress-sanitize';
import {
  clearPlayerProgress,
  createInitialProgress,
  loadPlayerProgress,
  restorePlayerProgress,
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
  QuestRiskLevel,
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
  addQuestRecoveryMode: boolean;
  improveQuestId: string | null;
  frictionReviewQuestId: string | null;
  focusQuest: BoardQuest | null;
  focusDecisiveMoment: boolean;
  showRecoveryPrompt: boolean;
  showDailyAwarenessCheck: boolean;
  isTodayFocusLocked: boolean;
  showChapterIntro: boolean;
  showHqTutorial: boolean;
  completedQuestCount: number;
  allQuestsComplete: boolean;
  isSagaPreview: boolean;
  selectUniverse: (universeId: string) => void;
  selectSaga: (sagaId: string) => void;
  switchSaga: (sagaId: string, options?: { forceFirstChapter?: boolean }) => void;
  completeOnboarding: () => void;
  addUserQuest: (originalTitle: string, category: TaskCategory, options?: AddUserQuestOptions) => void;
  addUserQuestPack: (
    items: Array<{ originalTitle: string; category: TaskCategory; options?: CreateUserQuestOptions }>,
  ) => void;
  questPackSheetOpen: boolean;
  openQuestPackSheet: () => void;
  closeQuestPackSheet: () => void;
  openAddQuestSheet: () => void;
  openRecoveryQuestSheet: () => void;
  lockTodayFocus: () => void;
  openQuestFocus: (questId: string) => void;
  startQuestNow: (questId: string) => void;
  closeQuestFocus: () => void;
  closeAddQuestSheet: () => void;
  viewCreatedQuestOnBoard: () => void;
  addAnotherQuest: () => void;
  completeQuest: (questId: string) => void;
  updateUserQuest: (questId: string, updates: UserQuestReadinessUpdates) => void;
  openImproveQuest: (questId: string) => void;
  closeImproveQuest: () => void;
  openFrictionReview: (questId: string) => void;
  closeFrictionReview: () => void;
  recordFrictionReview: (questId: string, reason: QuestFrictionReason) => void;
  markFrictionFixApplied: (questId: string) => void;
  archiveUserQuest: (questId: string) => void;
  disableRecurringQuest: (templateId: string) => void;
  recordFocusDistraction: (questId: string, distraction: QuestDistractionType) => void;
  markFrictionShieldApplied: (questId: string) => void;
  submitDailyAwareness: (blocker: DailyAwarenessBlocker) => void;
  dismissDailyAwarenessCheck: () => void;
  submitWeeklyReview: (
    helpedFactors: WeeklyReviewHelpedFactor[],
    slowdownFactor: WeeklyReviewSlowdownFactor,
  ) => void;
  dismissXpBurst: () => void;
  markChapterIntroSeen: () => void;
  dismissHqTutorial: () => void;
  startHqTutorialAddQuest: () => void;
  dismissNarrativeMoment: () => void;
  dismissQuestComplete: () => void;
  continueFromChapterComplete: () => void;
  startUnlockedSagaFromChapterComplete: (sagaId: string, entryChapterId: string) => void;
  maybeShowVillainTaunt: () => void;
  resetProgress: () => Promise<void>;
  importProgress: (progress: PlayerProgress) => Promise<void>;
  restoreDefaultStory: () => void;
  devAddXp: (amount: number) => void;
  devCompleteCurrentChapter: () => void;
  devUnlockTodayFocus: () => void;
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
  const [questPackSheetOpen, setQuestPackSheetOpen] = useState(false);
  const [addQuestRecoveryMode, setAddQuestRecoveryMode] = useState(false);
  const [focusQuestId, setFocusQuestId] = useState<string | null>(null);
  const [focusDecisiveMoment, setFocusDecisiveMoment] = useState(false);
  const [improveQuestId, setImproveQuestId] = useState<string | null>(null);
  const [frictionReviewQuestId, setFrictionReviewQuestId] = useState<string | null>(null);
  const pendingChapterCompleteRef = useRef<ChapterCompleteState | null>(null);

  useEffect(() => {
    let active = true;

    loadPlayerProgress().then((saved) => {
      if (!active) return;
      const base = saved ?? createInitialProgress();
      setProgress(applySessionOnOpen(base));
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

  const resolvedNarrative = useMemo(() => resolveNarrativeState(progress), [progress]);
  const narrativeStateValid = resolvedNarrative.isValid;
  const activeUniverse = resolvedNarrative.universe ?? getDefaultUniverse();
  const activeSaga = resolvedNarrative.saga ?? getDefaultSaga();
  const currentChapter = resolvedNarrative.chapter;
  const chapters = activeSaga.chapters;
  const characters = activeSaga.characters;
  const isSagaPreview = isSagaInPreview(activeSaga);
  const sagaCompletedQuestIds = progress.completedQuestIdsBySagaId[activeSaga.id] ?? [];

  useEffect(() => {
    if (!isHydrated) return;

    const handleAppStateChange = (state: AppStateStatus) => {
      if (state !== 'active') return;
      setProgress((prev) => {
        let next = applySessionOnOpen(prev);
        if (currentChapter) {
          next = generateRecurringQuestInstances(next, {
            universe: activeUniverse,
            saga: activeSaga,
            chapter: currentChapter,
          });
        }
        return next;
      });
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [isHydrated, activeUniverse, activeSaga, currentChapter]);

  useEffect(() => {
    if (!isHydrated || !currentChapter) return;
    setProgress((prev) =>
      generateRecurringQuestInstances(prev, {
        universe: activeUniverse,
        saga: activeSaga,
        chapter: currentChapter,
      }),
    );
  }, [isHydrated, activeUniverse, activeSaga, currentChapter]);

  useEffect(() => {
    if (!isHydrated || narrativeStateValid) return;
    narrativeWarn('Narrative state invalid after hydrate', resolvedNarrative.issues);
  }, [isHydrated, narrativeStateValid, resolvedNarrative.issues]);

  const questBoardProgress = useMemo(
    () => ({
      userQuests: progress.userQuests,
      completedQuestIdsBySagaId: progress.completedQuestIdsBySagaId,
      selectedUniverseId: progress.selectedUniverseId,
      dailyFocusLimit: progress.dailyFocusLimit,
      focusLockedDate: progress.focusLockedDate,
      lockedFocusQuestIds: progress.lockedFocusQuestIds,
      templateQuestStartedAt: progress.templateQuestStartedAt,
    }),
    [
      progress.completedQuestIdsBySagaId,
      progress.dailyFocusLimit,
      progress.focusLockedDate,
      progress.lockedFocusQuestIds,
      progress.selectedUniverseId,
      progress.templateQuestStartedAt,
      progress.userQuests,
    ],
  );

  const quests = useMemo(
    () =>
      currentChapter ? buildBoardQuests(currentChapter, activeSaga, questBoardProgress) : [],
    [activeSaga, currentChapter, questBoardProgress],
  );

  const completedQuestCount = quests.filter((q) => q.completed).length;
  const focusQuest = useMemo(
    () => (focusQuestId ? quests.find((quest) => quest.id === focusQuestId) ?? null : null),
    [focusQuestId, quests],
  );

  useEffect(() => {
    if (focusQuestId && !focusQuest) {
      setFocusQuestId(null);
    }
  }, [focusQuest, focusQuestId]);
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
    (currentChapter.introScene?.length ?? 0) > 0 &&
    !progress.seenChapterIntros.includes(currentChapter.id) &&
    chapterComplete === null;

  const showRecoveryPrompt = useMemo(
    () => isHydrated && shouldShowRecoveryPrompt(progress),
    [isHydrated, progress],
  );

  const todayFocusLocked = useMemo(
    () => isHydrated && isTodayFocusLocked(progress),
    [isHydrated, progress],
  );

  const showHqTutorial =
    isHydrated &&
    progress.hasOnboarded &&
    !progress.tutorialSeen &&
    !showChapterIntro &&
    chapterComplete === null &&
    questComplete === null &&
    questCreated === null &&
    narrativeMoment === null;

  const showDailyAwarenessCheck = useMemo(
    () =>
      isHydrated &&
      progress.hasOnboarded &&
      !showHqTutorial &&
      shouldShowDailyAwarenessCheck(progress),
    [isHydrated, progress, showHqTutorial],
  );

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
    setProgress((prev) => {
      const next: PlayerProgress = { ...prev, hasOnboarded: true };
      if (prev.firstUniverseId !== null) return next;

      return {
        ...next,
        firstUniverseId: prev.selectedUniverseId,
        firstSagaId: prev.selectedSagaId,
        onboardingCompletedAt: getLocalDateKey(),
      };
    });
  }, []);

  const addUserQuest = useCallback(
    (originalTitle: string, category: TaskCategory, options?: AddUserQuestOptions) => {
      const trimmed = originalTitle.trim();
      if (!trimmed || !currentChapter) return;

      setProgress((prev) => {
        const { recurring, ...questOptions } = options ?? {};
        let recurringQuestTemplates = prev.recurringQuestTemplates;
        let generatedFromRecurringQuestId = questOptions.generatedFromRecurringQuestId;

        if (recurring) {
          const template = createRecurringQuestTemplate(trimmed, category, recurring, questOptions);
          recurringQuestTemplates = [...recurringQuestTemplates, template];
          generatedFromRecurringQuestId = template.id;
        }

        const quest = createUserQuestFromTask(
          trimmed,
          category,
          activeUniverse,
          activeSaga,
          currentChapter,
          prev.userQuests,
          {
            ...questOptions,
            ...(generatedFromRecurringQuestId
              ? {
                  generatedFromRecurringQuestId,
                  plannedTimeLabel:
                    questOptions.plannedTimeLabel ?? recurring?.preferredTimeLabel?.trim(),
                }
              : {}),
          },
        );

        setAddQuestSheetOpen(false);
        setQuestCreated(quest);

        return {
          ...prev,
          recurringQuestTemplates,
          userQuests: pruneUserQuests([...prev.userQuests, quest]),
        };
      });
    },
    [activeSaga, activeUniverse, currentChapter],
  );

  const disableRecurringQuest = useCallback((templateId: string) => {
    setProgress((prev) => disableRecurringQuestTemplate(prev, templateId));
  }, []);

  const addUserQuestPack = useCallback(
    (items: Array<{ originalTitle: string; category: TaskCategory; options?: CreateUserQuestOptions }>) => {
      if (!currentChapter || items.length === 0) return;

      setProgress((prev) => {
        const created: UserQuest[] = [];
        let workingQuests = prev.userQuests;

        for (const item of items) {
          const trimmed = item.originalTitle.trim();
          if (!trimmed) continue;

          const quest = createUserQuestFromTask(
            trimmed,
            item.category,
            activeUniverse,
            activeSaga,
            currentChapter,
            workingQuests,
            item.options,
          );
          created.push(quest);
          workingQuests = [...workingQuests, quest];
        }

        if (created.length === 0) return prev;

        setAddQuestSheetOpen(false);
        setQuestPackSheetOpen(false);

        return {
          ...prev,
          userQuests: pruneUserQuests([...prev.userQuests, ...created]),
        };
      });
    },
    [activeSaga, activeUniverse, currentChapter],
  );

  const openQuestPackSheet = useCallback(() => {
    setAddQuestSheetOpen(false);
    setQuestPackSheetOpen(true);
  }, []);

  const closeQuestPackSheet = useCallback(() => {
    setQuestPackSheetOpen(false);
  }, []);

  const openAddQuestSheet = useCallback(() => {
    setAddQuestRecoveryMode(false);
    setAddQuestSheetOpen(true);
  }, []);

  const openRecoveryQuestSheet = useCallback(() => {
    setAddQuestRecoveryMode(true);
    setAddQuestSheetOpen(true);
  }, []);

  const closeQuestFocus = useCallback(() => {
    setFocusQuestId(null);
    setFocusDecisiveMoment(false);
  }, []);

  const openQuestFocus = useCallback((questId: string) => {
    setFocusDecisiveMoment(false);
    setFocusQuestId(questId);
  }, []);

  const startQuestNow = useCallback((questId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProgress((prev) => markQuestStarted(prev, questId));
    setFocusDecisiveMoment(true);
    setFocusQuestId(questId);
  }, []);

  const openImproveQuest = useCallback((questId: string) => {
    setImproveQuestId(questId);
  }, []);

  const closeImproveQuest = useCallback(() => {
    setImproveQuestId(null);
  }, []);

  const openFrictionReview = useCallback((questId: string) => {
    setFrictionReviewQuestId(questId);
  }, []);

  const closeFrictionReview = useCallback(() => {
    setFrictionReviewQuestId(null);
  }, []);

  const updateUserQuest = useCallback(
    (questId: string, updates: UserQuestReadinessUpdates) => {
      setProgress((prev) => ({
        ...prev,
        userQuests: prev.userQuests.map((quest) => {
          if (quest.id !== questId) return quest;

          const next: UserQuest = { ...quest };

          if ('starterTaskTitle' in updates) {
            const value = updates.starterTaskTitle?.trim();
            if (value) next.starterTaskTitle = value;
            else delete next.starterTaskTitle;
          }

          if ('implementationIntention' in updates) {
            const value = updates.implementationIntention?.trim();
            if (value) next.implementationIntention = value;
            else delete next.implementationIntention;
          }

          if ('prepStepTitle' in updates) {
            const value = updates.prepStepTitle?.trim();
            if (value) next.prepStepTitle = value;
            else delete next.prepStepTitle;
          }

          if ('focusPinned' in updates) {
            if (updates.focusPinned) next.focusPinned = true;
            else delete next.focusPinned;
          }

          if ('originalTitle' in updates) {
            const value = updates.originalTitle?.trim();
            if (value) next.originalTitle = value;
          }

          if ('plannedTimeLabel' in updates) {
            const value = updates.plannedTimeLabel?.trim();
            if (value) next.plannedTimeLabel = value;
            else delete next.plannedTimeLabel;
          }

          if ('afterCurrentHabit' in updates) {
            const value = updates.afterCurrentHabit?.trim();
            if (value) next.afterCurrentHabit = value;
            else delete next.afterCurrentHabit;
          }

          return next;
        }),
      }));
    },
    [],
  );

  const recordFrictionReview = useCallback((questId: string, reason: QuestFrictionReason) => {
    setProgress((prev) => ({
      ...prev,
      userQuests: prev.userQuests.map((quest) => {
        if (quest.id !== questId) return quest;

        const review = {
          reason,
          reviewedAt: new Date().toISOString(),
          suggestedFixApplied: false,
        };

        return {
          ...quest,
          frictionReviews: [...(quest.frictionReviews ?? []), review].slice(-10),
        };
      }),
    }));
  }, []);

  const markFrictionFixApplied = useCallback((questId: string) => {
    setProgress((prev) => ({
      ...prev,
      userQuests: prev.userQuests.map((quest) => {
        if (quest.id !== questId || !quest.frictionReviews?.length) return quest;

        const reviews = [...quest.frictionReviews];
        const lastIndex = reviews.length - 1;
        const last = reviews[lastIndex];
        if (!last || last.suggestedFixApplied) return quest;

        reviews[lastIndex] = { ...last, suggestedFixApplied: true };
        return { ...quest, frictionReviews: reviews };
      }),
    }));
  }, []);

  const archiveUserQuest = useCallback((questId: string) => {
    setProgress((prev) => ({
      ...prev,
      userQuests: prev.userQuests.map((quest) =>
        quest.id === questId
          ? { ...quest, archivedAt: getLocalDateKey() }
          : quest,
      ),
    }));
  }, []);

  const recordFocusDistraction = useCallback(
    (questId: string, distraction: QuestDistractionType) => {
      setProgress((prev) => ({
        ...prev,
        userQuests: prev.userQuests.map((quest) =>
          quest.id === questId
            ? { ...quest, lastFocusDistraction: distraction, frictionShieldAppliedAt: undefined }
            : quest,
        ),
      }));
    },
    [],
  );

  const markFrictionShieldApplied = useCallback((questId: string) => {
    const appliedAt = new Date().toISOString();
    setProgress((prev) => ({
      ...prev,
      userQuests: prev.userQuests.map((quest) =>
        quest.id === questId ? { ...quest, frictionShieldAppliedAt: appliedAt } : quest,
      ),
    }));
  }, []);

  const submitDailyAwareness = useCallback((blocker: DailyAwarenessBlocker) => {
    setProgress((prev) => recordDailyAwarenessAnswer(prev, blocker));
  }, []);

  const dismissDailyAwarenessCheck = useCallback(() => {
    setProgress((prev) => dismissDailyAwarenessForToday(prev));
  }, []);

  const submitWeeklyReview = useCallback(
    (helpedFactors: WeeklyReviewHelpedFactor[], slowdownFactor: WeeklyReviewSlowdownFactor) => {
      setProgress((prev) => recordWeeklyReview(prev, helpedFactors, slowdownFactor));
    },
    [],
  );

  const lockTodayFocusCommit = useCallback(() => {
    setProgress((prev) => lockTodayFocus(prev, activeUniverse.id));
  }, [activeUniverse.id]);

  const devUnlockTodayFocus = useCallback(() => {
    setProgress((prev) => unlockTodayFocus(prev));
  }, []);

  const closeAddQuestSheet = useCallback(() => {
    setAddQuestSheetOpen(false);
    setAddQuestRecoveryMode(false);
  }, []);

  const viewCreatedQuestOnBoard = useCallback(() => {
    setQuestCreated(null);
    router.push('/(game)/quests' as Href);
  }, []);

  const addAnotherQuest = useCallback(() => {
    setQuestCreated(null);
    setAddQuestRecoveryMode(false);
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

  const markTutorialSeen = useCallback(() => {
    setProgress((prev) => (prev.tutorialSeen ? prev : { ...prev, tutorialSeen: true }));
  }, []);

  const dismissHqTutorial = useCallback(() => {
    markTutorialSeen();
  }, [markTutorialSeen]);

  const startHqTutorialAddQuest = useCallback(() => {
    markTutorialSeen();
    setAddQuestSheetOpen(true);
  }, [markTutorialSeen]);

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
      const traitKey = getTraitForCategory(boardQuest.category);
      const previousVoteCount = progress.identityVotes[traitKey] ?? 0;
      const identityVote = castIdentityVote(
        progress.identityVotes,
        boardQuest.category,
        activeUniverse.id,
      );
      const milestoneTier = detectIdentityMilestoneUnlock(
        previousVoteCount,
        identityVote.voteCount,
      );
      const identityMilestoneUnlock = milestoneTier
        ? buildIdentityMilestoneUnlock(traitKey, milestoneTier, activeUniverse.id)
        : undefined;

      const updatedCompletedIds =
        boardQuest.source === 'template'
          ? [...sagaCompletedQuestIds, questId]
          : sagaCompletedQuestIds;

      const chapterDoneCount = countCompletedTemplates(currentChapter, updatedCompletedIds);
      const completingRecovery = shouldMarkRecoveryOnQuestComplete(progress);

      setProgress((prev) => {
        const withQuestCompletion =
          boardQuest.source === 'template'
            ? appendSagaCompletedQuest(prev, activeSaga.id, questId)
            : prev;

        const withRecovery = completingRecovery ? markRecoveryQuestComplete(withQuestCompletion) : withQuestCompletion;

        const evidenceEvent = buildEvidenceEventFromQuestCompletion(boardQuest, {
          universeId: activeUniverse.id,
          sagaId: activeSaga.id,
          chapterId: currentChapter.id,
          traitKey,
        });

        return appendEvidenceEvent(
          recordQuestCompleted(
            {
              ...withRecovery,
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
              identityVotes: identityVote.identityVotes,
            },
            boardQuest.xpReward,
            boardQuest.reputationReward,
            getLocalDateKey(),
            {
              highRisk:
                boardQuest.source === 'user' && isHighRiskQuest(boardQuest.riskLevel),
            },
          ),
          evidenceEvent,
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
      const afterQuestReward =
        boardQuest.source === 'user' ? boardQuest.afterQuestReward?.trim() : undefined;
      const rewardCopy = getAfterQuestRewardCopy(activeUniverse.id);
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
        identityVoteGainLine: identityVote.voteGainLine,
        identityUniverseLine: identityVote.universeLine,
        ...(identityMilestoneUnlock ? { identityMilestoneUnlock } : {}),
        ...(completingRecovery
          ? { recoveryCompleteLine: getRecoveryQuestCopy(activeUniverse.id).completeMessage }
          : {}),
        ...(afterQuestReward
          ? {
              rewardRitualUnlockedLine: formatRewardRitualUnlockedLine(afterQuestReward),
              rewardRitualFlavorLine: rewardCopy.universeHint,
            }
          : {}),
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

  const importProgress = useCallback(async (rawProgress: PlayerProgress) => {
    const restored = restorePlayerProgress(rawProgress);
    setProgress(restored);
    setXpBurst(null);
    setNarrativeMoment(null);
    setChapterComplete(null);
    setQuestComplete(null);
    setQuestCreated(null);
    setAddQuestSheetOpen(false);
    setAddQuestRecoveryMode(false);
    pendingChapterCompleteRef.current = null;
    await savePlayerProgress(restored);
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
      addQuestRecoveryMode,
      improveQuestId,
      frictionReviewQuestId,
      focusQuest,
      focusDecisiveMoment,
      showRecoveryPrompt,
      showDailyAwarenessCheck,
      isTodayFocusLocked: todayFocusLocked,
      showChapterIntro,
      showHqTutorial,
      completedQuestCount,
      allQuestsComplete,
      isSagaPreview,
      selectUniverse,
      selectSaga,
      switchSaga,
      completeOnboarding,
      addUserQuest,
      addUserQuestPack,
      questPackSheetOpen,
      openQuestPackSheet,
      closeQuestPackSheet,
      openAddQuestSheet,
      openRecoveryQuestSheet,
      lockTodayFocus: lockTodayFocusCommit,
      openQuestFocus,
      startQuestNow,
      closeQuestFocus,
      closeAddQuestSheet,
      viewCreatedQuestOnBoard,
      addAnotherQuest,
      completeQuest,
      updateUserQuest,
      openImproveQuest,
      closeImproveQuest,
      openFrictionReview,
      closeFrictionReview,
      recordFrictionReview,
      markFrictionFixApplied,
      archiveUserQuest,
      disableRecurringQuest,
      recordFocusDistraction,
      markFrictionShieldApplied,
      submitDailyAwareness,
      dismissDailyAwarenessCheck,
      submitWeeklyReview,
      dismissXpBurst,
      markChapterIntroSeen,
      dismissHqTutorial,
      startHqTutorialAddQuest,
      dismissNarrativeMoment,
      dismissQuestComplete,
      continueFromChapterComplete,
      startUnlockedSagaFromChapterComplete,
      maybeShowVillainTaunt,
      resetProgress,
      importProgress,
      restoreDefaultStory,
      devAddXp,
      devCompleteCurrentChapter,
      devUnlockTodayFocus,
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
      addQuestRecoveryMode,
      addQuestSheetOpen,
      addUserQuest,
      addUserQuestPack,
      allQuestsComplete,
      closeQuestPackSheet,
      archiveUserQuest,
      disableRecurringQuest,
      chapters,
      characters,
      chapterComplete,
      closeAddQuestSheet,
      closeFrictionReview,
      closeImproveQuest,
      closeQuestFocus,
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
      dismissDailyAwarenessCheck,
      dismissHqTutorial,
      dismissNarrativeMoment,
      dismissQuestComplete,
      dismissXpBurst,
      focusDecisiveMoment,
      focusQuest,
      frictionReviewQuestId,
      improveQuestId,
      isHydrated,
      isSagaPreview,
      todayFocusLocked,
      lockTodayFocusCommit,
      markChapterIntroSeen,
      markFrictionFixApplied,
      markFrictionShieldApplied,
      maybeShowVillainTaunt,
      narrativeMoment,
      openAddQuestSheet,
      openFrictionReview,
      openImproveQuest,
      openQuestFocus,
      openQuestPackSheet,
      openRecoveryQuestSheet,
      player,
      narrativeStateValid,
      progress,
      questComplete,
      questCreated,
      questPackSheetOpen,
      quests,
      recordFrictionReview,
      recordFocusDistraction,
      resetProgress,
      importProgress,
      restoreDefaultStory,
      selectSaga,
      selectUniverse,
      showChapterIntro,
      showDailyAwarenessCheck,
      showHqTutorial,
      showRecoveryPrompt,
      todayFocusLocked,
      startHqTutorialAddQuest,
      startUnlockedSagaFromChapterComplete,
      storyLine,
      submitDailyAwareness,
      submitWeeklyReview,
      startQuestNow,
      switchSaga,
      updateUserQuest,
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
