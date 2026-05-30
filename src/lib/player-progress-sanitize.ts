import { getLocalDateKey } from '@/lib/daily-streak';
import {
  sanitizePlanningTimestamp,
  sanitizePlanningTimestampList,
} from '@/lib/motion-vs-action';
import { sanitizeQuestDistractionType } from '@/lib/distraction-shield';
import { pruneEvidenceLog } from '@/lib/evidence-log';
import {
  sanitizeMomentumMilestonesReached,
  sanitizeMomentumReserve,
} from '@/lib/momentum-reserve';
import { sanitizeRoutineRepetitionByKey } from '@/lib/routine-boredom-guard';
import { sanitizeQuestDefaultsSettings } from '@/lib/quest-defaults';
import { sanitizeQuestInbox } from '@/lib/quest-inbox';
import { sanitizeChildQuestIds } from '@/lib/quest-chain';
import { sanitizeDesiredIdentityTraits } from '@/lib/identity-compass';
import { pruneWeeklyReviewByWeek } from '@/lib/weekly-review';
import type { DailyActivity, PlayerProgress, QuestFrictionReason, TaskCategory, UserQuest } from '@/types/narrative';

export const MAX_STORED_USER_QUESTS = 300;
export const ACTIVITY_RETENTION_DAYS = 90;

const TASK_CATEGORIES = new Set<TaskCategory>([
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
]);

const EMPTY_ACTIVITY: DailyActivity = {
  questsCompleted: 0,
  xpEarned: 0,
  reputationEarned: 0,
  chaptersCompleted: 0,
  highRiskQuestsCompleted: 0,
};

function isTaskCategory(value: unknown): value is TaskCategory {
  return typeof value === 'string' && TASK_CATEGORIES.has(value as TaskCategory);
}

