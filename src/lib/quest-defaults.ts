import { buildHabitStackPlan, buildTimedPlan } from '@/lib/quest-friction';
import { getDefaultPrepPreset } from '@/lib/quest-prep';
import { DEFAULT_QUEST_RISK_LEVEL } from '@/lib/quest-risk';
import { TASK_CATEGORIES } from '@/lib/task-categories';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import type {
  CategoryQuestDefaults,
  QuestDefaultsPresetId,
  QuestDefaultsSettings,
  QuestRiskLevel,
  TaskCategory,
} from '@/types/narrative';

export const QUEST_DEFAULTS_APPLIED_COPY = 'Defaults applied. You can adjust anything.';

export const QUEST_DEFAULTS_PRESETS: Array<{
  id: QuestDefaultsPresetId;
  label: string;
  description: string;
}> = [
  {
    id: 'low-friction',
    label: 'Low Friction Mode',
    description: 'Starter on, prep encouraged, standard risk.',
  },
  {
    id: 'deep-work',
    label: 'Deep Work Mode',
    description: 'Desk location and focus for work and study.',
  },
  {
    id: 'recovery',
    label: 'Recovery Mode',
    description: 'Gentle health and cleaning defaults with rest rewards.',
  },
];

export function createEmptyQuestDefaultsSettings(): QuestDefaultsSettings {
  return { byCategory: {} };
}

export function getCategoryQuestDefaults(
  settings: QuestDefaultsSettings | undefined,
  category: TaskCategory,
): CategoryQuestDefaults {
  return settings?.byCategory?.[category] ?? {};
}

export function hasCategoryQuestDefaults(defaults: CategoryQuestDefaults): boolean {
  return (
    defaults.defaultRiskLevel != null ||
    defaults.defaultStarterEnabled != null ||
    Boolean(defaults.defaultPrepStep?.trim()) ||
    Boolean(defaults.defaultAfterQuestReward?.trim()) ||
    Boolean(defaults.defaultPlannedTimeLabel?.trim()) ||
    Boolean(defaults.defaultPlannedLocation?.trim()) ||
    Boolean(defaults.defaultAfterCurrentHabit?.trim()) ||
    defaults.defaultMarkAsFocus != null
  );
}

export function buildImplementationIntentionFromDefaults(
  defaults: CategoryQuestDefaults,
  taskTitle: string,
): string | undefined {
  const trimmedTask = taskTitle.trim();
  if (defaults.defaultAfterCurrentHabit?.trim()) {
    return buildHabitStackPlan(defaults.defaultAfterCurrentHabit, trimmedTask);
  }

  const time = defaults.defaultPlannedTimeLabel?.trim();
  const location = defaults.defaultPlannedLocation?.trim();

  if (time && location) {
    return `${time} at ${location}: ${trimmedTask}`;
  }
  if (time) {
    return buildTimedPlan(time, trimmedTask);
  }
  if (location) {
    return trimmedTask ? `At ${location}: ${trimmedTask}` : `At ${location}`;
  }

  return undefined;
}

export type ResolvedAddQuestDefaults = {
  riskLevel?: QuestRiskLevel;
  starterEnabled?: boolean;
  starterTitle?: string;
  prepEnabled?: boolean;
  prepStepTitle?: string;
  rewardEnabled?: boolean;
  afterQuestReward?: string;
  plannedTimeLabel?: string;
  plannedLocation?: string;
  afterCurrentHabit?: string;
  focusPinned?: boolean;
  implementationIntention?: string;
};

