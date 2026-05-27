import type { Chapter, Saga, TaskCategory, Universe, UserQuest } from '@/types/narrative';

const CATEGORY_VERBS: Record<TaskCategory, string> = {
  cleaning: 'Prepare',
  fitness: 'Train for',
  study: 'Decode',
  work: 'Execute',
  health: 'Restore',
  social: 'Rally',
  creative: 'Craft',
  errand: 'Run',
};

const CHAPTER_STAKES: Record<number, string> = {
  1: 'makes its first move',
  2: 'strikes at dawn',
  3: 'sabotages the supply line',
  4: 'hunts fear in the dark',
  5: 'pushes all-in at high noon',
};

export const TASK_CATEGORIES: TaskCategory[] = [
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
];

export const CATEGORY_LABELS: Record<TaskCategory, string> = {
  cleaning: 'Cleaning',
  fitness: 'Fitness',
  study: 'Study',
  work: 'Work',
  health: 'Health',
  social: 'Social',
  creative: 'Creative',
  errand: 'Errand',
};

function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Strip common task verbs to get the core noun phrase. */
function taskNoun(originalTitle: string): string {
  const trimmed = originalTitle.trim();
  const stripped = trimmed.replace(
    /^(clean|wash|organize|organise|do|complete|finish|study|work on|run|buy|get)\s+(the\s+)?/i,
    '',
  );
  return stripped || trimmed;
}

function extractSettingFromTemplate(templateTitle: string): string | null {
  const afterThe = templateTitle.match(/\bthe\s+([A-Za-z]+)/i);
  return afterThe?.[1] ?? null;
}

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
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  templateHook?: string,
): string {
  const task = taskNoun(originalTitle).toLowerCase();
  const article = /^[aeiou]/.test(task) ? 'An' : 'A';
  const stakes = CHAPTER_STAKES[chapter.order] ?? 'tightens its grip';
  const base = `${article} ${task} keeps ${universe.locationName} steady before ${saga.villainName} ${stakes}.`;
  return templateHook ? `${base} ${templateHook}` : base;
}

export function convertTaskToUserQuest(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
): Omit<UserQuest, 'id' | 'isCompleted'> {
  const template = chapter.questTemplates.find((t) => t.category === category);

  return {
    originalTitle: originalTitle.trim(),
    category,
    narrativeTitle: buildNarrativeTitle(originalTitle, category, template?.title),
    narrativeDescription: buildNarrativeDescription(
      originalTitle,
      universe,
      saga,
      chapter,
      template?.dramaticHook,
    ),
    sourceUniverseId: universe.id,
    sourceSagaId: saga.id,
    sourceChapterId: chapter.id,
    xpReward: template?.xpReward ?? 100,
    reputationReward: template?.reputationImpact ?? 8,
    reactionCharacterId: template?.reactionCharacterId ?? saga.characters.find((c) => !c.isVillain)?.id ?? '',
  };
}

export function createUserQuestId(): string {
  return `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function isUserQuestId(id: string): boolean {
  return id.startsWith('user-');
}
