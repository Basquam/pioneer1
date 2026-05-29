import {
  findRoutineTitleCatalogEntry,
  normalizeRoutineTitleKey,
} from '@/data/narrative/routine-title-variations';
import { applyQuestVariation } from '@/lib/quest-variation-patterns';
import { buildQuestNarrativeContext, buildDefaultNarrativeDescription, buildDefaultNarrativeTitle } from '@/lib/quest-narrative-context';
import {
  pickQuestVariation,
  type PickQuestVariationOptions,
} from '@/lib/quest-variation-picker';
import type {
  Chapter,
  PlayerProgress,
  QuestVariationIntensity,
  RoutineRepetitionRecord,
  Saga,
  TaskCategory,
  Universe,
  UserQuest,
} from '@/types/narrative';

export const ROUTINE_VARIATION_TONE_CYCLE: QuestVariationIntensity[] = ['calm', 'normal', 'urgent'];

export const ROUTINE_FRESHNESS_HINTS = [
  'Same habit, new proof.',
  'Routine is how the role becomes real.',
  'This one counts because you returned.',
] as const;

export const ROUTINE_REPETITION_LOOKBACK = 3;
export const ROUTINE_FRESH_ANGLE_EVERY = 3;
export const MAX_ROUTINE_REPETITION_KEYS = 48;

export function resolveRoutineRepetitionKey(
  quest: Pick<UserQuest, 'originalTitle' | 'category' | 'generatedFromRecurringQuestId'>,
): string {
  if (quest.generatedFromRecurringQuestId) {
    return `recurring:${quest.generatedFromRecurringQuestId}`;
  }
  return `task:${normalizeRoutineTitleKey(quest.originalTitle)}:${quest.category}`;
}

export function getRoutineRepetitionRecord(
  progress: Pick<PlayerProgress, 'routineRepetitionByKey'>,
  key: string,
): RoutineRepetitionRecord | undefined {
  return progress.routineRepetitionByKey?.[key];
}

export function pickRoutineVariationTone(completionCount: number): QuestVariationIntensity {
  return ROUTINE_VARIATION_TONE_CYCLE[completionCount % ROUTINE_VARIATION_TONE_CYCLE.length] ?? 'normal';
}

export function countSimilarTitleQuests(
  userQuests: UserQuest[],
  originalTitle: string,
  category: TaskCategory,
): number {
  const normalized = normalizeRoutineTitleKey(originalTitle);
  return userQuests.filter(
    (quest) =>
      quest.category === category &&
      normalizeRoutineTitleKey(quest.originalTitle) === normalized,
  ).length;
}

export function isRoutineOrRepeatedQuest(
  quest: Pick<UserQuest, 'originalTitle' | 'category' | 'generatedFromRecurringQuestId'>,
  progress: Pick<PlayerProgress, 'routineRepetitionByKey' | 'userQuests'>,
): boolean {
  if (quest.generatedFromRecurringQuestId) return true;

  const key = resolveRoutineRepetitionKey(quest);
  const record = getRoutineRepetitionRecord(progress, key);
  if (record && record.completionCount >= 1) return true;

  return countSimilarTitleQuests(progress.userQuests, quest.originalTitle, quest.category) >= 2;
}

export function getRoutineFreshnessHint(
  quest: Pick<UserQuest, 'id' | 'originalTitle' | 'category' | 'generatedFromRecurringQuestId'>,
  progress: Pick<PlayerProgress, 'routineRepetitionByKey' | 'userQuests'>,
): string | null {
  if (!isRoutineOrRepeatedQuest(quest, progress)) return null;

  const hintIndex =
    Math.abs(hashString(`${quest.id}:${quest.originalTitle}`)) % ROUTINE_FRESHNESS_HINTS.length;
  return ROUTINE_FRESHNESS_HINTS[hintIndex] ?? ROUTINE_FRESHNESS_HINTS[0];
}

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0;
  }
  return hash;
}

function pickRotatedCatalogTitle(
  titles: string[],
  repetitionRecord: RoutineRepetitionRecord | undefined,
  completionCount: number,
): string | null {
  if (titles.length === 0) return null;

  const lastUsed = repetitionRecord?.lastNarrativeTitleUsed;
  const startIndex = completionCount % titles.length;

  for (let offset = 0; offset < titles.length; offset += 1) {
    const candidate = titles[(startIndex + offset) % titles.length];
    if (candidate && candidate !== lastUsed) {
      return candidate;
    }
  }

  return titles[startIndex] ?? titles[0] ?? null;
}

function shouldAddFreshAngle(completionCount: number): boolean {
  return completionCount > 0 && completionCount % ROUTINE_FRESH_ANGLE_EVERY === 0;
}

function pickFreshAngleLine(
  universeId: string,
  originalTitle: string,
  completionCount: number,
): string | undefined {
  const catalog = findRoutineTitleCatalogEntry(originalTitle);
  const angles = catalog?.freshAnglesByUniverse?.[universeId];
  if (!angles?.length) return undefined;
  return angles[completionCount % angles.length];
}