export function resolveAddQuestDefaults(
  settings: QuestDefaultsSettings | undefined,
  category: TaskCategory,
  taskTitle: string,
): ResolvedAddQuestDefaults {
  const defaults = getCategoryQuestDefaults(settings, category);
  if (!hasCategoryQuestDefaults(defaults)) {
    return {};
  }

  const trimmedTask = taskTitle.trim();
  const resolved: ResolvedAddQuestDefaults = {};

  if (defaults.defaultRiskLevel) {
    resolved.riskLevel = defaults.defaultRiskLevel;
  }

  if (defaults.defaultStarterEnabled != null) {
    resolved.starterEnabled = defaults.defaultStarterEnabled;
    if (defaults.defaultStarterEnabled && trimmedTask) {
      resolved.starterTitle = generateStarterTaskTitle(trimmedTask, category);
    }
  }

  if (defaults.defaultPrepStep?.trim()) {
    resolved.prepEnabled = true;
    resolved.prepStepTitle = defaults.defaultPrepStep.trim();
  }

  if (defaults.defaultAfterQuestReward?.trim()) {
    resolved.rewardEnabled = true;
    resolved.afterQuestReward = defaults.defaultAfterQuestReward.trim();
  }

  if (defaults.defaultPlannedTimeLabel?.trim()) {
    resolved.plannedTimeLabel = defaults.defaultPlannedTimeLabel.trim();
  }

  if (defaults.defaultPlannedLocation?.trim()) {
    resolved.plannedLocation = defaults.defaultPlannedLocation.trim();
  }

  if (defaults.defaultAfterCurrentHabit?.trim()) {
    resolved.afterCurrentHabit = defaults.defaultAfterCurrentHabit.trim();
  }

  if (defaults.defaultMarkAsFocus != null) {
    resolved.focusPinned = defaults.defaultMarkAsFocus;
  }

  const plan = buildImplementationIntentionFromDefaults(defaults, trimmedTask);
  if (plan) {
    resolved.implementationIntention = plan;
  }

  return resolved;
}

function categoryDefaultsMap(
  entries: Partial<Record<TaskCategory, CategoryQuestDefaults>>,
): QuestDefaultsSettings['byCategory'] {
  return entries;
}

export function applyQuestDefaultsPreset(presetId: QuestDefaultsPresetId): QuestDefaultsSettings {
  switch (presetId) {
    case 'low-friction':
      return {
        activePresetId: presetId,
        byCategory: categoryDefaultsMap(
          Object.fromEntries(
            TASK_CATEGORIES.map((category) => [
              category,
              {
                defaultStarterEnabled: true,
                defaultPrepStep: getDefaultPrepPreset(category),
                defaultRiskLevel: 'standard' as QuestRiskLevel,
              },
            ]),
          ) as Partial<Record<TaskCategory, CategoryQuestDefaults>>,
        ),
      };
    case 'deep-work':
      return {
        activePresetId: presetId,
        byCategory: categoryDefaultsMap({
          work: {
            defaultPlannedLocation: 'Desk',
            defaultMarkAsFocus: true,
            defaultRiskLevel: 'standard',
          },
          study: {
            defaultPlannedLocation: 'Desk',
            defaultMarkAsFocus: true,
            defaultRiskLevel: 'standard',
          },
        }),
      };
    case 'recovery':
      return {
        activePresetId: presetId,
        byCategory: categoryDefaultsMap({
          health: {
            defaultStarterEnabled: true,
            defaultRiskLevel: 'low',
            defaultAfterQuestReward: 'Rest for 5 minutes',
          },
          cleaning: {
            defaultStarterEnabled: true,
            defaultRiskLevel: 'low',
          },
        }),
      };
  }
}

export function mergeCategoryQuestDefaults(
  current: CategoryQuestDefaults,
  updates: Partial<CategoryQuestDefaults>,
): CategoryQuestDefaults {
  const next: CategoryQuestDefaults = { ...current };

  for (const [key, value] of Object.entries(updates) as Array<
    [keyof CategoryQuestDefaults, CategoryQuestDefaults[keyof CategoryQuestDefaults]]
  >) {
    if (value === undefined || value === null || value === '') {
      delete next[key];
    } else if (typeof value === 'string') {
      const trimmed = value.trim();
      if (trimmed.length === 0) {
        delete next[key];
      } else {
        (next as Record<string, string>)[key] = trimmed;
      }
    } else {
      (next as Record<string, boolean | QuestRiskLevel>)[key] = value;
    }
  }

  return next;
}

