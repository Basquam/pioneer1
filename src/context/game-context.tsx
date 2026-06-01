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
import { getLocalDateKey, getTomorrowDateKey } from '@/lib/daily-streak';
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
import { createUserQuestFromTask, type CreateUserQuestOptions, isUserQuestId } from '@/lib/convert-task-to-quest';
import {
  getQuestSuiteById,
  resolveAddQuestSuitePrefill,
  suggestSuiteForCategory,
} from '@/constants/quest-suites';
import {
  recordSuiteQuestCompleted,
  recordSuiteQuestCreated,
} from '@/lib/quest-suite-stats';
import {
  addStarterToRecurringQuestTemplate,
  archiveRecurringQuestTemplate,
  createRecurringQuestTemplate,
  disableRecurringQuestTemplate,
  generateRecurringQuestInstances,
  lowerRecurringQuestTemplateDifficulty,
  pauseRecurringQuestTemplate,
  updateRecurringQuestTemplate as applyRecurringQuestTemplateUpdate,
  type AddUserQuestOptions,
  type RecurringQuestTemplateUpdates,
} from '@/lib/recurring-quests';
import { getSuggestedStarterForRoutine } from '@/lib/routine-maintenance';
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
import {
  recordRoutineQuestCompleted,
  recordRoutineQuestSpawned,
} from '@/lib/routine-boredom-guard';
import {
  applyMomentumGain,
  computeMomentumGainFromQuest,
  detectMomentumMilestoneUnlock,
  formatMomentumGainOverlayLine,
  MOMENTUM_MILESTONE_REACHED_MESSAGE,
  sanitizeMomentumMilestonesReached,
  sanitizeMomentumReserve,
} from '@/lib/momentum-reserve';
import {
  isTooMuchMotion,
  recordFocusStartedActivity,
  recordFrictionReviewActivity,
  recordImproveActivity,
  recordQuestCompletedAt,
  recordReadinessUpdateActivity,
  sanitizePlanningTimestamp,
  sanitizePlanningTimestampList,
  type PlanningActivitySource,
} from '@/lib/motion-vs-action';
import type { UserQuestReadinessUpdates } from '@/lib/quest-readiness';
import {
  dismissDailyAwarenessForToday,
  recordDailyAwarenessAnswer,
  shouldShowDailyAwarenessCheck,
} from '@/lib/daily-awareness';
import {
  applyArchiveQuestLifecycle,
  applyCarryQuestToToday,
  applyCompleteQuestLifecycle,
  applySnoozeQuest,
} from '@/lib/quest-lifecycle';
import {
  dismissDailyShutdownForToday,
  recordDailyShutdown,
  shouldShowDailyShutdownPrompt,
} from '@/lib/daily-shutdown';
import { recordTomorrowSetup, type TomorrowSetupInput } from '@/lib/tomorrow-setup';
import { recordWeeklyReview } from '@/lib/weekly-review';
import { markMonthlyReviewSeen } from '@/lib/monthly-review';
import {
  dismissNextBestActionForToday as recordNextBestActionDismissed,
} from '@/lib/next-best-action';
import {
  dismissCoachTipForToday as recordCoachTipDismissed,
} from '@/lib/contextual-coach-tip';
import {
  markFeatureDiscovered,
  refreshFeatureDiscoveryState,
  setGuidedFeatureDiscoveryEnabled,
  setShowAdvancedFeatureTools as applyShowAdvancedFeatureTools,
} from '@/lib/feature-discovery';
import {
  advanceRewardQueue,
  buildChapterRewardCelebrationEvent,
  buildProcessAchievementCelebrationEvents,
  buildQuestCompleteCelebrationEvents,
  enqueueRewardEvents,
  getActiveRewardEvent,
  mergeCelebrationBatch,
  type RewardEvent,
  type RewardEventInput,
} from '@/lib/reward-event-queue';
import {
  detectProcessAchievementUnlocks,
  hasQuestDefaultsConfigured,
  toProcessAchievementToasts,
  unlockProcessAchievements,
  wasQuestNeedsReviewBeforeLifecycleAction,
  type ProcessAchievementUnlock,
} from '@/lib/process-achievements';
import {
  activateMinimumViableDay as applyMinimumViableDayActivation,
  getMinimumViableDayCompletionFlavor,
  getMinimumViableDayCopy,
  isMinimumViableDayActive,
  markMinimumViableDaySecured,
  pickSuggestedSmallQuest,
  shouldAutoActivateMvdFromAwareness,
  shouldMarkMinimumViableDaySecuredOnQuestComplete,
} from '@/lib/minimum-viable-day';
import { sanitizeMascotPreference } from '@/lib/app-mascot-coach';
import type { QuestBoardTab } from '@/lib/quest-board-organization';
import type {
  DailyAwarenessBlocker,
  DailyShutdownHelpedBy,
  DailyShutdownOpenQuestSummary,
  MinimumViableDaySource,
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
import { suggestTaskCategory } from '@/lib/suggest-task-category';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
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
import {
  applyQuestDefaultsPreset as buildQuestDefaultsPreset,
  updateCategoryQuestDefaultsInSettings,
} from '@/lib/quest-defaults';
import { getUniverseUiCopy } from '@/lib/universe-ui-copy';
import {
  captureQuestInboxItem,
  findInboxItem,
  getActiveInboxItems,
  markInboxItemArchived,
  markInboxItemConverted,
} from '@/lib/quest-inbox';
import { sanitizeQuestStyleProfile } from '@/lib/quest-style-profile';
import { sanitizeReminderPreferences } from '@/lib/reminder-preferences';
import {
  cancelQuestReminderNotification,
  requestLocalReminderPermissions,
} from '@/lib/local-notifications';
import {
  formatDesiredIdentityHighlight,
  isDesiredIdentityTrait,
  sanitizeDesiredIdentityTraits,
} from '@/lib/identity-compass';
import {
  buildQuestChainFromParent,
  formatChainCompleteLine,
  isQuestChainParentBlocked,
  isQuestChainSplittable,
  markQuestChainParentComplete,
  type QuestChainStepInput,
} from '@/lib/quest-chain';
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
  IdentityTraitKey,
  CategoryQuestDefaults,
  QuestDefaultsPresetId,
  QuestInboxItem,
  QuestStyleProfile,
  ReminderPreferences,
  QuestSuiteId,
  MascotPreference,
} from '@/types/narrative';

export type XpBurst = { id: string; amount: number };

export type AddQuestInboxPrefill = {
  title: string;
  inboxItemId: string;
  suggestedCategory?: TaskCategory;
};

