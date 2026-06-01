import type { PlayerProgress } from '@/types/narrative';

function isDevEnvironment(): boolean {
  return typeof globalThis !== 'undefined' && (globalThis as { __DEV__?: boolean }).__DEV__ === true;
}

/** Bump when PlayerProgress shape changes and a migration step is required. */
export const CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION = 3;

/** Saves written before schemaVersion existed. */
export const LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION = 0;

export type PlayerProgressMigrationStep = {
  fromVersion: number;
  toVersion: number;
  id: string;
  migrate: (raw: Record<string, unknown>) => Record<string, unknown>;
};

export type PlayerProgressMigrationResult = {
  progress: Partial<PlayerProgress> & Record<string, unknown>;
  fromVersion: number;
  toVersion: number;
  appliedMigrations: string[];
};

const MIGRATION_STEPS: PlayerProgressMigrationStep[] = [
  {
    fromVersion: 0,
    toVersion: 1,
    id: 'v0-to-v1',
    migrate: migrateV0ToV1,
  },
  {
    fromVersion: 1,
    toVersion: 2,
    id: 'v1-to-v2',
    migrate: migrateV1ToV2,
  },
  {
    fromVersion: 2,
    toVersion: 3,
    id: 'v2-to-v3',
    migrate: migrateV2ToV3,
  },
];

export function readPlayerProgressSchemaVersion(raw: unknown): number {
  if (!raw || typeof raw !== 'object') return LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION;

  const version = (raw as Record<string, unknown>).schemaVersion;
  if (typeof version !== 'number' || !Number.isFinite(version) || version < 0) {
    return LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION;
  }

  return Math.floor(version);
}

function logMigration(result: PlayerProgressMigrationResult): void {
  if (!isDevEnvironment()) return;
  if (result.appliedMigrations.length === 0 && result.fromVersion === result.toVersion) return;

  console.log('[PlayerProgress] migration applied', {
    oldSchemaVersion: result.fromVersion,
    newSchemaVersion: result.toVersion,
    steps: result.appliedMigrations,
  });
}

/**
 * Ordered schema migrations for raw persisted progress.
 * Never throws — returns a safe partial record for normalize/sanitize.
 */
export function migratePlayerProgress(raw: unknown): PlayerProgressMigrationResult {
  if (!raw || typeof raw !== 'object') {
    const empty: Partial<PlayerProgress> & Record<string, unknown> = {
      schemaVersion: CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
    };
    const result: PlayerProgressMigrationResult = {
      progress: empty,
      fromVersion: LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION,
      toVersion: CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
      appliedMigrations: ['empty-input'],
    };
    logMigration(result);
    return result;
  }

  let current: Record<string, unknown> = { ...(raw as Record<string, unknown>) };
  const fromVersion = readPlayerProgressSchemaVersion(current);
  const appliedMigrations: string[] = [];
  let version = fromVersion;

  if (version > CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION) {
    if (isDevEnvironment()) {
      console.warn('[PlayerProgress] save schema newer than app', {
        saveSchemaVersion: version,
        appSchemaVersion: CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
      });
    }
    current.schemaVersion = version;
    return {
      progress: current as Partial<PlayerProgress> & Record<string, unknown>,
      fromVersion,
      toVersion: version,
      appliedMigrations,
    };
  }

  for (const step of MIGRATION_STEPS) {
    if (version >= step.toVersion) continue;
    if (version !== step.fromVersion) continue;

    try {
      current = step.migrate(current);
      appliedMigrations.push(step.id);
      version = step.toVersion;
      current.schemaVersion = step.toVersion;
    } catch (error) {
      if (isDevEnvironment()) {
        console.warn('[PlayerProgress] migration step failed — continuing with defaults', {
          step: step.id,
          error,
        });
      }
      version = step.toVersion;
      current.schemaVersion = step.toVersion;
    }
  }

  current.schemaVersion = CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION;

  const result: PlayerProgressMigrationResult = {
    progress: current as Partial<PlayerProgress> & Record<string, unknown>,
    fromVersion,
    toVersion: CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
    appliedMigrations,
  };
  logMigration(result);
  return result;
}

