import type { ThemeId } from '@/types/theme';

export type StoryChapter = {
  id: string;
  themeId: ThemeId;
  index: number;
  title: string;
  summary: string;
  requiredQuests: number;
  dialogue: string;
};
