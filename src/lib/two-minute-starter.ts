import type { TaskCategory } from '@/types/narrative';

export type StarterToggleCopy = {
  toggleLabel: string;
  universeHint: string;
  previewLabel: string;
};

const STARTER_TOGGLE_COPY: Record<string, StarterToggleCopy> = {
  'dust-and-iron': {
    toggleLabel: 'Make it easier to start',
    universeHint: 'Start with the first step on the trail.',
    previewLabel: 'Starter move',
  },
  neuronet: {
    toggleLabel: 'Make it easier to start',
    universeHint: 'Run the smallest executable action.',
    previewLabel: 'Starter move',
  },
  'neon-ashes': {
    toggleLabel: 'Make it easier to start',
    universeHint: 'Follow the first lead.',
    previewLabel: 'Starter move',
  },
};

const STARTER_BY_CATEGORY: Record<TaskCategory, (title: string) => string> = {
  cleaning: (title) => {
    const lower = title.toLowerCase();
    if (/\b(room|whole|entire|apartment|house|bedroom|kitchen)\b/.test(lower)) {
      return 'Clear one visible surface';
    }
    return 'Tidy one small spot for 2 minutes';
  },
  fitness: (title) => {
    const lower = title.toLowerCase();
    if (/\b(workout|exercise|gym|run|training)\b/.test(lower)) {
      return 'Put on workout clothes';
    }
    return 'Move for 2 minutes';
  },
  study: (title) => {
    const lower = title.toLowerCase();
    if (/\b(exam|test|midterm|final|quiz)\b/.test(lower)) {
      return 'Open notes and study for 2 minutes';
    }
    return 'Open materials and read for 2 minutes';
  },
  work: () => 'Work on one small piece for 2 minutes',
  health: () => 'Take 2 minutes for rest or a quick check-in',
  social: () => 'Send one short message',
  creative: () => 'Create one small thing for 2 minutes',
  errand: () => 'Do the first tiny step',
};

export function getStarterToggleCopy(universeId: string): StarterToggleCopy {
  return STARTER_TOGGLE_COPY[universeId] ?? STARTER_TOGGLE_COPY['dust-and-iron'];
}

export function generateStarterTaskTitle(title: string, category: TaskCategory): string {
  const trimmed = title.trim();
  if (!trimmed) return STARTER_BY_CATEGORY[category]('');

  return STARTER_BY_CATEGORY[category](trimmed);
}

export function formatStarterMoveLine(starterTaskTitle: string, universeId: string): string {
  const copy = getStarterToggleCopy(universeId);
  return `${copy.previewLabel}: ${starterTaskTitle}`;
}