/** Keep only persisted UserQuest fields; variation history is a small id string only. */
export function sanitizeUserQuest(raw: unknown): UserQuest | null {
  if (!raw || typeof raw !== 'object') return null;

  const quest = raw as Record<string, unknown>;
  if (typeof quest.id !== 'string' || !quest.id.startsWith('user-')) return null;
  if (typeof quest.originalTitle !== 'string') return null;
  if (!isTaskCategory(quest.category)) return null;
  if (typeof quest.narrativeTitle !== 'string') return null;
  if (typeof quest.narrativeDescription !== 'string') return null;
  if (typeof quest.sourceUniverseId !== 'string') return null;
  if (typeof quest.sourceSagaId !== 'string') return null;
  if (typeof quest.sourceChapterId !== 'string') return null;
  if (typeof quest.isCompleted !== 'boolean') return null;
  if (typeof quest.xpReward !== 'number') return null;
  if (typeof quest.reputationReward !== 'number') return null;
  if (typeof quest.reactionCharacterId !== 'string') return null;

  const sanitized: UserQuest = {
    id: quest.id,
    originalTitle: quest.originalTitle,
    category: quest.category,
    narrativeTitle: quest.narrativeTitle,
    narrativeDescription: quest.narrativeDescription,
    sourceUniverseId: quest.sourceUniverseId,
    sourceSagaId: quest.sourceSagaId,
    sourceChapterId: quest.sourceChapterId,
    isCompleted: quest.isCompleted,
    xpReward: quest.xpReward,
    reputationReward: quest.reputationReward,
    reactionCharacterId: quest.reactionCharacterId,
  };

  if (typeof quest.usedVariationId === 'string' && quest.usedVariationId.length > 0) {
    sanitized.usedVariationId = quest.usedVariationId;
  }

  if (typeof quest.createdOnDate === 'string' && quest.createdOnDate.length > 0) {
    sanitized.createdOnDate = quest.createdOnDate;
  }

  if (typeof quest.starterTaskTitle === 'string' && quest.starterTaskTitle.length > 0) {
    sanitized.starterTaskTitle = quest.starterTaskTitle;
  }

  if (typeof quest.prepStepTitle === 'string' && quest.prepStepTitle.length > 0) {
    sanitized.prepStepTitle = quest.prepStepTitle;
  }

  if (typeof quest.implementationIntention === 'string' && quest.implementationIntention.length > 0) {
    sanitized.implementationIntention = quest.implementationIntention;
  }

  if (quest.focusPinned === true) {
    sanitized.focusPinned = true;
  }

  if (typeof quest.plannedTimeLabel === 'string' && quest.plannedTimeLabel.length > 0) {
    sanitized.plannedTimeLabel = quest.plannedTimeLabel;
  }

  if (typeof quest.plannedLocation === 'string' && quest.plannedLocation.length > 0) {
    sanitized.plannedLocation = quest.plannedLocation;
  }

  if (typeof quest.afterCurrentHabit === 'string' && quest.afterCurrentHabit.length > 0) {
    sanitized.afterCurrentHabit = quest.afterCurrentHabit;
  }

  if (typeof quest.archivedAt === 'string' && quest.archivedAt.length > 0) {
    sanitized.archivedAt = quest.archivedAt;
  }

  if (typeof quest.startedAt === 'string' && quest.startedAt.length > 0) {
    sanitized.startedAt = quest.startedAt;
  }

  if (typeof quest.afterQuestReward === 'string' && quest.afterQuestReward.length > 0) {
    sanitized.afterQuestReward = quest.afterQuestReward;
  }

  if (typeof quest.preQuestRitual === 'string' && quest.preQuestRitual.length > 0) {
    sanitized.preQuestRitual = quest.preQuestRitual.slice(0, 200);
  }

  const riskLevel = typeof quest.riskLevel === 'string' ? quest.riskLevel : null;
  if (riskLevel === 'low' || riskLevel === 'standard' || riskLevel === 'high') {
    sanitized.riskLevel = riskLevel;
  }

  const lastFocusDistraction = sanitizeQuestDistractionType(quest.lastFocusDistraction);
  if (lastFocusDistraction) {
    sanitized.lastFocusDistraction = lastFocusDistraction;
  }

  if (typeof quest.frictionShieldAppliedAt === 'string' && quest.frictionShieldAppliedAt.length > 0) {
    sanitized.frictionShieldAppliedAt = quest.frictionShieldAppliedAt;
  }

  const improvedAt = sanitizePlanningTimestampList(quest.improvedAt);
  if (improvedAt.length > 0) sanitized.improvedAt = improvedAt;

  const readinessUpdatedAt = sanitizePlanningTimestampList(quest.readinessUpdatedAt);
  if (readinessUpdatedAt.length > 0) sanitized.readinessUpdatedAt = readinessUpdatedAt;

  const frictionReviewedAt = sanitizePlanningTimestampList(quest.frictionReviewedAt);
  if (frictionReviewedAt.length > 0) sanitized.frictionReviewedAt = frictionReviewedAt;

  const focusStartedAt = sanitizePlanningTimestamp(quest.focusStartedAt);
  if (focusStartedAt) sanitized.focusStartedAt = focusStartedAt;

  const completedAt = sanitizePlanningTimestamp(quest.completedAt);
  if (completedAt) sanitized.completedAt = completedAt;

  if (
    typeof quest.generatedFromRecurringQuestId === 'string' &&
    quest.generatedFromRecurringQuestId.startsWith('recurring-')
  ) {
    sanitized.generatedFromRecurringQuestId = quest.generatedFromRecurringQuestId;
  }

  if (quest.routineVariationTone === 'calm' || quest.routineVariationTone === 'normal' || quest.routineVariationTone === 'urgent') {
    sanitized.routineVariationTone = quest.routineVariationTone;
  }

  if (typeof quest.routineFreshAngleLine === 'string' && quest.routineFreshAngleLine.length > 0) {
    sanitized.routineFreshAngleLine = quest.routineFreshAngleLine;
  }

  if (typeof quest.parentQuestId === 'string' && quest.parentQuestId.startsWith('user-')) {
    sanitized.parentQuestId = quest.parentQuestId;
  }

  const childQuestIds = sanitizeChildQuestIds(quest.childQuestIds);
  if (childQuestIds) {
    sanitized.childQuestIds = childQuestIds;
  }

  if (quest.isQuestChainParent === true) {
    sanitized.isQuestChainParent = true;
  }

  if (typeof quest.chainStepOrder === 'number' && quest.chainStepOrder >= 1 && quest.chainStepOrder <= 5) {
    sanitized.chainStepOrder = Math.floor(quest.chainStepOrder);
  }

  if (typeof quest.chainTitle === 'string' && quest.chainTitle.trim().length > 0) {
    sanitized.chainTitle = quest.chainTitle.trim();
  }

  if (Array.isArray(quest.frictionReviews)) {
    const reviews = quest.frictionReviews
      .map((entry) => sanitizeFrictionReview(entry))
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null)
      .slice(-10);
    if (reviews.length > 0) sanitized.frictionReviews = reviews;
  }

  return sanitized;
}

const FRICTION_REASONS = new Set([
  'too-big',
  'too-vague',
  'wrong-time',
  'forgot',
  'low-energy',
  'not-important',
]);

function sanitizeFrictionReview(raw: unknown) {
  if (!raw || typeof raw !== 'object') return null;
  const review = raw as Record<string, unknown>;
  if (typeof review.reason !== 'string' || !FRICTION_REASONS.has(review.reason)) return null;
  if (typeof review.reviewedAt !== 'string' || review.reviewedAt.length === 0) return null;

  return {
    reason: review.reason as QuestFrictionReason,
    reviewedAt: review.reviewedAt,
    ...(review.suggestedFixApplied === true ? { suggestedFixApplied: true } : {}),
  };
}

