import type { ChapterCompleteState, QuestCompleteState } from '@/types/narrative';

import type { ProcessAchievementToast } from '@/lib/process-achievements';

export type RewardEventType =
  | 'questCompletion'
  | 'characterReaction'
  | 'identityMilestone'
  | 'processAchievement'
  | 'momentumMilestone'
  | 'chapterReward'
  | 'storyUnlock'
  | 'rewardRitual';

export type RewardEventPriority = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export const REWARD_EVENT_TYPE_PRIORITY: Record<RewardEventType, RewardEventPriority> = {
  questCompletion: 1,
  characterReaction: 2,
  chapterReward: 3,
  storyUnlock: 3,
  identityMilestone: 4,
  processAchievement: 5,
  momentumMilestone: 6,
  rewardRitual: 7,
};

export type QuestCompletionPayload = Pick<
  QuestCompleteState,
  | 'questId'
  | 'source'
  | 'narrativeTitle'
  | 'earnedXp'
  | 'earnedReputation'
  | 'momentumGainLine'
  | 'questChainCompleteLine'
  | 'recoveryCompleteLine'
  | 'minimumViableDayCompleteLine'
  | 'minimumViableDayFlavorLine'
  | 'identityVoteGainLine'
  | 'identityUniverseLine'
  | 'desiredIdentityHighlightLine'
>;

export type CharacterReactionPayload = Pick<
  QuestCompleteState,
  'questId' | 'narrativeTitle' | 'characterId' | 'characterLine'
>;

export type IdentityMilestonePayload = NonNullable<QuestCompleteState['identityMilestoneUnlock']>;

export type MomentumMilestonePayload = NonNullable<QuestCompleteState['momentumMilestoneUnlock']>;

export type RewardRitualPayload = {
  unlockedLine: string;
  flavorLine?: string;
};

export type ProcessAchievementPayload = ProcessAchievementToast;

export type ChapterRewardPayload = ChapterCompleteState;

export type RewardSummaryPayload = {
  isSummary: true;
  combinedTitles: string[];
};

export type RewardEventPayload =
  | QuestCompletionPayload
  | CharacterReactionPayload
  | IdentityMilestonePayload
  | MomentumMilestonePayload
  | RewardRitualPayload
  | ProcessAchievementPayload
  | ChapterRewardPayload
  | RewardSummaryPayload;

export type RewardEvent = {
  id: string;
  type: RewardEventType;
  title: string;
  message: string;
  priority: RewardEventPriority;
  createdAt: string;
  batchId: string;
  sequence: number;
  payload?: RewardEventPayload;
  /** Universe-flavored line for compact toasts. */
  flavorLine?: string;
};

export type RewardEventInput = Omit<RewardEvent, 'priority' | 'createdAt' | 'batchId' | 'sequence'> & {
  priority?: RewardEventPriority;
  createdAt?: string;
  batchId?: string;
  sequence?: number;
};

export const MAX_REWARD_EVENT_QUEUE_SIZE = 24;

const SMALL_REWARD_TYPES = new Set<RewardEventType>([
  'identityMilestone',
  'processAchievement',
  'momentumMilestone',
  'rewardRitual',
]);

const FULL_SCREEN_REWARD_TYPES = new Set<RewardEventType>([
  'questCompletion',
  'characterReaction',
  'chapterReward',
  'storyUnlock',
]);

const REWARD_EVENT_TYPE_LABEL: Record<RewardEventType, string> = {
  questCompletion: 'Quest completion',
  characterReaction: 'Character reaction',
  identityMilestone: 'Identity milestone',
  processAchievement: 'Process achievement',
  momentumMilestone: 'Momentum milestone',
  chapterReward: 'Chapter reward',
  storyUnlock: 'Story unlock',
  rewardRitual: 'Reward ritual',
};

export function getRewardEventPriority(type: RewardEventType): RewardEventPriority {
  return REWARD_EVENT_TYPE_PRIORITY[type];
}

export function isFullScreenRewardEvent(type: RewardEventType): boolean {
  return FULL_SCREEN_REWARD_TYPES.has(type);
}

export function isCompactRewardEvent(type: RewardEventType): boolean {
  return !FULL_SCREEN_REWARD_TYPES.has(type);
}

export function createRewardEvent(input: RewardEventInput, defaults?: { batchId?: string; sequence?: number }): RewardEvent {
  const type = input.type;
  return {
    id: input.id,
    type,
    title: input.title,
    message: input.message,
    priority: input.priority ?? getRewardEventPriority(type),
    createdAt: input.createdAt ?? new Date().toISOString(),
    batchId: input.batchId ?? defaults?.batchId ?? input.id,
    sequence: input.sequence ?? defaults?.sequence ?? 0,
    ...(input.payload !== undefined ? { payload: input.payload } : {}),
    ...(input.flavorLine ? { flavorLine: input.flavorLine } : {}),
  };
}

