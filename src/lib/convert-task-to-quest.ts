import {
  buildQuestNarrativeContext,
  capitalize,
  CATEGORY_VERBS,
  extractSettingFromTemplate,
  taskNoun,
} from '@/lib/quest-narrative-context';
import { applyQuestVariation } from '@/lib/quest-variation-patterns';
import { pickQuestVariation } from '@/lib/quest-variation-picker';
import type { Chapter, QuestRiskLevel, Saga, TaskCategory, Universe, UserQuest } from '@/types/narrative';

import { getLocalDateKey } from '@/lib/daily-streak';

function buildNarrativeTitle(
  originalTitle: string,
  category: TaskCategory,
  templateTitle: string | undefined,
): string {
  const verb = CATEGORY_VERBS[category];
  const noun = capitalize(taskNoun(originalTitle));

  if (templateTitle) {
    const setting = extractSettingFromTemplate(templateTitle);
    if (setting && category === 'cleaning') {
      return `${verb} the ${capitalize(setting)} ${noun}`;
    }
    const prefix = templateTitle.split('—')[0]?.trim();
    if (prefix) {
      return `${prefix} — ${noun}`;
    }
  }

  return `${verb} ${noun}`;
}

function buildNarrativeDescription(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  templateHook?: string,
): string {
  const context = buildQuestNarrativeContext(
    originalTitle,
    category,
    universe,
    saga,
    chapter,
    undefined,
    templateHook,
  );
  const base = `${context.Article} ${context.task} keeps ${context.location} steady before ${context.villain} ${context.stakes}.`;
  return templateHook ? `${base} ${templateHook}` : base;
}

export function convertTaskToUserQuest(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  recentQuests: UserQuest[] = [],
): Omit<UserQuest, 'id' | 'isCompleted'> {
  const template = chapter.questTemplates.find((entry) => entry.category === category);
  const narrativeContext = buildQuestNarrativeContext(
    originalTitle,
    category,
    universe,
    saga,
    chapter,
    template?.title,
    template?.dramaticHook,
  );

  const variation = template?.variations?.length
    ? pickQuestVariation(template.variations, recentQuests, chapter.id, category)
    : null;

  const narrative = variation
    ? applyQuestVariation(variation, narrativeContext)
    : {
        narrativeTitle: buildNarrativeTitle(originalTitle, category, template?.title),
        narrativeDescription: buildNarrativeDescription(
          originalTitle,
          category,
          universe,
          saga,
          chapter,
          template?.dramaticHook,
        ),
      };

  return {
    originalTitle: originalTitle.trim(),
    category,
    narrativeTitle: narrative.narrativeTitle,
    narrativeDescription: narrative.narrativeDescription,
    usedVariationId: variation?.id,
    sourceUniverseId: universe.id,
    sourceSagaId: saga.id,
    sourceChapterId: chapter.id,
    xpReward: template?.xpReward ?? 100,
    reputationReward: template?.reputationImpact ?? 8,
    reactionCharacterId:
      template?.reactionCharacterId ?? saga.characters.find((character) => !character.isVillain)?.id ?? '',
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
): UserQuest {
  const trimmed = originalTitle.trim();
  const converted = convertTaskToUserQuest(trimmed, category, universe, saga, chapter, recentQuests);

  return {
    ...converted,
    id: createUserQuestId(),
    isCompleted: false,
    createdOnDate,
    ...(options?.starterTaskTitle ? { starterTaskTitle: options.starterTaskTitle.trim() } : {}),
    ...(options?.prepStepTitle ? { prepStepTitle: options.prepStepTitle.trim() } : {}),
    ...(options?.afterQuestReward ? { afterQuestReward: options.afterQuestReward.trim() } : {}),
    riskLevel: options?.riskLevel ?? 'standard',
  };
}

export function isUserQuestId(id: string): boolean {
  return id.startsWith('user-');
}
