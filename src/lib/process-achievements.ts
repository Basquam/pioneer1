import { getLocalDateKey } from '@/lib/daily-streak';
import { isTodayFocusLocked, isQuestInLockedFocus } from '@/lib/focus-lock';
import { hasCategoryQuestDefaults, getCategoryQuestDefaults } from '@/lib/quest-defaults';
import { hasStarterMove } from '@/lib/quest-readiness';
import { isQuestNeedsReview } from '@/lib/quest-lifecycle';
import { TASK_CATEGORIES } from '@/lib/task-categories';
import { shouldMarkMinimumViableDaySecuredOnQuestComplete } from '@/lib/minimum-viable-day';
import { shouldMarkRecoveryOnQuestComplete } from '@/lib/recovery-quest';
import type {
  BoardQuest,
  PlayerProgress,
  ProcessAchievementEntry,
  ProcessAchievementId,
  QuestDefaultsSettings,
  UserQuest,
} from '@/types/narrative';

export type { ProcessAchievementId, ProcessAchievementEntry } from '@/types/narrative';

export type ProcessAchievementDefinition = {
  id: ProcessAchievementId;
  meaning: string;
  getTitle: (universeId: string) => string;
};

export type ProcessAchievementToast = {
  achievementId: ProcessAchievementId;
  title: string;
  meaning: string;
  universeFlavorLine: string;
};

export type ProcessAchievementUnlock = {
  achievementId: ProcessAchievementId;
  relatedUniverseId?: string;
  relatedQuestId?: string;
};

export type ProcessAchievementQuestCompleteEvent = {
  type: 'quest-complete';
  universeId: string;
  today: string;
  questId: string;
  boardQuest: BoardQuest;
  userQuest: UserQuest | null;
};

export type ProcessAchievementQuestCreatedEvent = {
  type: 'quest-created';
  universeId: string;
  quest: UserQuest;
};

export type ProcessAchievementLifecycleResolvedEvent = {
  type: 'quest-lifecycle-resolved';
  universeId: string;
  questId: string;
  wasNeedsReview: boolean;
};

export type ProcessAchievementChainSplitEvent = {
  type: 'quest-chain-split';
  universeId: string;
  parentQuest: UserQuest;
};

export type ProcessAchievementDefaultsConfiguredEvent = {
  type: 'quest-defaults-configured';
  universeId: string;
};

export type ProcessAchievementWeeklyReviewEvent = {
  type: 'weekly-review-completed';
  universeId: string;
};

export type ProcessAchievementEvent =
  | ProcessAchievementQuestCompleteEvent
  | ProcessAchievementQuestCreatedEvent
  | ProcessAchievementLifecycleResolvedEvent
  | ProcessAchievementChainSplitEvent
  | ProcessAchievementDefaultsConfiguredEvent
  | ProcessAchievementWeeklyReviewEvent;

const UNIVERSE_FLAVOR_LINE: Record<string, string> = {
  'dust-and-iron': 'Another mark of the trail.',
  neuronet: 'Protocol mastered.',
  'neon-ashes': 'Case method recorded.',
};

const PLAN_ACHIEVEMENT_TITLES: Record<string, string> = {
  'dust-and-iron': 'Trail Marked',
  neuronet: 'Signal Locked',
  'neon-ashes': 'Lead Pinned',
};

const PROCESS_ACHIEVEMENT_DEFINITIONS: Record<ProcessAchievementId, ProcessAchievementDefinition> = {
  'first-step-taken': {
    id: 'first-step-taken',
    getTitle: () => 'First Step Taken',
    meaning: 'You completed your first quest.',
  },
  'small-move-counts': {
    id: 'small-move-counts',
    getTitle: () => 'Small Move Counts',
    meaning: 'You finished a quest that began with a tiny starter move.',
  },
  'trail-marked': {
    id: 'trail-marked',
    getTitle: (universeId) => PLAN_ACHIEVEMENT_TITLES[universeId] ?? PLAN_ACHIEVEMENT_TITLES['dust-and-iron'],
    meaning: 'You pinned a quest to a when/where plan.',
  },
  'prepared-before-starting': {
    id: 'prepared-before-starting',
    getTitle: () => 'Prepared Before Starting',
    meaning: 'You used a prep step and followed through.',
  },
  'focus-entered': {
    id: 'focus-entered',
    getTitle: () => 'Focus Entered',
    meaning: 'You completed a quest from Focus Mode.',
  },
  'minimum-day-secured': {
    id: 'minimum-day-secured',
    getTitle: () => 'Minimum Day Secured',
    meaning: 'You kept momentum on a minimum viable day.',
  },
  'back-on-track': {
    id: 'back-on-track',
    getTitle: () => 'Back on Track',
    meaning: 'You returned after a missed day with a recovery quest.',
  },
  'clutter-cleared': {
    id: 'clutter-cleared',
    getTitle: () => 'Clutter Cleared',
    meaning: 'You made a clear decision on a stale quest.',
  },
  'big-quest-broken': {
    id: 'big-quest-broken',
    getTitle: () => 'Big Quest Broken',
    meaning: 'You split a heavy quest into smaller linked steps.',
  },
  'promise-kept': {
    id: 'promise-kept',
    getTitle: () => 'Promise Kept',
    meaning: 'You completed every locked focus quest for the day.',
  },
  'system-builder': {
    id: 'system-builder',
    getTitle: () => 'System Builder',
    meaning: 'You configured quest defaults to support future you.',
  },
  'reflection-logged': {
    id: 'reflection-logged',
    getTitle: () => 'Reflection Logged',
    meaning: 'You completed a weekly review.',
  },
};

