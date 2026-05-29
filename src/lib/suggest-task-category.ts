import { TASK_CATEGORIES } from '@/lib/task-categories';
import type { TaskCategory } from '@/types/narrative';

const CATEGORY_KEYWORDS: Record<TaskCategory, readonly string[]> = {
  cleaning: [
    'clean',
    'tidy',
    'organize',
    'wash',
    'laundry',
    'dishes',
    'room',
    'kitchen',
    'bathroom',
    'trash',
  ],
  fitness: ['workout', 'exercise', 'gym', 'walk', 'run', 'stretch', 'pushup', 'cardio', 'lift'],
  study: ['study', 'read', 'notes', 'exam', 'lecture', 'course', 'learn', 'practice', 'homework'],
  work: [
    'email',
    'report',
    'meeting',
    'task',
    'project',
    'document',
    'supplier',
    'client',
    'presentation',
    'code',
    'debug',
  ],
  health: ['water', 'sleep', 'medicine', 'vitamins', 'meal', 'doctor', 'rest', 'breathe'],
  social: ['call', 'message', 'reply', 'text', 'friend', 'family', 'check in'],
  creative: ['write', 'draw', 'guitar', 'music', 'design', 'sketch', 'record', 'edit', 'compose'],
  errand: [
    'buy',
    'groceries',
    'pick up',
    'deliver',
    'bank',
    'post office',
    'appointment',
    'store',
  ],
};

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function keywordMatches(title: string, keyword: string): boolean {
  const pattern = keyword.includes(' ')
    ? new RegExp(keyword.replace(/\s+/g, '\\s+'), 'i')
    : new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');

  return pattern.test(title);
}

function matchesCategory(title: string, category: TaskCategory): boolean {
  return CATEGORY_KEYWORDS[category].some((keyword) => keywordMatches(title, keyword));
}

/** Returns a category only when exactly one keyword group matches (confident suggestion). */
export function suggestTaskCategory(taskTitle: string): TaskCategory | null {
  const trimmed = taskTitle.trim();
  if (!trimmed) return null;

  const matches = TASK_CATEGORIES.filter((category) => matchesCategory(trimmed, category));
  return matches.length === 1 ? matches[0]! : null;
}