function dedupeRewardEvents(events: RewardEvent[]): RewardEvent[] {
  const seen = new Set<string>();
  const result: RewardEvent[] = [];

  for (const event of events) {
    if (seen.has(event.id)) continue;
    seen.add(event.id);
    result.push(event);
  }

  return result;
}

function sortRewardEvents(events: RewardEvent[]): RewardEvent[] {
  return [...events].sort((left, right) => {
    if (left.priority !== right.priority) return left.priority - right.priority;
    if (left.batchId !== right.batchId) {
      if (left.createdAt !== right.createdAt) {
        return left.createdAt.localeCompare(right.createdAt);
      }
      return left.batchId.localeCompare(right.batchId);
    }
    return left.sequence - right.sequence;
  });
}

function buildSmallRewardSummary(events: RewardEvent[]): RewardEvent {
  const titles = events.map((event) => event.title);
  const combinedTitles = events.flatMap((event) => {
    const payload = event.payload;
    if (payload && 'isSummary' in payload && payload.isSummary) {
      return payload.combinedTitles;
    }
    return [event.title];
  });

  const priority = Math.min(...events.map((event) => event.priority)) as RewardEventPriority;
  const batchId = events[0]?.batchId ?? 'summary';
  const createdAt = events[0]?.createdAt ?? new Date().toISOString();

  return createRewardEvent(
    {
      id: `summary-${batchId}-${events.map((event) => event.id).join('-')}`,
      type: 'processAchievement',
      title: `${events.length} rewards earned`,
      message: buildCombinedSummaryMessage(events),
      priority,
      batchId,
      createdAt,
      sequence: events[0]?.sequence ?? 0,
      payload: {
        isSummary: true,
        combinedTitles,
      },
      flavorLine: events.find((event) => event.flavorLine)?.flavorLine,
    },
    { batchId, sequence: events[0]?.sequence ?? 0 },
  );
}

function buildCombinedSummaryMessage(events: RewardEvent[]): string {
  if (events.length === 2) {
    return `${events[0].title} + ${events[1].title}`;
  }

  return events.map((event) => REWARD_EVENT_TYPE_LABEL[event.type]).join(' · ');
}

export function coalesceSmallRewardEvents(events: RewardEvent[]): RewardEvent[] {
  const result: RewardEvent[] = [];
  let smallBatch: RewardEvent[] = [];

  const flushSmallBatch = () => {
    if (smallBatch.length === 0) return;
    if (smallBatch.length === 1) {
      result.push(smallBatch[0]);
    } else {
      result.push(buildSmallRewardSummary(smallBatch));
    }
    smallBatch = [];
  };

  for (const event of events) {
    if (SMALL_REWARD_TYPES.has(event.type)) {
      smallBatch.push(event);
      continue;
    }
    flushSmallBatch();
    result.push(event);
  }

  flushSmallBatch();
  return result;
}

export function enqueueRewardEvents(
  queue: RewardEvent[],
  incoming: RewardEventInput[],
  options?: { coalesceIncomingSmall?: boolean },
): RewardEvent[] {
  if (incoming.length === 0) return queue;

  const batchId = incoming[0]?.batchId ?? `batch-${Date.now()}`;
  const normalizedIncoming = incoming.map((event, index) =>
    createRewardEvent(event, { batchId: event.batchId ?? batchId, sequence: event.sequence ?? index }),
  );

  const sortedIncoming = sortRewardEvents(normalizedIncoming);
  const preparedIncoming = options?.coalesceIncomingSmall
    ? coalesceSmallRewardEvents(sortedIncoming)
    : sortedIncoming;

  const merged = dedupeRewardEvents([...queue, ...preparedIncoming]);
  return merged.slice(0, MAX_REWARD_EVENT_QUEUE_SIZE);
}

export function advanceRewardQueue(queue: RewardEvent[]): RewardEvent[] {
  if (queue.length === 0) return queue;
  return queue.slice(1);
}

export function getActiveRewardEvent(queue: RewardEvent[]): RewardEvent | null {
  return queue[0] ?? null;
}

export function mergeCelebrationBatch(events: RewardEvent[]): RewardEvent[] {
  let headEnd = 0;
  for (const event of events) {
    if (SMALL_REWARD_TYPES.has(event.type)) break;
    headEnd += 1;
  }
  return [...events.slice(0, headEnd), ...coalesceSmallRewardEvents(events.slice(headEnd))];
}

