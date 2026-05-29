import { getLocalDateKey } from '@/lib/daily-streak';
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

  if (typeof quest.afterCurrentHabit === 'string' && quest.afterCurrentHabit.length > 0) {
    sanitized.afterCurrentHabit = quest.afterCurrentHabit;
  }

  if (typeof quest.archivedAt === 'string' && quest.archivedAt.length > 0) {
    sanitized.archivedAt = quest.archivedAt;
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
  };
}

export { EMPTY_ACTIVITY };
