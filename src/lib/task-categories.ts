import type { TaskCategory } from '@/types/narrative';

export type TaskCategoryMeta = {
  id: TaskCategory;
  /** Wild West flavor name shown in UI. */
  label: string;
  /** Plain real-world label for clarity. */
  realWorldLabel: string;
  description: string;
  icon: string;
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

export const TASK_CATEGORY_META: Record<TaskCategory, TaskCategoryMeta> = {
  cleaning: {
    id: 'cleaning',
    label: 'Restore Order',
    realWorldLabel: 'Cleaning',
    description: 'Clear dust, mess, and chaos before trouble arrives.',
    icon: '🧹',
  },
  fitness: {
    id: 'fitness',
    label: 'Sharpen the Body',
    realWorldLabel: 'Fitness',
    description: 'Train strength and endurance for the road ahead.',
    icon: '💪',
  },
  study: {
    id: 'study',
    label: 'Gather Intel',
    realWorldLabel: 'Study',
    description: 'Read maps, ledgers, and signs the enemy missed.',
    icon: '📜',
  },
  work: {
    id: 'work',
    label: 'Handle Operations',
    realWorldLabel: 'Work',
    description: 'Ship the work that keeps the frontier running.',
    icon: '⚙️',
  },
  health: {
    id: 'health',
    label: 'Stay Alive',
    realWorldLabel: 'Health',
    description: 'Rest, recover, and keep your body battle-ready.',
    icon: '❤️',
  },
  social: {
    id: 'social',
    label: 'Send Word',
    realWorldLabel: 'Social',
    description: 'Rally allies, send messages, and hold the line together.',
    icon: '📣',
  },
  creative: {
    id: 'creative',
    label: 'Craft the Legend',
    realWorldLabel: 'Creative',
    description: 'Shape the story the town will remember.',
    icon: '✒️',
  },
  errand: {
    id: 'errand',
    label: 'Supply Run',
    realWorldLabel: 'Errand',
    description: 'Fetch what the camp needs before sundown.',
    icon: '📦',
  },
};

export function getTaskCategoryMeta(category: TaskCategory): TaskCategoryMeta {
  return TASK_CATEGORY_META[category];
}