export function buildQuestCompleteCelebrationEvents(
  state: QuestCompleteState,
  options?: {
    batchId?: string;
    progressMessage?: string;
    affinityGainLabel?: string | null;
    /** First-run onboarding: keep only the quest completion beat. */
    onboardingSimplified?: boolean;
  },
): RewardEvent[] {
  const batchId = options?.batchId ?? `quest-${state.questId}-${Date.now()}`;
  const createdAt = new Date().toISOString();

  const questCompletion = createRewardEvent(
    {
      id: `quest-completion-${state.questId}`,
      type: 'questCompletion',
      title: state.narrativeTitle,
      message: options?.progressMessage ?? 'Quest cleared.',
      payload: {
        questId: state.questId,
        source: state.source,
        narrativeTitle: state.narrativeTitle,
        earnedXp: state.earnedXp,
        earnedReputation: state.earnedReputation,
        momentumGainLine: state.momentumGainLine,
        questChainCompleteLine: state.questChainCompleteLine,
        recoveryCompleteLine: state.recoveryCompleteLine,
        minimumViableDayCompleteLine: state.minimumViableDayCompleteLine,
        minimumViableDayFlavorLine: state.minimumViableDayFlavorLine,
        identityVoteGainLine: state.identityVoteGainLine,
        identityUniverseLine: state.identityUniverseLine,
        desiredIdentityHighlightLine: state.desiredIdentityHighlightLine,
      },
      batchId,
      createdAt,
      sequence: 0,
    },
    { batchId, sequence: 0 },
  );

  const characterReaction = createRewardEvent(
    {
      id: `character-reaction-${state.questId}`,
      type: 'characterReaction',
      title: state.narrativeTitle,
      message: state.characterLine,
      payload: {
        questId: state.questId,
        narrativeTitle: state.narrativeTitle,
        characterId: state.characterId,
        characterLine: state.characterLine,
      },
      batchId,
      createdAt,
      sequence: 1,
    },
    { batchId, sequence: 1 },
  );

  const smallEvents: RewardEvent[] = [];

  if (state.identityMilestoneUnlock) {
    smallEvents.push(
      createRewardEvent(
        {
          id: `identity-milestone-${state.questId}`,
          type: 'identityMilestone',
          title: state.identityMilestoneUnlock.headline,
          message: state.identityMilestoneUnlock.universeFlavorLine,
          flavorLine: state.identityMilestoneUnlock.universeFlavorLine,
          payload: state.identityMilestoneUnlock,
          batchId,
          createdAt,
          sequence: 2,
        },
        { batchId, sequence: 2 },
      ),
    );
  }

  if (state.momentumMilestoneUnlock) {
    smallEvents.push(
      createRewardEvent(
        {
          id: `momentum-milestone-${state.questId}`,
          type: 'momentumMilestone',
          title: state.momentumMilestoneUnlock.label,
          message: state.momentumMilestoneUnlock.message,
          payload: state.momentumMilestoneUnlock,
          batchId,
          createdAt,
          sequence: 3,
        },
        { batchId, sequence: 3 },
      ),
    );
  }

  if (state.rewardRitualUnlockedLine) {
    smallEvents.push(
      createRewardEvent(
        {
          id: `reward-ritual-${state.questId}`,
          type: 'rewardRitual',
          title: 'Reward ritual unlocked',
          message: state.rewardRitualUnlockedLine,
          flavorLine: state.rewardRitualFlavorLine,
          payload: {
            unlockedLine: state.rewardRitualUnlockedLine,
            flavorLine: state.rewardRitualFlavorLine,
          },
          batchId,
          createdAt,
          sequence: 4,
        },
        { batchId, sequence: 4 },
      ),
    );
  }

  if (options?.onboardingSimplified) {
    return [questCompletion];
  }

  return coalesceSmallRewardEvents([questCompletion, characterReaction, ...smallEvents]);
}

export function buildChapterRewardCelebrationEvent(chapter: ChapterCompleteState): RewardEvent {
  const batchId = `chapter-${chapter.chapterId}-${Date.now()}`;
  return createRewardEvent({
    id: `chapter-reward-${chapter.chapterId}`,
    type: 'chapterReward',
    title: chapter.chapterTitle,
    message: 'Chapter complete.',
    payload: chapter,
    batchId,
    sequence: 10,
  });
}

export function buildProcessAchievementCelebrationEvents(
  toasts: ProcessAchievementToast[],
  batchId = `process-${Date.now()}`,
): RewardEvent[] {
  return toasts.map((toast, index) =>
    createRewardEvent(
      {
        id: `process-achievement-${toast.achievementId}-${batchId}`,
        type: 'processAchievement',
        title: toast.title,
        message: toast.meaning,
        flavorLine: toast.universeFlavorLine,
        payload: toast,
        batchId,
        sequence: index,
      },
      { batchId, sequence: index },
    ),
  );
}

export function getCelebrationEyebrow(type: RewardEventType): string {
  switch (type) {
    case 'identityMilestone':
      return 'IDENTITY MILESTONE UNLOCKED';
    case 'processAchievement':
      return 'PROCESS ACHIEVEMENT UNLOCKED';
    case 'momentumMilestone':
      return 'MOMENTUM MILESTONE';
    case 'rewardRitual':
      return 'REWARD RITUAL';
    case 'storyUnlock':
      return 'STORY UNLOCKED';
    default:
      return 'REWARD EARNED';
  }
}