export function updateCategoryQuestDefaultsInSettings(
  settings: QuestDefaultsSettings,
  category: TaskCategory,
  updates: Partial<CategoryQuestDefaults>,
): QuestDefaultsSettings {
  const merged = mergeCategoryQuestDefaults(getCategoryQuestDefaults(settings, category), updates);
  const byCategory = { ...settings.byCategory };

  if (hasCategoryQuestDefaults(merged)) {
    byCategory[category] = merged;
  } else {
    delete byCategory[category];
  }

  return {
    ...settings,
    byCategory,
    activePresetId: undefined,
  };
}

export function sanitizeCategoryQuestDefaults(raw: unknown): CategoryQuestDefaults | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  const sanitized: CategoryQuestDefaults = {};

  const risk = record.defaultRiskLevel;
  if (risk === 'low' || risk === 'standard' || risk === 'high') {
    sanitized.defaultRiskLevel = risk;
  }

  if (record.defaultStarterEnabled === true) {
    sanitized.defaultStarterEnabled = true;
  } else if (record.defaultStarterEnabled === false) {
    sanitized.defaultStarterEnabled = false;
  }

  if (typeof record.defaultPrepStep === 'string' && record.defaultPrepStep.trim()) {
    sanitized.defaultPrepStep = record.defaultPrepStep.trim();
  }

  if (typeof record.defaultAfterQuestReward === 'string' && record.defaultAfterQuestReward.trim()) {
    sanitized.defaultAfterQuestReward = record.defaultAfterQuestReward.trim();
  }

  if (typeof record.defaultPlannedTimeLabel === 'string' && record.defaultPlannedTimeLabel.trim()) {
    sanitized.defaultPlannedTimeLabel = record.defaultPlannedTimeLabel.trim();
  }

  if (typeof record.defaultPlannedLocation === 'string' && record.defaultPlannedLocation.trim()) {
    sanitized.defaultPlannedLocation = record.defaultPlannedLocation.trim();
  }

  if (typeof record.defaultAfterCurrentHabit === 'string' && record.defaultAfterCurrentHabit.trim()) {
    sanitized.defaultAfterCurrentHabit = record.defaultAfterCurrentHabit.trim();
  }

  if (record.defaultMarkAsFocus === true) {
    sanitized.defaultMarkAsFocus = true;
  } else if (record.defaultMarkAsFocus === false) {
    sanitized.defaultMarkAsFocus = false;
  }

  return hasCategoryQuestDefaults(sanitized) ? sanitized : null;
}

export function sanitizeQuestDefaultsSettings(raw: unknown): QuestDefaultsSettings {
  if (!raw || typeof raw !== 'object') {
    return createEmptyQuestDefaultsSettings();
  }

  const record = raw as Record<string, unknown>;
  const byCategory: Partial<Record<TaskCategory, CategoryQuestDefaults>> = {};

  if (record.byCategory && typeof record.byCategory === 'object') {
    for (const category of TASK_CATEGORIES) {
      const sanitized = sanitizeCategoryQuestDefaults(
        (record.byCategory as Record<string, unknown>)[category],
      );
      if (sanitized) {
        byCategory[category] = sanitized;
      }
    }
  }

  const activePresetId = record.activePresetId;
  const presetValid =
    activePresetId === 'low-friction' ||
    activePresetId === 'deep-work' ||
    activePresetId === 'recovery';

  return {
    byCategory,
    ...(presetValid ? { activePresetId } : {}),
  };
}

export function formatCategoryDefaultsSummary(defaults: CategoryQuestDefaults): string {
  const parts: string[] = [];
  if (defaults.defaultStarterEnabled) parts.push('starter');
  if (defaults.defaultPrepStep) parts.push('prep');
  if (defaults.defaultAfterQuestReward) parts.push('reward');
  if (defaults.defaultPlannedTimeLabel) parts.push('time');
  if (defaults.defaultPlannedLocation) parts.push('location');
  if (defaults.defaultAfterCurrentHabit) parts.push('habit stack');
  if (defaults.defaultMarkAsFocus) parts.push('focus');
  if (defaults.defaultRiskLevel && defaults.defaultRiskLevel !== DEFAULT_QUEST_RISK_LEVEL) {
    parts.push(`${defaults.defaultRiskLevel} risk`);
  }
  return parts.length > 0 ? parts.join(' · ') : 'No defaults set';
}
