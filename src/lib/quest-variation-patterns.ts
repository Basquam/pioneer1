import type { QuestNarrativeContext } from '@/lib/quest-narrative-context';
import type { QuestTemplateVariation } from '@/types/narrative';

const TOKEN_PATTERN = /\{([a-zA-Z]+)\}/g;

export function applyVariationPattern(
  pattern: string,
  context: QuestNarrativeContext,
): string {
  return pattern.replace(TOKEN_PATTERN, (_match, token: string) => {
    const value = context[token as keyof QuestNarrativeContext];
    return value ?? `{${token}}`;
  });
}

export function applyQuestVariation(
  variation: QuestTemplateVariation,
  context: QuestNarrativeContext,
): { narrativeTitle: string; narrativeDescription: string } {
  const narrativeTitle = applyVariationPattern(variation.narrativeTitlePattern, context);
  let narrativeDescription = applyVariationPattern(
    variation.narrativeDescriptionPattern,
    context,
  );

  if (context.templateHook && !narrativeDescription.includes(context.templateHook)) {
    narrativeDescription = `${narrativeDescription} ${context.templateHook}`;
  }

  return { narrativeTitle, narrativeDescription };
}
