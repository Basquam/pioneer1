import type { QuestSuite, QuestSuiteId, TaskCategory } from '@/types/narrative';

export const QUEST_SUITE_IDS: QuestSuiteId[] = [
  'gym',
  'business',
  'scholar',
  'home',
  'wellness',
  'creative',
  'social',
  'errand',
];

export const QUEST_SUITES: QuestSuite[] = [
  {
    id: 'gym',
    label: 'Gym Suite',
    shortLabel: 'Gym',
    description: 'Fitness, movement, strength, body discipline.',
    icon: '🏋️',
    primaryCategories: ['fitness', 'health'],
  },
  {
    id: 'business',
    label: 'Business Suite',
    shortLabel: 'Business',
    description: 'Work, emails, deadlines, meetings, professional tasks.',
    icon: '💼',
    primaryCategories: ['work', 'errand'],
  },
  {
    id: 'scholar',
    label: 'Scholar Suite',
    shortLabel: 'Scholar',
    description: 'Study, notes, exams, learning, research.',
    icon: '📚',
    primaryCategories: ['study', 'work'],
  },
  {
    id: 'home',
    label: 'Home Suite',
    shortLabel: 'Home',
    description: 'Cleaning, organizing, maintenance, household tasks.',
    icon: '🏠',
    primaryCategories: ['cleaning', 'errand'],
  },
  {
    id: 'wellness',
    label: 'Wellness Suite',
    shortLabel: 'Wellness',
    description: 'Health, rest, recovery, self-care, low-energy support.',
    icon: '🌿',
    primaryCategories: ['health', 'cleaning'],
  },
  {
    id: 'creative',
    label: 'Creative Suite',
    shortLabel: 'Creative',
    description: 'Writing, music, drawing, design, building.',
    icon: '🎨',
    primaryCategories: ['creative', 'study'],
  },
  {
    id: 'social',
    label: 'Social Suite',
    shortLabel: 'Social',
    description: 'Messages, calls, relationships, social maintenance.',
    icon: '💬',
    primaryCategories: ['social'],
  },
  {
    id: 'errand',
    label: 'Errand Suite',
    shortLabel: 'Errand',
    description: 'Outside tasks, appointments, purchases, deliveries.',
    icon: '🛒',
    primaryCategories: ['errand', 'work'],
  },
];

const SUITE_BY_ID = new Map(QUEST_SUITES.map((suite) => [suite.id, suite]));

export function isQuestSuiteId(value: unknown): value is QuestSuiteId {
  return typeof value === 'string' && SUITE_BY_ID.has(value as QuestSuiteId);
}

export function getQuestSuiteById(suiteId: QuestSuiteId): QuestSuite | undefined {
  return SUITE_BY_ID.get(suiteId);
}

export function suggestSuiteForCategory(category: TaskCategory): QuestSuiteId {
  for (const suite of QUEST_SUITES) {
    if (suite.primaryCategories[0] === category) return suite.id;
  }

  for (const suite of QUEST_SUITES) {
    if (suite.primaryCategories.includes(category)) return suite.id;
  }

  return 'errand';
}

const TITLE_SUITE_KEYWORDS: Array<{ suiteId: QuestSuiteId; keywords: string[] }> = [
  {
    suiteId: 'gym',
    keywords: ['gym', 'workout', 'lift', 'run', 'walk', 'stretch', 'exercise', 'train'],
  },
  {
    suiteId: 'business',
    keywords: ['email', 'meeting', 'deadline', 'client', 'report', 'invoice', 'work'],
  },
  {
    suiteId: 'scholar',
    keywords: ['study', 'exam', 'homework', 'lecture', 'notes', 'research', 'read chapter'],
  },
  {
    suiteId: 'home',
    keywords: ['clean', 'laundry', 'dishes', 'vacuum', 'organize', 'tidy', 'declutter'],
  },
  {
    suiteId: 'wellness',
    keywords: ['rest', 'sleep', 'meditate', 'recover', 'hydrate', 'self-care', 'breathe'],
  },
  {
    suiteId: 'creative',
    keywords: ['write', 'draw', 'design', 'music', 'sketch', 'build', 'compose'],
  },
  {
    suiteId: 'social',
    keywords: ['call', 'message', 'text', 'friend', 'family', 'reply', 'reach out'],
  },
  {
    suiteId: 'errand',
    keywords: ['buy', 'pick up', 'appointment', 'store', 'deliver', 'return', 'errand'],
  },
];

export function suggestSuiteForTaskTitle(
  title: string,
  category?: TaskCategory,
): QuestSuiteId | null {
  const normalized = title.trim().toLowerCase();
  if (!normalized) return category ? suggestSuiteForCategory(category) : null;

  for (const entry of TITLE_SUITE_KEYWORDS) {
    if (entry.keywords.some((keyword) => normalized.includes(keyword))) {
      return entry.suiteId;
    }
  }

  return category ? suggestSuiteForCategory(category) : null;
}

export function resolveAddQuestSuitePrefill({
  category,
  activeSuiteId,
  title,
}: {
  category: TaskCategory | null;
  activeSuiteId?: QuestSuiteId;
  title: string;
}): QuestSuiteId | null {
  const categorySuite = category ? suggestSuiteForCategory(category) : null;

  if (activeSuiteId) {
    if (category) {
      const activeSuite = getQuestSuiteById(activeSuiteId);
      if (activeSuite && !activeSuite.primaryCategories.includes(category)) {
        return categorySuite ?? activeSuiteId;
      }
    }
    return activeSuiteId;
  }

  if (categorySuite) return categorySuite;

  const titleSuite = title.trim() ? suggestSuiteForTaskTitle(title.trim(), category ?? undefined) : null;
  return titleSuite;
}
