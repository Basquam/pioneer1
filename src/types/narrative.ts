export type TaskCategory =
  | 'cleaning'
  | 'fitness'
  | 'study'
  | 'work'
  | 'health'
  | 'social'
  | 'creative'
  | 'errand';

export type QuestSuiteId =
  | 'gym'
  | 'business'
  | 'scholar'
  | 'home'
  | 'wellness'
  | 'creative'
  | 'social'
  | 'errand';

export type QuestSuite = {
  id: QuestSuiteId;
  label: string;
  shortLabel: string;
  description: string;
  icon: string;
  primaryCategories: TaskCategory[];
};

export type QuestSuiteStats = {
  questsCreated: number;
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  lastCompletedAt: string | null;
};

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

/** Optional local media keys — resolved via narrative-media registry. */
export type UniverseMedia = {
  moodImageKey?: string;
};

export type SagaMedia = {
  bannerImageKey?: string;
  /** Optional detail / office reveal image for locked saga previews. */
  detailImageKey?: string;
};

export type ChapterMedia = {
  sceneImageKey?: string;
};

export type CharacterPortraitExpression =
  | 'neutral'
  | 'approving'
  | 'worried'
  | 'taunting'
  | 'angry'
  | 'concerned';

/** Narrative context used to pick a character portrait expression. */
export type CharacterPortraitContext =
  | 'default'
  | 'questComplete'
  | 'questMissed'
  | 'villainTaunt'
  | 'chapterIntro'
  | 'chapterSuccess'
  | 'chapterFailure'
  | 'confrontation'
  | 'encouragement'
  | 'setback'
  | 'lockedTeaser';

export type CharacterMedia = {
  /** Default portrait — neutral expression. */
  portraitImageKey?: string;
  /** Optional expression portrait keys keyed by expression id. */
  portraitExpressions?: Partial<Record<CharacterPortraitExpression, string>>;
};

