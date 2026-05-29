import type { QuestRiskLevel } from '@/types/narrative';

export type QuestRiskOption = {
  level: QuestRiskLevel;
  simpleLabel: string;
  description: string;
};

export type QuestRiskUniverseLabels = Record<QuestRiskLevel, string>;

const RISK_SIMPLE_LABELS: Record<QuestRiskLevel, string> = {
  low: 'Low',
  standard: 'Standard',
  high: 'High',
};

const RISK_DESCRIPTIONS: Record<QuestRiskLevel, string> = {
  low: 'Quick and easy',
  standard: 'Normal effort',
  high: 'Challenging or emotionally heavy',
};

const UNIVERSE_RISK_LABELS: Record<string, QuestRiskUniverseLabels> = {
  'dust-and-iron': {
    low: 'Short Patrol',
    standard: 'Town Duty',
    high: 'High Noon Move',
  },
  neuronet: {
    low: 'Clean Signal',
    standard: 'Active Operation',
    high: 'Black Ice Run',
  },
  'neon-ashes': {
    low: 'Small Lead',
    standard: 'Open Case',
    high: 'Dangerous Testimony',
  },
};

export const QUEST_RISK_LEVELS: QuestRiskLevel[] = ['low', 'standard', 'high'];

export function getQuestRiskOptions(): QuestRiskOption[] {
  return QUEST_RISK_LEVELS.map((level) => ({
    level,
    simpleLabel: RISK_SIMPLE_LABELS[level],
    description: RISK_DESCRIPTIONS[level],
  }));
}

export function getQuestRiskUniverseLabels(universeId: string): QuestRiskUniverseLabels {
  return UNIVERSE_RISK_LABELS[universeId] ?? UNIVERSE_RISK_LABELS['dust-and-iron'];
}

export function getQuestRiskFlavorLabel(level: QuestRiskLevel, universeId: string): string {
  return getQuestRiskUniverseLabels(universeId)[level];
}

export function resolveQuestRiskLevel(level: QuestRiskLevel | undefined): QuestRiskLevel {
  return level ?? 'standard';
}

export function isHighRiskQuest(level: QuestRiskLevel | undefined): boolean {
  return resolveQuestRiskLevel(level) === 'high';
}

export function formatQuestRiskCardLine(level: QuestRiskLevel, universeId: string): string {
  const flavor = getQuestRiskFlavorLabel(level, universeId);
  const simple = RISK_SIMPLE_LABELS[level];
  return `Risk: ${simple} · ${flavor}`;
}

export function formatQuestRiskFocusLine(level: QuestRiskLevel, universeId: string): string {
  const flavor = getQuestRiskFlavorLabel(level, universeId);
  const description = RISK_DESCRIPTIONS[level];
  return `${flavor} — ${description}`;
}

export function getHighRiskSuggestionLines(options: {
  starterEnabled: boolean;
  prepEnabled: boolean;
}): string[] {
  const suggestions: string[] = [];
  if (!options.starterEnabled) {
    suggestions.push('Consider enabling a two-minute starter move.');
  }
  if (!options.prepEnabled) {
    suggestions.push('Consider adding a prep step.');
  }
  suggestions.push('Consider adding a when/where plan in Improve Quest.');
  return suggestions;
}

export function sanitizeQuestRiskLevel(raw: unknown): QuestRiskLevel | null {
  if (raw === 'low' || raw === 'standard' || raw === 'high') return raw;
  return null;
}

export const DEFAULT_QUEST_RISK_LEVEL: QuestRiskLevel = 'standard';
