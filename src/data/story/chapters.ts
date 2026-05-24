import type { StoryChapter } from '@/types/story';
import type { ThemeId } from '@/types/theme';

function chaptersForTheme(themeId: ThemeId, villain: string, location: string): StoryChapter[] {
  return [
    {
      id: `${themeId}-ch1`,
      themeId,
      index: 0,
      title: 'The First Stand',
      summary: `Tension rises in ${location}. The enemy tests your resolve.`,
      requiredQuests: 0,
      dialogue: `Reports flood in from ${location}. Something stirs in the shadows.`,
    },
    {
      id: `${themeId}-ch2`,
      themeId,
      index: 1,
      title: 'Turning the Tide',
      summary: 'Your first victories echo through the streets.',
      requiredQuests: 1,
      dialogue: `${villain} falters — but they never fall from one blow.`,
    },
    {
      id: `${themeId}-ch3`,
      themeId,
      index: 2,
      title: 'The Counterstrike',
      summary: 'The enemy strikes back with desperate fury.',
      requiredQuests: 2,
      dialogue: 'They know you\'re coming. Finish what you started.',
    },
    {
      id: `${themeId}-ch4`,
      themeId,
      index: 3,
      title: 'Final Reckoning',
      summary: 'All paths converge. Victory — or oblivion.',
      requiredQuests: 3,
      dialogue: 'This is the moment your legend is written.',
    },
  ];
}

export const STORY_CHAPTERS: Record<ThemeId, StoryChapter[]> = {
  'wild-west': chaptersForTheme('wild-west', 'The Black Vulture Gang', 'Dustfall'),
  noir: chaptersForTheme('noir', 'The Crown Syndicate', 'Midnight City'),
  cyberpunk: chaptersForTheme('cyberpunk', 'Omnicorp Black ICE', 'Neon Ward'),
  zombie: chaptersForTheme('zombie', 'The Hollow Horde', 'Haven-7'),
  'space-horror': chaptersForTheme('space-horror', 'The Bloom Entity', 'Station Orpheus'),
};