export type AddQuestTraitSuggestionPrefill = {
  title: string;
  category: TaskCategory;
  traitKey: IdentityTraitKey;
  reason: string;
  enableStarter: boolean;
};

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
  activeCelebration: RewardEvent | null;
  celebrationQueue: RewardEvent[];
  isCelebrationActive: boolean;
  questCreated: UserQuest | null;
  addQuestSheetOpen: boolean;
  addQuestRecoveryMode: boolean;
  addQuestInboxPrefill: AddQuestInboxPrefill | null;
  addQuestTraitSuggestionPrefill: AddQuestTraitSuggestionPrefill | null;
  activeInboxItems: QuestInboxItem[];
  improveQuestId: string | null;
  editRecurringQuestId: string | null;
  splitQuestChainId: string | null;
  frictionReviewQuestId: string | null;
  focusQuest: BoardQuest | null;
  focusDecisiveMoment: boolean;
  showRecoveryPrompt: boolean;
  showMinimumViableDayActive: boolean;
  showDailyAwarenessCheck: boolean;
  showDailyShutdownPrompt: boolean;
  dailyShutdownOpen: boolean;
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
  createOnboardingFirstQuest: (originalTitle: string) => UserQuest | null;
  beginOnboardingFirstQuestFocus: (questId: string) => void;
  markOnboardingSuiteComplete: () => void;
  dismissOnboardingFirstQuestInsight: () => void;
  onboardingFirstQuest: UserQuest | null;
  showOnboardingFirstQuestInsight: boolean;
  addUserQuest: (originalTitle: string, category: TaskCategory, options?: AddUserQuestOptions) => void;
  addUserQuestPack: (
    items: Array<{ originalTitle: string; category: TaskCategory; options?: CreateUserQuestOptions }>,
  ) => void;
  questPackSheetOpen: boolean;
  openQuestPackSheet: () => void;
  closeQuestPackSheet: () => void;
  openAddQuestSheet: () => void;
  openAddQuestFromTraitSuggestion: (
    suggestion: Pick<
      AddQuestTraitSuggestionPrefill,
      'title' | 'category' | 'traitKey' | 'reason' | 'enableStarter'
    >,
  ) => void;
  openRecoveryQuestSheet: () => void;
  activateMinimumViableDay: (source?: MinimumViableDaySource) => void;
  doOneSmallQuest: () => void;
  captureInboxTask: (title: string) => void;
  convertInboxItem: (inboxItemId: string) => void;
  archiveInboxItem: (inboxItemId: string) => void;
  lockTodayFocus: () => void;
  openQuestFocus: (questId: string) => void;
  startQuestNow: (questId: string) => void;
  closeQuestFocus: () => void;
  closeAddQuestSheet: () => void;
  viewCreatedQuestOnBoard: () => void;
  addAnotherQuest: () => void;
  completeQuest: (questId: string) => void;
  updateUserQuest: (
    questId: string,
    updates: UserQuestReadinessUpdates,
    options?: { planningSource?: PlanningActivitySource },
  ) => void;
  openImproveQuest: (questId: string) => void;
  closeImproveQuest: () => void;
  openSplitQuestChain: (questId: string) => void;
  closeSplitQuestChain: () => void;
  splitUserQuestIntoChain: (parentQuestId: string, steps: QuestChainStepInput[]) => void;
  openFrictionReview: (questId: string) => void;
  closeFrictionReview: () => void;
  recordFrictionReview: (questId: string, reason: QuestFrictionReason) => void;
  markFrictionFixApplied: (questId: string) => void;
  archiveUserQuest: (questId: string) => void;
  disableRecurringQuest: (templateId: string) => void;
  openEditRecurringQuest: (templateId: string) => void;
  closeEditRecurringQuest: () => void;
  updateRecurringQuestTemplate: (templateId: string, updates: RecurringQuestTemplateUpdates) => void;
  pauseRecurringQuest: (templateId: string) => void;
  archiveRecurringQuest: (templateId: string) => void;
  lowerRecurringQuestDifficulty: (templateId: string) => void;
  addStarterToRecurringQuest: (templateId: string) => void;
  updateCategoryQuestDefaults: (
    category: TaskCategory,
    updates: Partial<CategoryQuestDefaults>,
  ) => void;
  applyQuestDefaultsPreset: (presetId: QuestDefaultsPresetId) => void;
  setDesiredIdentityTraits: (traits: IdentityTraitKey[]) => void;
  setActiveSuiteId: (suiteId: QuestSuiteId) => void;
  clearActiveSuiteId: () => void;
  setQuestStyleProfile: (profile: QuestStyleProfile) => void;
  setReminderPreferences: (preferences: ReminderPreferences) => void;
  setMascotPreference: (preference: MascotPreference) => void;
  applyQuestReminderSyncUpdates: (
    updates: Array<{ questId: string; reminderId: string | null }>,
  ) => void;
  recordFocusDistraction: (questId: string, distraction: QuestDistractionType) => void;
  markFrictionShieldApplied: (questId: string) => void;
  submitDailyAwareness: (blocker: DailyAwarenessBlocker) => void;
  dismissDailyAwarenessCheck: () => void;
  openDailyShutdown: () => void;
  closeDailyShutdown: () => void;
  dismissDailyShutdownPrompt: () => void;
  completeDailyShutdown: (
    helpedBy: DailyShutdownHelpedBy | undefined,
    openQuestActions: DailyShutdownOpenQuestSummary[],
    tomorrowSetup?: TomorrowSetupInput,
  ) => void;
  carryQuestToToday: (questId: string) => void;
  snoozeQuest: (questId: string, untilDate: string) => void;
  carryQuestToTomorrow: (questId: string) => void;
  submitWeeklyReview: (
    helpedFactors: WeeklyReviewHelpedFactor[],
    slowdownFactor: WeeklyReviewSlowdownFactor,
  ) => void;
  closeMonthlySeasonReport: (monthKey?: string) => void;
  requestedQuestBoardTab: QuestBoardTab | null;
  requestQuestBoardTab: (tab: QuestBoardTab) => void;
  clearRequestedQuestBoardTab: () => void;
  dismissNextBestActionForToday: () => void;
  dismissCoachTipForToday: (tipId: string) => void;
  dismissCelebration: () => void;
  setGuidedFeatureDiscovery: (enabled: boolean) => void;
  setShowAdvancedFeatureTools: (enabled: boolean) => void;
  hqScrollNonce: number;
  requestHqScrollToDailyAwareness: () => void;
  dismissXpBurst: () => void;
  markChapterIntroSeen: () => void;
  dismissHqTutorial: () => void;
  startHqTutorialAddQuest: () => void;
  dismissNarrativeMoment: () => void;
  continueFromChapterComplete: (chapter: ChapterCompleteState) => void;
  startUnlockedSagaFromChapterComplete: (
    sagaId: string,
    entryChapterId: string,
    chapter: ChapterCompleteState,
  ) => void;
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
  const [celebrationQueue, setCelebrationQueue] = useState<RewardEvent[]>([]);
  const activeCelebration = getActiveRewardEvent(celebrationQueue);
  const isCelebrationActive = celebrationQueue.length > 0;
  const [questCreated, setQuestCreated] = useState<UserQuest | null>(null);
  const [onboardingFirstQuestId, setOnboardingFirstQuestId] = useState<string | null>(null);
  const [pendingOnboardingInsight, setPendingOnboardingInsight] = useState(false);
  const [showOnboardingFirstQuestInsight, setShowOnboardingFirstQuestInsight] = useState(false);
  const [addQuestSheetOpen, setAddQuestSheetOpen] = useState(false);
  const [dailyShutdownOpen, setDailyShutdownOpen] = useState(false);
  const [questPackSheetOpen, setQuestPackSheetOpen] = useState(false);
  const [addQuestRecoveryMode, setAddQuestRecoveryMode] = useState(false);
  const [addQuestInboxPrefill, setAddQuestInboxPrefill] = useState<AddQuestInboxPrefill | null>(null);
  const [addQuestTraitSuggestionPrefill, setAddQuestTraitSuggestionPrefill] =
    useState<AddQuestTraitSuggestionPrefill | null>(null);
  const [focusQuestId, setFocusQuestId] = useState<string | null>(null);
  const [focusDecisiveMoment, setFocusDecisiveMoment] = useState(false);
  const [improveQuestId, setImproveQuestId] = useState<string | null>(null);
  const [editRecurringQuestId, setEditRecurringQuestId] = useState<string | null>(null);
  const [splitQuestChainId, setSplitQuestChainId] = useState<string | null>(null);
  const [frictionReviewQuestId, setFrictionReviewQuestId] = useState<string | null>(null);
  const [requestedQuestBoardTab, setRequestedQuestBoardTab] = useState<QuestBoardTab | null>(null);
  const [hqScrollNonce, setHqScrollNonce] = useState(0);
  const pendingChapterCompleteRef = useRef<ChapterCompleteState | null>(null);

  const enqueueCelebrations = useCallback((incoming: RewardEventInput[]) => {
    if (incoming.length === 0) return;
    setCelebrationQueue((queue) => enqueueRewardEvents(queue, incoming));
  }, []);

  const dismissCelebration = useCallback(() => {
    setCelebrationQueue((queue) => advanceRewardQueue(queue));
  }, []);

  const enqueueProcessAchievementUnlocks = useCallback(
    (unlocks: ProcessAchievementUnlock[], universeId: string, batchId?: string) => {
      const toasts = toProcessAchievementToasts(unlocks, universeId);
      const events = buildProcessAchievementCelebrationEvents(
        toasts,
        batchId ?? `process-${Date.now()}`,
      );
      setCelebrationQueue((queue) =>
        enqueueRewardEvents(queue, events, { coalesceIncomingSmall: true }),
      );
    },
    [],
  );

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

  useEffect(() => {
    if (!isHydrated || progress.hasOnboarded || onboardingFirstQuestId) return;
    const incomplete = progress.userQuests.find((quest) => !quest.isCompleted);
    if (incomplete) {
      setOnboardingFirstQuestId(incomplete.id);
    }
  }, [isHydrated, onboardingFirstQuestId, progress.hasOnboarded, progress.userQuests]);

  useEffect(() => {
    if (!pendingOnboardingInsight || isCelebrationActive || focusQuestId) return;
    setShowOnboardingFirstQuestInsight(true);
    setPendingOnboardingInsight(false);
  }, [focusQuestId, isCelebrationActive, pendingOnboardingInsight]);

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
      routineRepetitionByKey: progress.routineRepetitionByKey,
    }),
    [
      progress.completedQuestIdsBySagaId,
      progress.dailyFocusLimit,
      progress.focusLockedDate,
      progress.lockedFocusQuestIds,
      progress.routineRepetitionByKey,
      progress.selectedUniverseId,
      progress.templateQuestStartedAt,
      progress.userQuests,
    ],
  );

  const activeInboxItems = useMemo(
    () => getActiveInboxItems(progress.questInbox),
    [progress.questInbox],
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
    progress.hasOnboarded &&
    currentChapter !== null &&
    (currentChapter.introScene?.length ?? 0) > 0 &&
    !progress.seenChapterIntros.includes(currentChapter.id) &&
    !isCelebrationActive;

  const onboardingFirstQuest = useMemo(() => {
    if (!onboardingFirstQuestId) return null;
    return progress.userQuests.find((quest) => quest.id === onboardingFirstQuestId) ?? null;
  }, [onboardingFirstQuestId, progress.userQuests]);

  const showRecoveryPrompt = useMemo(
    () => isHydrated && shouldShowRecoveryPrompt(progress),
    [isHydrated, progress],
  );

  const showMinimumViableDayActive = useMemo(
    () => isHydrated && isMinimumViableDayActive(progress),
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
    !isCelebrationActive &&
    !showOnboardingFirstQuestInsight &&
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

  const showDailyShutdownPrompt = useMemo(
    () =>
      isHydrated &&
      progress.hasOnboarded &&
      !showHqTutorial &&
      shouldShowDailyShutdownPrompt(progress),
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

  const markOnboardingSuiteComplete = useCallback(() => {
    setProgress((prev) => ({
      ...prev,
      onboardingSuiteComplete: true,
    }));
  }, []);

  const createOnboardingFirstQuest = useCallback(
    (originalTitle: string): UserQuest | null => {
      const trimmed = originalTitle.trim();
      if (!trimmed || !currentChapter) return null;

      let created: UserQuest | null = null;

      setProgress((prev) => {
        const category =
          suggestTaskCategory(trimmed) ??
          (prev.activeSuiteId
            ? getQuestSuiteById(prev.activeSuiteId)?.primaryCategories[0]
            : null) ??
          'work';
        const suiteId =
          resolveAddQuestSuitePrefill({
            category,
            activeSuiteId: prev.activeSuiteId,
            title: trimmed,
          }) ?? suggestSuiteForCategory(category);
        const starter = generateStarterTaskTitle(trimmed, category);

        const quest = createUserQuestFromTask(
          trimmed,
          category,
          activeUniverse,
          activeSaga,
          currentChapter,
          prev.userQuests,
          {
            suiteId,
            starterTaskTitle: starter,
            skipCreatedOverlay: true,
          },
          getLocalDateKey(),
          prev,
        );

        created = quest;
        setOnboardingFirstQuestId(quest.id);

        return refreshFeatureDiscoveryState(
          recordSuiteQuestCreated(
            recordRoutineQuestSpawned(
              {
                ...prev,
                userQuests: pruneUserQuests([...prev.userQuests, quest]),
                onboardingSuiteComplete: true,
              },
              quest,
            ),
            quest.suiteId,
          ),
        );
      });

      return created;
    },
    [activeSaga, activeUniverse, currentChapter],
  );

  const beginOnboardingFirstQuestFocus = useCallback((questId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProgress((prev) => {
      let next = markQuestStarted(prev, questId);
      if (isUserQuestId(questId)) {
        next = {
          ...next,
          userQuests: next.userQuests.map((quest) =>
            quest.id === questId ? recordFocusStartedActivity(quest) : quest,
          ),
        };
      }
      return next;
    });
    setFocusDecisiveMoment(true);
    setFocusQuestId(questId);
  }, []);

  const addUserQuest = useCallback(
    (originalTitle: string, category: TaskCategory, options?: AddUserQuestOptions) => {
      const trimmed = originalTitle.trim();
      if (!trimmed || !currentChapter) return;

      let achievementUnlocks: ProcessAchievementUnlock[] = [];

      setProgress((prev) => {
        const { recurring, convertFromInboxItemId, ...questOptions } = options ?? {};
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
          getLocalDateKey(),
          prev,
        );

        setAddQuestSheetOpen(false);
        setAddQuestInboxPrefill(null);
        setAddQuestTraitSuggestionPrefill(null);
        if (!questOptions.skipCreatedOverlay) {
          setQuestCreated(quest);
        }

        const questInbox = convertFromInboxItemId
          ? markInboxItemConverted(prev.questInbox, convertFromInboxItemId)
          : prev.questInbox;

        achievementUnlocks = detectProcessAchievementUnlocks(prev, {
          type: 'quest-created',
          universeId: activeUniverse.id,
          quest,
        });

        const next = unlockProcessAchievements(
          refreshFeatureDiscoveryState(
            recordSuiteQuestCreated(
              recordRoutineQuestSpawned(
                {
                  ...prev,
                  recurringQuestTemplates,
                  questInbox,
                  userQuests: pruneUserQuests([...prev.userQuests, quest]),
                },
                quest,
              ),
              quest.suiteId,
            ),
          ),
          achievementUnlocks,
        );

        return next;
      });

      enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
    },
    [activeSaga, activeUniverse, currentChapter, enqueueProcessAchievementUnlocks],
  );

  const disableRecurringQuest = useCallback((templateId: string) => {
    setProgress((prev) => disableRecurringQuestTemplate(prev, templateId));
  }, []);

  const openEditRecurringQuest = useCallback((templateId: string) => {
    setEditRecurringQuestId(templateId);
  }, []);

  const closeEditRecurringQuest = useCallback(() => {
    setEditRecurringQuestId(null);
  }, []);

  const updateRecurringQuestTemplate = useCallback(
    (templateId: string, updates: RecurringQuestTemplateUpdates) => {
      setProgress((prev) => applyRecurringQuestTemplateUpdate(prev, templateId, updates));
    },
    [],
  );

  const pauseRecurringQuest = useCallback((templateId: string) => {
    setProgress((prev) => pauseRecurringQuestTemplate(prev, templateId));
  }, []);

  const archiveRecurringQuest = useCallback((templateId: string) => {
    setProgress((prev) => archiveRecurringQuestTemplate(prev, templateId));
  }, []);

  const lowerRecurringQuestDifficulty = useCallback((templateId: string) => {
    setProgress((prev) => lowerRecurringQuestTemplateDifficulty(prev, templateId));
  }, []);

  const addStarterToRecurringQuest = useCallback((templateId: string) => {
    setProgress((prev) => {
      const template = prev.recurringQuestTemplates.find((entry) => entry.id === templateId);
      if (!template) return prev;
      return addStarterToRecurringQuestTemplate(
        prev,
        templateId,
        getSuggestedStarterForRoutine(template),
      );
    });
  }, []);

  const updateCategoryQuestDefaults = useCallback(
    (category: TaskCategory, updates: Partial<CategoryQuestDefaults>) => {
      let achievementUnlocks: ProcessAchievementUnlock[] = [];

      setProgress((prev) => {
        const next = {
          ...prev,
          questDefaults: updateCategoryQuestDefaultsInSettings(prev.questDefaults, category, updates),
        };
        if (!hasQuestDefaultsConfigured(next.questDefaults)) return next;
        achievementUnlocks = detectProcessAchievementUnlocks(prev, {
          type: 'quest-defaults-configured',
          universeId: activeUniverse.id,
        });
        return unlockProcessAchievements(next, achievementUnlocks);
      });

      enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
    },
    [activeUniverse.id, enqueueProcessAchievementUnlocks],
  );

  const applyQuestDefaultsPreset = useCallback((presetId: QuestDefaultsPresetId) => {
    let achievementUnlocks: ProcessAchievementUnlock[] = [];

    setProgress((prev) => {
      const next = {
        ...prev,
        questDefaults: buildQuestDefaultsPreset(presetId),
      };
      if (!hasQuestDefaultsConfigured(next.questDefaults)) return next;
      achievementUnlocks = detectProcessAchievementUnlocks(prev, {
        type: 'quest-defaults-configured',
        universeId: activeUniverse.id,
      });
      return unlockProcessAchievements(next, achievementUnlocks);
    });

    enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
  }, [activeUniverse.id, enqueueProcessAchievementUnlocks]);

  const setDesiredIdentityTraits = useCallback((traits: IdentityTraitKey[]) => {
    setProgress((prev) => ({
      ...prev,
      desiredIdentityTraits: sanitizeDesiredIdentityTraits(traits),
    }));
  }, []);

  const setActiveSuiteId = useCallback((suiteId: QuestSuiteId) => {
    setProgress((prev) => ({
      ...prev,
      activeSuiteId: suiteId,
    }));
  }, []);

  const clearActiveSuiteId = useCallback(() => {
    setProgress((prev) => {
      const next = { ...prev };
      delete next.activeSuiteId;
      return next;
    });
  }, []);

  const setQuestStyleProfile = useCallback((profile: QuestStyleProfile) => {
    setProgress((prev) => ({
      ...prev,
      questStyleProfile: sanitizeQuestStyleProfile(profile),
    }));
  }, []);

  const setReminderPreferences = useCallback((preferences: ReminderPreferences) => {
    const sanitized = sanitizeReminderPreferences(preferences);
    if (sanitized.remindersEnabled) {
      void requestLocalReminderPermissions();
    }
    setProgress((prev) => ({
      ...prev,
      reminderPreferences: sanitized,
    }));
  }, []);

  const setMascotPreference = useCallback((preference: MascotPreference) => {
    setProgress((prev) => ({
      ...prev,
      mascotPreference: sanitizeMascotPreference(preference),
    }));
  }, []);

  const applyQuestReminderSyncUpdates = useCallback(
    (updates: Array<{ questId: string; reminderId: string | null }>) => {
      if (updates.length === 0) return;

      setProgress((prev) => {
        let changed = false;
        const userQuests = prev.userQuests.map((quest) => {
          const update = updates.find((entry) => entry.questId === quest.id);
          if (!update) return quest;

          if (update.reminderId === quest.reminderId) return quest;

          changed = true;
          if (update.reminderId) {
            return { ...quest, reminderId: update.reminderId };
          }

          const next = { ...quest };
          delete next.reminderId;
          return next;
        });

        return changed ? { ...prev, userQuests } : prev;
      });
    },
    [],
  );

  const addUserQuestPack = useCallback(
    (items: Array<{ originalTitle: string; category: TaskCategory; options?: CreateUserQuestOptions }>) => {
      if (!currentChapter || items.length === 0) return;

      setProgress((prev) => {
        let workingQuests = prev.userQuests;
        const created: UserQuest[] = [];

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
            {
              ...item.options,
              suiteId: item.options?.suiteId ?? suggestSuiteForCategory(item.category),
            },
            getLocalDateKey(),
            prev,
          );
          created.push(quest);
          workingQuests = [...workingQuests, quest];
        }

        if (created.length === 0) return prev;

        setAddQuestSheetOpen(false);
        setQuestPackSheetOpen(false);

        let next = {
          ...prev,
          userQuests: pruneUserQuests([...prev.userQuests, ...created]),
        };

        for (const quest of created) {
          next = recordRoutineQuestSpawned(next, quest);
          next = recordSuiteQuestCreated(next, quest.suiteId);
        }

        return next;
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
    setAddQuestInboxPrefill(null);
    setAddQuestTraitSuggestionPrefill(null);
    setAddQuestSheetOpen(true);
  }, []);

  const openAddQuestFromTraitSuggestion = useCallback(
    (suggestion: Pick<
      AddQuestTraitSuggestionPrefill,
      'title' | 'category' | 'traitKey' | 'reason' | 'enableStarter'
    >) => {
      setAddQuestRecoveryMode(false);
      setAddQuestInboxPrefill(null);
      setAddQuestTraitSuggestionPrefill({
        title: suggestion.title,
        category: suggestion.category,
        traitKey: suggestion.traitKey,
        reason: suggestion.reason,
        enableStarter: suggestion.enableStarter,
      });
      setAddQuestSheetOpen(true);
    },
    [],
  );

  const openRecoveryQuestSheet = useCallback(() => {
    setAddQuestRecoveryMode(true);
    setAddQuestInboxPrefill(null);
    setAddQuestTraitSuggestionPrefill(null);
    setAddQuestSheetOpen(true);
  }, []);

  const activateMinimumViableDay = useCallback((source: MinimumViableDaySource = 'briefing') => {
    setProgress((prev) => applyMinimumViableDayActivation(prev, source));
  }, []);

  const doOneSmallQuest = useCallback(() => {
    const today = getLocalDateKey();
    const suggested = pickSuggestedSmallQuest(progress, activeUniverse.id, today);
    if (suggested) {
      setFocusDecisiveMoment(false);
      setFocusQuestId(suggested.id);
      setProgress((prev) => ({
        ...prev,
        userQuests: prev.userQuests.map((quest) =>
          quest.id === suggested.id ? recordFocusStartedActivity(quest) : quest,
        ),
      }));
      router.push('/(game)/quests' as Href);
      return;
    }

    setAddQuestRecoveryMode(true);
    setAddQuestInboxPrefill(null);
    setAddQuestTraitSuggestionPrefill({
      title: '',
      category: 'health',
      traitKey: 'reliable',
      reason: 'minimum-viable-day',
      enableStarter: true,
    });
    setAddQuestSheetOpen(true);
  }, [activeUniverse.id, progress]);

  const captureInboxTask = useCallback((title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;

    setProgress((prev) => ({
      ...prev,
      questInbox: captureQuestInboxItem(prev.questInbox, trimmed),
    }));
  }, []);

  const convertInboxItem = useCallback(
    (inboxItemId: string) => {
      const item = findInboxItem(progress.questInbox, inboxItemId);
      if (!item || item.status !== 'inbox') return;

      setAddQuestRecoveryMode(false);
      setAddQuestInboxPrefill({
        title: item.title,
        inboxItemId: item.id,
        ...(item.suggestedCategory ? { suggestedCategory: item.suggestedCategory } : {}),
      });
      setAddQuestSheetOpen(true);
    },
    [progress.questInbox],
  );

  const archiveInboxItem = useCallback((inboxItemId: string) => {
    setProgress((prev) => ({
      ...prev,
      questInbox: markInboxItemArchived(prev.questInbox, inboxItemId),
    }));
  }, []);

  const closeQuestFocus = useCallback(() => {
    setFocusQuestId(null);
    setFocusDecisiveMoment(false);
  }, []);

  const openQuestFocus = useCallback((questId: string) => {
    setFocusDecisiveMoment(false);
    setFocusQuestId(questId);
    if (!isUserQuestId(questId)) return;
    setProgress((prev) =>
      refreshFeatureDiscoveryState(
        markFeatureDiscovered(
          {
            ...prev,
            userQuests: prev.userQuests.map((quest) =>
              quest.id === questId ? recordFocusStartedActivity(quest) : quest,
            ),
          },
          'focusMode',
        ),
      ),
    );
  }, []);

  const startQuestNow = useCallback((questId: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setProgress((prev) => {
      let next = markQuestStarted(prev, questId);
      if (isUserQuestId(questId)) {
        next = {
          ...next,
          userQuests: next.userQuests.map((quest) =>
            quest.id === questId ? recordFocusStartedActivity(quest) : quest,
          ),
        };
      }
      return next;
    });
    setFocusDecisiveMoment(true);
    setFocusQuestId(questId);
  }, []);

  const openImproveQuest = useCallback((questId: string) => {
    setImproveQuestId(questId);
    setProgress((prev) => refreshFeatureDiscoveryState(markFeatureDiscovered(prev, 'questReadiness')));
  }, []);

  const closeImproveQuest = useCallback(() => {
    setImproveQuestId(null);
  }, []);

  const openSplitQuestChain = useCallback((questId: string) => {
    setSplitQuestChainId(questId);
  }, []);

  const closeSplitQuestChain = useCallback(() => {
    setSplitQuestChainId(null);
  }, []);

  const splitUserQuestIntoChain = useCallback(
    (parentQuestId: string, steps: QuestChainStepInput[]) => {
      if (!currentChapter) return;

      let achievementUnlocks: ProcessAchievementUnlock[] = [];

      setProgress((prev) => {
        const parent = prev.userQuests.find((quest) => quest.id === parentQuestId);
        if (!parent || !isQuestChainSplittable(parent)) return prev;

        try {
          const { updatedParent, childQuests } = buildQuestChainFromParent(
            parent,
            steps,
            activeUniverse,
            activeSaga,
            currentChapter,
            prev.userQuests,
            prev,
            getLocalDateKey(),
          );

          const next = {
            ...prev,
            userQuests: pruneUserQuests([
              ...prev.userQuests.map((quest) => (quest.id === parentQuestId ? updatedParent : quest)),
              ...childQuests,
            ]),
          };

          achievementUnlocks = detectProcessAchievementUnlocks(prev, {
            type: 'quest-chain-split',
            universeId: activeUniverse.id,
            parentQuest: parent,
          });

          return unlockProcessAchievements(
            refreshFeatureDiscoveryState(
              markFeatureDiscovered(next, 'questChain'),
            ),
            achievementUnlocks,
          );
        } catch {
          return prev;
        }
      });

      enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
      setSplitQuestChainId(null);
    },
    [activeSaga, activeUniverse, currentChapter, enqueueProcessAchievementUnlocks],
  );

  const openFrictionReview = useCallback((questId: string) => {
    setFrictionReviewQuestId(questId);
  }, []);

  const closeFrictionReview = useCallback(() => {
    setFrictionReviewQuestId(null);
  }, []);

  const updateUserQuest = useCallback(
    (
      questId: string,
      updates: UserQuestReadinessUpdates,
      options?: { planningSource?: PlanningActivitySource },
    ) => {
      const timestamp = new Date().toISOString();
      setProgress((prev) => ({
        ...prev,
        userQuests: prev.userQuests.map((quest) => {
          if (quest.id !== questId) return quest;

          let next: UserQuest = { ...quest };

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

          if ('reminderEnabled' in updates) {
            if (updates.reminderEnabled && updates.reminderTime) {
              next.reminderEnabled = true;
              next.reminderTime = updates.reminderTime;
              if (updates.reminderLabel?.trim()) {
                next.reminderLabel = updates.reminderLabel.trim();
              } else {
                delete next.reminderLabel;
              }
              delete next.reminderId;
            } else {
              delete next.reminderEnabled;
              delete next.reminderTime;
              delete next.reminderLabel;
              delete next.reminderId;
            }
          }

          if (options?.planningSource === 'improve') {
            next = recordImproveActivity(next, timestamp);
          } else if (options?.planningSource === 'readiness') {
            next = recordReadinessUpdateActivity(next, timestamp);
          }

          return next;
        }),
      }));
    },
    [],
  );

  const recordFrictionReview = useCallback((questId: string, reason: QuestFrictionReason) => {
    setProgress((prev) =>
      refreshFeatureDiscoveryState(
        markFeatureDiscovered(
          {
            ...prev,
            userQuests: prev.userQuests.map((quest) => {
              if (quest.id !== questId) return quest;

              const review = {
                reason,
                reviewedAt: new Date().toISOString(),
                suggestedFixApplied: false,
              };

              return recordFrictionReviewActivity({
                ...quest,
                frictionReviews: [...(quest.frictionReviews ?? []), review].slice(-10),
              });
            }),
          },
          'frictionReview',
        ),
      ),
    );
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
    void cancelQuestReminderNotification(questId);
    let achievementUnlocks: ProcessAchievementUnlock[] = [];
    const today = getLocalDateKey();

    setProgress((prev) => {
      const quest = prev.userQuests.find((entry) => entry.id === questId);
      const wasNeedsReview = quest
        ? wasQuestNeedsReviewBeforeLifecycleAction(quest, today)
        : false;
      const next = {
        ...prev,
        userQuests: prev.userQuests.map((entry) =>
          entry.id === questId ? applyArchiveQuestLifecycle(entry) : entry,
        ),
      };
      achievementUnlocks = detectProcessAchievementUnlocks(prev, {
        type: 'quest-lifecycle-resolved',
        universeId: activeUniverse.id,
        questId,
        wasNeedsReview,
      });
      return unlockProcessAchievements(next, achievementUnlocks);
    });

    enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
  }, [activeUniverse.id, enqueueProcessAchievementUnlocks]);

  const carryQuestToToday = useCallback((questId: string) => {
    let achievementUnlocks: ProcessAchievementUnlock[] = [];
    const today = getLocalDateKey();

    setProgress((prev) => {
      const quest = prev.userQuests.find((entry) => entry.id === questId);
      const wasNeedsReview = quest
        ? wasQuestNeedsReviewBeforeLifecycleAction(quest, today)
        : false;
      const next = {
        ...prev,
        userQuests: prev.userQuests.map((entry) =>
          entry.id === questId ? applyCarryQuestToToday(entry) : entry,
        ),
      };
      achievementUnlocks = detectProcessAchievementUnlocks(prev, {
        type: 'quest-lifecycle-resolved',
        universeId: activeUniverse.id,
        questId,
        wasNeedsReview,
      });
      return unlockProcessAchievements(next, achievementUnlocks);
    });

    enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
  }, [activeUniverse.id, enqueueProcessAchievementUnlocks]);

  const snoozeQuest = useCallback((questId: string, untilDate: string) => {
    let achievementUnlocks: ProcessAchievementUnlock[] = [];
    const today = getLocalDateKey();

    setProgress((prev) => {
      const quest = prev.userQuests.find((entry) => entry.id === questId);
      const wasNeedsReview = quest
        ? wasQuestNeedsReviewBeforeLifecycleAction(quest, today)
        : false;
      const next = {
        ...prev,
        userQuests: prev.userQuests.map((entry) =>
          entry.id === questId ? applySnoozeQuest(entry, untilDate) : entry,
        ),
      };
      achievementUnlocks = detectProcessAchievementUnlocks(prev, {
        type: 'quest-lifecycle-resolved',
        universeId: activeUniverse.id,
        questId,
        wasNeedsReview,
      });
      return unlockProcessAchievements(next, achievementUnlocks);
    });

    enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
  }, [activeUniverse.id, enqueueProcessAchievementUnlocks]);

  const carryQuestToTomorrow = useCallback(
    (questId: string) => {
      snoozeQuest(questId, getTomorrowDateKey());
    },
    [snoozeQuest],
  );

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
    setProgress((prev) => {
      let next = recordDailyAwarenessAnswer(prev, blocker);
      if (shouldAutoActivateMvdFromAwareness(blocker)) {
        next = applyMinimumViableDayActivation(next, 'awareness');
      }
      return next;
    });
  }, []);

  const dismissDailyAwarenessCheck = useCallback(() => {
    setProgress((prev) => dismissDailyAwarenessForToday(prev));
  }, []);

  const openDailyShutdown = useCallback(() => {
    setDailyShutdownOpen(true);
  }, []);

  const closeDailyShutdown = useCallback(() => {
    setDailyShutdownOpen(false);
  }, []);

  const dismissDailyShutdownPrompt = useCallback(() => {
    setProgress((prev) => dismissDailyShutdownForToday(prev));
  }, []);

  const completeDailyShutdown = useCallback(
    (
      helpedBy: DailyShutdownHelpedBy | undefined,
      openQuestActions: DailyShutdownOpenQuestSummary[],
      tomorrowSetup: TomorrowSetupInput = { kind: 'skip' },
    ) => {
      setProgress((prev) => {
        const withShutdown = recordDailyShutdown(prev, helpedBy, openQuestActions);
        const withSetup =
          tomorrowSetup.kind === 'skip'
            ? withShutdown
            : markFeatureDiscovered(recordTomorrowSetup(withShutdown, tomorrowSetup), 'tomorrowSetup');
        return refreshFeatureDiscoveryState(withSetup);
      });
    },
    [],
  );

  const submitWeeklyReview = useCallback(
    (helpedFactors: WeeklyReviewHelpedFactor[], slowdownFactor: WeeklyReviewSlowdownFactor) => {
      let achievementUnlocks: ProcessAchievementUnlock[] = [];

      setProgress((prev) => {
        const next = recordWeeklyReview(prev, helpedFactors, slowdownFactor);
        achievementUnlocks = detectProcessAchievementUnlocks(prev, {
          type: 'weekly-review-completed',
          universeId: activeUniverse.id,
        });
        return unlockProcessAchievements(
          refreshFeatureDiscoveryState(
            markFeatureDiscovered(next, 'weeklyReview'),
          ),
          achievementUnlocks,
        );
      });

      enqueueProcessAchievementUnlocks(achievementUnlocks, activeUniverse.id);
    },
    [activeUniverse.id, enqueueProcessAchievementUnlocks],
  );

  const closeMonthlySeasonReport = useCallback((monthKey?: string) => {
    setProgress((prev) => markMonthlyReviewSeen(prev, monthKey));
  }, []);

  const requestQuestBoardTab = useCallback((tab: QuestBoardTab) => {
    setRequestedQuestBoardTab(tab);
  }, []);

  const clearRequestedQuestBoardTab = useCallback(() => {
    setRequestedQuestBoardTab(null);
  }, []);

  const dismissNextBestActionForToday = useCallback(() => {
    setProgress((prev) => recordNextBestActionDismissed(prev));
  }, []);

  const dismissCoachTipForToday = useCallback((tipId: string) => {
    setProgress((prev) =>
      refreshFeatureDiscoveryState(
        markFeatureDiscovered(recordCoachTipDismissed(prev, tipId), 'coachTips'),
      ),
    );
  }, []);

  const setGuidedFeatureDiscovery = useCallback((enabled: boolean) => {
    setProgress((prev) => setGuidedFeatureDiscoveryEnabled(prev, enabled));
  }, []);

  const setShowAdvancedFeatureTools = useCallback((enabled: boolean) => {
    setProgress((prev) => applyShowAdvancedFeatureTools(prev, enabled));
  }, []);

  const requestHqScrollToDailyAwareness = useCallback(() => {
    setHqScrollNonce((current) => current + 1);
  }, []);

  const lockTodayFocusCommit = useCallback(() => {
    setProgress((prev) => lockTodayFocus(prev, activeUniverse.id));
  }, [activeUniverse.id]);

  const devUnlockTodayFocus = useCallback(() => {
    setProgress((prev) => unlockTodayFocus(prev));
  }, []);

  const closeAddQuestSheet = useCallback(() => {
    setAddQuestSheetOpen(false);
    setAddQuestRecoveryMode(false);
    setAddQuestInboxPrefill(null);
    setAddQuestTraitSuggestionPrefill(null);
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

  const dismissOnboardingFirstQuestInsight = useCallback(() => {
    setShowOnboardingFirstQuestInsight(false);
    setOnboardingFirstQuestId(null);
    setPendingOnboardingInsight(false);
    markChapterIntroSeen();
    markTutorialSeen();
    completeOnboarding();
  }, [completeOnboarding, markChapterIntroSeen, markTutorialSeen]);

  const startHqTutorialAddQuest = useCallback(() => {
    markTutorialSeen();
    setAddQuestSheetOpen(true);
  }, [markTutorialSeen]);

  const maybeShowVillainTaunt = useCallback(() => {
    if (!currentChapter) return;
    if (narrativeMoment) return;
    if (isCelebrationActive) return;
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
    isCelebrationActive,
    progress.dismissedTauntBySagaId,
  ]);

  const completeQuest = useCallback(
    (questId: string) => {
      if (!currentChapter) return;
      if (isCelebrationActive) return;

      const boardQuest = findBoardQuest(quests, questId);
      if (!boardQuest || boardQuest.completed) return;
      if (isQuestChainParentBlocked(boardQuest)) return;

      triggerQuestCompleteHaptic();

      const completingUserQuest =
        boardQuest.source === 'user'
          ? (progress.userQuests.find((quest) => quest.id === questId) ?? null)
          : null;
      const chainParent =
        completingUserQuest?.parentQuestId != null
          ? progress.userQuests.find((quest) => quest.id === completingUserQuest.parentQuestId)
          : null;
      const chainChildIds = chainParent?.childQuestIds ?? [];
      const willCompleteChain =
        chainParent?.isQuestChainParent === true &&
        chainChildIds.length > 0 &&
        chainChildIds.every((childId) => {
          if (childId === questId) return true;
          return progress.userQuests.find((quest) => quest.id === childId)?.isCompleted === true;
        });
      const questChainCompleteLine =
        willCompleteChain && chainParent?.chainTitle
          ? formatChainCompleteLine(chainParent.chainTitle, chainChildIds.length)
          : undefined;

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
      const securingMinimumDay = shouldMarkMinimumViableDaySecuredOnQuestComplete(
        progress,
        getLocalDateKey(),
      );
      const momentumGain = computeMomentumGainFromQuest(boardQuest);
      const momentumMilestoneUnlock = detectMomentumMilestoneUnlock(
        sanitizeMomentumReserve(progress.momentumReserve),
        sanitizeMomentumReserve(progress.momentumReserve) + momentumGain,
        sanitizeMomentumMilestonesReached(progress.momentumMilestonesReached),
      );
      const today = getLocalDateKey();
      let achievementUnlocks: ProcessAchievementUnlock[] = [];

      setProgress((prev) => {
        const withQuestCompletion =
          boardQuest.source === 'template'
            ? appendSagaCompletedQuest(prev, activeSaga.id, questId)
            : prev;

        const withRecovery = completingRecovery ? markRecoveryQuestComplete(withQuestCompletion) : withQuestCompletion;
        const withMinimumDay = securingMinimumDay
          ? markMinimumViableDaySecured(withRecovery, getLocalDateKey())
          : withRecovery;

        const evidenceEvent = buildEvidenceEventFromQuestCompletion(boardQuest, {
          universeId: activeUniverse.id,
          sagaId: activeSaga.id,
          chapterId: currentChapter.id,
          traitKey,
        });

        const withActivity = appendEvidenceEvent(
          recordQuestCompleted(
            {
              ...withMinimumDay,
              userQuests:
                boardQuest.source === 'user'
                  ? prev.userQuests.map((quest) =>
                      quest.id === questId ? applyCompleteQuestLifecycle(quest) : quest,
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

        const withRoutine =
          boardQuest.source === 'user'
            ? recordRoutineQuestCompleted(withActivity, {
                originalTitle: boardQuest.originalTitle,
                category: boardQuest.category,
                narrativeTitle: boardQuest.narrativeTitle,
                usedVariationId: boardQuest.usedVariationId,
                generatedFromRecurringQuestId: boardQuest.generatedFromRecurringQuestId,
              })
            : withActivity;

        const withChainParent =
          willCompleteChain && chainParent
            ? {
                ...withRoutine,
                userQuests: markQuestChainParentComplete(withRoutine.userQuests, chainParent.id),
              }
            : withRoutine;

        const completedUserQuest =
          boardQuest.source === 'user'
            ? withChainParent.userQuests.find((quest) => quest.id === questId) ?? null
            : null;

        const withSuiteStats =
          completedUserQuest?.suiteId
            ? recordSuiteQuestCompleted(
                withChainParent,
                completedUserQuest.suiteId,
                boardQuest.xpReward,
                boardQuest.reputationReward,
                completedUserQuest.completedAt ?? new Date().toISOString(),
              )
            : withChainParent;

        achievementUnlocks = detectProcessAchievementUnlocks(prev, {
          type: 'quest-complete',
          universeId: activeUniverse.id,
          today,
          questId,
          boardQuest,
          userQuest: completingUserQuest,
        });

        return unlockProcessAchievements(
          refreshFeatureDiscoveryState(applyMomentumGain(withSuiteStats, momentumGain).progress),
          achievementUnlocks,
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
      const desiredIdentityHighlightLine = isDesiredIdentityTrait(traitKey, progress.desiredIdentityTraits)
        ? formatDesiredIdentityHighlight(traitKey)
        : undefined;

      const questState: QuestCompleteState = {
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
        ...(securingMinimumDay
          ? {
              minimumViableDayCompleteLine: getMinimumViableDayCopy(activeUniverse.id).completion,
              minimumViableDayFlavorLine: getMinimumViableDayCompletionFlavor(activeUniverse.id),
            }
          : {}),
        ...(afterQuestReward
          ? {
              rewardRitualUnlockedLine: formatRewardRitualUnlockedLine(afterQuestReward),
              rewardRitualFlavorLine: rewardCopy.universeHint,
            }
          : {}),
        ...(momentumGain > 0
          ? { momentumGainLine: formatMomentumGainOverlayLine(activeUniverse.id, momentumGain) }
          : {}),
        ...(momentumMilestoneUnlock
          ? {
              momentumMilestoneUnlock: {
                message: MOMENTUM_MILESTONE_REACHED_MESSAGE,
                label: momentumMilestoneUnlock.label,
              },
            }
          : {}),
        ...(questChainCompleteLine ? { questChainCompleteLine } : {}),
        ...(desiredIdentityHighlightLine ? { desiredIdentityHighlightLine } : {}),
      };

      const batchId = `quest-${questId}-${Date.now()}`;
      const progressMessage =
        boardQuest.source === 'user' ? ui.userQuestCompleteMessage : ui.templateQuestCompleteMessage;
      let celebrationEvents = buildQuestCompleteCelebrationEvents(questState, {
        batchId,
        progressMessage,
      });

      const processAchievementEvents = buildProcessAchievementCelebrationEvents(
        toProcessAchievementToasts(achievementUnlocks, activeUniverse.id),
        batchId,
      );
      celebrationEvents = mergeCelebrationBatch([...celebrationEvents, ...processAchievementEvents]);

      const pendingChapter = pendingChapterCompleteRef.current;
      pendingChapterCompleteRef.current = null;
      if (pendingChapter) {
        if (pendingChapter.newRewards?.length) {
          setProgress((prev) => ({
            ...prev,
            unlockedRewards: unlockChapterRewards(prev.unlockedRewards, pendingChapter.newRewards!),
          }));
        }
        celebrationEvents.push(buildChapterRewardCelebrationEvent(pendingChapter));
      }

      enqueueCelebrations(celebrationEvents);

      if (!progress.hasOnboarded && questId === onboardingFirstQuestId) {
        setPendingOnboardingInsight(true);
      }
    },
    [
      activeSaga,
      activeUniverse,
      currentChapter,
      enqueueCelebrations,
      isCelebrationActive,
      onboardingFirstQuestId,
      progress,
      quests,
      sagaCompletedQuestIds,
    ],
  );

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
    (chapter: ChapterCompleteState, options?: { switchToSagaId?: string; entryChapterId?: string }) => {
      setProgress((prev) => {
        let next = appendSagaCompletedChapter(prev, activeSaga.id, chapter.chapterId);

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

        if (chapter.nextChapterId) {
          next = setSagaActiveChapter(next, activeSaga.id, chapter.nextChapterId);
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
    },
    [activeSaga.id, activeUniverse],
  );

  const continueFromChapterComplete = useCallback(
    (chapter: ChapterCompleteState) => {
      finalizeChapterComplete(chapter);
      dismissCelebration();
    },
    [dismissCelebration, finalizeChapterComplete],
  );

  const startUnlockedSagaFromChapterComplete = useCallback(
    (sagaId: string, entryChapterId: string, chapter: ChapterCompleteState) => {
      finalizeChapterComplete(chapter, { switchToSagaId: sagaId, entryChapterId });
      dismissCelebration();
    },
    [dismissCelebration, finalizeChapterComplete],
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
    setCelebrationQueue([]);
    pendingChapterCompleteRef.current = null;
  }, []);

  const devSwitchToNeuroNet = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => applyDevSwitchToNeuroNet(prev));
    setNarrativeMoment(null);
    setCelebrationQueue([]);
    pendingChapterCompleteRef.current = null;
  }, []);

  const devSwitchToDustAndIron = useCallback(() => {
    if (!__DEV__) return;
    setProgress((prev) => applyDevSwitchToDustAndIron(prev));
    setNarrativeMoment(null);
    setCelebrationQueue([]);
    pendingChapterCompleteRef.current = null;
  }, []);

  const restoreDefaultStory = useCallback(() => {
    setProgress((prev) => restoreDefaultStoryProgress(prev));
    setNarrativeMoment(null);
    setCelebrationQueue([]);
    pendingChapterCompleteRef.current = null;
  }, []);

  const resetProgress = useCallback(async () => {
    await clearPlayerProgress();
    const fresh = createInitialProgress();
    setProgress(fresh);
    setXpBurst(null);
    setNarrativeMoment(null);
    setCelebrationQueue([]);
    setQuestCreated(null);
    setOnboardingFirstQuestId(null);
    setPendingOnboardingInsight(false);
    setShowOnboardingFirstQuestInsight(false);
    setAddQuestSheetOpen(false);
    pendingChapterCompleteRef.current = null;
    await savePlayerProgress(fresh);
  }, []);

  const importProgress = useCallback(async (rawProgress: PlayerProgress) => {
    const restored = restorePlayerProgress(rawProgress);
    setProgress(restored);
    setXpBurst(null);
    setNarrativeMoment(null);
    setCelebrationQueue([]);
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
      activeCelebration,
      celebrationQueue,
      isCelebrationActive,
      questCreated,
      addQuestSheetOpen,
      addQuestRecoveryMode,
      addQuestInboxPrefill,
      addQuestTraitSuggestionPrefill,
      activeInboxItems,
      improveQuestId,
      editRecurringQuestId,
      splitQuestChainId,
      frictionReviewQuestId,
      focusQuest,
      focusDecisiveMoment,
      showRecoveryPrompt,
      showMinimumViableDayActive,
      showDailyAwarenessCheck,
      showDailyShutdownPrompt,
      dailyShutdownOpen,
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
      createOnboardingFirstQuest,
      beginOnboardingFirstQuestFocus,
      markOnboardingSuiteComplete,
      dismissOnboardingFirstQuestInsight,
      onboardingFirstQuest,
      showOnboardingFirstQuestInsight,
      addUserQuest,
      addUserQuestPack,
      questPackSheetOpen,
      openQuestPackSheet,
      closeQuestPackSheet,
      openAddQuestSheet,
      openAddQuestFromTraitSuggestion,
      openRecoveryQuestSheet,
      activateMinimumViableDay,
      doOneSmallQuest,
      captureInboxTask,
      convertInboxItem,
      archiveInboxItem,
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
      openSplitQuestChain,
      closeSplitQuestChain,
      splitUserQuestIntoChain,
      openFrictionReview,
      closeFrictionReview,
      recordFrictionReview,
      markFrictionFixApplied,
      archiveUserQuest,
      disableRecurringQuest,
      openEditRecurringQuest,
      closeEditRecurringQuest,
      updateRecurringQuestTemplate,
      pauseRecurringQuest,
      archiveRecurringQuest,
      lowerRecurringQuestDifficulty,
      addStarterToRecurringQuest,
      updateCategoryQuestDefaults,
      applyQuestDefaultsPreset,
      setDesiredIdentityTraits,
      setActiveSuiteId,
      clearActiveSuiteId,
      setQuestStyleProfile,
      setReminderPreferences,
      setMascotPreference,
      applyQuestReminderSyncUpdates,
      recordFocusDistraction,
      markFrictionShieldApplied,
      submitDailyAwareness,
      dismissDailyAwarenessCheck,
      openDailyShutdown,
      closeDailyShutdown,
      dismissDailyShutdownPrompt,
      completeDailyShutdown,
      carryQuestToToday,
      snoozeQuest,
      carryQuestToTomorrow,
      submitWeeklyReview,
      closeMonthlySeasonReport,
      requestedQuestBoardTab,
      requestQuestBoardTab,
      clearRequestedQuestBoardTab,
      dismissNextBestActionForToday,
      dismissCoachTipForToday,
      dismissCelebration,
      setGuidedFeatureDiscovery,
      setShowAdvancedFeatureTools,
      hqScrollNonce,
      requestHqScrollToDailyAwareness,
      dismissXpBurst,
      markChapterIntroSeen,
      dismissHqTutorial,
      startHqTutorialAddQuest,
      dismissNarrativeMoment,
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
      addQuestInboxPrefill,
      addQuestTraitSuggestionPrefill,
      addQuestSheetOpen,
      activeInboxItems,
      addUserQuest,
      addUserQuestPack,
      allQuestsComplete,
      closeQuestPackSheet,
      activateMinimumViableDay,
      doOneSmallQuest,
      archiveUserQuest,
      archiveInboxItem,
      captureInboxTask,
      convertInboxItem,
      disableRecurringQuest,
      openEditRecurringQuest,
      closeEditRecurringQuest,
      updateRecurringQuestTemplate,
      pauseRecurringQuest,
      archiveRecurringQuest,
      lowerRecurringQuestDifficulty,
      addStarterToRecurringQuest,
      updateCategoryQuestDefaults,
      applyQuestDefaultsPreset,
      setDesiredIdentityTraits,
      setActiveSuiteId,
      clearActiveSuiteId,
      setQuestStyleProfile,
      setReminderPreferences,
      setMascotPreference,
      applyQuestReminderSyncUpdates,
      chapters,
      characters,
      activeCelebration,
      closeAddQuestSheet,
      closeFrictionReview,
      closeImproveQuest,
      closeEditRecurringQuest,
      closeSplitQuestChain,
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
      dismissDailyShutdownPrompt,
      openDailyShutdown,
      closeDailyShutdown,
      completeDailyShutdown,
      carryQuestToToday,
      snoozeQuest,
      carryQuestToTomorrow,
      dailyShutdownOpen,
      dismissHqTutorial,
      dismissNarrativeMoment,
      dismissCelebration,
      dismissXpBurst,
      focusDecisiveMoment,
      focusQuest,
      frictionReviewQuestId,
      improveQuestId,
      editRecurringQuestId,
      splitQuestChainId,
      activeCelebration,
      celebrationQueue,
      isCelebrationActive,
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
      openAddQuestFromTraitSuggestion,
      openFrictionReview,
      openImproveQuest,
      openSplitQuestChain,
      openQuestFocus,
      openQuestPackSheet,
      openRecoveryQuestSheet,
      player,
      narrativeStateValid,
      progress,
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
      showMinimumViableDayActive,
      todayFocusLocked,
      startHqTutorialAddQuest,
      startUnlockedSagaFromChapterComplete,
      storyLine,
      submitDailyAwareness,
      submitWeeklyReview,
      closeMonthlySeasonReport,
      requestedQuestBoardTab,
      requestQuestBoardTab,
      clearRequestedQuestBoardTab,
      dismissNextBestActionForToday,
      dismissCoachTipForToday,
      dismissCelebration,
      setGuidedFeatureDiscovery,
      setShowAdvancedFeatureTools,
      hqScrollNonce,
      requestHqScrollToDailyAwareness,
      startQuestNow,
      splitUserQuestIntoChain,
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