export function sanitizeUserQuestList(userQuests: unknown): UserQuest[] {
  if (!Array.isArray(userQuests)) return [];
  return userQuests
    .map((quest) => sanitizeUserQuest(quest))
    .filter((quest): quest is UserQuest => quest !== null);
}

/** Prefer keeping active quests; trim oldest completed entries when over the cap. */
export function pruneUserQuests(userQuests: UserQuest[]): UserQuest[] {
  if (userQuests.length <= MAX_STORED_USER_QUESTS) return userQuests;

  const incomplete = userQuests.filter((quest) => !quest.isCompleted);
  const completed = userQuests.filter((quest) => quest.isCompleted);
  const maxCompleted = Math.max(0, MAX_STORED_USER_QUESTS - incomplete.length);
  const keptCompleted = completed.slice(-maxCompleted);
  const keptIds = new Set([...incomplete, ...keptCompleted].map((quest) => quest.id));

  return userQuests.filter((quest) => keptIds.has(quest.id));
}

export function pruneActivityByDate(
  activityByDate: Record<string, DailyActivity>,
  referenceDate = new Date(),
): Record<string, DailyActivity> {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - ACTIVITY_RETENTION_DAYS);
  const cutoffKey = getLocalDateKey(cutoff);

  return Object.fromEntries(
    Object.entries(activityByDate).filter(([dateKey]) => dateKey >= cutoffKey),
  );
}

function sanitizeDailyActivity(raw: unknown): DailyActivity | null {
  if (!raw || typeof raw !== 'object') return null;
  const activity = raw as Record<string, unknown>;

  return {
    questsCompleted: typeof activity.questsCompleted === 'number' ? activity.questsCompleted : 0,
    xpEarned: typeof activity.xpEarned === 'number' ? activity.xpEarned : 0,
    reputationEarned:
      typeof activity.reputationEarned === 'number' ? activity.reputationEarned : 0,
    chaptersCompleted:
      typeof activity.chaptersCompleted === 'number' ? activity.chaptersCompleted : 0,
    highRiskQuestsCompleted:
      typeof activity.highRiskQuestsCompleted === 'number' ? activity.highRiskQuestsCompleted : 0,
  };
}

function sanitizeActivityByDate(raw: unknown): Record<string, DailyActivity> {
  if (!raw || typeof raw !== 'object') return {};

  const sanitized = Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .map(([dateKey, value]) => {
        const activity = sanitizeDailyActivity(value);
        return activity ? ([dateKey, activity] as const) : null;
      })
      .filter((entry): entry is [string, DailyActivity] => entry !== null),
  );

  return pruneActivityByDate(sanitized);
}

/** Trim growth-prone fields before persisting or after loading saved progress. */
export function sanitizePersistedProgress(progress: PlayerProgress): PlayerProgress {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - ACTIVITY_RETENTION_DAYS);
  const cutoffKey = getLocalDateKey(cutoff);

  const dailyAwarenessByDate = Object.fromEntries(
    Object.entries(progress.dailyAwarenessByDate).filter(([dateKey]) => dateKey >= cutoffKey),
  );
  const dailyAwarenessDismissedDates = progress.dailyAwarenessDismissedDates.filter(
    (dateKey) => dateKey >= cutoffKey,
  );

  return {
    ...progress,
    userQuests: pruneUserQuests(sanitizeUserQuestList(progress.userQuests)),
    activityByDate: sanitizeActivityByDate(progress.activityByDate),
    dailyAwarenessByDate,
    dailyAwarenessDismissedDates,
    weeklyReviewByWeek: pruneWeeklyReviewByWeek(
      progress.weeklyReviewByWeek ?? {},
      new Date(),
      ACTIVITY_RETENTION_DAYS,
    ),
    evidenceLog: pruneEvidenceLog(progress.evidenceLog ?? []),
    momentumReserve: sanitizeMomentumReserve(progress.momentumReserve),
    momentumMilestonesReached: sanitizeMomentumMilestonesReached(progress.momentumMilestonesReached),
    routineRepetitionByKey: sanitizeRoutineRepetitionByKey(progress.routineRepetitionByKey),
    questDefaults: sanitizeQuestDefaultsSettings(progress.questDefaults),
    questInbox: sanitizeQuestInbox(progress.questInbox),
    desiredIdentityTraits: sanitizeDesiredIdentityTraits(progress.desiredIdentityTraits),
  };
}

export { EMPTY_ACTIVITY };
