import { createNeuroNetVariations } from '@/lib/quest-variation-builders/neuronet';
import { createNoirVariations } from '@/lib/quest-variation-builders/noir';
import {
  enrichChaptersWithVariations,
  buildChapterVariationContext,
  createVariationsFromPatterns,
  resolveTemplateVariations,
} from '@/lib/quest-variation-builders/shared';
import { resolveStakesForUniverse } from '@/lib/quest-variation-builders/stakes';
import type {
  ChapterVariationContext,
  SagaVariationProfile,
  UniverseVariationType,
  VariationBuilder,
} from '@/lib/quest-variation-builders/types';
import { TASK_CATEGORIES } from '@/lib/quest-variation-builders/types';
import { createWildWestVariations } from '@/lib/quest-variation-builders/wild-west';
import type { Chapter } from '@/types/narrative';

export {
  buildChapterVariationContext,
  createVariationsFromPatterns,
  enrichChaptersWithVariations,
  resolveTemplateVariations,
  resolveStakesForUniverse,
  TASK_CATEGORIES,
};
export type {
  ChapterVariationContext,
  SagaVariationProfile,
  UniverseVariationType,
  VariationBuilder,
};

export { createWildWestVariations, createNeuroNetVariations, createNoirVariations };

const BUILDERS: Record<UniverseVariationType, VariationBuilder> = {
  'wild-west': createWildWestVariations,
  neuronet: createNeuroNetVariations,
  noir: createNoirVariations,
};

export function getVariationBuilder(universeType: UniverseVariationType): VariationBuilder {
  return BUILDERS[universeType];
}

export function enrichSagaChapters(
  chapters: Chapter[],
  profile: SagaVariationProfile,
): Chapter[] {
  return enrichChaptersWithVariations(chapters, profile, getVariationBuilder(profile.universeType));
}

export const WILD_WEST_VARIATION_PROFILE = {
  universeType: 'wild-west',
  locationName: 'Dustfall',
  terminology: {
    questTerm: 'Quest',
    reputationTerm: 'Reputation',
    mapTerm: 'Territory Map',
    chapterCompleteTerm: 'Chapter Cleared',
  },
} as const satisfies Omit<SagaVariationProfile, 'villainName'>;

export const NEURONET_VARIATION_PROFILE = {
  universeType: 'neuronet',
  locationName: 'Neon Spire',
  terminology: {
    questTerm: 'Operation',
    reputationTerm: 'Network Standing',
    mapTerm: 'Sector Map',
    chapterCompleteTerm: 'Sector Secured',
  },
} as const satisfies Omit<SagaVariationProfile, 'villainName'>;

export const NOIR_VARIATION_PROFILE = {
  universeType: 'noir',
  locationName: 'Grayhaven',
  terminology: {
    questTerm: 'Lead',
    reputationTerm: 'Detective Standing',
    mapTerm: 'Case Board',
    chapterCompleteTerm: 'Case Advanced',
  },
} as const satisfies Omit<SagaVariationProfile, 'villainName'>;
