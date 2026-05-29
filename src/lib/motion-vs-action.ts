import { getLocalDateKey } from '@/lib/daily-streak';
import { resolveQuestCreatedOnDate } from '@/lib/daily-focus';
import type { BoardQuest, UserQuest } from '@/types/narrative';

export const MOTION_GUARD_PLANNING_THRESHOLD = 3;

export const MOTION_GUARD_CARD_PROMPT = "You've prepared enough. Take the first action.";

export const MOTION_GUARD_CARD_CTA = 'START THE FIRST MOVE';

export const MOTION_GUARD_FOCUS_PROMPT = 'Planning is done. One small action counts now.';

const UNIVERSE_MOTION_GUARD_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Enough planning. Ride the trail.',
  neuronet: 'Stop simulating. Execute the operation.',
  'neon-ashes': 'The file is ready. Follow the lead.',
};

export type PlanningActivitySource = 'improve' | 'readiness';

function appendTimestamp(existing: string[] | undefined, timestamp: string): string[] {
  return [...(existing ?? []), timestamp];
}

export function recordImproveActivity(quest: UserQuest, timestamp: string = new Date().toISOString()): UserQuest {
  return {
    ...quest,
    improvedAt: appendTimestamp(quest.improvedAt, timestamp),
  };
}

export function recordReadinessUpdateActivity(
  quest: UserQuest,
  timestamp: string = new Date().toISOString(),
): UserQuest {
  return {
    ...quest,
    readinessUpdatedAt: appendTimestamp(quest.readinessUpdatedAt, timestamp),
  };
}

export function recordFrictionReviewActivity(
  quest: UserQuest,
  timestamp: string = new Date().toISOString(),
): UserQuest {
  return {
    ...quest,
    frictionReviewedAt: appendTimestamp(quest.frictionReviewedAt, timestamp),
  };
}

export function recordFocusStartedActivity(
  quest: UserQuest,
  timestamp: string = new Date().toISOString(),
): UserQuest {
  if (quest.focusStartedAt) return quest;
  return { ...quest, focusStartedAt: timestamp };
}

export function recordQuestCompletedAt(
  quest: UserQuest,
  timestamp: string = new Date().toISOString(),
): UserQuest {
  return { ...quest, completedAt: timestamp };
}

export function countPlanningActions(quest: Pick<UserQuest, 'improvedAt' | 'readinessUpdatedAt' | 'frictionReviewedAt' | 'frictionReviews'>): number {
  const improved = quest.improvedAt?.length ?? 0;
  const readiness = quest.readinessUpdatedAt?.length ?? 0;
  const frictionLogged = quest.frictionReviewedAt?.length ?? 0;
  const frictionLegacy = quest.frictionReviews?.length ?? 0;
  const friction = Math.max(frictionLogged, frictionLegacy);

  return improved + readiness + friction;
}

export function isQuestCreatedOnOrBeforeToday(
  quest: Pick<UserQuest, 'id' | 'createdOnDate'>,
  today: string = getLocalDateKey(),
): boolean {
  const createdOnDate = resolveQuestCreatedOnDate(quest);
  if (!createdOnDate) return true;
  return createdOnDate <= today;
}

export function isTooMuchMotion(
  quest: Pick<
    UserQuest,
    | 'id'
    | 'isCompleted'
    | 'completedAt'
    | 'createdOnDate'
    | 'improvedAt'
    | 'readinessUpdatedAt'
    | 'frictionReviewedAt'
    | 'frictionReviews'
  >,
  today: string = getLocalDateKey(),
): boolean {
  if (quest.isCompleted || quest.completedAt) return false;
  if (!isQuestCreatedOnOrBeforeToday(quest, today)) return false;
  return countPlanningActions(quest) >= MOTION_GUARD_PLANNING_THRESHOLD;
}

export function isBoardQuestTooMuchMotion(quest: BoardQuest, today: string = getLocalDateKey()): boolean {
  if (quest.source !== 'user' || quest.completed) return false;
  return isTooMuchMotion(
    {
      id: quest.id,
      isCompleted: quest.completed,
      completedAt: quest.completedAt,
      createdOnDate: quest.createdOnDate,
      improvedAt: quest.improvedAt,
      readinessUpdatedAt: quest.readinessUpdatedAt,
      frictionReviewedAt: quest.frictionReviewedAt,
      frictionReviews: quest.frictionReviews,
    },
    today,
  );
}

export function getMotionGuardUniverseFlavor(universeId: string): string {
  return UNIVERSE_MOTION_GUARD_FLAVOR[universeId] ?? UNIVERSE_MOTION_GUARD_FLAVOR['dust-and-iron'];
}

export function sanitizePlanningTimestampList(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((entry): entry is string => typeof entry === 'string' && entry.length > 0).slice(-30);
}

export function sanitizePlanningTimestamp(raw: unknown): string | undefined {
  return typeof raw === 'string' && raw.length > 0 ? raw : undefined;
}
