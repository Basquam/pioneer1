import type { ThemeId } from '@/types/theme';

export type PlayerStats = {
  grit: number;
  focus: number;
  legend: number;
};

export type Player = {
  level: number;
  totalXp: number;
  rank: string;
  stats: PlayerStats;
};

export type ThemeProgress = {
  villainInfluence: number;
  storyLine: string;
  unlockedChapterIndex: number;
};

export type GameSave = {
  hasOnboarded: boolean;
  activeThemeId: ThemeId;
  player: Player;
  themeProgress: Record<ThemeId, ThemeProgress>;
  quests: Record<string, boolean>;
};
