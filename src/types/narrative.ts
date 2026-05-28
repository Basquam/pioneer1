export type TaskCategory =
  | 'cleaning'
  | 'fitness'
  | 'study'
  | 'work'
  | 'health'
  | 'social'
  | 'creative'
  | 'errand';

export type UniverseTerminology = {
  questTerm: string;
  mapTerm: string;
  streakTerm: string;
  reputationTerm: string;
  chapterCompleteTerm: string;
};

export type UniverseFaction = {
  id: string;
  name: string;
  theme: string;
  description: string;
};

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
  /** Character-specific affinity label — e.g. Trust, Respect, Rivalry. */
  affinityLabel?: string;
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

export type QuestVariationIntensity = 'calm' | 'normal' | 'urgent';

export type QuestVariationTag =
  | 'cleaning'
  | 'preparation'
  | 'investigation'
  | 'delivery'
  | 'training'
  | 'recovery'
  | 'outreach'
  | 'craft';

export type QuestTemplateVariation = {
  id: string;
  narrativeTitlePattern: string;
  narrativeDescriptionPattern: string;
  intensity?: QuestVariationIntensity;
  tags?: QuestVariationTag[];
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
  /** Rule-based narrative variants for user-created quest conversion. */
  variations?: QuestTemplateVariation[];
};

export type ChapterRewardType = 'badge' | 'title' | 'cosmetic' | 'storyUnlock';

export type ChapterReward = {
  id: string;
  type: ChapterRewardType;
  name: string;
  /** Saga id unlocked when type is storyUnlock. */
  unlockTargetId?: string;
};

export type Chapter = {
  id: string;
  order: number;
  title: string;
  territoryName: string;
  mapPosition: { x: number; y: number };
  summary: string;
  dramaticPurpose: string;
  introDialogue: string;
  introScene: DialogueBeat[];
  successDialogue: string;
  failureDialogue: string;
  questTemplates: QuestTemplate[];
  chapterRewards: ChapterReward[];
};

export type Saga = {
  id: string;
  title: string;
  villainName: string;
  villainTitle: string;
  villainCharacterId: string;
  /** Main ally name — shown in saga selection when chapters are not yet playable. */
  allyName?: string;
  status: 'available' | 'locked';
  /** Reward id required to unlock this saga when status is locked. */
  requiredUnlockId?: string;
  unlockRequirementLabel?: string;
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
  /** Recurring narrative theme for the universe. */
  theme: string;
  coreProgressionName: string;
  terminology: UniverseTerminology;
  factions: UniverseFaction[];
  /** Audio asset key — see constants/audio.ts for bundled tracks. */
  ambientAudioId?: string;
  status: 'available' | 'locked';
  /** Reward id required to unlock this universe when status is locked. */
  requiredUnlockId?: string;
  /** Shown on universe selection when status is locked. */
  unlockRequirementLabel?: string;
  palette: UniversePalette;
  sagas: Saga[];
};

export type NarrativeMoment =
  | { type: 'quest_complete'; characterId: string; line: string; questTitle: string }
  | { type: 'villain_taunt'; characterId: string; line: string };

export type ChapterCompleteState = {
  chapterId: string;
  chapterOrder: number;
  chapterTitle: string;
  successDialogue: string;
  earnedXp: number;
  earnedReputation: number;
  nextChapterId: string | null;
  newRewards?: ChapterReward[];
};

export type QuestCompleteState = {
  questId: string;
  source: 'template' | 'user';
  narrativeTitle: string;
  earnedXp: number;
  earnedReputation: number;
  characterId: string;
  characterLine: string;
  /** e.g. "+1 Reliable" */
  identityVoteGainLine?: string;
  /** Universe-flavored identity reinforcement line. */
  identityUniverseLine?: string;
};

export type UserQuest = {
  id: string;
  originalTitle: string;
  category: TaskCategory;
  narrativeTitle: string;
  narrativeDescription: string;
  /** Id of the QuestTemplateVariation applied during conversion, if any. */
  usedVariationId?: string;
  sourceUniverseId: string;
  sourceSagaId: string;
  sourceChapterId: string;
  isCompleted: boolean;
  xpReward: number;
  reputationReward: number;
  reactionCharacterId: string;
  /** Local calendar date (YYYY-MM-DD) when this quest was created. */
  createdOnDate?: string;
  /** Optional small first step to reduce friction on a larger task. */
  starterTaskTitle?: string;
};

export type IdentityTraitKey =
  | 'organized'
  | 'resilient'
  | 'curious'
  | 'reliable'
  | 'selfRespecting'
  | 'connected'
  | 'builder'
  | 'prepared';

export type IdentityVotes = Record<IdentityTraitKey, number>;

export type BoardQuest = {
  id: string;
  source: 'template' | 'user';
  category: TaskCategory;
  originalTitle: string;
  narrativeTitle: string;
  narrativeDescription: string;
  xpReward: number;
  reputationReward: number;
  reactionCharacterId: string;
  completed: boolean;
  /** First N user quests created today — highlighted on the board. */
  isDailyFocus?: boolean;
  starterTaskTitle?: string;
};

export type DailyActivity = {
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  chaptersCompleted: number;
};

export type PlayerProgress = {
  hasOnboarded: boolean;
  /** First-session HQ tutorial — shown once after onboarding. */
  tutorialSeen: boolean;
  /** Universe chosen during first onboarding completion — never overwritten. */
  firstUniverseId: string | null;
  /** Saga chosen during first onboarding completion — never overwritten. */
  firstSagaId: string | null;
  /** Local ISO date (YYYY-MM-DD) when onboarding was first completed. */
  onboardingCompletedAt: string | null;
  selectedUniverseId: string;
  selectedSagaId: string;
  /** Active chapter for the selected saga — mirrors activeChapterBySagaId[selectedSagaId]. */
  currentChapterId: string;
  activeChapterBySagaId: Record<string, string>;
  completedChapterIdsBySagaId: Record<string, string[]>;
  completedQuestIdsBySagaId: Record<string, string[]>;
  totalXp: number;
  level: number;
  reputation: number;
  unlockedRewards: string[];
  userQuests: UserQuest[];
  villainInfluenceBySaga: Record<string, number>;
  chapterCompletions: Record<string, number>;
  relationshipByCharacter: Record<string, RelationshipTier>;
  characterAffinity: Record<string, number>;
  seenChapterIntros: string[];
  dismissedTauntBySagaId: Record<string, string | null>;
  /** Local calendar date (YYYY-MM-DD) when the player last opened the app. */
  lastActiveDate: string | null;
  /** Consecutive local days the player has returned. */
  dailyStreak: number;
  /** Max recommended user-created quests per local day before a soft warning. */
  dailyFocusLimit: number;
  /** Per-day activity log keyed by local date (YYYY-MM-DD). */
  activityByDate: Record<string, DailyActivity>;
  /** Last selected saga per universe — restored when switching universes. */
  lastSagaByUniverseId: Record<string, string>;
  /** Per-trait identity votes — only increase on quest completion. */
  identityVotes: IdentityVotes;
};
