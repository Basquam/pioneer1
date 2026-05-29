export const AFTER_QUEST_REWARD_PRESETS = [
  'Make coffee or tea',
  'Listen to one song',
  'Rest for 5 minutes',
  'Play guitar for 5 minutes',
  'Watch one short video',
  'Take a short walk',
] as const;

export type AfterQuestRewardPreset = (typeof AFTER_QUEST_REWARD_PRESETS)[number];

export type AfterQuestRewardCopy = {
  sectionPrompt: string;
  helperText: string;
  universeHint: string;
  focusRitualLine: string;
  cardLabel: string;
};

const AFTER_QUEST_REWARD_COPY: Record<string, AfterQuestRewardCopy> = {
  'dust-and-iron': {
    sectionPrompt: 'After I finish this quest, I will…',
    helperText: 'Pair the task with a small reward you actually want.',
    universeHint: 'Clear the trail, then take your rest.',
    focusRitualLine: 'Finish the quest. Claim the ritual.',
    cardLabel: 'After reward',
  },
  neuronet: {
    sectionPrompt: 'After I finish this quest, I will…',
    helperText: 'Pair the task with a small reward you actually want.',
    universeHint: 'Complete the operation, then release the signal.',
    focusRitualLine: 'Finish the quest. Claim the ritual.',
    cardLabel: 'After reward',
  },
  'neon-ashes': {
    sectionPrompt: 'After I finish this quest, I will…',
    helperText: 'Pair the task with a small reward you actually want.',
    universeHint: 'Close the lead, then take a quiet moment.',
    focusRitualLine: 'Finish the quest. Claim the ritual.',
    cardLabel: 'After reward',
  },
};

export function getAfterQuestRewardCopy(universeId: string): AfterQuestRewardCopy {
  return AFTER_QUEST_REWARD_COPY[universeId] ?? AFTER_QUEST_REWARD_COPY['dust-and-iron'];
}

export function isPresetAfterQuestReward(value: string): boolean {
  const trimmed = value.trim();
  return AFTER_QUEST_REWARD_PRESETS.some((preset) => preset === trimmed);
}

export function formatAfterRewardCardLine(reward: string, universeId: string): string {
  const { cardLabel } = getAfterQuestRewardCopy(universeId);
  return `${cardLabel}: ${reward.trim()}.`;
}

export function formatRewardRitualUnlockedLine(reward: string): string {
  return `Reward ritual unlocked: ${reward.trim()}.`;
}

export function getDefaultAfterQuestRewardPreset(): AfterQuestRewardPreset {
  return AFTER_QUEST_REWARD_PRESETS[0];
}
