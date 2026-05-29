import {
  buildRoutineAwareNarrative,
  getRoutineRepetitionRecord,
  resolveRoutineRepetitionKey,
} from '@/lib/routine-boredom-guard';
import type {
  Chapter,
  PlayerProgress,
  QuestRiskLevel,
  Saga,
  TaskCategory,
  Universe,
  UserQuest,
} from '@/types/narrative';

import { getLocalDateKey } from '@/lib/daily-streak';

export function convertTaskToUserQuest(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  recentQuests: UserQuest[] = [],
  routineProgress?: Pick<PlayerProgress, 'routineRepetitionByKey'>,
  generatedFromRecurringQuestId?: string,
): Omit<UserQuest, 'id' | 'isCompleted'> {
  const trimmed = originalTitle.trim();
  const repetitionKey = resolveRoutineRepetitionKey({
    originalTitle: trimmed,
    category,
    generatedFromRecurringQuestId,
  });
  const repetitionRecord = routineProgress
    ? getRoutineRepetitionRecord(routineProgress, repetitionKey)
    : undefined;

  const narrative = buildRoutineAwareNarrative({
    originalTitle: trimmed,
    category,
    universe,
    saga,
    chapter,
    recentQuests,
    repetitionRecord,
    generatedFromRecurringQuestId,
  });

  const template = chapter.questTemplates.find((entry) => entry.category === category);

  return {
    originalTitle: trimmed,
    category,
    narrativeTitle: narrative.narrativeTitle,
    narrativeDescription: narrative.routineFreshAngleLine
      ? `${narrative.narrativeDescription} ${narrative.routineFreshAngleLine}`
      : narrative.narrativeDescription,
    usedVariationId: narrative.usedVariationId,
    sourceUniverseId: universe.id,
    sourceSagaId: saga.id,
    sourceChapterId: chapter.id,
    xpReward: template?.xpReward ?? 100,
    reputationReward: template?.reputationImpact ?? 8,
    reactionCharacterId:
      template?.reactionCharacterId ?? saga.characters.find((character) => !character.isVillain)?.id ?? '',
    ...(narrative.routineVariationTone
      ? { routineVariationTone: narrative.routineVariationTone }
      : {}),
    ...(narrative.routineFreshAngleLine
      ? { routineFreshAngleLine: narrative.routineFreshAngleLine }
      : {}),
    ...(generatedFromRecurringQuestId ? { generatedFromRecurringQuestId } : {}),
  };
}

export function createUserQuestId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export type CreateUserQuestOptions = {
  starterTaskTitle?: string;
  prepStepTitle?: string;
  afterQuestReward?: string;
  riskLevel?: QuestRiskLevel;
  generatedFromRecurringQuestId?: string;
  plannedTimeLabel?: string;
  plannedLocation?: string;
  afterCurrentHabit?: string;
  implementationIntention?: string;
  focusPinned?: boolean;
};

/** Shared user-quest creation used by single and batch add flows. */
export function createUserQuestFromTask(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  recentQuests: UserQuest[] = [],
  options?: CreateUserQuestOptions,
  createdOnDate: string = getLocalDateKey(),
  routineProgress?: Pick<PlayerProgress, 'routineRepetitionByKey'>,
): UserQuest {
  const trimmed = originalTitle.trim();
  const converted = convertTaskToUserQuest(
    trimmed,
    category,
    universe,
    saga,
    chapter,
    recentQuests,
    routineProgress,
    options?.generatedFromRecurringQuestId,
  );

  return {
    ...converted,
    id: createUserQuestId(),
    isCompleted: false,
    createdOnDate,
    ...(options?.starterTaskTitle ? { starterTaskTitle: options.starterTaskTitle.trim() } : {}),
    ...(options?.prepStepTitle ? { prepStepTitle: options.prepStepTitle.trim() } : {}),
    ...(options?.afterQuestReward ? { afterQuestReward: options.afterQuestReward.trim() } : {}),
    riskLevel: options?.riskLevel ?? 'standard',
    ...(options?.generatedFromRecurringQuestId
      ? { generatedFromRecurringQuestId: options.generatedFromRecurringQuestId }
      : {}),
    ...(options?.plannedTimeLabel ? { plannedTimeLabel: options.plannedTimeLabel.trim() } : {}),
    ...(options?.plannedLocation ? { plannedLocation: options.plannedLocation.trim() } : {}),
    ...(options?.afterCurrentHabit ? { afterCurrentHabit: options.afterCurrentHabit.trim() } : {}),
    ...(options?.implementationIntention
      ? { implementationIntention: options.implementationIntention.trim() }
      : {}),
    ...(options?.focusPinned ? { focusPinned: true } : {}),
  };
}

export function isUserQuestId(id: string): boolean {
  return id.startsWith('user-');
}