export type NarrativeCharacter = {
  id: string;
  sagaId: string;
  name: string;
  portrait: string;
  role: string;
  personality: string;
  isVillain?: boolean;
  /** Optional bundled portrait image key — emoji portrait remains fallback. */
  media?: CharacterMedia;
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

export type ChapterRewardMedia = {
  /** Local asset key for reward badge / unlock artwork. */
  rewardImageKey?: string;
};

export type ChapterReward = {
  id: string;
  type: ChapterRewardType;
  name: string;
  /** Optional bundled reward image key. */
  media?: ChapterRewardMedia;
  /** Saga id unlocked when type is storyUnlock. */
  unlockTargetId?: string;
};

export type Chapter = {
  id: string;
  order: number;
  title: string;
  territoryName: string;
  mapPosition: { x: number; y: number };
  /** Optional bundled scene image key for chapter intros and detail sheets. */
  media?: ChapterMedia;
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
  /** Optional bundled banner image key for saga cards and detail views. */
  media?: SagaMedia;
  /** Main ally name — shown in saga selection when chapters are not yet playable. */
  allyName?: string;
  status: 'available' | 'locked';
  /** Reward id required to unlock this saga when status is locked. */
  requiredUnlockId?: string;
  unlockRequirementLabel?: string;
  summary: string;
  rankTitles: [string, string, string];
  /** Short role-standard lines expressing the crew code for this saga. */
  crewCode?: string[];
  characters: NarrativeCharacter[];
  chapters: Chapter[];
};

export type Universe = {
  id: string;
  name: string;
  tagline: string;
  icon: string;
  /** Optional bundled mood image key for universe cards and previews. */
  media?: UniverseMedia;
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
  /** Personalized saga finale — only on the last chapter of a saga. */
  sagaFinale?: ResolvedSagaEnding;
};

export type SagaEndingConditionType =
  | 'default'
  | 'reliable'
  | 'organized'
  | 'resilient'
  | 'loyal'
  | 'high-noon'
  | 'recovery';

export type SagaEndingVariant = {
  id: string;
  label: string;
  priority: number;
  conditionType: SagaEndingConditionType;
  title: string;
  summary: string;
  dialogueOverride?: string;
  rewardFlavorLine?: string;
  universeFlavorLine?: string;
};

export type ResolvedSagaEnding = {
  endingVariantId: string;
  label: string;
  title: string;
  summary: string;
  dialogueOverride?: string;
  rewardFlavorLine?: string;
  universeFlavorLine?: string;
};

export type SagaEndingRecord = {
  endingVariantId: string;
  earnedAt: string;
  title: string;
  summary: string;
  label?: string;
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
  /** Encouraging line when a recovery quest cycle is completed. */
  recoveryCompleteLine?: string;
  /** Shown when a minimum viable day is secured. */
  minimumViableDayCompleteLine?: string;
  /** Universe-flavored line when a minimum viable day is secured. */
  minimumViableDayFlavorLine?: string;
  /** Temptation-bundled reward unlocked after completing a user quest. */
  rewardRitualUnlockedLine?: string;
  /** Universe-flavored reward ritual line. */
  rewardRitualFlavorLine?: string;
  /** Shown when a trait crosses into a new milestone tier. */
  identityMilestoneUnlock?: {
    headline: string;
    universeFlavorLine: string;
  };
  /** Universe-flavored momentum gain line, e.g. "+1 Frontier Momentum". */
  momentumGainLine?: string;
  /** Shown when momentum crosses a stored-effort milestone. */
  momentumMilestoneUnlock?: {
    message: string;
    label: string;
  };
  /** Shown when the final step of a quest chain clears the parent. */
  questChainCompleteLine?: string;
  /** Shown when a gained identity vote matches a desired compass trait. */
  desiredIdentityHighlightLine?: string;
};

export type QuestFrictionReason =
  | 'too-big'
  | 'too-vague'
  | 'wrong-time'
  | 'forgot'
  | 'low-energy'
  | 'not-important';

export type QuestFrictionReview = {
  reason: QuestFrictionReason;
  /** ISO timestamp when the user reviewed friction. */
  reviewedAt: string;
  suggestedFixApplied?: boolean;
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
  /** Lifecycle state for board aging and review. */
  status?: QuestLifecycleStatus;
  /** Local calendar date when the quest was first created. */
  createdDate?: string;
  /** Local date when the quest was carried forward to the board. */
  carriedToDate?: string;
  /** Hide from active board until this local date. */
  snoozedUntilDate?: string;
  xpReward: number;
  reputationReward: number;
  reactionCharacterId: string;
  /** Local calendar date (YYYY-MM-DD) when this quest was created. */
  createdOnDate?: string;
  /** Optional small first step to reduce friction on a larger task. */
  starterTaskTitle?: string;
  /** Optional environment priming step to do before starting later. */
  prepStepTitle?: string;
  /** Optional implementation intention — how the user plans to execute the task. */
  implementationIntention?: string;
  /** User pinned this quest as a daily focus commitment beyond auto-assigned slots. */
  focusPinned?: boolean;
  /** When the user plans to do this quest — e.g. "Tomorrow morning". */
  plannedTimeLabel?: string;
  /** Local date when daily shutdown marked this quest for tomorrow. */
  carryForwardDate?: string;
  /** Optional local reminder cue — never required. */
  reminderEnabled?: boolean;
  /** Preset key or HH:mm custom time. */
  reminderTime?: string;
  /** Display label such as Evening or 19:30. */
  reminderLabel?: string;
  /** Scheduled local notification identifier. */
  reminderId?: string;
  /** Where the user plans to do this quest — e.g. "Desk". */
  plannedLocation?: string;
  /** Habit to stack this quest after — e.g. "I finish breakfast". */
  afterCurrentHabit?: string;
  /** Local-only friction reviews when a quest feels hard to start. */
  frictionReviews?: QuestFrictionReview[];
  /** Hidden from the board when set — archived, not deleted. */
  archivedAt?: string;
  /** ISO timestamp when the user tapped START NOW — first decisive moment. */
  startedAt?: string;
  /** Optional real-life reward paired with completing this quest. */
  afterQuestReward?: string;
  /** Optional enjoyable ritual before starting this quest. */
  preQuestRitual?: string;
  /** Goldilocks risk sizing — low, standard, or high. */
  riskLevel?: QuestRiskLevel;
  /** Last distraction noted in Focus Mode — optional session note. */
  lastFocusDistraction?: QuestDistractionType;
  /** ISO timestamp when the user applied a friction shield in Focus Mode. */
  frictionShieldAppliedAt?: string;
  /** ISO timestamps when Improve Quest was saved. */
  improvedAt?: string[];
  /** ISO timestamps when readiness/planning fields were updated. */
  readinessUpdatedAt?: string[];
  /** ISO timestamps when friction was reviewed. */
  frictionReviewedAt?: string[];
  /** ISO timestamp when Quest Focus Mode was first opened. */
  focusStartedAt?: string;
  /** ISO timestamp when the quest was completed. */
  completedAt?: string;
  /** Links a generated instance back to its recurring routine template. */
  generatedFromRecurringQuestId?: string;
  /** Routine boredom guard tone for this spawn — calm, normal, or urgent. */
  routineVariationTone?: QuestVariationIntensity;
  /** Optional fresh-angle line for repeated routines. */
  routineFreshAngleLine?: string;
  /** Parent quest id when this quest is a chain step. */
  parentQuestId?: string;
  /** Child quest ids when this quest is a chain parent. */
  childQuestIds?: string[];
  /** True when this quest was split into a chain of smaller steps. */
  isQuestChainParent?: boolean;
  /** Step order within a quest chain (1-based). */
  chainStepOrder?: number;
  /** Shared chain label — usually the parent original title. */
  chainTitle?: string;
  /** Real-life domain / mode for personalization — optional for legacy quests. */
  suiteId?: QuestSuiteId;
};

export type RoutineRepetitionRecord = {
  originalTitle: string;
  category: TaskCategory;
  generatedFromRecurringQuestId?: string;
  lastNarrativeTitleUsed?: string;
  recentVariationIds: string[];
  completionCount: number;
};

export type QuestDistractionType =
  | 'phone'
  | 'social-media'
  | 'games'
  | 'bed-couch'
  | 'notifications'
  | 'random-tabs'
  | 'unclear-next-step'
  | 'other';

export type QuestRiskLevel = 'low' | 'standard' | 'high';

export type QuestLifecycleStatus = 'active' | 'completed' | 'carried' | 'snoozed' | 'archived';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly';

export type WeekdayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export type RecurringQuestTemplate = {
  id: string;
  originalTitle: string;
  category: TaskCategory;
  recurrenceType: RecurrenceType;
  preferredTimeLabel?: string;
  preferredDays?: WeekdayKey[];
  /** ISO timestamp when the routine was created. */
  createdAt: string;
  isActive: boolean;
  /** ISO timestamp when the routine was paused (isActive false). */
  pausedAt?: string;
  /** ISO timestamp when the routine was archived (isActive false). */
  archivedAt?: string;
  starterTaskTitle?: string;
  prepStepTitle?: string;
  afterQuestReward?: string;
  riskLevel?: QuestRiskLevel;
  reminderEnabled?: boolean;
  reminderTime?: string;
};

export type ReminderPreferences = {
  remindersEnabled?: boolean;
  quietHoursEnabled?: boolean;
  quietHoursStart?: string;
  quietHoursEnd?: string;
};

export type QuestReadinessChecklist = {
  starter: boolean;
  plan: boolean;
  prep: boolean;
  focus: boolean;
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
  lifecycleStatus?: QuestLifecycleStatus;
  createdDate?: string;
  carriedToDate?: string;
  snoozedUntilDate?: string;
  needsReview?: boolean;
  /** First N user quests created today — highlighted on the board. */
  isDailyFocus?: boolean;
  /** Pinned as part of today's locked focus commitment. */
  isFocusLocked?: boolean;
  starterTaskTitle?: string;
  prepStepTitle?: string;
  implementationIntention?: string;
  /** 0–4 Atomic Habits readiness score — user quests only. */
  readinessScore?: number;
  readinessChecklist?: QuestReadinessChecklist;
  /** Local calendar date when this user quest was created. */
  createdOnDate?: string;
  /** Show gentle friction review action on the card. */
  showFrictionReview?: boolean;
  plannedTimeLabel?: string;
  /** Carried forward from daily shutdown for a future day. */
  carryForwardDate?: string;
  afterCurrentHabit?: string;
  plannedLocation?: string;
  reminderEnabled?: boolean;
  reminderLabel?: string;
  /** ISO timestamp when START NOW was tapped. */
  startedAt?: string;
  /** True when the quest has a recorded start moment. */
  isStarted?: boolean;
  afterQuestReward?: string;
  preQuestRitual?: string;
  riskLevel?: QuestRiskLevel;
  lastFocusDistraction?: QuestDistractionType;
  frictionShieldAppliedAt?: string;
  improvedAt?: string[];
  readinessUpdatedAt?: string[];
  frictionReviewedAt?: string[];
  frictionReviews?: QuestFrictionReview[];
  focusStartedAt?: string;
  completedAt?: string;
  /** True when planning activity exceeds the motion guard threshold. */
  isTooMuchMotion?: boolean;
  /** True when this quest was spawned from a recurring routine. */
  isRecurring?: boolean;
  /** Subtle hint for recurring or repeated routine quests. */
  routineFreshnessHint?: string;
  usedVariationId?: string;
  generatedFromRecurringQuestId?: string;
  parentQuestId?: string;
  childQuestIds?: string[];
  isQuestChainParent?: boolean;
  chainStepOrder?: number;
  chainTitle?: string;
  chainProgress?: {
    completed: number;
    total: number;
  };
  suiteId?: QuestSuiteId;
};

export type DailyActivity = {
  questsCompleted: number;
  xpEarned: number;
  reputationEarned: number;
  chaptersCompleted: number;
  highRiskQuestsCompleted: number;
};

export type MinimumViableDaySource = 'awareness' | 'briefing' | 'next-best-action';

export type MinimumViableDayEntry = {
  date: string;
  activatedAt: string;
  source?: MinimumViableDaySource;
  securedAt?: string;
};

export type DailyAwarenessBlocker =
  | 'low-energy'
  | 'too-many-tasks'
  | 'unclear-priorities'
  | 'messy-environment'
  | 'emotional-resistance'
  | 'ready';

export type DailyAwarenessEntry = {
  date: string;
  selectedBlocker: DailyAwarenessBlocker;
  createdAt: string;
};

export type DailyShutdownHelpedBy =
  | 'focus-mode'
  | 'starter-move'
  | 'prep-step'
  | 'reward-ritual'
  | 'locked-focus'
  | 'reminder'
  | 'character-story'
  | 'nothing-yet';

export type DailyShutdownOpenQuestAction =
  | 'carry-today'
  | 'snooze'
  | 'split'
  | 'archive'
  | 'complete'
  | 'leave'
  | 'keep-tomorrow'
  | 'convert-starter';

export type DailyShutdownOpenQuestSummary = {
  questId: string;
  action: DailyShutdownOpenQuestAction;
};

export type DailyShutdownEntry = {
  date: string;
  completedAt: string;
  helpedBy?: DailyShutdownHelpedBy;
  openQuestActions: DailyShutdownOpenQuestSummary[];
};

export type TomorrowSetupKind =
  | 'first-quest'
  | 'captured-task'
  | 'environment-step'
  | 'when-where-plan';

export type TomorrowSetupEntry = {
  date: string;
  preparedOnDate: string;
  preparedAt: string;
  kind: TomorrowSetupKind;
  selectedTomorrowQuestId?: string;
  plannedTomorrowTaskTitle?: string;
  plannedTomorrowInboxItemId?: string;
  tomorrowPrepStepTitle?: string;
  tomorrowImplementationIntention?: string;
};

export type WeeklyReviewHelpedFactor =
  | 'focus-mode'
  | 'starter-moves'
  | 'prep-steps'
  | 'locked-focus'
  | 'character-story'
  | 'ambience'
  | 'reward-rituals';

export type WeeklyReviewSlowdownFactor =
  | 'too-many-quests'
  | 'tasks-too-vague'
  | 'low-energy'
  | 'wrong-timing'
  | 'messy-environment'
  | 'emotional-resistance'
  | 'distractions';

export type WeeklyReviewEntry = {
  weekKey: string;
  helpedFactors: WeeklyReviewHelpedFactor[];
  slowdownFactor: WeeklyReviewSlowdownFactor;
  submittedAt: string;
};

export type EvidenceEventSource = 'userQuest' | 'chapterBounty';

export type EvidenceEvent = {
  id: string;
  /** Local calendar date (YYYY-MM-DD). */
  date: string;
  /** ISO timestamp when the quest was completed. */
  timestamp: string;
  universeId: string;
  sagaId: string;
  chapterId: string;
  questTitle: string;
  originalTaskTitle?: string;
  category: TaskCategory;
  identityTraitGained?: string;
  xpEarned: number;
  reputationEarned: number;
  characterId?: string;
  rewardRitual?: string;
  source: EvidenceEventSource;
};

export type FeatureDiscoveryKey =
  | 'starterMove'
  | 'prepStep'
  | 'rewardRitual'
  | 'riskLevel'
  | 'focusMode'
  | 'frictionReview'
  | 'questChain'
  | 'recurringQuest'
  | 'tomorrowSetup'
  | 'weeklyReview'
  | 'coachTips'
  | 'identityVotes'
  | 'questReadiness'
  | 'systemsInsight';

export type FeatureDiscoveryFlags = Partial<Record<FeatureDiscoveryKey, true>>;

export type FeatureDiscoveryState = {
  guidedDiscoveryEnabled: boolean;
  showAdvancedTools: boolean;
  discovered: FeatureDiscoveryFlags;
  introduced: Partial<Record<FeatureDiscoveryKey, string>>;
  currentTier: number;
};

export type ProcessAchievementId =
  | 'first-step-taken'
  | 'small-move-counts'
  | 'trail-marked'
  | 'prepared-before-starting'
  | 'focus-entered'
  | 'minimum-day-secured'
  | 'back-on-track'
  | 'clutter-cleared'
  | 'big-quest-broken'
  | 'promise-kept'
  | 'system-builder'
  | 'reflection-logged';

export type ProcessAchievementEntry = {
  achievementId: ProcessAchievementId;
  unlockedAt: string;
  relatedUniverseId?: string;
  relatedQuestId?: string;
};

export type OnboardingStepId =
  | 'welcome'
  | 'premise'
  | 'theme'
  | 'saga'
  | 'suite'
  | 'first-quest';

export type PlayerProgress = {
  /** Local save schema version — used for ordered migrations on load/import. */
  schemaVersion: number;
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
  /** Priority traits the user wants to reinforce (1–3). */
  desiredIdentityTraits: IdentityTraitKey[];
  /** Local date when the user locked today's focus quests. */
  focusLockedDate: string | null;
  /** User quest ids pinned when focus was locked for focusLockedDate. */
  lockedFocusQuestIds: string[];
  /** Last local date active before a missed-day gap was detected. */
  lastMissedDate: string | null;
  /** Return date when a recovery quest was offered after a missed day. */
  recoveryQuestOfferedForDate: string | null;
  /** Local dates when the user completed a recovery quest after returning. */
  recoveryQuestCompletedDates: string[];
  /** Daily awareness check answers keyed by local date (YYYY-MM-DD). */
  dailyAwarenessByDate: Record<string, DailyAwarenessEntry>;
  /** Local dates when the user dismissed the awareness check without answering. */
  dailyAwarenessDismissedDates: string[];
  /** Daily shutdown reflections keyed by local date (YYYY-MM-DD). */
  dailyShutdownByDate: Record<string, DailyShutdownEntry>;
  /** Local dates when the user dismissed the daily shutdown prompt. */
  dailyShutdownDismissedDates: string[];
  /** Chapter bounty template quest ids → ISO timestamp when START NOW was tapped. */
  templateQuestStartedAt: Record<string, string>;
  /** Weekly reflection answers keyed by local week (Sunday start date YYYY-MM-DD). */
  weeklyReviewByWeek: Record<string, WeeklyReviewEntry>;
  /** Local month keys (YYYY-MM) when the user closed/archived the monthly season report. */
  monthlyReviewSeenByMonth: Record<string, string>;
  /** Local dates when the user dismissed the HQ next best action card. */
  dismissedNextBestActionByDate: Record<string, boolean>;
  /** Coach tip ids dismissed per local date (YYYY-MM-DD). */
  dismissedCoachTipsByDate: Record<string, string[]>;
  /** Progressive feature disclosure — guided unlocks and discovery tracking. */
  featureDiscoveryState: FeatureDiscoveryState;
  /** Behavior-design process achievements unlocked locally. */
  processAchievements: ProcessAchievementEntry[];
  /** Minimum viable / low-energy day mode keyed by local date (YYYY-MM-DD). */
  minimumViableDayByDate: Record<string, MinimumViableDayEntry>;
  /** Prime-tomorrow setup keyed by the local date it applies to (YYYY-MM-DD). */
  tomorrowSetupByDate: Record<string, TomorrowSetupEntry>;
  /** Local recurring routine templates — spawn user quest instances on schedule. */
  recurringQuestTemplates: RecurringQuestTemplate[];
  /** Recent quest completion events for the evidence timeline. */
  evidenceLog: EvidenceEvent[];
  /** Stored effort from completed quests — a psychological progress indicator, not currency. */
  momentumReserve: number;
  /** Momentum milestone thresholds already reached (10, 25, 50, 100). */
  momentumMilestonesReached: number[];
  /** Lightweight repetition tracking for recurring and repeated user quests. */
  routineRepetitionByKey: Record<string, RoutineRepetitionRecord>;
  /** Optional per-category defaults for new quest creation. */
  questDefaults: QuestDefaultsSettings;
  /** Quick-captured tasks waiting to become quests. */
  questInbox: QuestInboxItem[];
  /** Personal productivity style calibration — emphasis only, never restrictive. */
  questStyleProfile: QuestStyleProfile;
  /** Global local reminder preferences. */
  reminderPreferences: ReminderPreferences;
  /** Active real-life quest suite focus — optional personalization layer. */
  activeSuiteId?: QuestSuiteId;
  /** Per-suite activity stats keyed by QuestSuiteId. */
  suiteStatsById: Partial<Record<QuestSuiteId, QuestSuiteStats>>;
  /** True after the user finishes or skips the onboarding suite step. */
  onboardingSuiteComplete?: boolean;
  /** Farthest canonical onboarding screen reached — used for resume routing. */
  onboardingStep?: OnboardingStepId;
  /** App-level coach mascot visibility preference — not story characters. */
  mascotPreference: MascotPreference;
  /** Earned soft-branch saga finale variants keyed by saga id. */
  sagaEndingsBySagaId: Record<string, SagaEndingRecord>;
  /** Earned inventory items — non-stackable in v1. */
  inventoryItems: PlayerInventoryItem[];
  /** Per-universe equipped item loadouts. */
  equippedItemsByUniverseId: Record<string, EquippedItemsLoadout>;
  /** Tracks once-per-day passive item effects by local date. */
  inventoryDailyEffectsByDate: Record<string, InventoryDailyEffectsEntry>;
};

export type ItemRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export type ItemSlot = 'badge' | 'tool' | 'charm' | 'cosmetic';

export type InventoryItemId =
  | 'antique-sheriff-badge'
  | 'golden-bandana'
  | 'blue-revolver'
  | 'deputy-canteen'
  | 'railway-pocket-watch'
  | 'ledger-compass';

export type ItemEffectType =
  | 'first-daily-xp-bonus'
  | 'first-locked-focus-rep-bonus'
  | 'highlight-starter-move'
  | 'prioritize-recovery-health'
  | 'readiness-plan-bonus'
  | 'prioritize-business-errand-suite';

export type InventoryItemDefinition = {
  id: InventoryItemId;
  name: string;
  description: string;
  universeId?: string;
  suiteId?: QuestSuiteId;
  rarity: ItemRarity;
  slot: ItemSlot;
  effectType?: ItemEffectType;
  effectValue?: number;
  effectDescription: string;
  flavorText: string;
  image?: number;
};

export type InventoryItemSource =
  | 'chapter-complete'
  | 'saga-complete'
  | 'recovery-quest'
  | 'minimum-viable-day'
  | 'dev';

export type PlayerInventoryItem = {
  itemId: InventoryItemId;
  earnedAt: string;
  source: InventoryItemSource;
  isNew?: boolean;
};

export type EquippedItemsLoadout = {
  badge?: InventoryItemId;
  tool?: InventoryItemId;
  charm?: InventoryItemId;
  cosmetic?: InventoryItemId;
};

export type InventoryDailyEffectsEntry = {
  goldenBandanaXpUsed?: boolean;
  sheriffBadgeRepUsed?: boolean;
};

export type ActiveQuestItemEffectLine = {
  itemId: InventoryItemId;
  itemName: string;
  message: string;
};

/** Meta-coach guides (Sasha & Marcus) — separate from universe story characters. */
export type AppMascotId = 'sasha' | 'marcus';

export type MascotPreference = 'both' | 'sasha' | 'marcus' | 'minimal' | 'off';

export type AppMascot = {
  id: AppMascotId;
  name: string;
  role: string;
  toneDescription: string;
  initials: string;
  portrait?: number;
};

export type QuestStyleKey =
  | 'quick-wins'
  | 'deep-work'
  | 'story-driven'
  | 'recovery-mode'
  | 'challenge-seeker'
  | 'creative-builder';

export type QuestStyleProfile = {
  primaryStyle?: QuestStyleKey;
  secondaryStyle?: QuestStyleKey;
  updatedAt?: string;
};

export type CategoryQuestDefaults = {
  defaultRiskLevel?: QuestRiskLevel;
  defaultStarterEnabled?: boolean;
  defaultPrepStep?: string;
  defaultAfterQuestReward?: string;
  defaultPlannedTimeLabel?: string;
  defaultPlannedLocation?: string;
  defaultAfterCurrentHabit?: string;
  defaultMarkAsFocus?: boolean;
};

export type QuestDefaultsPresetId = 'low-friction' | 'deep-work' | 'recovery';

export type QuestDefaultsSettings = {
  byCategory: Partial<Record<TaskCategory, CategoryQuestDefaults>>;
  activePresetId?: QuestDefaultsPresetId;
};

export type QuestInboxItemStatus = 'inbox' | 'converted' | 'archived';

export type QuestInboxItem = {
  id: string;
  title: string;
  createdAt: string;
  suggestedCategory?: TaskCategory;
  status: QuestInboxItemStatus;
  /** Optional local date when the user plans to tackle this item (YYYY-MM-DD). */
  targetDate?: string;
};
