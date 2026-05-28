import type {
  QuestTemplateVariation,
  TaskCategory,
  UniverseTerminology,
} from '@/types/narrative';

export type UniverseVariationType = 'wild-west' | 'neuronet' | 'noir';

export type ChapterVariationContext = {
  chapterId: string;
  chapterTitle: string;
  chapterOrder: number;
  territoryName: string;
  locationName: string;
  villainName: string;
  stakes: string;
  questTerm: string;
  reputationTerm: string;
  mapTerm: string;
  chapterCompleteTerm: string;
};

export type SagaVariationProfile = {
  universeType: UniverseVariationType;
  locationName: string;
  villainName: string;
  terminology: Pick<
    UniverseTerminology,
    'questTerm' | 'reputationTerm' | 'mapTerm' | 'chapterCompleteTerm'
  >;
};

export type VariationPatternDef = {
  suffix: string;
  titlePattern: string;
  descriptionPattern: string;
  intensity: QuestTemplateVariation['intensity'];
  tags: QuestTemplateVariation['tags'];
};

export type CategoryVariationPatterns = Record<
  TaskCategory,
  (context: ChapterVariationContext) => VariationPatternDef[]
>;

export type VariationBuilder = (
  context: ChapterVariationContext,
) => Partial<Record<TaskCategory, QuestTemplateVariation[]>>;

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
