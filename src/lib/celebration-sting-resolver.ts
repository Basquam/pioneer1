import type { RewardEvent, RewardEventType } from '@/lib/reward-event-queue';

export type EventStingKind =
  | 'chapterComplete'
  | 'rewardUnlock'
  | 'questComplete'
  | 'villainAppearance';

/** Higher value wins when multiple celebration events enqueue together. */
export const EVENT_STING_PRIORITY: Record<EventStingKind, number> = {
  chapterComplete: 4,
  rewardUnlock: 3,
  questComplete: 2,
  villainAppearance: 1,
};

function rewardEventTypeToStingKind(type: RewardEventType): EventStingKind | null {
  switch (type) {
    case 'chapterReward':
      return 'chapterComplete';
    case 'storyUnlock':
    case 'processAchievement':
      return 'rewardUnlock';
    case 'questCompletion':
      return 'questComplete';
    default:
      return null;
  }
}

export function resolveCelebrationSting(events: RewardEvent[]): EventStingKind | null {
  let best: EventStingKind | null = null;
  let bestPriority = 0;

  for (const event of events) {
    const kind = rewardEventTypeToStingKind(event.type);
    if (!kind) continue;
    const priority = EVENT_STING_PRIORITY[kind];
    if (priority > bestPriority) {
      bestPriority = priority;
      best = kind;
    }
  }

  return best;
}
