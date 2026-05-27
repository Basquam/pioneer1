export type TaskCategory =
  | 'cleaning'
  | 'fitness'
  | 'study'
  | 'work'
  | 'health'
  | 'social'
  | 'creative'
  | 'errand';

export type UniversePalette = {
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

export type RelationshipTier = 'distant' | 'warming' | 'trusted' | 'bonded';

export type NarrativeCharacter = {
  id: string;
  sagaId: string;
  name: string;
  portrait: string;
  role: string;
  personality: string;
  isVillain?: boolean;
  lines: {
    greeting: string[];
    chapterIntro: string[];
    questComplete: string[];
    questMissed: string[];
  };
};

export type DialogueBeat = {
  characterId: string;
  line: string;
  badge?: string;
};

export type QuestTemplate = {
  id: string;
  category: TaskCategory;
  title: string;
  objective: string;
  dramaticHook: string;
  xpReward: number;
  reputationImpact: number;
  reactionCharacterId: string;
};

export type Chapter = {
  id: string;
  order: number;
  title: string;
  summary: string;
  dramaticPurpose: string;
  introDialogue: string;
  introScene: DialogueBeat[];
  successDialogue: string;
  failureDialogue: string;
  questTemplates: QuestTemplate[];
};

export type Saga = {
  id: string;
  title: string;
  villainName: string;
  villainTitle: string;
  villainCharacterId: string;
  status: 'available' | 'locked';
  summary: string;
  rankTitles: [string, string, string];
  characters: NarrativeCharacter[];
  chapters: Chapter[];
};

export type Universe = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  mentorName: string;
  locationName: string;
  mood: string;
  palette: UniversePalette;
  sagas: Saga[];
};

export type NarrativeMoment =
  | { type: 'quest_complete'; characterId: string; line: string; questTitle: string }
  | { type: 'villain_taunt'; characterId: string; line: string }
  | { type: 'chapter_transition'; fromChapterId: string; toChapterId: string; title: string };

export type PlayerProgress = {
  hasOnboarded: boolean;
  selectedUniverseId: string;
  selectedSagaId: string;
  currentChapterId: string;
  totalXp: number;
  level: number;
  reputation: number;
  completedQuestIds: string[];
  villainInfluenceBySaga: Record<string, number>;
  chapterCompletions: Record<string, number>;
  relationshipByCharacter: Record<string, RelationshipTier>;
  characterAffinity: Record<string, number>;
  seenChapterIntros: string[];
  dismissedTauntForChapterId: string | null;
};
