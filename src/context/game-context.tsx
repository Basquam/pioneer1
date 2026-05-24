import { createContext, useCallback, useMemo, useState, type ReactNode } from 'react';

import { getQuestsForTheme } from '@/data/quests';
import { STORY_CHAPTERS } from '@/data/story/chapters';
import { getTheme, STORY_THEMES } from '@/data/themes';
import { computeLevel, rankForLevel } from '@/lib/level';
import type { QuestState } from '@/types/quest';
import type { ThemeProgress } from '@/types/player';
import type { StoryChapter } from '@/types/story';
import type { ThemeId } from '@/types/theme';

export type XpBurst = { id: string; amount: number };

type GameContextValue = {
  hasOnboarded: boolean;
  activeThemeId: ThemeId;
  theme: ReturnType<typeof getTheme>;
  player: {
    level: number;
    totalXp: number;
    xpInLevel: number;
    xpToNext: number;
    xpProgress: number;
    rank: string;
    stats: { grit: number; focus: number; legend: number };
  };
  themeProgress: ThemeProgress;
  themeProgressMap: Record<ThemeId, ThemeProgress>;
  quests: QuestState[];
  chapters: StoryChapter[];
  xpBurst: XpBurst | null;
  completedQuestCount: number;
  allQuestsComplete: boolean;
  selectTheme: (id: ThemeId) => void;
  completeOnboarding: () => void;
  completeQuest: (questId: string) => void;
  dismissXpBurst: () => void;
  switchTheme: (id: ThemeId) => void;
};

export const GameContext = createContext<GameContextValue | null>(null);

const DEFAULT_THEME: ThemeId = 'wild-west';

function defaultThemeProgress(themeId: ThemeId): ThemeProgress {
  const theme = getTheme(themeId);
  return {
    villainInfluence: 100,
    storyLine: theme.openingStory,
    unlockedChapterIndex: 0,
  };
}

function buildInitialQuests(themeId: ThemeId, completed: Record<string, boolean>): QuestState[] {
  return getQuestsForTheme(themeId).map((q) => ({
    ...q,
    completed: completed[q.id] ?? false,
  }));
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [hasOnboarded, setHasOnboarded] = useState(false);
  const [activeThemeId, setActiveThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [totalXp, setTotalXp] = useState(0);
  const [questCompleted, setQuestCompleted] = useState<Record<string, boolean>>({});
  const [themeProgressMap, setThemeProgressMap] = useState<Record<ThemeId, ThemeProgress>>(() =>
    Object.keys(STORY_THEMES).reduce(
      (acc, id) => {
        acc[id as ThemeId] = defaultThemeProgress(id as ThemeId);
        return acc;
      },
      {} as Record<ThemeId, ThemeProgress>,
    ),
  );
  const [xpBurst, setXpBurst] = useState<XpBurst | null>(null);

  const theme = getTheme(activeThemeId);
  const themeProgress = themeProgressMap[activeThemeId];

  const quests = useMemo(
    () => buildInitialQuests(activeThemeId, questCompleted),
    [activeThemeId, questCompleted],
  );

  const chapters = STORY_CHAPTERS[activeThemeId];

  const completedQuestCount = quests.filter((q) => q.completed).length;
  const allQuestsComplete = completedQuestCount === quests.length && quests.length > 0;

  const levelInfo = computeLevel(totalXp);
  const rank = rankForLevel(theme.rankTitles, levelInfo.level);

  const player = useMemo(
    () => ({
      level: levelInfo.level,
      totalXp,
      xpInLevel: levelInfo.xpInLevel,
      xpToNext: levelInfo.xpToNext,
      xpProgress: levelInfo.progress,
      rank,
      stats: {
        grit: Math.min(99, completedQuestCount * 20 + levelInfo.level * 5),
        focus: completedQuestCount,
        legend: Math.round(levelInfo.progress * 100),
      },
    }),
    [completedQuestCount, levelInfo, rank, totalXp],
  );

  const selectTheme = useCallback((id: ThemeId) => {
    setActiveThemeId(id);
  }, []);

  const completeOnboarding = useCallback(() => {
    setHasOnboarded(true);
  }, []);

  const switchTheme = useCallback((id: ThemeId) => {
    setActiveThemeId(id);
    setThemeProgressMap((prev) => ({
      ...prev,
      [id]: prev[id] ?? defaultThemeProgress(id),
    }));
  }, []);

  const completeQuest = useCallback(
    (questId: string) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest || quest.completed) return;

      setQuestCompleted((prev) => ({ ...prev, [questId]: true }));
      setTotalXp((xp) => xp + quest.xpReward);
      setXpBurst({ id: `${questId}-${Date.now()}`, amount: quest.xpReward });

      const newCompleted = completedQuestCount + 1;
      const newInfluence = Math.max(0, themeProgress.villainInfluence - quest.threatReduction);

      setThemeProgressMap((prev) => ({
        ...prev,
        [activeThemeId]: {
          villainInfluence: newInfluence,
          storyLine: quest.completionLine,
          unlockedChapterIndex: Math.min(3, newCompleted),
        },
      }));
    },
    [activeThemeId, completedQuestCount, quests, themeProgress.villainInfluence],
  );

  const dismissXpBurst = useCallback(() => setXpBurst(null), []);

  const value = useMemo<GameContextValue>(
    () => ({
      hasOnboarded,
      activeThemeId,
      theme,
      player,
      themeProgress,
      themeProgressMap,
      quests,
      chapters,
      xpBurst,
      completedQuestCount,
      allQuestsComplete,
      selectTheme,
      completeOnboarding,
      completeQuest,
      dismissXpBurst,
      switchTheme,
    }),
    [
      hasOnboarded,
      activeThemeId,
      theme,
      player,
      themeProgress,
      themeProgressMap,
      quests,
      chapters,
      xpBurst,
      completedQuestCount,
      allQuestsComplete,
      selectTheme,
      completeOnboarding,
      completeQuest,
      dismissXpBurst,
      switchTheme,
    ],
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}
