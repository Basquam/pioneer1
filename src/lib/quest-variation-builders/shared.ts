import type {
  Chapter,
  QuestTemplate,
  QuestTemplateVariation,
  TaskCategory,
} from '@/types/narrative';

import type {
  CategoryVariationPatterns,
  ChapterVariationContext,
  SagaVariationProfile,
  VariationBuilder,
  VariationPatternDef,
} from '@/lib/quest-variation-builders/types';
import { resolveStakesForUniverse } from '@/lib/quest-variation-builders/stakes';
import { TASK_CATEGORIES } from '@/lib/quest-variation-builders/types';

function toVariation(
  chapterId: string,
  category: TaskCategory,
  pattern: VariationPatternDef,
): QuestTemplateVariation {
  return {
    id: `${chapterId}-${category}-${pattern.suffix}`,
    narrativeTitlePattern: pattern.titlePattern,
    narrativeDescriptionPattern: pattern.descriptionPattern,
    intensity: pattern.intensity,
    tags: pattern.tags,
  };
}

export function buildChapterVariationContext(
  chapter: Chapter,
  profile: SagaVariationProfile,
): ChapterVariationContext {
  return {
    chapterId: chapter.id,
    chapterTitle: chapter.title,
    chapterOrder: chapter.order,
    territoryName: chapter.territoryName,
    locationName: profile.locationName,
    villainName: profile.villainName,
    stakes: resolveStakesForUniverse(profile.universeType, chapter.order),
    questTerm: profile.terminology.questTerm,
    reputationTerm: profile.terminology.reputationTerm,
    mapTerm: profile.terminology.mapTerm,
    chapterCompleteTerm: profile.terminology.chapterCompleteTerm,
  };
}

export function createVariationsFromPatterns(
  patterns: CategoryVariationPatterns,
  context: ChapterVariationContext,
): Partial<Record<TaskCategory, QuestTemplateVariation[]>> {
  const result: Partial<Record<TaskCategory, QuestTemplateVariation[]>> = {};

  for (const category of TASK_CATEGORIES) {
    result[category] = patterns[category](context).map((pattern) =>
      toVariation(context.chapterId, category, pattern),
    );
  }

  return result;
}

export function createUniverseVariationBuilder(
  patterns: CategoryVariationPatterns,
): VariationBuilder {
  return (context) => createVariationsFromPatterns(patterns, context);
}

/** Hand-written template variations win; optional category overrides come next; then generated. */
export function resolveTemplateVariations(
  template: QuestTemplate,
  generated: Partial<Record<TaskCategory, QuestTemplateVariation[]>>,
  overrides?: Partial<Record<TaskCategory, QuestTemplateVariation[]>>,
): QuestTemplateVariation[] | undefined {
  if (template.variations?.length) {
    return template.variations;
  }

  const override = overrides?.[template.category];
  if (override?.length) {
    return override;
  }

  return generated[template.category];
}

export function enrichChaptersWithVariations(
  chapters: Chapter[],
  profile: SagaVariationProfile,
  builder: VariationBuilder,
  overridesByChapterId?: Record<
    string,
    Partial<Record<TaskCategory, QuestTemplateVariation[]>>
  >,
): Chapter[] {
  return chapters.map((chapter) => {
    const context = buildChapterVariationContext(chapter, profile);
    const generated = builder(context);
    const chapterOverrides = overridesByChapterId?.[chapter.id];

    return {
      ...chapter,
      questTemplates: chapter.questTemplates.map((template) => ({
        ...template,
        variations: resolveTemplateVariations(template, generated, chapterOverrides),
      })),
    };
  });
}
