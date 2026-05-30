/** Minimal audit using only RN-free modules. Run: npx tsx scripts/stability-audit-lite.ts */
import { UNIVERSES } from '../src/data/narrative/universes';
import { NEON_ASHES_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neon-ashes-universe';
import { NEURONET_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neuronet-universe';
import { convertTaskToUserQuest, createUserQuestId } from '../src/lib/convert-task-to-quest';
import { getLocalDateKey, getTomorrowDateKey } from '../src/lib/daily-streak';
import {
  applyDevSwitchToDustAndIron,
  applyDevSwitchToNeonAshes,
  applyDevSwitchToNeuroNet,
} from '../src/lib/dev-universe-switch';
import { resolveNarrativeState } from '../src/lib/narrative-state';
import { createEmptyIdentityVotes } from '../src/lib/identity-votes';
import {
  formatDesiredIdentityHighlight,
  getDesiredTraitWeeklyProgress,
  getIdentityCompassFlavor,
  isDesiredIdentityTrait,
  sanitizeDesiredIdentityTraits,
  toggleDesiredIdentityTrait,
} from '../src/lib/identity-compass';
import {
  getTraitAlignedSuggestions,
  getTraitSuggestionFlavor,
  TRAIT_TO_SUGGESTED_CATEGORIES,
} from '../src/lib/trait-aligned-suggestions';
import {
  buildQuestCalendarDays,
  getQuestCalendarIntensity,
  QUEST_CALENDAR_DAYS,
} from '../src/lib/quest-calendar';
import {
  generateSystemsInsights,
  getSystemsInsightHeaderFlavor,
  hasEnoughSystemsInsightData,
  MAX_SYSTEMS_INSIGHTS,
  pickQuestIdForFocusInsight,
} from '../src/lib/systems-insights';
import {
  formatPreQuestRitualCardLine,
  formatPreQuestRitualFocusLine,
  getPreQuestRitualCopy,
  isMotivationLinePreset,
  isPresetPreQuestRitual,
} from '../src/lib/pre-quest-ritual';
import {
  generateGoldilocksRecommendation,
  generateGoldilocksRecommendationWithStyle,
  getGoldilocksCoachFlavor,
  hasEnoughGoldilocksCoachData,
  pickHighRiskQuestForSplit,
} from '../src/lib/goldilocks-coach';
import {
  createQuestStyleProfileUpdate,
  formatQuestStyleSummary,
  mergeResolvedAddQuestDefaults,
  resolveQuestStyleAddQuestDefaults,
  sanitizeQuestStyleProfile,
  sortPackIdsByStyle,
} from '../src/lib/quest-style-profile';
import { QUEST_PACKS, sortQuestPacksForProfile } from '../src/lib/quest-packs';
import { getDailyAwarenessRecommendation } from '../src/lib/daily-awareness';
import {
  appendEvidenceEvent,
  createEvidenceEvent,
  groupEvidenceByDate,
  sanitizeEvidenceLog,
} from '../src/lib/evidence-log';
import { getCrewCodeLines, getDailyCrewCodeLine } from '../src/lib/crew-code';
import {
  applyQuestDefaultsPreset,
  createEmptyQuestDefaultsSettings,
  resolveAddQuestDefaults,
  sanitizeQuestDefaultsSettings,
} from '../src/lib/quest-defaults';
import {
  captureQuestInboxItem,
  getActiveInboxItems,
  getQuickCaptureFlavor,
  markInboxItemArchived,
  markInboxItemConverted,
  QUEST_INBOX_EMPTY_MESSAGE,
  sanitizeQuestInbox,
} from '../src/lib/quest-inbox';
import { suggestTaskCategory } from '../src/lib/suggest-task-category';
import {
  buildQuestChainFromParent,
  computeChainProgress,
  formatChainProgressLabel,
  getQuestChainFlavor,
  isQuestChainSplittable,
  splitChildXpReward,
} from '../src/lib/quest-chain';
import {
  buildRoutineAwareNarrative,
  getRoutineFreshnessHint,
  pickRoutineVariationTone,
  recordRoutineQuestCompleted,
  recordRoutineQuestSpawned,
} from '../src/lib/routine-boredom-guard';
import { findRoutineTitleCatalogEntry } from '../src/data/narrative/routine-title-variations';
import {
  applyMomentumGain,
  computeMomentumGain,
  detectMomentumMilestoneUnlock,
  formatMomentumGainOverlayLine,
  getMomentumUniverseCopy,
  MOMENTUM_MILESTONES,
} from '../src/lib/momentum-reserve';
import {
  countPlanningActions,
  getMotionGuardUniverseFlavor,
  isTooMuchMotion,
  recordFrictionReviewActivity,
  recordImproveActivity,
  recordReadinessUpdateActivity,
} from '../src/lib/motion-vs-action';
import {
  detectIdentityMilestoneUnlock,
  getMilestoneTierForVotes,
  getTraitBecomingProgress,
} from '../src/lib/identity-milestones';
import { buildBoardQuests, findBoardQuest } from '../src/lib/quest-board';
import { computeQuestReadiness } from '../src/lib/quest-readiness';
import { isHighRiskQuest, resolveQuestRiskLevel } from '../src/lib/quest-risk';
import { getDistractionShieldSuggestion } from '../src/lib/distraction-shield';
import { getQuestFocusCopy, getQuestStartRitualCopy } from '../src/lib/quest-focus-mode';
import { getAfterQuestRewardCopy } from '../src/lib/after-quest-reward';
import { recordWeeklyReview } from '../src/lib/weekly-review';
import { lockTodayFocus } from '../src/lib/focus-lock';
import { shouldShowFrictionReview } from '../src/lib/quest-friction';
import { sanitizePersistedProgress, sanitizeUserQuest } from '../src/lib/player-progress-sanitize';
import {
  buildQuestReminderFields,
  buildQuestReminderId,
  createDefaultReminderPreferences,
  formatQuestReminderCue,
  getQuestReminderNotificationCopy,
  shouldScheduleQuestReminder,
  suggestReminderSelectionFromPlannedTime,
} from '../src/lib/quest-reminders';
import { sanitizeReminderPreferences } from '../src/lib/reminder-preferences';
import {
  buildQuestBoardTabContent,
  compareTodayBoardQuests,
  getChapterBoardTabLabel,
  getTodayQuestPriority,
} from '../src/lib/quest-board-organization';
import type { BoardQuest, IdentityTraitKey, PlayerProgress, QuestRiskLevel, TaskCategory, UserQuest } from '../src/types/narrative';
import {
  applyKeepQuestForTomorrow,
  computeDailyShutdownOpenQuests,
  getDailyShutdownCopy,
  recordDailyShutdown,
  shouldShowDailyShutdownPrompt,
} from '../src/lib/daily-shutdown';
import {
  applyCarryQuestToToday,
  isQuestInTodayTab,
  isQuestNeedsReview,
} from '../src/lib/quest-lifecycle';
import {
  computeMonthlySeasonReport,
  getLocalMonthKey,
  getMonthlyReportTitle,
  isMonthlyReviewClosed,
  markMonthlyReviewSeen,
  MONTHLY_IDENTITY_COPY,
} from '../src/lib/monthly-review';
import {
  dismissNextBestActionForToday,
  getNextBestAction,
  isNextBestActionDismissedToday,
} from '../src/lib/next-best-action';
import {
  activateMinimumViableDay,
  countMinimumDaysSecuredThisMonth,
  getMinimumViableDayCopy,
  hasCompletedQuestToday,
  isMinimumViableDayActive,
  isMinimumViableDaySecuredToday,
  markMinimumViableDaySecured,
  pickSuggestedSmallQuest,
  shouldAutoActivateMvdFromAwareness,
} from '../src/lib/minimum-viable-day';
import { getQuestLoadStatus } from '../src/lib/quest-load';
import {
  computeRoutineMaintenanceSummary,
  getSuggestedStarterForRoutine,
} from '../src/lib/routine-maintenance';
import {
  formatTomorrowImplementationIntention,
  getTomorrowSetupForDate,
  recordTomorrowSetup,
} from '../src/lib/tomorrow-setup';
import {
  dismissCoachTipForToday,
  getContextualCoachTip,
  isCoachTipDismissedToday,
} from '../src/lib/contextual-coach-tip';
import {
  computeDiscoveryTier,
  createDefaultFeatureDiscoveryState,
  isFeatureUnlocked,
  refreshFeatureDiscoveryState,
  setGuidedFeatureDiscoveryEnabled,
} from '../src/lib/feature-discovery';
import {
  detectProcessAchievementUnlocks,
  getProcessAchievementDefinition,
  isProcessAchievementUnlocked,
  unlockProcessAchievements,
} from '../src/lib/process-achievements';
import {
  advanceRewardQueue,
  buildQuestCompleteCelebrationEvents,
  createRewardEvent,
  enqueueRewardEvents,
  getActiveRewardEvent,
} from '../src/lib/reward-event-queue';
import {
  addStarterToRecurringQuestTemplate,
  createRecurringQuestTemplate,
  lowerRecurringQuestTemplateDifficulty,
  pauseRecurringQuestTemplate,
} from '../src/lib/recurring-quests';
import { shouldShowRecoveryPrompt } from '../src/lib/recovery-quest';
const AMBIENT_UNIVERSE_IDS = ['dust-and-iron', 'neuronet', 'neon-ashes'] as const;

const failures: string[] = [];
const assert = (ok: boolean, msg: string) => {
  if (!ok) failures.push(msg);
};

function baseProgress(): PlayerProgress {
  const progress = {
    hasOnboarded: true,
    tutorialSeen: false,
    firstUniverseId: null,
    firstSagaId: null,
    onboardingCompletedAt: null,
    selectedUniverseId: 'dust-and-iron',
    selectedSagaId: 'vulture-gang',
    currentChapterId: 'vulture-gang-ch1',
    activeChapterBySagaId: {},
    completedChapterIdsBySagaId: {},
    completedQuestIdsBySagaId: {},
    totalXp: 0,
    level: 1,
    reputation: 0,
    unlockedRewards: [NEURONET_UNIVERSE_UNLOCK_ID, NEON_ASHES_UNIVERSE_UNLOCK_ID],
    userQuests: [],
    villainInfluenceBySaga: {},
    chapterCompletions: {},
    relationshipByCharacter: {},
    characterAffinity: {},
    seenChapterIntros: [],
    dismissedTauntBySagaId: {},
    lastActiveDate: null,
    dailyStreak: 0,
    dailyFocusLimit: 3,
    activityByDate: {},
    lastSagaByUniverseId: {},
    identityVotes: createEmptyIdentityVotes(),
    desiredIdentityTraits: [],
    lastMissedDate: null,
    recoveryQuestOfferedForDate: null,
    recoveryQuestCompletedDates: [],
    focusLockedDate: null,
    lockedFocusQuestIds: [],
    dailyAwarenessByDate: {},
    dailyAwarenessDismissedDates: [],
    templateQuestStartedAt: {},
    weeklyReviewByWeek: {},
    recurringQuestTemplates: [],
    evidenceLog: [],
    momentumReserve: 0,
    momentumMilestonesReached: [],
    routineRepetitionByKey: {},
    questDefaults: createEmptyQuestDefaultsSettings(),
    questInbox: [],
    questStyleProfile: {},
    reminderPreferences: createDefaultReminderPreferences(),
    dailyShutdownByDate: {},
    dailyShutdownDismissedDates: [],
    monthlyReviewSeenByMonth: {},
    dismissedNextBestActionByDate: {},
    dismissedCoachTipsByDate: {},
    featureDiscoveryState: createDefaultFeatureDiscoveryState(),
    processAchievements: [],
    minimumViableDayByDate: {},
    tomorrowSetupByDate: {},
  } as PlayerProgress;

  for (const universe of UNIVERSES) {
    for (const saga of universe.sagas) {
      progress.activeChapterBySagaId[saga.id] = saga.chapters[0]?.id ?? '';
      progress.completedChapterIdsBySagaId[saga.id] = [];
      progress.completedQuestIdsBySagaId[saga.id] = [];
      progress.dismissedTauntBySagaId[saga.id] = null;
      progress.villainInfluenceBySaga[saga.id] = 100;
      progress.lastSagaByUniverseId[universe.id] = saga.id;
    }
  }

  return progress;
}

// Universe switching
let progress = baseProgress();
for (const fn of [
  () => applyDevSwitchToDustAndIron(progress),
  () => applyDevSwitchToNeuroNet(progress),
  () => applyDevSwitchToNeonAshes(progress),
  () => applyDevSwitchToDustAndIron(progress),
]) {
  progress = fn();
  const state = resolveNarrativeState(progress);
  assert(state.isValid, `switch invalid: ${state.issues.join(', ')}`);
}

// Ambient universe coverage (modules verified at build time via require in constants/audio.ts)
for (const universeId of AMBIENT_UNIVERSE_IDS) {
  assert(UNIVERSES.some((u) => u.id === universeId), `missing universe ${universeId}`);
}

// Add quest all universes
const category: TaskCategory = 'work';
for (const universe of UNIVERSES) {
  const saga = universe.sagas.find((s) => s.chapters.length > 0)!;
  const chapter = saga.chapters[0]!;
  const quest = convertTaskToUserQuest('Audit task', category, universe, saga, chapter, []);
  assert(quest.sourceUniverseId === universe.id, `quest universe ${universe.id}`);
  assert(quest.narrativeTitle.length > 0, `empty quest title ${universe.id}`);
}

// Origin fields preserved on switch
progress = {
  ...baseProgress(),
  firstUniverseId: 'neon-ashes',
  firstSagaId: 'hollow-syndicate',
  onboardingCompletedAt: '2026-05-27',
};
const switched = applyDevSwitchToNeuroNet(progress);
assert(switched.firstUniverseId === 'neon-ashes', 'origin universe overwritten');
assert(switched.firstSagaId === 'hollow-syndicate', 'origin saga overwritten');

function simulateAddUserQuest(
  base: PlayerProgress,
  universeId: string,
  options?: {
    starterTaskTitle?: string;
    prepStepTitle?: string;
    afterQuestReward?: string;
    riskLevel?: QuestRiskLevel;
  },
): UserQuest {
  const universe = UNIVERSES.find((u) => u.id === universeId)!;
  const saga = universe.sagas.find((s) => s.id === base.selectedSagaId)!;
  const chapter = saga.chapters.find((c) => c.id === base.currentChapterId)!;
  const converted = convertTaskToUserQuest('Simulated quest', 'cleaning', universe, saga, chapter, base.userQuests);
  return {
    ...converted,
    id: createUserQuestId(),
    isCompleted: false,
    createdOnDate: '2026-05-27',
    ...(options?.starterTaskTitle ? { starterTaskTitle: options.starterTaskTitle } : {}),
    ...(options?.prepStepTitle ? { prepStepTitle: options.prepStepTitle } : {}),
    ...(options?.afterQuestReward ? { afterQuestReward: options.afterQuestReward } : {}),
    riskLevel: options?.riskLevel ?? 'standard',
  };
}

// Behavior tools: create quest variants (all universes)
for (const universe of UNIVERSES) {
  const saga = universe.sagas.find((s) => s.chapters.length > 0)!;
  const chapter = saga.chapters[0]!;
  const scoped: PlayerProgress = {
    ...baseProgress(),
    selectedUniverseId: universe.id,
    selectedSagaId: saga.id,
    currentChapterId: chapter.id,
    userQuests: [],
  };

  const normal = simulateAddUserQuest(scoped, universe.id);
  assert(normal.riskLevel === 'standard', `${universe.id}: default risk`);

  const full = simulateAddUserQuest(scoped, universe.id, {
    starterTaskTitle: 'Wipe one counter',
    prepStepTitle: 'Lay out supplies',
    afterQuestReward: 'Five minutes of rest',
    riskLevel: 'high',
  });
  assert(full.starterTaskTitle != null, `${universe.id}: starter`);
  assert(full.prepStepTitle != null, `${universe.id}: prep`);
  assert(full.afterQuestReward != null, `${universe.id}: reward`);
  assert(isHighRiskQuest(full.riskLevel), `${universe.id}: high risk`);
  assert(getQuestFocusCopy(universe.id).tagline.length > 0, `${universe.id}: focus copy`);
  assert(getQuestStartRitualCopy(universe.id).startButtonLabel.length > 0, `${universe.id}: ritual copy`);
  assert(getAfterQuestRewardCopy(universe.id).helperText.length > 0, `${universe.id}: reward copy`);
}

// Board quest supports + friction + completed guard
const dustUniverse = UNIVERSES.find((u) => u.id === 'dust-and-iron')!;
const dustSaga = dustUniverse.sagas.find((s) => s.chapters.length > 0)!;
const dustChapter = dustSaga.chapters[0]!;
const richQuest: UserQuest = {
  ...simulateAddUserQuest(
    { ...baseProgress(), selectedSagaId: dustSaga.id, currentChapterId: dustChapter.id },
    'dust-and-iron',
    {
      starterTaskTitle: 'Open the document',
      prepStepTitle: 'Clear the table',
      afterQuestReward: 'Coffee break',
      riskLevel: 'high',
    },
  ),
  implementationIntention: 'After lunch, at my desk',
  lastFocusDistraction: 'phone',
};
const boardProgress: PlayerProgress = {
  ...baseProgress(),
  selectedUniverseId: dustUniverse.id,
  selectedSagaId: dustSaga.id,
  currentChapterId: dustChapter.id,
  userQuests: [richQuest],
};
const boardQuest = findBoardQuest(buildBoardQuests(dustChapter, dustSaga, boardProgress), richQuest.id)!;
assert(Boolean(boardQuest.starterTaskTitle), 'board starter');
assert(Boolean(boardQuest.implementationIntention), 'board plan');
assert(Boolean(boardQuest.prepStepTitle), 'board prep');
assert(Boolean(boardQuest.afterQuestReward), 'board reward');
assert(boardQuest.lastFocusDistraction === 'phone', 'board distraction');
assert(getDistractionShieldSuggestion('phone').length > 0, 'shield copy');
assert((computeQuestReadiness(boardQuest)?.score ?? 0) >= 2, 'readiness score');

const staleQuest = { ...richQuest, id: createUserQuestId(), createdOnDate: '2026-05-20' };
const staleEntry = findBoardQuest(
  buildBoardQuests(dustChapter, dustSaga, { ...boardProgress, userQuests: [staleQuest] }),
  staleQuest.id,
)!;
assert(shouldShowFrictionReview(staleEntry, '2026-05-27'), 'friction eligible');

// Motion vs Action guard
const motionQuest = recordReadinessUpdateActivity(
  recordImproveActivity(
    recordFrictionReviewActivity({ ...richQuest, isCompleted: false }),
    '2026-05-27T10:00:00.000Z',
  ),
  '2026-05-27T11:00:00.000Z',
);
assert(countPlanningActions(motionQuest) === 3, 'planning action count');
assert(isTooMuchMotion(motionQuest, '2026-05-27'), 'too much motion when 3 planning actions');
assert(!isTooMuchMotion({ ...motionQuest, isCompleted: true }, '2026-05-27'), 'completed quest not flagged');
assert(!isTooMuchMotion({ ...richQuest, improvedAt: ['t1'] }, '2026-05-27'), 'under threshold not flagged');
const motionBoard = findBoardQuest(
  buildBoardQuests(dustChapter, dustSaga, { ...boardProgress, userQuests: [motionQuest] }),
  motionQuest.id,
)!;
assert(motionBoard.isTooMuchMotion === true, 'board quest too much motion flag');
assert(getMotionGuardUniverseFlavor('neuronet').includes('Execute'), 'neuronet motion flavor');

const doneEntry = findBoardQuest(
  buildBoardQuests(dustChapter, dustSaga, {
    ...boardProgress,
    userQuests: [{ ...richQuest, isCompleted: true }],
  }),
  richQuest.id,
)!;
assert(doneEntry.completed === true, 'completed board quest');

// Persistence sanitize round-trip
const sanitized = sanitizeUserQuest(richQuest);
assert(sanitized?.lastFocusDistraction === 'phone', 'sanitize distraction');
assert(sanitized?.afterQuestReward === 'Coffee break', 'sanitize reward');
assert(sanitized?.riskLevel === 'high', 'sanitize risk');

let persisted = sanitizePersistedProgress({
  ...boardProgress,
  userQuests: [richQuest],
});
persisted = recordWeeklyReview(persisted, ['starter-moves'], 'low-energy');
persisted = lockTodayFocus(persisted, 'dust-and-iron', '2026-05-27');
const roundTrip = sanitizePersistedProgress(persisted);
assert(roundTrip.userQuests[0]?.lastFocusDistraction === 'phone', 'round-trip distraction');
assert(roundTrip.userQuests[0]?.afterQuestReward === 'Coffee break', 'round-trip reward');
assert(Object.keys(roundTrip.weeklyReviewByWeek).length === 1, 'round-trip weekly review');
assert(roundTrip.focusLockedDate === '2026-05-27', 'round-trip focus lock');
assert(roundTrip.lockedFocusQuestIds.length > 0, 'round-trip locked ids');

// Legacy quest without new fields normalizes via sanitize
const legacyRaw = {
  id: 'user-1000-legacy',
  originalTitle: 'Legacy task',
  category: 'work' as TaskCategory,
  narrativeTitle: 'Legacy narrative',
  narrativeDescription: 'Legacy desc',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: dustSaga.id,
  sourceChapterId: dustChapter.id,
  isCompleted: false,
  xpReward: 10,
  reputationReward: 1,
  reactionCharacterId: dustSaga.characters[0]?.id ?? 'unknown',
};
const legacySanitized = sanitizeUserQuest(legacyRaw);
assert(legacySanitized?.originalTitle === 'Legacy task', 'legacy quest sanitize');
assert(resolveQuestRiskLevel(legacySanitized?.riskLevel) === 'standard', 'legacy default risk');

// Identity milestones
assert(getMilestoneTierForVotes(0) === null, 'zero votes no tier');
assert(getMilestoneTierForVotes(1)?.label === 'Spark', 'spark at 1 vote');
assert(getMilestoneTierForVotes(5)?.label === 'Emerging', 'emerging at 5 votes');
assert(getMilestoneTierForVotes(60)?.label === 'Legendary', 'legendary at 60 votes');
assert(detectIdentityMilestoneUnlock(0, 1)?.label === 'Spark', 'first vote unlocks spark');
assert(detectIdentityMilestoneUnlock(4, 5)?.label === 'Emerging', 'fifth vote unlocks emerging');
assert(detectIdentityMilestoneUnlock(5, 6) === null, 'no duplicate tier unlock');
const reliableProgress = getTraitBecomingProgress('reliable', 3);
assert(reliableProgress.currentTier?.label === 'Spark', 'reliable spark tier at 3');
assert(reliableProgress.votesToNext === 2, 'reliable 2 votes to emerging');

// Evidence timeline
const sampleEvent = createEvidenceEvent({
  universeId: 'dust-and-iron',
  sagaId: dustSaga.id,
  chapterId: dustChapter.id,
  questTitle: 'Secure the supply room',
  originalTaskTitle: 'Clean kitchen',
  category: 'cleaning',
  identityTraitGained: 'Organized',
  xpEarned: 12,
  reputationEarned: 2,
  characterId: dustSaga.characters[0]?.id,
  source: 'userQuest',
  date: '2026-05-27',
  timestamp: '2026-05-27T18:00:00.000Z',
});
const withEvidence = appendEvidenceEvent({ ...boardProgress, evidenceLog: [] }, sampleEvent);
assert(withEvidence.evidenceLog.length === 1, 'append evidence event');
assert(withEvidence.evidenceLog[0]?.questTitle === 'Secure the supply room', 'evidence quest title');
assert(sanitizeEvidenceLog(withEvidence.evidenceLog).length === 1, 'sanitize evidence log');
assert(groupEvidenceByDate(withEvidence.evidenceLog, '2026-05-27')[0]?.label === 'Today', 'group today');

// Crew code
const vultureSaga = UNIVERSES[0]?.sagas[0];
assert(vultureSaga != null && getCrewCodeLines(vultureSaga).length >= 2, 'vulture crew code lines');
const lineA = getDailyCrewCodeLine(vultureSaga!, '2026-05-27');
const lineB = getDailyCrewCodeLine(vultureSaga!, '2026-05-27');
assert(lineA != null && lineA === lineB, 'crew code daily line stable');

// Momentum reserve
assert(computeMomentumGain('user', 'standard') === 1, 'user quest momentum');
assert(computeMomentumGain('template', 'standard') === 2, 'template quest momentum');
assert(computeMomentumGain('user', 'high') === 3, 'high-risk user momentum bonus');
const momentumApplied = applyMomentumGain(baseProgress(), 2);
assert(momentumApplied.progress.momentumReserve === 2, 'momentum accumulates');
assert(
  detectMomentumMilestoneUnlock(8, 11, [])?.label === MOMENTUM_MILESTONES[0]?.label,
  'momentum milestone at 10',
);
assert(
  formatMomentumGainOverlayLine('neuronet', 1) === '+1 Signal Charge',
  'neuronet momentum overlay line',
);
assert(getMomentumUniverseCopy('neon-ashes').label === 'Case Pressure', 'neon ashes momentum label');

// Routine boredom guard
assert(findRoutineTitleCatalogEntry('Drink water') != null, 'hydration catalog match');
assert(pickRoutineVariationTone(0) === 'calm', 'routine tone calm first');
assert(pickRoutineVariationTone(1) === 'normal', 'routine tone normal second');
assert(pickRoutineVariationTone(3) === 'calm', 'routine tone cycles');
const routineSpawned = recordRoutineQuestSpawned({ ...boardProgress }, {
  ...richQuest,
  id: createUserQuestId(),
  originalTitle: 'Drink water',
  category: 'health',
  narrativeTitle: 'Refill the canteen before patrol.',
  isCompleted: false,
  generatedFromRecurringQuestId: 'recurring-test-1',
});
assert(
  routineSpawned.routineRepetitionByKey['recurring:recurring-test-1']?.lastNarrativeTitleUsed != null,
  'routine repetition on spawn',
);
const routineCompleted = recordRoutineQuestCompleted(routineSpawned, {
  originalTitle: 'Drink water',
  category: 'health',
  narrativeTitle: 'Refill the canteen before patrol.',
  generatedFromRecurringQuestId: 'recurring-test-1',
});
assert(
  routineCompleted.routineRepetitionByKey['recurring:recurring-test-1']?.completionCount === 1,
  'routine completion count',
);
const repeatNarrative = buildRoutineAwareNarrative({
  originalTitle: 'Drink water',
  category: 'health',
  universe: dustUniverse,
  saga: dustSaga,
  chapter: dustChapter,
  recentQuests: [],
  repetitionRecord: {
    originalTitle: 'Drink water',
    category: 'health',
    lastNarrativeTitleUsed: 'Refill the canteen before patrol.',
    recentVariationIds: [],
    completionCount: 2,
  },
});
assert(
  repeatNarrative.narrativeTitle !== 'Refill the canteen before patrol.',
  'routine catalog rotates title',
);
const freshnessHint = getRoutineFreshnessHint(
  {
    id: 'user-test',
    originalTitle: 'Drink water',
    category: 'health',
    generatedFromRecurringQuestId: 'recurring-test-1',
  },
  routineCompleted,
);
assert(freshnessHint != null, 'routine freshness hint');

// Quest defaults
const deepWorkDefaults = applyQuestDefaultsPreset('deep-work');
assert(deepWorkDefaults.byCategory.work?.defaultPlannedLocation === 'Desk', 'deep work desk default');
const resolvedDefaults = resolveAddQuestDefaults(deepWorkDefaults, 'work', 'Write report');
assert(resolvedDefaults.focusPinned === true, 'deep work focus default');
assert(resolvedDefaults.plannedLocation === 'Desk', 'deep work location resolved');
const recoveryDefaults = applyQuestDefaultsPreset('recovery');
assert(
  recoveryDefaults.byCategory.health?.defaultAfterQuestReward === 'Rest for 5 minutes',
  'recovery reward default',
);
assert(sanitizeQuestDefaultsSettings(undefined).byCategory != null, 'sanitize empty quest defaults');

// Category suggestion
assert(suggestTaskCategory('Clean kitchen') === 'cleaning', 'single cleaning match');
assert(suggestTaskCategory('Buy groceries') === 'errand', 'single errand match');
assert(suggestTaskCategory('Write report') === null, 'ambiguous creative/work returns null');
assert(suggestTaskCategory('Call about groceries') === null, 'ambiguous social/errand returns null');
assert(suggestTaskCategory('') === null, 'empty title returns null');

// Quest inbox
assert(QUEST_INBOX_EMPTY_MESSAGE === 'No loose tasks captured.', 'inbox empty message');
assert(
  getQuickCaptureFlavor('dust-and-iron') === 'Jot it on the bounty board.',
  'dust quick capture flavor',
);
assert(
  getQuickCaptureFlavor('neuronet') === 'Capture the signal before it decays.',
  'neuronet quick capture flavor',
);
const inboxCaptured = captureQuestInboxItem([], 'Buy groceries');
assert(inboxCaptured.length === 1, 'capture inbox item');
assert(inboxCaptured[0]?.status === 'inbox', 'inbox item active');
assert(inboxCaptured[0]?.suggestedCategory === 'errand', 'inbox category suggestion');
const activeInbox = getActiveInboxItems(inboxCaptured);
assert(activeInbox.length === 1, 'active inbox filter');
const inboxId = inboxCaptured[0]!.id;
const inboxConverted = markInboxItemConverted(inboxCaptured, inboxId);
assert(getActiveInboxItems(inboxConverted).length === 0, 'converted leaves active inbox');
assert(inboxConverted[0]?.status === 'converted', 'inbox item converted status');
const inboxArchived = markInboxItemArchived(inboxCaptured, inboxId);
assert(inboxArchived[0]?.status === 'archived', 'inbox item archived status');
assert(sanitizeQuestInbox(undefined).length === 0, 'sanitize missing inbox');
assert(sanitizeQuestInbox(inboxCaptured).length === 1, 'sanitize inbox items');
const { questInbox: _legacyInbox, ...legacyWithoutInbox } = baseProgress();
const legacyProgress = sanitizePersistedProgress(legacyWithoutInbox as PlayerProgress);
assert(Array.isArray(legacyProgress.questInbox), 'legacy import defaults inbox');

// Quest chain
assert(getQuestChainFlavor('dust-and-iron') === 'Break the trail into smaller rides.', 'chain flavor');
assert(splitChildXpReward(100, 4) === 25, 'split child xp');
assert(isQuestChainSplittable({
  id: 'user-test',
  isCompleted: false,
  isQuestChainParent: false,
}) === true, 'splittable quest');
assert(isQuestChainSplittable({
  id: 'user-test',
  isCompleted: false,
  isQuestChainParent: true,
}) === false, 'chain parent not splittable');
const chainParent = {
  ...richQuest,
  id: 'user-chain-parent',
  originalTitle: 'Clean entire room',
  xpReward: 100,
  reputationReward: 8,
};
const chainBuilt = buildQuestChainFromParent(
  chainParent,
  [
    { title: 'Clear one visible surface' },
    { title: 'Put laundry away' },
    { title: 'Take trash out' },
    { title: 'Vacuum floor' },
  ],
  dustUniverse,
  dustSaga,
  dustChapter,
  [chainParent],
  boardProgress,
  '2026-05-27',
);
assert(chainBuilt.updatedParent.isQuestChainParent === true, 'parent marked chain');
assert(chainBuilt.childQuests.length === 4, 'four chain children');
assert(chainBuilt.childQuests[0]?.parentQuestId === chainParent.id, 'child links parent');
assert(chainBuilt.childQuests[0]?.xpReward === 25, 'child split xp');
const chainProgress = computeChainProgress(chainBuilt.updatedParent, chainBuilt.childQuests);
assert(chainProgress?.completed === 0 && chainProgress.total === 4, 'chain progress initial');
assert(formatChainProgressLabel(2, 4) === 'Quest Chain: 2/4 steps cleared', 'chain progress label');

// Identity compass
assert(getIdentityCompassFlavor('neuronet') === 'Choose the signal you want to strengthen.', 'compass flavor');
assert(sanitizeDesiredIdentityTraits(['reliable', 'invalid', 'reliable']).length === 1, 'sanitize desired traits');
assert(toggleDesiredIdentityTrait(['organized'], 'curious').length === 2, 'toggle desired trait');
assert(isDesiredIdentityTrait('reliable', ['reliable', 'curious']), 'desired trait match');
assert(
  formatDesiredIdentityHighlight('reliable') === "You reinforced Reliable — a trait you're building toward.",
  'desired highlight line',
);
const compassProgress = {
  ...baseProgress(),
  desiredIdentityTraits: sanitizeDesiredIdentityTraits(['reliable', 'organized']),
  evidenceLog: [
    createEvidenceEvent({
      universeId: 'dust-and-iron',
      sagaId: dustSaga.id,
      chapterId: dustChapter.id,
      questTitle: 'Handle operations',
      category: 'work',
      identityTraitGained: 'Reliable',
      xpEarned: 10,
      reputationEarned: 2,
      source: 'userQuest',
      date: '2026-05-27',
    }),
  ],
};
const weeklyCompass = getDesiredTraitWeeklyProgress(compassProgress, new Date('2026-05-27T12:00:00'));
assert(weeklyCompass?.traitKey === 'reliable', 'weekly desired trait progress');
const legacyCompass = sanitizePersistedProgress({ ...baseProgress(), desiredIdentityTraits: undefined as never });
assert(Array.isArray(legacyCompass.desiredIdentityTraits), 'legacy import defaults desired traits');

// Trait-aligned suggestions
assert(TRAIT_TO_SUGGESTED_CATEGORIES.reliable.includes('work'), 'reliable maps to work');
const traitSuggestions = getTraitAlignedSuggestions(['reliable', 'organized']);
assert(traitSuggestions.length === 2, 'two trait suggestions');
assert(traitSuggestions[0]?.title === 'Review one important work item', 'reliable suggestion title');
assert(traitSuggestions[1]?.category === 'cleaning', 'organized suggestion category');
assert(getTraitSuggestionFlavor('dust-and-iron') === 'Choose a trail that proves your badge.', 'trait suggestion flavor');
assert(getTraitAlignedSuggestions([]).length === 0, 'empty desired traits yields no suggestions');

// Quest calendar
assert(getQuestCalendarIntensity(0) === 'none', 'calendar intensity none');
assert(getQuestCalendarIntensity(1) === 'light', 'calendar intensity light');
assert(getQuestCalendarIntensity(3) === 'medium', 'calendar intensity medium');
assert(getQuestCalendarIntensity(4) === 'strong', 'calendar intensity strong');
const calendarDays = buildQuestCalendarDays({
  '2026-05-27': {
    questsCompleted: 2,
    xpEarned: 20,
    reputationEarned: 4,
    chaptersCompleted: 0,
    highRiskQuestsCompleted: 0,
  },
});
assert(calendarDays.length === QUEST_CALENDAR_DAYS, 'calendar day count');
const todayEntry = calendarDays[calendarDays.length - 1];
assert(todayEntry?.isToday === true, 'calendar marks today');

// Systems insights
assert(getSystemsInsightHeaderFlavor('dust-and-iron') === 'Trail Readout', 'systems insight flavor');
assert(getSystemsInsightHeaderFlavor('neuronet') === 'Signal Diagnostics', 'neuronet insight flavor');
assert(generateSystemsInsights(baseProgress()).length === 0, 'empty progress yields no insights');

const highRiskProgress = {
  ...baseProgress(),
  activityByDate: {
    '2026-05-27': {
      questsCompleted: 1,
      xpEarned: 10,
      reputationEarned: 2,
      chaptersCompleted: 0,
      highRiskQuestsCompleted: 0,
    },
  },
  userQuests: [
    {
      id: 'risk-1',
      originalTitle: 'Big task A',
      category: 'work',
      narrativeTitle: 'Risk A',
      narrativeDescription: 'Desc',
      sourceUniverseId: 'dust-and-iron',
      sourceSagaId: 'vulture-gang',
      sourceChapterId: 'vulture-gang-ch1',
      isCompleted: false,
      xpReward: 10,
      reputationReward: 2,
      reactionCharacterId: 'deputy',
      riskLevel: 'high',
      createdOnDate: '2026-05-27',
    },
    {
      id: 'risk-2',
      originalTitle: 'Big task B',
      category: 'work',
      narrativeTitle: 'Risk B',
      narrativeDescription: 'Desc',
      sourceUniverseId: 'dust-and-iron',
      sourceSagaId: 'vulture-gang',
      sourceChapterId: 'vulture-gang-ch1',
      isCompleted: false,
      xpReward: 10,
      reputationReward: 2,
      reactionCharacterId: 'deputy',
      riskLevel: 'high',
      createdOnDate: '2026-05-26',
    },
  ] as UserQuest[],
};
const highRiskInsights = generateSystemsInsights(highRiskProgress, new Date('2026-05-27T12:00:00'));
assert(
  highRiskInsights.some((card) => card.id === 'high-risk-pile'),
  'high-risk incomplete quests trigger insight',
);
assert(highRiskInsights.length <= MAX_SYSTEMS_INSIGHTS, 'insights capped at three');
assert(
  hasEnoughSystemsInsightData({
    windowDateKeys: ['2026-05-27'],
    activeIncompleteQuests: highRiskProgress.userQuests,
    completedInWindow: [],
    createdInWindow: highRiskProgress.userQuests,
    awarenessAnswers: 0,
    lowEnergyAwarenessCount: 0,
    weeklyReviewCount: 0,
    totalQuestsCompletedInWindow: 1,
  }),
  'snapshot marks enough data',
);
assert(pickQuestIdForFocusInsight(highRiskProgress) === 'risk-1', 'focus insight picks first active quest');

// Pre-quest ritual
assert(getPreQuestRitualCopy('dust-and-iron').universeHint === 'Steady your hand before the ride.', 'pre-quest flavor');
assert(isPresetPreQuestRitual('Put on headphones'), 'pre-quest preset match');
assert(
  formatPreQuestRitualCardLine('Put on headphones', 'dust-and-iron') === 'Start ritual: Put on headphones',
  'pre-quest card line',
);
assert(
  formatPreQuestRitualFocusLine('Take three deep breaths', 'neuronet') === 'Before you begin: Take three deep breaths',
  'pre-quest focus line',
);
assert(
  formatPreQuestRitualFocusLine('Read the character motivation line', 'dust-and-iron', 'Ride steady.') ===
    'Before you begin: Ride steady.',
  'motivation preset resolves in focus',
);
const legacyQuest = sanitizeUserQuest({
  id: 'user-legacy-1',
  originalTitle: 'Task',
  category: 'work',
  narrativeTitle: 'Title',
  narrativeDescription: 'Desc',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: 'vulture-gang',
  sourceChapterId: 'vulture-gang-ch1',
  isCompleted: false,
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
});
assert(legacyQuest?.preQuestRitual == null, 'legacy quest import omits preQuestRitual');
const ritualQuest = sanitizeUserQuest({
  ...legacyQuest!,
  preQuestRitual: 'Start ambience',
});
assert(ritualQuest?.preQuestRitual === 'Start ambience', 'preQuestRitual persists on sanitize');

// Goldilocks coach
assert(
  getGoldilocksCoachFlavor('dust-and-iron') ===
    'Choose a trail that tests you, not one that breaks the horse.',
  'goldilocks flavor',
);
const goldilocksRec = generateGoldilocksRecommendation(highRiskProgress, new Date('2026-05-27T12:00:00'));
assert(goldilocksRec?.id === 'high-risk-heavy', 'goldilocks high-risk heavy recommendation');
assert(
  pickHighRiskQuestForSplit(highRiskProgress.userQuests) === 'risk-1',
  'goldilocks picks splittable high-risk quest',
);
const lowRiskOnlyProgress = {
  ...baseProgress(),
  userQuests: [
    {
      id: 'user-low-1',
      originalTitle: 'Easy A',
      category: 'errand',
      narrativeTitle: 'Easy A',
      narrativeDescription: 'Desc',
      sourceUniverseId: 'dust-and-iron',
      sourceSagaId: 'vulture-gang',
      sourceChapterId: 'vulture-gang-ch1',
      isCompleted: true,
      xpReward: 8,
      reputationReward: 1,
      reactionCharacterId: 'deputy',
      riskLevel: 'low',
      createdOnDate: '2026-05-25',
      completedAt: '2026-05-25T18:00:00.000Z',
    },
    {
      id: 'user-low-2',
      originalTitle: 'Easy B',
      category: 'cleaning',
      narrativeTitle: 'Easy B',
      narrativeDescription: 'Desc',
      sourceUniverseId: 'dust-and-iron',
      sourceSagaId: 'vulture-gang',
      sourceChapterId: 'vulture-gang-ch1',
      isCompleted: true,
      xpReward: 8,
      reputationReward: 1,
      reactionCharacterId: 'deputy',
      riskLevel: 'low',
      createdOnDate: '2026-05-26',
      completedAt: '2026-05-26T18:00:00.000Z',
    },
  ] as UserQuest[],
};
const lowRiskRec = generateGoldilocksRecommendation(lowRiskOnlyProgress, new Date('2026-05-27T12:00:00'));
assert(lowRiskRec?.id === 'low-risk-steady', 'goldilocks low-risk steady recommendation');
assert(
  hasEnoughGoldilocksCoachData({
    windowDateKeys: ['2026-05-27'],
    recentUserQuests: lowRiskOnlyProgress.userQuests,
    activeIncompleteQuests: [],
    completedInWindow: lowRiskOnlyProgress.userQuests,
    createdInWindow: lowRiskOnlyProgress.userQuests,
    highRiskIncomplete: [],
    lowReadinessIncomplete: [],
    completedByRisk: { low: 2, standard: 0, high: 0 },
    abandonedHighRisk: [],
  }),
  'goldilocks snapshot enough data',
);

// Quest style profile
const styleProfile = createQuestStyleProfileUpdate('quick-wins', 'deep-work');
assert(styleProfile.primaryStyle === 'quick-wins', 'quest style primary');
assert(styleProfile.secondaryStyle === 'deep-work', 'quest style secondary');
assert(formatQuestStyleSummary(styleProfile) === 'Quick Wins · Deep Work', 'quest style summary');
const legacyStyle = sanitizeQuestStyleProfile(undefined);
assert(legacyStyle.primaryStyle == null, 'legacy style import empty');
const quickDefaults = resolveQuestStyleAddQuestDefaults(styleProfile, 'health', 'Drink water');
assert(quickDefaults.riskLevel === 'low', 'quick wins default risk');
assert(quickDefaults.starterEnabled === true, 'quick wins starter default');
const mergedDefaults = mergeResolvedAddQuestDefaults(quickDefaults, { riskLevel: 'standard' });
assert(mergedDefaults.riskLevel === 'standard', 'quest defaults override style');
const packOrder = sortPackIdsByStyle(
  QUEST_PACKS.map((pack) => pack.id),
  styleProfile,
);
assert(packOrder[0] === 'morning-reset', 'style sorts morning reset first');
const styledPacks = sortQuestPacksForProfile(QUEST_PACKS, styleProfile);
assert(styledPacks[0]?.id === 'morning-reset', 'styled pack list order');
assert(
  getTraitAlignedSuggestions([], 3, styleProfile).every((entry) => entry.enableStarter),
  'quick wins boosts starter suggestions',
);
assert(
  getDailyAwarenessRecommendation('low-energy', styleProfile).includes('2-minute starter'),
  'styled daily awareness recommendation',
);
const challengeProfile = createQuestStyleProfileUpdate('challenge-seeker');
const styledGoldilocks = generateGoldilocksRecommendationWithStyle(
  {
    ...lowRiskOnlyProgress,
    questStyleProfile: challengeProfile,
  },
  new Date('2026-05-27T12:00:00'),
);
assert(styledGoldilocks?.id === 'low-risk-steady', 'styled goldilocks recommendation');

// Quest reminders
assert(buildQuestReminderId('user-abc') === 'quest-cue-user-abc', 'quest reminder id format');
assert(
  buildQuestReminderFields('evening').reminderLabel === 'Evening',
  'evening reminder preset label',
);
assert(
  buildQuestReminderFields('custom', '19:30').reminderTime === '19:30',
  'custom reminder time',
);
assert(
  suggestReminderSelectionFromPlannedTime('Tomorrow morning') === 'morning',
  'planned time suggests morning reminder',
);
assert(
  formatQuestReminderCue({ reminderEnabled: true, reminderLabel: 'Evening' }) === 'Cue: Evening',
  'quest card reminder cue',
);
assert(
  getQuestReminderNotificationCopy('neon-ashes').title === 'A lead is waiting.',
  'neon ashes reminder copy',
);
const reminderQuest = sanitizeUserQuest({
  id: 'user-reminder-1',
  originalTitle: 'Walk',
  category: 'fitness',
  narrativeTitle: 'Walk',
  narrativeDescription: 'Walk',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: 'dustfall-saga',
  sourceChapterId: 'vulture-gang-ch1',
  isCompleted: false,
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
  reminderEnabled: true,
  reminderTime: 'evening',
  reminderLabel: 'Evening',
});
assert(reminderQuest?.reminderEnabled === true, 'reminder fields persist on sanitize');
assert(
  shouldScheduleQuestReminder(reminderQuest!, { remindersEnabled: true }) === true,
  'should schedule when globally enabled',
);
assert(
  shouldScheduleQuestReminder(reminderQuest!, { remindersEnabled: false }) === false,
  'should not schedule when globally disabled',
);
assert(
  sanitizeReminderPreferences({ remindersEnabled: true }).remindersEnabled === true,
  'reminder preferences sanitize',
);

// Daily shutdown
assert(getDailyShutdownCopy('neuronet').title === 'End the cycle.', 'daily shutdown copy');
assert(
  shouldShowDailyShutdownPrompt({ ...baseProgress(), hasOnboarded: true }) === true,
  'daily shutdown prompt when not completed',
);
const shutdownProgress = recordDailyShutdown(baseProgress(), 'focus-mode', [
  { questId: 'user-abc', action: 'leave' },
]);
assert(
  shutdownProgress.dailyShutdownByDate[getLocalDateKey()]?.helpedBy === 'focus-mode',
  'daily shutdown record',
);
const carryQuest = applyKeepQuestForTomorrow({
  id: 'user-carry',
  originalTitle: 'Walk',
  category: 'fitness',
  narrativeTitle: 'Walk',
  narrativeDescription: 'Walk',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: 'vulture-gang',
  sourceChapterId: 'vulture-gang-ch1',
  isCompleted: false,
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
  createdOnDate: getLocalDateKey(),
});
assert(carryQuest.status === 'snoozed', 'keep for tomorrow snoozes quest');
assert(carryQuest.snoozedUntilDate != null, 'snooze until date set');
const openShutdownQuests = computeDailyShutdownOpenQuests(
  {
    ...baseProgress(),
    userQuests: [
      {
        id: 'user-open-1',
        originalTitle: 'Inbox zero',
        category: 'work',
        narrativeTitle: 'Inbox',
        narrativeDescription: 'Inbox',
        sourceUniverseId: 'dust-and-iron',
        sourceSagaId: 'vulture-gang',
        sourceChapterId: 'vulture-gang-ch1',
        isCompleted: false,
        xpReward: 10,
        reputationReward: 2,
        reactionCharacterId: 'deputy',
        createdOnDate: getLocalDateKey(),
        focusPinned: true,
      },
    ],
  },
  'dust-and-iron',
);
assert(openShutdownQuests.length === 1, 'open shutdown quest includes focus quest');

// Quest board organization
assert(getChapterBoardTabLabel('neon-ashes') === 'Leads', 'chapter tab label');
const lockedFocusQuest: BoardQuest = {
  id: 'user-focus-1',
  source: 'user',
  category: 'work',
  originalTitle: 'Locked',
  narrativeTitle: 'Locked',
  narrativeDescription: 'Locked',
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
  completed: false,
  isFocusLocked: true,
  createdOnDate: getLocalDateKey(),
  createdDate: getLocalDateKey(),
  lifecycleStatus: 'active',
};
const regularQuest: BoardQuest = {
  ...lockedFocusQuest,
  id: 'user-regular-1',
  isFocusLocked: false,
};
assert(
  getTodayQuestPriority(lockedFocusQuest) < getTodayQuestPriority(regularQuest),
  'locked focus sorts ahead on today tab',
);
assert(
  compareTodayBoardQuests(lockedFocusQuest, regularQuest) < 0,
  'today tab compare prefers locked focus',
);
const todayBoard = buildQuestBoardTabContent({
  tab: 'today',
  userEntries: [{ kind: 'quest', quest: regularQuest }, { kind: 'quest', quest: lockedFocusQuest }],
  chapterQuests: [],
});
assert(todayBoard.entries[0]?.kind === 'quest' && todayBoard.entries[0].quest.id === 'user-focus-1', 'today tab ordering');

const lifecycleStaleQuest = sanitizeUserQuest({
  id: 'user-stale-1',
  originalTitle: 'Old quest',
  category: 'work',
  narrativeTitle: 'Old',
  narrativeDescription: 'Old',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: 'vulture-gang',
  sourceChapterId: 'vulture-gang-ch1',
  isCompleted: false,
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
  createdOnDate: '2026-05-20',
});
assert(lifecycleStaleQuest != null, 'stale quest sanitizes');
assert(isQuestNeedsReview(lifecycleStaleQuest!, '2026-05-27'), 'stale quest needs review');
assert(!isQuestInTodayTab(lifecycleStaleQuest!, '2026-05-27'), 'stale quest not in today tab');
const carried = applyCarryQuestToToday(lifecycleStaleQuest!, '2026-05-27');
assert(isQuestInTodayTab(carried, '2026-05-27'), 'carried quest returns to today');
const completedLegacy = sanitizeUserQuest({
  id: 'user-done-1',
  originalTitle: 'Done',
  category: 'work',
  narrativeTitle: 'Done',
  narrativeDescription: 'Done',
  sourceUniverseId: 'dust-and-iron',
  sourceSagaId: 'vulture-gang',
  sourceChapterId: 'vulture-gang-ch1',
  isCompleted: true,
  xpReward: 10,
  reputationReward: 2,
  reactionCharacterId: 'deputy',
});
assert(completedLegacy?.status === 'completed', 'completed legacy quest normalizes to completed');
const reviewBoard = buildQuestBoardTabContent({
  tab: 'review',
  userEntries: [
    {
      kind: 'quest',
      quest: {
        ...regularQuest,
        id: 'user-review-1',
        createdDate: '2026-05-20',
        createdOnDate: '2026-05-20',
        needsReview: true,
        lifecycleStatus: 'active',
      },
    },
  ],
  chapterQuests: [],
  today: '2026-05-27',
});
assert(reviewBoard.entries.length === 1, 'review tab lists stale quests');

// Monthly season report
assert(getMonthlyReportTitle('dust-and-iron') === 'Frontier Season Report', 'monthly report title');
assert(getMonthlyReportTitle('neuronet') === 'Signal Cycle Report', 'neuronet monthly title');
assert(getMonthlyReportTitle('neon-ashes') === 'Monthly Case File', 'neon ashes monthly title');
assert(MONTHLY_IDENTITY_COPY.includes('evidence'), 'monthly identity copy');
const monthKey = getLocalMonthKey(new Date('2026-05-27T12:00:00'));
const monthlyProgress = {
  ...baseProgress(),
  activityByDate: {
    '2026-05-10': {
      questsCompleted: 2,
      xpEarned: 20,
      reputationEarned: 4,
      chaptersCompleted: 0,
      highRiskQuestsCompleted: 1,
    },
    '2026-05-15': {
      questsCompleted: 1,
      xpEarned: 10,
      reputationEarned: 2,
      chaptersCompleted: 1,
      highRiskQuestsCompleted: 0,
    },
  },
  evidenceLog: [
    {
      id: 'evidence-m1',
      date: '2026-05-10',
      timestamp: '2026-05-10T18:00:00.000Z',
      universeId: 'dust-and-iron',
      sagaId: 'vulture-gang',
      chapterId: 'vulture-gang-ch1',
      questTitle: 'Trail ride',
      category: 'work',
      identityTraitGained: 'Reliable',
      xpEarned: 10,
      reputationEarned: 2,
      source: 'userQuest',
    },
    {
      id: 'evidence-m2',
      date: '2026-05-10',
      timestamp: '2026-05-10T19:00:00.000Z',
      universeId: 'dust-and-iron',
      sagaId: 'vulture-gang',
      chapterId: 'vulture-gang-ch1',
      questTitle: 'Supply run',
      category: 'errand',
      identityTraitGained: 'Reliable',
      xpEarned: 10,
      reputationEarned: 2,
      source: 'userQuest',
    },
  ],
  desiredIdentityTraits: ['reliable'] as IdentityTraitKey[],
};
const monthlyReport = computeMonthlySeasonReport(
  monthlyProgress as PlayerProgress,
  'dust-and-iron',
  new Date('2026-05-27T12:00:00'),
  monthKey,
);
assert(monthlyReport.questsCompleted === 3, 'monthly quests completed');
assert(monthlyReport.identityVotesGained === 2, 'monthly identity votes');
assert(monthlyReport.strongestTrait?.trait.key === 'reliable', 'monthly strongest trait');
assert(monthlyReport.becomingSummary.length >= 2, 'monthly becoming summary');
assert(monthlyReport.activeDays === 2, 'monthly active days');
const closedMonthly = markMonthlyReviewSeen(monthlyProgress as PlayerProgress, monthKey);
assert(isMonthlyReviewClosed(closedMonthly, monthKey), 'monthly review closed');

// Next best action
const recoveryProgress = {
  ...baseProgress(),
  hasOnboarded: true,
  recoveryQuestOfferedForDate: getLocalDateKey(),
  recoveryQuestCompletedDates: [],
};
assert(shouldShowRecoveryPrompt(recoveryProgress), 'recovery prompt active');
const recoveryAction = getNextBestAction({
  progress: recoveryProgress,
  universeId: 'dust-and-iron',
  remainingChapterBounties: 0,
});
assert(recoveryAction.actionType === 'recovery-quest', 'next best action recovery');
assert(recoveryAction.ctaLabel === 'START RECOVERY QUEST', 'recovery cta');
const dismissedNba = dismissNextBestActionForToday(baseProgress());
assert(isNextBestActionDismissedToday(dismissedNba), 'next best action dismissed today');
const inboxAction = getNextBestAction({
  progress: {
    ...baseProgress(),
    hasOnboarded: true,
    dailyAwarenessDismissedDates: [getLocalDateKey()],
    questInbox: [
      {
        id: 'inbox-1',
        title: 'Call dentist',
        createdAt: new Date().toISOString(),
        status: 'inbox',
      },
    ],
  },
  universeId: 'dust-and-iron',
  remainingChapterBounties: 0,
});
assert(inboxAction.actionType === 'convert-inbox', 'next best action inbox');

// Minimum viable day
assert(shouldAutoActivateMvdFromAwareness('low-energy'), 'mvd auto from low energy');
assert(!shouldAutoActivateMvdFromAwareness('ready'), 'mvd not auto from ready');
const mvdProgress = activateMinimumViableDay(baseProgress(), 'briefing', getLocalDateKey());
assert(isMinimumViableDayActive(mvdProgress), 'mvd active after activation');
assert(getMinimumViableDayCopy('dust-and-iron').title.includes('ride'), 'mvd dust copy');
const securedMvd = markMinimumViableDaySecured(mvdProgress, getLocalDateKey());
assert(isMinimumViableDaySecuredToday(securedMvd), 'mvd secured today');
assert(countMinimumDaysSecuredThisMonth(securedMvd) === 1, 'mvd secured count this month');
const lowEnergyAwarenessProgress = {
  ...baseProgress(),
  hasOnboarded: true,
  dailyAwarenessByDate: {
    [getLocalDateKey()]: {
      date: getLocalDateKey(),
      selectedBlocker: 'low-energy' as const,
      createdAt: new Date().toISOString(),
    },
  },
  dailyAwarenessDismissedDates: [getLocalDateKey()],
};
const activateMvdAction = getNextBestAction({
  progress: lowEnergyAwarenessProgress,
  universeId: 'dust-and-iron',
  remainingChapterBounties: 0,
});
assert(activateMvdAction.actionType === 'activate-minimum-day', 'nba suggests mvd activation');
const activeMvdNoQuest = activateMinimumViableDay(
  {
    ...baseProgress(),
    hasOnboarded: true,
    dailyAwarenessDismissedDates: [getLocalDateKey()],
  },
  'briefing',
  getLocalDateKey(),
);
const doSmallAction = getNextBestAction({
  progress: activeMvdNoQuest,
  universeId: 'dust-and-iron',
  remainingChapterBounties: 0,
});
assert(doSmallAction.actionType === 'do-one-small-quest', 'nba do one small quest');
assert(doSmallAction.ctaLabel === 'DO ONE SMALL QUEST', 'mvd cta label');
assert(!hasCompletedQuestToday(activeMvdNoQuest), 'no quest completed today baseline');
assert(pickSuggestedSmallQuest(activeMvdNoQuest, 'dust-and-iron') === null, 'no small quest when empty');

// Quest load meter
const loadToday = getLocalDateKey();
const loadDustSaga = UNIVERSES.find((u) => u.id === 'dust-and-iron')!.sagas.find((s) => s.chapters.length > 0)!;
const loadDustChapter = loadDustSaga.chapters[0]!;
const loadBaseProgress = {
  ...baseProgress(),
  selectedUniverseId: 'dust-and-iron',
  selectedSagaId: loadDustSaga.id,
  currentChapterId: loadDustChapter.id,
};
function makeTodayQuests(count: number): UserQuest[] {
  return Array.from({ length: count }, (_, index) => ({
    ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron'),
    id: createUserQuestId(),
    createdOnDate: loadToday,
    originalTitle: `Load quest ${index + 1}`,
  }));
}
const emptyLoad = getQuestLoadStatus({
  progress: loadBaseProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(emptyLoad.loadLevel === 'light', 'quest load empty is light');
assert(emptyLoad.suggestedAction.type === 'add-one-quest', 'quest load light action');
assert(emptyLoad.universeFlavor.includes('trail'), 'quest load dust flavor');
const balancedLoad = getQuestLoadStatus({
  progress: { ...loadBaseProgress, userQuests: makeTodayQuests(4) },
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(balancedLoad.loadLevel === 'balanced', 'quest load four today balanced');
assert(balancedLoad.suggestedAction.label === 'START FOCUS', 'quest load balanced focus cta');
const heavyLoad = getQuestLoadStatus({
  progress: { ...loadBaseProgress, userQuests: makeTodayQuests(6) },
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(heavyLoad.loadLevel === 'heavy', 'quest load six today heavy');
assert(heavyLoad.suggestedAction.type === 'review-quest-load', 'quest load heavy review');
const staleQuestForLoad = {
  ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron'),
  id: createUserQuestId(),
  createdOnDate: '2020-01-01',
  originalTitle: 'Stale quest',
};
const overloadedLoad = getQuestLoadStatus({
  progress: {
    ...loadBaseProgress,
    userQuests: [...makeTodayQuests(7), staleQuestForLoad, staleQuestForLoad],
  },
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(overloadedLoad.loadLevel === 'overloaded', 'quest load overloaded board');
assert(overloadedLoad.score >= 0 && overloadedLoad.score <= 100, 'quest load score bounded');

// Routine maintenance
const routineTemplate = createRecurringQuestTemplate('Morning stretch', 'health', {
  recurrenceType: 'daily',
  preferredTimeLabel: 'After waking',
});
const routineProgress = {
  ...loadBaseProgress,
  recurringQuestTemplates: [routineTemplate],
  desiredIdentityTraits: ['selfRespecting'] as IdentityTraitKey[],
};
const routineSummary = computeRoutineMaintenanceSummary({
  progress: routineProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(routineSummary.activeRoutineCount === 1, 'routine maintenance active count');
assert(routineSummary.entries[0]?.status === 'healthy', 'new routine healthy');
assert(routineSummary.universeFlavor.includes('trail'), 'routine maintenance flavor');
const starter = getSuggestedStarterForRoutine(routineTemplate);
assert(starter.length > 0, 'routine starter suggestion');
const withStarter = addStarterToRecurringQuestTemplate(routineProgress, routineTemplate.id, starter);
assert(withStarter.recurringQuestTemplates[0]?.starterTaskTitle === starter, 'routine starter applied');
const heavyRoutine = {
  ...routineTemplate,
  riskLevel: 'high' as const,
};
const heavyRoutineProgress = {
  ...loadBaseProgress,
  recurringQuestTemplates: [heavyRoutine],
  userQuests: [
    ...makeTodayQuests(0),
    {
      ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron', { riskLevel: 'high' }),
      id: createUserQuestId(),
      generatedFromRecurringQuestId: heavyRoutine.id,
      createdOnDate: loadToday,
      isCompleted: false,
    },
    {
      ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron', { riskLevel: 'high' }),
      id: createUserQuestId(),
      generatedFromRecurringQuestId: heavyRoutine.id,
      createdOnDate: subtractDaysForAudit(loadToday, 3),
      isCompleted: false,
    },
  ],
};
function subtractDaysForAudit(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() - days);
  return getLocalDateKey(date);
}
const heavyRoutineSummary = computeRoutineMaintenanceSummary({
  progress: heavyRoutineProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(
  heavyRoutineSummary.entries[0]?.status === 'too-heavy' ||
    heavyRoutineSummary.entries[0]?.status === 'needs-adjustment',
  'high risk low completion flagged',
);
const lowered = lowerRecurringQuestTemplateDifficulty(heavyRoutineProgress, heavyRoutine.id);
assert(lowered.recurringQuestTemplates[0]?.riskLevel === 'standard', 'routine difficulty lowered');
const paused = pauseRecurringQuestTemplate(heavyRoutineProgress, heavyRoutine.id);
assert(paused.recurringQuestTemplates[0]?.isActive === false, 'routine paused');
assert(typeof paused.recurringQuestTemplates[0]?.pausedAt === 'string', 'routine pausedAt set');

// Tomorrow setup
const tomorrow = getTomorrowDateKey();
const withPrep = recordTomorrowSetup(loadBaseProgress, {
  kind: 'environment-step',
  prepStepTitle: 'Put notebook on desk',
});
assert(getTomorrowSetupForDate(withPrep, tomorrow)?.tomorrowPrepStepTitle === 'Put notebook on desk', 'tomorrow prep stored');
const withPlan = recordTomorrowSetup(loadBaseProgress, {
  kind: 'when-where-plan',
  implementationIntention: formatTomorrowImplementationIntention('stretch', '7:30 AM', 'kitchen'),
});
assert(
  getTomorrowSetupForDate(withPlan, tomorrow)?.tomorrowImplementationIntention?.includes('stretch') === true,
  'tomorrow plan stored',
);
const withCapture = recordTomorrowSetup(loadBaseProgress, {
  kind: 'captured-task',
  taskTitle: 'Email the clinic',
});
const capturedEntry = getTomorrowSetupForDate(withCapture, tomorrow);
assert(capturedEntry?.plannedTomorrowTaskTitle === 'Email the clinic', 'tomorrow captured task');
assert(
  withCapture.questInbox.some((item) => item.title === 'Email the clinic' && item.targetDate === tomorrow),
  'tomorrow inbox target date',
);

// Contextual coach tips
const highRiskQuest = {
  ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron', { riskLevel: 'high' }),
  id: createUserQuestId(),
  createdOnDate: loadToday,
  originalTitle: 'High risk no starter',
  starterTaskTitle: undefined,
};
const coachHighRiskProgress = {
  ...loadBaseProgress,
  userQuests: [highRiskQuest],
};
const highRiskTip = getContextualCoachTip({
  progress: coachHighRiskProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(highRiskTip?.id === 'high-risk-no-starter', 'coach tip high risk no starter');
assert(highRiskTip?.ctaLabel === 'Add Starter Move', 'coach tip starter cta');
assert(highRiskTip?.universeFlavorLabel === 'Trail Advice', 'coach tip dust flavor');
const dismissedCoach = dismissCoachTipForToday(coachHighRiskProgress, 'high-risk-no-starter', loadToday);
assert(
  isCoachTipDismissedToday(dismissedCoach, 'high-risk-no-starter', loadToday),
  'coach tip dismissed today',
);
assert(
  getContextualCoachTip({
    progress: dismissedCoach,
    universeId: 'dust-and-iron',
    today: loadToday,
  })?.id !== 'high-risk-no-starter',
  'dismissed coach tip hidden',
);
const lowEnergyCoachProgress = {
  ...loadBaseProgress,
  userQuests: [],
  dailyAwarenessByDate: {
    [loadToday]: {
      date: loadToday,
      selectedBlocker: 'low-energy' as const,
      createdAt: new Date().toISOString(),
    },
  },
};
const lowEnergyTip = getContextualCoachTip({
  progress: lowEnergyCoachProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(lowEnergyTip?.id === 'low-energy-minimum-day', 'coach tip low energy mvd');
const overloadedCoachProgress = {
  ...loadBaseProgress,
  userQuests: Array.from({ length: 9 }, (_, index) => ({
    ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron', {
      starterTaskTitle: 'Start small',
      prepStepTitle: 'Prep surface',
    }),
    id: createUserQuestId(),
    createdOnDate: loadToday,
    implementationIntention: 'When desk, then work',
    originalTitle: `Load quest ${index + 1}`,
  })),
};
const overloadedTip = getContextualCoachTip({
  progress: overloadedCoachProgress,
  universeId: 'dust-and-iron',
  today: loadToday,
});
assert(overloadedTip?.id === 'board-overloaded', 'coach tip overloaded board');
const neuronetUniverse = UNIVERSES.find((u) => u.id === 'neuronet')!;
const neuronetSaga = neuronetUniverse.sagas.find((s) => s.chapters.length > 0)!;
const neuronetChapter = neuronetSaga.chapters[0]!;
const neuronetProgress = {
  ...loadBaseProgress,
  selectedUniverseId: 'neuronet',
  selectedSagaId: neuronetSaga.id,
  currentChapterId: neuronetChapter.id,
};
const neuronetTip = getContextualCoachTip({
  progress: {
    ...neuronetProgress,
    userQuests: [
      {
        ...simulateAddUserQuest(neuronetProgress, 'neuronet', { riskLevel: 'high' }),
        id: createUserQuestId(),
        createdOnDate: loadToday,
      },
    ],
  },
  universeId: 'neuronet',
  today: loadToday,
});
assert(neuronetTip?.universeFlavorLabel === 'Signal Guidance', 'coach tip neuronet flavor');

// Feature discovery
const freshDiscovery = createDefaultFeatureDiscoveryState();
assert(freshDiscovery.guidedDiscoveryEnabled === true, 'feature discovery guided default');
assert(computeDiscoveryTier(loadBaseProgress) === 0, 'feature discovery tier zero baseline');
const afterQuestProgress = refreshFeatureDiscoveryState({
  ...loadBaseProgress,
  userQuests: [
    {
      ...simulateAddUserQuest(loadBaseProgress, 'dust-and-iron'),
      id: createUserQuestId(),
      createdOnDate: loadToday,
      isCompleted: true,
      completedAt: new Date().toISOString(),
    },
  ],
});
assert(computeDiscoveryTier(afterQuestProgress) >= 1, 'feature discovery tier after completion');
assert(isFeatureUnlocked(afterQuestProgress, 'focusMode'), 'focus unlocked after first completion');
const veteranProgress = setGuidedFeatureDiscoveryEnabled(
  {
    ...loadBaseProgress,
    userQuests: makeTodayQuests(4),
    activityByDate: {
      [loadToday]: { questsCompleted: 2, xpEarned: 20, reputationEarned: 4, chaptersCompleted: 0, highRiskQuestsCompleted: 0 },
      '2026-05-26': { questsCompleted: 1, xpEarned: 10, reputationEarned: 2, chaptersCompleted: 0, highRiskQuestsCompleted: 0 },
    },
  },
  false,
);
assert(veteranProgress.featureDiscoveryState.guidedDiscoveryEnabled === false, 'guided discovery off for veterans');

// Process achievements
assert(!isProcessAchievementUnlocked(loadBaseProgress, 'first-step-taken'), 'no achievements baseline');
const firstStepUnlocks = detectProcessAchievementUnlocks(loadBaseProgress, {
  type: 'quest-complete',
  universeId: 'dust-and-iron',
  today: loadToday,
  questId: 'user-test-1',
  boardQuest: {
    id: 'user-test-1',
    source: 'user',
    category: 'health',
    originalTitle: 'Test',
    narrativeTitle: 'Test',
    narrativeDescription: 'Test desc',
    xpReward: 10,
    reputationReward: 1,
    reactionCharacterId: 'char',
    completed: false,
  },
  userQuest: null,
});
assert(firstStepUnlocks.some((entry) => entry.achievementId === 'first-step-taken'), 'first step unlock');
const withFirstStep = unlockProcessAchievements(loadBaseProgress, firstStepUnlocks);
assert(isProcessAchievementUnlocked(withFirstStep, 'first-step-taken'), 'first step persisted');
assert(
  getProcessAchievementDefinition('trail-marked').getTitle('neuronet') === 'Signal Locked',
  'plan achievement neuronet title',
);

// Reward event queue
const questCelebrations = buildQuestCompleteCelebrationEvents(
  {
    questId: 'q1',
    source: 'user',
    narrativeTitle: 'Test Quest',
    earnedXp: 10,
    earnedReputation: 2,
    characterId: 'char-1',
    characterLine: 'Well done.',
    identityMilestoneUnlock: {
      headline: 'Reliable x3',
      universeFlavorLine: 'Trail mark.',
    },
    momentumMilestoneUnlock: {
      message: 'Momentum stored',
      label: 'Steady Pace',
    },
  },
  { batchId: 'batch-test', progressMessage: 'Quest cleared.' },
);
assert(questCelebrations[0]?.type === 'questCompletion', 'quest completion first');
assert(questCelebrations[1]?.type === 'characterReaction', 'character reaction second');
assert(
  questCelebrations.some((event) => event.title === '2 rewards earned' || event.type === 'identityMilestone'),
  'small rewards coalesced or present',
);

const queue = enqueueRewardEvents([], questCelebrations);
assert(getActiveRewardEvent(queue)?.type === 'questCompletion', 'active celebration is first queued');
const advanced = advanceRewardQueue(queue);
assert(getActiveRewardEvent(advanced)?.type === 'characterReaction', 'dismiss advances queue');

const duplicateQueue = enqueueRewardEvents(queue, [
  createRewardEvent({
    id: questCelebrations[0].id,
    type: 'questCompletion',
    title: 'Dup',
    message: 'Dup',
  }),
]);
assert(duplicateQueue.length === queue.length, 'duplicate event ids ignored');

if (failures.length) {
  console.error('FAILED:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log('Lite stability checks passed (including behavior systems).');
