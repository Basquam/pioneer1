import type { BoardQuest } from '@/types/narrative';

export type QuestStartRitualCopy = {
  startButtonLabel: string;
  step1Prompt: string;
  step2Prompt: string;
  step3Prompt: string;
  advanceLabel: string;
  readyHint: string;
};

const QUEST_START_RITUAL_COPY: Record<string, QuestStartRitualCopy> = {
  'dust-and-iron': {
    startButtonLabel: 'START RITUAL',
    step1Prompt: 'Read the trail.',
    step2Prompt: 'Take the first move.',
    step3Prompt: 'Ride.',
    advanceLabel: 'NEXT',
    readyHint: 'Ready when you are.',
  },
  neuronet: {
    startButtonLabel: 'START RITUAL',
    step1Prompt: 'Scan the operation.',
    step2Prompt: 'Run the smallest executable action.',
    step3Prompt: 'Execute.',
    advanceLabel: 'NEXT',
    readyHint: 'Ready when you are.',
  },
  'neon-ashes': {
    startButtonLabel: 'START RITUAL',
    step1Prompt: 'Review the lead.',
    step2Prompt: 'Follow the first clue.',
    step3Prompt: 'Begin the case.',
    advanceLabel: 'NEXT',
    readyHint: 'Ready when you are.',
  },
};

export function getQuestStartRitualCopy(universeId: string): QuestStartRitualCopy {
  return QUEST_START_RITUAL_COPY[universeId] ?? QUEST_START_RITUAL_COPY['dust-and-iron'];
}

export function getRitualMissionLine(quest: Pick<BoardQuest, 'narrativeTitle'>): string {
  return quest.narrativeTitle;
}

export function getRitualFirstMoveLine(
  quest: Pick<BoardQuest, 'starterTaskTitle' | 'originalTitle' | 'narrativeTitle'>,
): string {
  if (quest.starterTaskTitle?.trim()) return quest.starterTaskTitle.trim();
  return quest.originalTitle.trim() || quest.narrativeTitle;
}

export type QuestFocusCopy = {
  tagline: string;
  completeLabel: string;
  exitLabel: string;
  identityVoteLabel: string;
  motivationBadge: string;
  completedHint: string;
};

type QuestFocusSourceUi = {
  templateQuestLabel: string;
  focusQuestLabel: string;
  yourQuestLabel: string;
  templateQuestClearedLabel: string;
  userQuestClearedLabel: string;
};

const QUEST_FOCUS_COPY: Record<string, QuestFocusCopy> = {
  'dust-and-iron': {
    tagline: 'Ride the trail. One move at a time.',
    completeLabel: 'COMPLETE QUEST',
    exitLabel: 'EXIT FOCUS',
    identityVoteLabel: 'IDENTITY VOTE',
    motivationBadge: 'ALLY WORD',
    completedHint: 'This one is cleared. Exit focus when you are ready.',
  },
  neuronet: {
    tagline: 'Execute the operation. Keep the signal clean.',
    completeLabel: 'COMPLETE QUEST',
    exitLabel: 'EXIT FOCUS',
    identityVoteLabel: 'IDENTITY VOTE',
    motivationBadge: 'SIGNAL BOOST',
    completedHint: 'This operation is complete. Exit focus when you are ready.',
  },
  'neon-ashes': {
    tagline: 'Follow the lead. Stay with the case.',
    completeLabel: 'COMPLETE QUEST',
    exitLabel: 'EXIT FOCUS',
    identityVoteLabel: 'IDENTITY VOTE',
    motivationBadge: 'CASE NOTE',
    completedHint: 'This lead is closed. Exit focus when you are ready.',
  },
};

function titleCaseTerm(label: string): string {
  const lower = label.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export function getQuestFocusCopy(universeId: string): QuestFocusCopy {
  return QUEST_FOCUS_COPY[universeId] ?? QUEST_FOCUS_COPY['dust-and-iron'];
}

export function getQuestFocusSourceLabel(
  quest: Pick<BoardQuest, 'source' | 'isDailyFocus'>,
  ui: QuestFocusSourceUi,
): string {
  if (quest.source === 'template') {
    return `Chapter ${titleCaseTerm(ui.templateQuestLabel)}`;
  }

  if (quest.isDailyFocus) {
    return ui.focusQuestLabel;
  }

  return ui.yourQuestLabel;
}

export function getQuestFocusClearedLabel(
  quest: Pick<BoardQuest, 'source'>,
  ui: Pick<QuestFocusSourceUi, 'templateQuestClearedLabel' | 'userQuestClearedLabel'>,
): string {
  return quest.source === 'template' ? ui.templateQuestClearedLabel : ui.userQuestClearedLabel;
}

export function formatFocusIdentityVotePreview(traitLabel: string): string {
  return `+1 ${traitLabel}`;
}

export function shortenMotivationLine(line: string, maxLength = 120): string {
  const trimmed = line.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength - 1).trimEnd()}…`;
}
