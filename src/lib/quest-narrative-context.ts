import type { Chapter, Saga, TaskCategory, Universe } from '@/types/narrative';

export const CATEGORY_VERBS: Record<TaskCategory, string> = {
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

const NEURONET_CHAPTER_STAKES: Record<number, string> = {
  1: 'flags your first route',
  2: 'scans the rainline',
  3: 'mirrors your coordinates',
  4: 'hunts hesitation in the dark grid',
  5: 'locks the final drop',
};

const NEON_ASHES_CHAPTER_STAKES: Record<number, string> = {
  1: 'redacts the first witness',
  2: 'watches the rainline',
  3: 'vanishes a contact list',
  4: 'burns the ledger trail',
  5: 'closes the hollow room',
};

export type QuestNarrativeContext = {
  task: string;
  Task: string;
  verb: string;
  setting: string;
  Setting: string;
  location: string;
  villain: string;
  stakes: string;
  article: string;
  Article: string;
  templateHook: string;
};

export function capitalize(word: string): string {
  if (!word) return word;
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/** Strip common task verbs to get the core noun phrase. */
export function taskNoun(originalTitle: string): string {
  const trimmed = originalTitle.trim();
  const stripped = trimmed.replace(
    /^(clean|wash|organize|organise|do|complete|finish|study|work on|run|buy|get)\s+(the\s+)?/i,
    '',
  );
  return stripped || trimmed;
}

export function extractSettingFromTemplate(templateTitle: string): string | null {
  const afterThe = templateTitle.match(/\bthe\s+([A-Za-z]+)/i);
  return afterThe?.[1] ?? null;
}

function resolveStakes(universe: Universe, chapter: Chapter): string {
  const stakesByUniverse =
    universe.id === 'neuronet'
      ? NEURONET_CHAPTER_STAKES
      : universe.id === 'neon-ashes'
        ? NEON_ASHES_CHAPTER_STAKES
        : CHAPTER_STAKES;
  return stakesByUniverse[chapter.order] ?? 'tightens its grip';
}

export function buildQuestNarrativeContext(
  originalTitle: string,
  category: TaskCategory,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  templateTitle?: string,
  templateHook?: string,
): QuestNarrativeContext {
  const task = taskNoun(originalTitle).toLowerCase();
  const Task = capitalize(taskNoun(originalTitle));
  const settingRaw = templateTitle ? extractSettingFromTemplate(templateTitle) ?? 'field' : 'field';
  const setting = settingRaw.toLowerCase();

  return {
    task,
    Task,
    verb: CATEGORY_VERBS[category],
    setting,
    Setting: capitalize(settingRaw),
    location: universe.locationName,
    villain: saga.villainName,
    stakes: resolveStakes(universe, chapter),
    article: /^[aeiou]/.test(task) ? 'an' : 'a',
    Article: /^[aeiou]/.test(task) ? 'An' : 'A',
    templateHook: templateHook ?? '',
  };
}