export const PROCESS_ACHIEVEMENT_IDS = Object.keys(
  PROCESS_ACHIEVEMENT_DEFINITIONS,
) as ProcessAchievementId[];

export function getProcessAchievementDefinition(
  achievementId: ProcessAchievementId,
): ProcessAchievementDefinition {
  return PROCESS_ACHIEVEMENT_DEFINITIONS[achievementId];
}

export function getProcessAchievementUniverseFlavor(universeId: string): string {
  return UNIVERSE_FLAVOR_LINE[universeId] ?? UNIVERSE_FLAVOR_LINE['dust-and-iron'];
}

export function sanitizeProcessAchievements(raw: unknown): ProcessAchievementEntry[] {
  if (!Array.isArray(raw)) return [];

  const seen = new Set<ProcessAchievementId>();
  const result: ProcessAchievementEntry[] = [];

  for (const entry of raw) {
    if (!entry || typeof entry !== 'object') continue;
    const record = entry as Record<string, unknown>;
    const achievementId = record.achievementId;
    const unlockedAt = record.unlockedAt;

    if (typeof achievementId !== 'string' || !(achievementId in PROCESS_ACHIEVEMENT_DEFINITIONS)) {
      continue;
    }
    if (typeof unlockedAt !== 'string' || unlockedAt.length === 0) continue;

    const id = achievementId as ProcessAchievementId;
    if (seen.has(id)) continue;
    seen.add(id);

    result.push({
      achievementId: id,
      unlockedAt,
      ...(typeof record.relatedUniverseId === 'string' && record.relatedUniverseId.length > 0
        ? { relatedUniverseId: record.relatedUniverseId }
        : {}),
      ...(typeof record.relatedQuestId === 'string' && record.relatedQuestId.length > 0
        ? { relatedQuestId: record.relatedQuestId }
        : {}),
    });
  }

  return result;
}

export function isProcessAchievementUnlocked(
  progress: Pick<PlayerProgress, 'processAchievements'>,
  achievementId: ProcessAchievementId,
): boolean {
  return (progress.processAchievements ?? []).some((entry) => entry.achievementId === achievementId);
}

export function getUnlockedProcessAchievementIds(
  progress: Pick<PlayerProgress, 'processAchievements'>,
): ProcessAchievementId[] {
  return (progress.processAchievements ?? []).map((entry) => entry.achievementId);
}

export function hasQuestDefaultsConfigured(settings: QuestDefaultsSettings | undefined): boolean {
  return TASK_CATEGORIES.some((category) =>
    hasCategoryQuestDefaults(getCategoryQuestDefaults(settings, category)),
  );
}

function countTotalCompletedQuests(progress: PlayerProgress): number {
  const userCompleted = progress.userQuests.filter((quest) => quest.isCompleted).length;
  const templateCompleted = Object.values(progress.completedQuestIdsBySagaId ?? {}).reduce(
    (total, ids) => total + ids.length,
    0,
  );
  return userCompleted + templateCompleted;
}

function allLockedFocusQuestsComplete(
  progress: PlayerProgress,
  completingQuestId: string,
  today: string,
): boolean {
  if (!isTodayFocusLocked(progress, today)) return false;
  if (progress.lockedFocusQuestIds.length === 0) return false;

  return progress.lockedFocusQuestIds.every((questId) => {
    if (questId === completingQuestId) return true;
    const quest = progress.userQuests.find((entry) => entry.id === questId);
    return quest?.isCompleted === true;
  });
}

