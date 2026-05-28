/** Minimal audit using only RN-free modules. Run: npx tsx scripts/stability-audit-lite.ts */
import { UNIVERSES } from '../src/data/narrative/universes';
import { NEON_ASHES_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neon-ashes-universe';
import { NEURONET_UNIVERSE_UNLOCK_ID } from '../src/data/narrative/neuronet-universe';
import { convertTaskToUserQuest } from '../src/lib/convert-task-to-quest';
import {
  applyDevSwitchToDustAndIron,
  applyDevSwitchToNeonAshes,
  applyDevSwitchToNeuroNet,
} from '../src/lib/dev-universe-switch';
import { resolveNarrativeState } from '../src/lib/narrative-state';
import type { PlayerProgress, TaskCategory } from '../src/types/narrative';

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

if (failures.length) {
  console.error('FAILED:\n' + failures.map((f) => ` - ${f}`).join('\n'));
  process.exit(1);
}
console.log('Lite stability checks passed.');