export type RoutineNarrativeInput = {
  originalTitle: string;
  category: TaskCategory;
  universe: Universe;
  saga: Saga;
  chapter: Chapter;
  recentQuests: UserQuest[];
  repetitionRecord?: RoutineRepetitionRecord;
  generatedFromRecurringQuestId?: string;
};

export type RoutineNarrativeResult = {
  narrativeTitle: string;
  narrativeDescription: string;
  usedVariationId?: string;
  routineVariationTone?: QuestVariationIntensity;
  routineFreshAngleLine?: string;
};

/** Builds narrative copy with routine-aware rotation on top of template variations. */
export function buildRoutineAwareNarrative(input: RoutineNarrativeInput): RoutineNarrativeResult {
  const {
    originalTitle,
    category,
    universe,
    saga,
    chapter,
    recentQuests,
    repetitionRecord,
  } = input;

  const template = chapter.questTemplates.find((entry) => entry.category === category);
  const completionCount = repetitionRecord?.completionCount ?? 0;
  const tone = pickRoutineVariationTone(completionCount);
  const isRepeat = Boolean(
    repetitionRecord &&
      (completionCount >= 1 || repetitionRecord.recentVariationIds.length > 0),
  );

  const narrativeContext = buildQuestNarrativeContext(
    originalTitle,
    category,
    universe,
    saga,
    chapter,
    template?.title,
    template?.dramaticHook,
  );

  const pickerOptions: PickQuestVariationOptions | undefined = isRepeat
    ? {
        excludeVariationIds: repetitionRecord?.recentVariationIds,
        excludeNarrativeTitle: repetitionRecord?.lastNarrativeTitleUsed,
        preferredIntensity: tone,
      }
    : { preferredIntensity: tone };

  const variation = template?.variations?.length
    ? pickQuestVariation(template.variations, recentQuests, chapter.id, category, pickerOptions)
    : null;

  let narrativeTitle: string;
  let narrativeDescription: string;
  let usedVariationId: string | undefined;

  if (variation) {
    const applied = applyQuestVariation(variation, narrativeContext);
    narrativeTitle = applied.narrativeTitle;
    narrativeDescription = applied.narrativeDescription;
    usedVariationId = variation.id;
  } else {
    narrativeTitle = buildDefaultNarrativeTitle(originalTitle, category, template?.title);
    narrativeDescription = buildDefaultNarrativeDescription(
      originalTitle,
      category,
      universe,
      saga,
      chapter,
      template?.dramaticHook,
    );
  }

  if (isRepeat) {
    const catalog = findRoutineTitleCatalogEntry(originalTitle);
    const catalogTitles = catalog?.titlesByUniverse[universe.id];
    if (catalogTitles?.length) {
      const rotated = pickRotatedCatalogTitle(catalogTitles, repetitionRecord, completionCount);
      if (rotated) {
        narrativeTitle = rotated;
      }
    } else if (narrativeTitle === repetitionRecord?.lastNarrativeTitleUsed && variation) {
      const fallback = template?.variations?.find((entry) => entry.id !== variation.id);
      if (fallback) {
        const applied = applyQuestVariation(fallback, narrativeContext);
        narrativeTitle = applied.narrativeTitle;
        narrativeDescription = applied.narrativeDescription;
        usedVariationId = fallback.id;
      }
    }
  }

  const routineFreshAngleLine = shouldAddFreshAngle(completionCount)
    ? pickFreshAngleLine(universe.id, originalTitle, completionCount)
    : undefined;

  return {
    narrativeTitle,
    narrativeDescription,
    ...(usedVariationId ? { usedVariationId } : {}),
    ...(isRepeat || input.generatedFromRecurringQuestId ? { routineVariationTone: tone } : {}),
    ...(routineFreshAngleLine ? { routineFreshAngleLine } : {}),
  };
}

export function createRoutineRepetitionRecord(
  quest: Pick<
    UserQuest,
    'originalTitle' | 'category' | 'generatedFromRecurringQuestId' | 'narrativeTitle' | 'usedVariationId'
  >,
): RoutineRepetitionRecord {
  return {
    originalTitle: quest.originalTitle.trim(),
    category: quest.category,
    ...(quest.generatedFromRecurringQuestId
      ? { generatedFromRecurringQuestId: quest.generatedFromRecurringQuestId }
      : {}),
    lastNarrativeTitleUsed: quest.narrativeTitle,
    recentVariationIds: quest.usedVariationId ? [quest.usedVariationId] : [],
    completionCount: 0,
  };
}

function appendRecentVariationIds(existing: string[], variationId?: string): string[] {
  if (!variationId) return existing;
  return [...existing.filter((id) => id !== variationId), variationId].slice(-ROUTINE_REPETITION_LOOKBACK);
}

