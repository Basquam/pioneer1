/** Minimal audit using only RN-free modules. Run: npx tsx scripts/stability-audit-lite.ts */
import { UNIVERSES } from '../src/data/narrative/universes';
import { NEON_ASHES_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neon-ashes-universe';
import { NEURONET_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neuronet-universe';
import { convertTaskToUserQuest, createUserQuestId } from '../src/lib/convert-task-to-quest';
import {
  applyDevSwitchToDustAndIron,
  applyDevSwitchToNeonAshes,
  applyDevSwitchToNeuroNet,
} from '../src/lib/dev-universe-switch';
import { resolveNarrativeState } from '../src/lib/narrative-state';
import { createEmptyIdentityVotes } from '../src/lib/identity-votes';
import {
  appendEvidenceEvent,
  createEvidenceEvent,
  groupEvidenceByDate,
  sanitizeEvidenceLog,
} from '../src/lib/evidence-log';
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
import type { PlayerProgress, QuestRiskLevel, TaskCategory, UserQuest } from '../src/types/narrative';

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

if (failures.length) {
  console.error('FAILED:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log('Lite stability checks passed (including behavior systems).');
