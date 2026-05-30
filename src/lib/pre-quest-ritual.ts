export const PRE_QUEST_RITUAL_PRESETS = [
  'Play one focus song',
  'Take three deep breaths',
  'Make coffee or tea',
  'Put on headphones',
  'Start ambience',
  'Stretch for 30 seconds',
  'Read the character motivation line',
] as const;

export type PreQuestRitualPreset = (typeof PRE_QUEST_RITUAL_PRESETS)[number];

export const MOTIVATION_LINE_PRESET: PreQuestRitualPreset = 'Read the character motivation line';

export type PreQuestRitualCopy = {
  sectionPrompt: string;
  helperText: string;
  universeHint: string;
  focusLinePrefix: string;
  cardLabel: string;
  ritualDoneLabel: string;
  ritualCompleteHint: string;
};

const PRE_QUEST_RITUAL_COPY: Record<string, PreQuestRitualCopy> = {
  'dust-and-iron': {
    sectionPrompt: 'Before I start, I will…',
    helperText: 'Pair the quest with a small enjoyable moment first.',
    universeHint: 'Steady your hand before the ride.',
    focusLinePrefix: 'Before you begin',
    cardLabel: 'Start ritual',
    ritualDoneLabel: 'RITUAL DONE',
    ritualCompleteHint: 'Ready — take the first move.',
  },
  neuronet: {
    sectionPrompt: 'Before I start, I will…',
    helperText: 'Pair the quest with a small enjoyable moment first.',
    universeHint: 'Prime the signal before execution.',
    focusLinePrefix: 'Before you begin',
    cardLabel: 'Start ritual',
    ritualDoneLabel: 'RITUAL DONE',
    ritualCompleteHint: 'Ready — run the smallest action.',
  },
  'neon-ashes': {
    sectionPrompt: 'Before I start, I will…',
    helperText: 'Pair the quest with a small enjoyable moment first.',
    universeHint: 'Set the mood before following the lead.',
    focusLinePrefix: 'Before you begin',
    cardLabel: 'Start ritual',
    ritualDoneLabel: 'RITUAL DONE',
    ritualCompleteHint: 'Ready — follow the lead.',
  },
};

export function getPreQuestRitualCopy(universeId: string): PreQuestRitualCopy {
  return PRE_QUEST_RITUAL_COPY[universeId] ?? PRE_QUEST_RITUAL_COPY['dust-and-iron'];
}

export function isPresetPreQuestRitual(value: string): boolean {
  const trimmed = value.trim();
  return PRE_QUEST_RITUAL_PRESETS.some((preset) => preset === trimmed);
}

export function isMotivationLinePreset(value: string | undefined): boolean {
  return value?.trim() === MOTIVATION_LINE_PRESET;
}

export function getDefaultPreQuestRitualPreset(): PreQuestRitualPreset {
  return PRE_QUEST_RITUAL_PRESETS[0];
}

export function formatPreQuestRitualCardLine(ritual: string, universeId: string): string {
  const { cardLabel } = getPreQuestRitualCopy(universeId);
  return `${cardLabel}: ${ritual.trim()}`;
}

export function formatPreQuestRitualFocusLine(
  ritual: string,
  universeId: string,
  motivationLine?: string,
): string {
  const { focusLinePrefix } = getPreQuestRitualCopy(universeId);
  const display = resolvePreQuestRitualDisplay(ritual, motivationLine);
  return `${focusLinePrefix}: ${display}`;
}

export function resolvePreQuestRitualDisplay(ritual: string, motivationLine?: string): string {
  if (isMotivationLinePreset(ritual) && motivationLine?.trim()) {
    return motivationLine.trim();
  }
  return ritual.trim();
}