export function detectProcessAchievementUnlocks(
  progress: PlayerProgress,
  event: ProcessAchievementEvent,
): ProcessAchievementUnlock[] {
  const unlocks: ProcessAchievementUnlock[] = [];

  const pushUnlock = (achievementId: ProcessAchievementId, relatedQuestId?: string) => {
    if (isProcessAchievementUnlocked(progress, achievementId)) return;
    if (unlocks.some((entry) => entry.achievementId === achievementId)) return;
    unlocks.push({
      achievementId,
      relatedUniverseId: 'universeId' in event ? event.universeId : undefined,
      ...(relatedQuestId ? { relatedQuestId } : {}),
    });
  };

  switch (event.type) {
    case 'quest-complete': {
      const { boardQuest, userQuest, questId, universeId, today } = event;
      const completedBefore = countTotalCompletedQuests(progress);

      if (completedBefore === 0) {
        pushUnlock('first-step-taken', questId);
      }

      if (userQuest && hasStarterMove(userQuest)) {
        pushUnlock('small-move-counts', questId);
      }

      if (userQuest?.prepStepTitle?.trim()) {
        pushUnlock('prepared-before-starting', questId);
      }

      if (
        userQuest?.focusStartedAt ||
        (userQuest && isQuestInLockedFocus(userQuest.id, progress, today))
      ) {
        pushUnlock('focus-entered', questId);
      }

      if (shouldMarkMinimumViableDaySecuredOnQuestComplete(progress, today)) {
        pushUnlock('minimum-day-secured', questId);
      }

      if (shouldMarkRecoveryOnQuestComplete(progress, today)) {
        pushUnlock('back-on-track', questId);
      }

      if (allLockedFocusQuestsComplete(progress, questId, today)) {
        pushUnlock('promise-kept', questId);
      }
      break;
    }
    case 'quest-created': {
      if (event.quest.implementationIntention?.trim()) {
        pushUnlock('trail-marked', event.quest.id);
      }
      break;
    }
    case 'quest-lifecycle-resolved': {
      if (event.wasNeedsReview) {
        pushUnlock('clutter-cleared', event.questId);
      }
      break;
    }
    case 'quest-chain-split': {
      pushUnlock('big-quest-broken', event.parentQuest.id);
      break;
    }
    case 'quest-defaults-configured': {
      pushUnlock('system-builder');
      break;
    }
    case 'weekly-review-completed': {
      pushUnlock('reflection-logged');
      break;
    }
    default:
      break;
  }

  return unlocks.map((unlock) => ({
    ...unlock,
    relatedUniverseId: unlock.relatedUniverseId ?? ('universeId' in event ? event.universeId : undefined),
  }));
}

export function unlockProcessAchievements(
  progress: PlayerProgress,
  unlocks: ProcessAchievementUnlock[],
  unlockedAt: string = new Date().toISOString(),
): PlayerProgress {
  if (unlocks.length === 0) return progress;

  const existing = progress.processAchievements ?? [];
  const seen = new Set(existing.map((entry) => entry.achievementId));
  const additions: ProcessAchievementEntry[] = [];

  for (const unlock of unlocks) {
    if (seen.has(unlock.achievementId)) continue;
    seen.add(unlock.achievementId);
    additions.push({
      achievementId: unlock.achievementId,
      unlockedAt,
      ...(unlock.relatedUniverseId ? { relatedUniverseId: unlock.relatedUniverseId } : {}),
      ...(unlock.relatedQuestId ? { relatedQuestId: unlock.relatedQuestId } : {}),
    });
  }

  if (additions.length === 0) return progress;

  return {
    ...progress,
    processAchievements: [...existing, ...additions],
  };
}

export function buildProcessAchievementToast(
  unlock: ProcessAchievementUnlock,
  universeId: string,
): ProcessAchievementToast {
  const definition = getProcessAchievementDefinition(unlock.achievementId);
  return {
    achievementId: unlock.achievementId,
    title: definition.getTitle(universeId),
    meaning: definition.meaning,
    universeFlavorLine: getProcessAchievementUniverseFlavor(universeId),
  };
}

export function buildProcessAchievementSummaryToast(
  unlocks: ProcessAchievementUnlock[],
  universeId: string,
): ProcessAchievementToast {
  const count = unlocks.length;
  return {
    achievementId: unlocks[0]?.achievementId ?? 'first-step-taken',
    title: `${count} process achievements unlocked`,
    meaning: unlocks
      .map((unlock) => getProcessAchievementDefinition(unlock.achievementId).getTitle(universeId))
      .join(' · '),
    universeFlavorLine: getProcessAchievementUniverseFlavor(universeId),
  };
}

export function toProcessAchievementToasts(
  unlocks: ProcessAchievementUnlock[],
  universeId: string,
): ProcessAchievementToast[] {
  if (unlocks.length === 0) return [];
  if (unlocks.length === 1) {
    return [buildProcessAchievementToast(unlocks[0], universeId)];
  }
  return [buildProcessAchievementSummaryToast(unlocks, universeId)];
}

export function applyProcessAchievementEvent(
  progress: PlayerProgress,
  event: ProcessAchievementEvent,
): { progress: PlayerProgress; unlocks: ProcessAchievementUnlock[] } {
  const unlocks = detectProcessAchievementUnlocks(progress, event);
  return {
    progress: unlockProcessAchievements(progress, unlocks),
    unlocks,
  };
}

export function wasQuestNeedsReviewBeforeLifecycleAction(
  quest: UserQuest,
  today: string = getLocalDateKey(),
): boolean {
  return isQuestNeedsReview(quest, today);
}
