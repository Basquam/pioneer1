import type { TaskCategory } from '@/types/narrative';

export type QuestPrepCopy = {
  sectionLabel: string;
  helperText: string;
  universeHint: string;
  previewLabel: string;
};

const QUEST_PREP_COPY: Record<string, QuestPrepCopy> = {
  'dust-and-iron': {
    sectionLabel: 'Make it easier later',
    helperText: 'Prepare one small thing now so starting later is easier.',
    universeHint: 'Prime the trail before the ride.',
    previewLabel: 'Prep',
  },
  neuronet: {
    sectionLabel: 'Make it easier later',
    helperText: 'Prepare one small thing now so starting later is easier.',
    universeHint: 'Preload the system before execution.',
    previewLabel: 'Prep',
  },
  'neon-ashes': {
    sectionLabel: 'Make it easier later',
    helperText: 'Prepare one small thing now so starting later is easier.',
    universeHint: 'Set the scene before following the lead.',
    previewLabel: 'Prep',
  },
};

export const PREP_PRESETS_BY_CATEGORY: Record<TaskCategory, string[]> = {
  cleaning: [
    'Put cleaning supplies where you can see them.',
    'Clear one surface.',
    'Place a trash bag nearby.',
  ],
  fitness: [
    'Put workout clothes somewhere visible.',
    'Fill a water bottle.',
    'Place shoes near the door.',
  ],
  study: [
    'Open your notes.',
    'Put your notebook on the desk.',
    'Clear your study space.',
  ],
  work: [
    'Open the document or tool you need.',
    'Write the first next action.',
    'Clear your workspace.',
  ],
  health: [
    'Fill a glass of water.',
    'Prepare medication or vitamins if needed.',
    'Set out what supports your health task.',
  ],
  social: [
    'Open the chat or contact.',
    'Draft the first sentence.',
    "Put the person's name on today's list.",
  ],
  creative: [
    'Open your creative tool.',
    'Lay out your instrument/material.',
    'Create a blank file/page.',
  ],
  errand: [
    'Put the item by the door.',
    'Write the stop/location.',
    'Prepare your bag or keys.',
  ],
};

export function getQuestPrepCopy(universeId: string): QuestPrepCopy {
  return QUEST_PREP_COPY[universeId] ?? QUEST_PREP_COPY['dust-and-iron'];
}

export function getPrepPresets(category: TaskCategory): string[] {
  return PREP_PRESETS_BY_CATEGORY[category];
}

export function getDefaultPrepPreset(category: TaskCategory): string {
  return PREP_PRESETS_BY_CATEGORY[category][0] ?? '';
}

export function isPrepPreset(step: string, category: TaskCategory): boolean {
  return PREP_PRESETS_BY_CATEGORY[category].includes(step);
}

export function formatPrepStepLine(prepStepTitle: string): string {
  return `Prep: ${prepStepTitle}`;
}
