export type ThemeId =
  | 'wild-west'
  | 'noir'
  | 'cyberpunk'
  | 'zombie'
  | 'space-horror';

export type ThemePalette = {
  void: string;
  night: string;
  primary: string;
  accent: string;
  gold: string;
  bone: string;
  fog: string;
  ink: string;
  panel: string;
  panelBorder: string;
  xpFill: string;
  xpTrack: string;
  glow: string;
  villain: string;
  villainGlow: string;
  gradient: [string, string, string];
};

export type StoryTheme = {
  id: ThemeId;
  name: string;
  tagline: string;
  icon: string;
  chapterTitle: string;
  locationName: string;
  mentorName: string;
  villain: {
    name: string;
    title: string;
  };
  colors: ThemePalette;
  introLines: string[];
  openingStory: string;
  victoryLine: string;
  rankTitles: string[];
};
