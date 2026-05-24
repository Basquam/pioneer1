export type QuestCategory = 'chore' | 'study' | 'work' | 'exercise';

export type Quest = {
  id: string;
  themeId: import('@/types/theme').ThemeId;
  realTask: string;
  questTitle: string;
  questSubtitle: string;
  xpReward: number;
  threatReduction: number;
  completionLine: string;
  category: QuestCategory;
};

export type QuestState = Quest & {
  completed: boolean;
};