export function recordRoutineQuestSpawned(
  progress: PlayerProgress,
  quest: UserQuest,
): PlayerProgress {
  const key = resolveRoutineRepetitionKey(quest);
  const existing = getRoutineRepetitionRecord(progress, key);

  const nextRecord: RoutineRepetitionRecord = existing
    ? {
        ...existing,
        originalTitle: quest.originalTitle.trim(),
        category: quest.category,
        ...(quest.generatedFromRecurringQuestId
          ? { generatedFromRecurringQuestId: quest.generatedFromRecurringQuestId }
          : {}),
        lastNarrativeTitleUsed: quest.narrativeTitle,
        recentVariationIds: appendRecentVariationIds(existing.recentVariationIds, quest.usedVariationId),
      }
    : createRoutineRepetitionRecord(quest);

  return {
    ...progress,
    routineRepetitionByKey: pruneRoutineRepetitionByKey({
      ...progress.routineRepetitionByKey,
      [key]: nextRecord,
    }),
  };
}

export function recordRoutineQuestCompleted(
  progress: PlayerProgress,
  quest: Pick<
    UserQuest,
    'originalTitle' | 'category' | 'generatedFromRecurringQuestId' | 'narrativeTitle' | 'usedVariationId'
  >,
): PlayerProgress {
  const key = resolveRoutineRepetitionKey(quest);
  const existing = getRoutineRepetitionRecord(progress, key);

  const nextRecord: RoutineRepetitionRecord = existing
    ? {
        ...existing,
        lastNarrativeTitleUsed: quest.narrativeTitle,
        recentVariationIds: appendRecentVariationIds(existing.recentVariationIds, quest.usedVariationId),
        completionCount: existing.completionCount + 1,
      }
    : {
        ...createRoutineRepetitionRecord(quest),
        completionCount: 1,
      };

  return {
    ...progress,
    routineRepetitionByKey: pruneRoutineRepetitionByKey({
      ...progress.routineRepetitionByKey,
      [key]: nextRecord,
    }),
  };
}

export function pruneRoutineRepetitionByKey(
  records: Record<string, RoutineRepetitionRecord>,
): Record<string, RoutineRepetitionRecord> {
  const entries = Object.entries(records);
  if (entries.length <= MAX_ROUTINE_REPETITION_KEYS) {
    return records;
  }

  const sorted = entries.sort(
    (a, b) => b[1].completionCount - a[1].completionCount || a[0].localeCompare(b[0]),
  );

  return Object.fromEntries(sorted.slice(0, MAX_ROUTINE_REPETITION_KEYS));
}

export function sanitizeRoutineRepetitionByKey(raw: unknown): Record<string, RoutineRepetitionRecord> {
  if (!raw || typeof raw !== 'object') return {};

  const sanitized = Object.fromEntries(
    Object.entries(raw as Record<string, unknown>)
      .map(([key, value]) => {
        const record = sanitizeRoutineRepetitionRecord(value);
        return record ? ([key, record] as const) : null;
      })
      .filter((entry): entry is [string, RoutineRepetitionRecord] => entry !== null),
  );

  return pruneRoutineRepetitionByKey(sanitized);
}

const TASK_CATEGORIES = new Set([
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
]);

function sanitizeRoutineRepetitionRecord(raw: unknown): RoutineRepetitionRecord | null {
  if (!raw || typeof raw !== 'object') return null;

  const record = raw as Record<string, unknown>;
  if (typeof record.originalTitle !== 'string' || record.originalTitle.trim().length === 0) {
    return null;
  }
  if (typeof record.category !== 'string' || !TASK_CATEGORIES.has(record.category)) {
    return null;
  }

  const sanitized: RoutineRepetitionRecord = {
    originalTitle: record.originalTitle.trim(),
    category: record.category as TaskCategory,
    recentVariationIds: [],
    completionCount: 0,
  };

  if (
    typeof record.generatedFromRecurringQuestId === 'string' &&
    record.generatedFromRecurringQuestId.startsWith('recurring-')
  ) {
    sanitized.generatedFromRecurringQuestId = record.generatedFromRecurringQuestId;
  }

  if (typeof record.lastNarrativeTitleUsed === 'string' && record.lastNarrativeTitleUsed.length > 0) {
    sanitized.lastNarrativeTitleUsed = record.lastNarrativeTitleUsed;
  }

  if (Array.isArray(record.recentVariationIds)) {
    sanitized.recentVariationIds = record.recentVariationIds
      .filter((entry): entry is string => typeof entry === 'string' && entry.length > 0)
      .slice(-ROUTINE_REPETITION_LOOKBACK);
  }

  if (typeof record.completionCount === 'number' && Number.isFinite(record.completionCount)) {
    sanitized.completionCount = Math.max(0, Math.floor(record.completionCount));
  }

  return sanitized;
}