/** Legacy saves without schemaVersion → v1 with explicit defaults for newer fields. */
export function migrateV0ToV1(raw: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...raw };

  if (next.identityVotes === undefined && next.identityVotesByCategory !== undefined) {
    next.identityVotes = next.identityVotesByCategory;
  }

  if (next.desiredIdentityTraits === undefined) next.desiredIdentityTraits = [];
  if (next.evidenceLog === undefined) next.evidenceLog = [];
  if (next.processAchievements === undefined) next.processAchievements = [];
  if (next.momentumReserve === undefined) next.momentumReserve = 0;
  if (next.momentumMilestonesReached === undefined) next.momentumMilestonesReached = [];
  if (next.dailyAwarenessByDate === undefined) next.dailyAwarenessByDate = {};
  if (next.dailyAwarenessDismissedDates === undefined) next.dailyAwarenessDismissedDates = [];
  if (next.dailyShutdownByDate === undefined) next.dailyShutdownByDate = {};
  if (next.dailyShutdownDismissedDates === undefined) next.dailyShutdownDismissedDates = [];
  if (next.weeklyReviewByWeek === undefined) next.weeklyReviewByWeek = {};
  if (next.monthlyReviewSeenByMonth === undefined) next.monthlyReviewSeenByMonth = {};
  if (next.questDefaults === undefined) next.questDefaults = {};
  if (next.questInbox === undefined) next.questInbox = [];
  if (next.recurringQuestTemplates === undefined) next.recurringQuestTemplates = [];
  if (next.tomorrowSetupByDate === undefined) next.tomorrowSetupByDate = {};
  if (next.minimumViableDayByDate === undefined) next.minimumViableDayByDate = {};
  if (next.dismissedNextBestActionByDate === undefined) next.dismissedNextBestActionByDate = {};
  if (next.dismissedCoachTipsByDate === undefined) next.dismissedCoachTipsByDate = {};
  if (next.featureDiscoveryState === undefined) next.featureDiscoveryState = undefined;
  if (next.routineRepetitionByKey === undefined) next.routineRepetitionByKey = {};
  if (next.questStyleProfile === undefined) next.questStyleProfile = {};
  if (next.reminderPreferences === undefined) next.reminderPreferences = undefined;
  if (next.templateQuestStartedAt === undefined) next.templateQuestStartedAt = {};
  if (next.focusLockedDate === undefined) next.focusLockedDate = null;
  if (next.lockedFocusQuestIds === undefined) next.lockedFocusQuestIds = [];
  if (next.lastMissedDate === undefined) next.lastMissedDate = null;
  if (next.recoveryQuestOfferedForDate === undefined) next.recoveryQuestOfferedForDate = null;
  if (next.recoveryQuestCompletedDates === undefined) next.recoveryQuestCompletedDates = [];

  next.schemaVersion = 1;
  return next;
}

/** v1 → v2: quest suite personalization fields. */
export function migrateV1ToV2(raw: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...raw };

  if (next.suiteStatsById === undefined) next.suiteStatsById = {};

  next.schemaVersion = 2;
  return next;
}

/** v2 → v3: app-level coach mascot preference. */
export function migrateV2ToV3(raw: Record<string, unknown>): Record<string, unknown> {
  const next: Record<string, unknown> = { ...raw };

  if (next.mascotPreference === undefined) next.mascotPreference = 'both';

  next.schemaVersion = 3;
  return next;
}

/** Minimal pre-v1 save fixture for dev migration smoke tests. */
export function createLegacyMinimalSaveFixture(): Record<string, unknown> {
  return {
    hasOnboarded: true,
    selectedUniverseId: 'dust-and-iron',
    selectedSagaId: 'vulture-gang',
    currentChapterId: 'vulture-gang-ch1',
    totalXp: 42,
    level: 2,
    reputation: 5,
    unlockedRewards: ['golden-route-title'],
    userQuests: [],
    villainInfluenceBySaga: { 'vulture-gang': 80 },
    chapterCompletions: { 'vulture-gang-ch1': 2 },
    relationshipByCharacter: {},
    characterAffinity: {},
    seenChapterIntros: ['vulture-gang-ch1'],
    activeChapterBySagaId: { 'vulture-gang': 'vulture-gang-ch1' },
    completedChapterIdsBySagaId: { 'vulture-gang': [] },
    completedQuestIdsBySagaId: { 'vulture-gang': ['template-1'] },
    dismissedTauntBySagaId: { 'vulture-gang': null },
    lastActiveDate: '2026-01-01',
    dailyStreak: 3,
    dailyFocusLimit: 3,
    activityByDate: {
      '2026-01-01': {
        questsCompleted: 1,
        xpEarned: 10,
        reputationEarned: 2,
        chaptersCompleted: 0,
        highRiskQuestsCompleted: 0,
      },
    },
    lastSagaByUniverseId: { 'dust-and-iron': 'vulture-gang' },
  };
}

export type SaveMigrationTestResult = {
  ok: boolean;
  message: string;
  fromVersion: number;
  toVersion: number;
};

export function testSaveMigration(
  restore: (raw: unknown) => PlayerProgress,
): SaveMigrationTestResult {
  try {
    const legacy = createLegacyMinimalSaveFixture();
    const fromVersion = readPlayerProgressSchemaVersion(legacy);
    const migrated = migratePlayerProgress(legacy);
    const restored = restore(migrated.progress);

    const checks = [
      restored.schemaVersion === CURRENT_PLAYER_PROGRESS_SCHEMA_VERSION,
      restored.totalXp === 42,
      restored.reputation === 5,
      restored.dailyStreak === 3,
      Array.isArray(restored.userQuests),
      Array.isArray(restored.processAchievements),
      Array.isArray(restored.evidenceLog),
      restored.identityVotes != null,
      restored.questDefaults != null,
      restored.featureDiscoveryState != null,
    ];

    if (checks.every(Boolean)) {
      return {
        ok: true,
        message: `Migration OK · v${fromVersion} → v${restored.schemaVersion}`,
        fromVersion,
        toVersion: restored.schemaVersion,
      };
    }

    return {
      ok: false,
      message: 'Migration ran but restored save failed validation checks.',
      fromVersion,
      toVersion: restored.schemaVersion,
    };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Migration test failed.',
      fromVersion: LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION,
      toVersion: LEGACY_PLAYER_PROGRESS_SCHEMA_VERSION,
    };
  }
}
