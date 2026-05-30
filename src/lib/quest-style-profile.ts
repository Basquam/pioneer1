import { getDefaultPrepPreset } from '@/lib/quest-prep';
import { DEFAULT_QUEST_RISK_LEVEL } from '@/lib/quest-risk';
import type { ResolvedAddQuestDefaults } from '@/lib/quest-defaults';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import type {
  IdentityTraitKey,
  QuestRiskLevel,
  QuestStyleKey,
  QuestStyleProfile,
  TaskCategory,
} from '@/types/narrative';

export type { QuestStyleKey, QuestStyleProfile } from '@/types/narrative';

export const QUEST_STYLE_KEYS: QuestStyleKey[] = [
  'quick-wins',
  'deep-work',
  'story-driven',
  'recovery-mode',
  'challenge-seeker',
  'creative-builder',
];

export type QuestStyleMeta = {
  key: QuestStyleKey;
  label: string;
  tagline: string;
  description: string;
  suggestedPackIds: string[];
  defaultRiskLevel?: QuestRiskLevel;
  traitBoost?: IdentityTraitKey[];
  categoryBoost?: TaskCategory[];
};

export const QUEST_STYLE_META: Record<QuestStyleKey, QuestStyleMeta> = {
  'quick-wins': {
    key: 'quick-wins',
    label: 'Quick Wins',
    tagline: 'Small, fast quests that build momentum.',
    description: 'Prefers low-risk moves with starter steps and gentle packs.',
    suggestedPackIds: ['morning-reset', 'low-energy-recovery'],
    defaultRiskLevel: 'low',
    categoryBoost: ['health', 'cleaning', 'errand'],
  },
  'deep-work': {
    key: 'deep-work',
    label: 'Deep Work',
    tagline: 'Focused sessions with a clear workspace.',
    description: 'Encourages plan, prep, and Focus Mode for work and study.',
    suggestedPackIds: ['deep-work-sprint', 'study-session'],
    defaultRiskLevel: 'standard',
    categoryBoost: ['work', 'study'],
  },
  'story-driven': {
    key: 'story-driven',
    label: 'Story Driven',
    tagline: 'Motivation through narrative and allies.',
    description: 'Emphasizes chapter bounties, character lines, and story progress.',
    suggestedPackIds: ['morning-reset', 'study-session'],
    categoryBoost: ['study', 'work'],
  },
  'recovery-mode': {
    key: 'recovery-mode',
    label: 'Recovery Mode',
    tagline: 'Low-pressure return after burnout or low energy.',
    description: 'Low-risk quests, starter moves, and recovery-friendly packs.',
    suggestedPackIds: ['low-energy-recovery', 'morning-reset'],
    defaultRiskLevel: 'low',
    categoryBoost: ['health', 'cleaning'],
  },
  'challenge-seeker': {
    key: 'challenge-seeker',
    label: 'Challenge Seeker',
    tagline: 'Harder missions when readiness is there.',
    description: 'Suggests progression and Quest Chains for difficult work.',
    suggestedPackIds: ['deep-work-sprint', 'clean-room-run'],
    defaultRiskLevel: 'standard',
    categoryBoost: ['work', 'fitness'],
  },
  'creative-builder': {
    key: 'creative-builder',
    label: 'Creative Builder',
    tagline: 'Make things that were not there before.',
    description: 'Creative, work, and builder-identity quests rise to the top.',
    suggestedPackIds: ['deep-work-sprint', 'study-session'],
    traitBoost: ['builder'],
    categoryBoost: ['creative', 'work'],
  },
};

export const QUEST_STYLE_SETTINGS_TITLE = 'Quest Style';
export const QUEST_STYLE_SETTINGS_SUBTITLE = 'Tune the app to the way you actually start.';

export function getQuestStyleMeta(key: QuestStyleKey): QuestStyleMeta {
  return QUEST_STYLE_META[key];
}

export function sanitizeQuestStyleProfile(raw: unknown): QuestStyleProfile {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const record = raw as Record<string, unknown>;
  const primaryStyle = sanitizeQuestStyleKey(record.primaryStyle);
  const secondaryStyle = sanitizeQuestStyleKey(record.secondaryStyle);

  const profile: QuestStyleProfile = {};

  if (primaryStyle) {
    profile.primaryStyle = primaryStyle;
  }

  if (secondaryStyle && secondaryStyle !== primaryStyle) {
    profile.secondaryStyle = secondaryStyle;
  }

  if (typeof record.updatedAt === 'string' && record.updatedAt.length > 0) {
    profile.updatedAt = record.updatedAt;
  }

  return profile;
}

export function sanitizeQuestStyleKey(raw: unknown): QuestStyleKey | null {
  if (typeof raw !== 'string') return null;
  return QUEST_STYLE_KEYS.includes(raw as QuestStyleKey) ? (raw as QuestStyleKey) : null;
}

export function isValidQuestStyleSelection(
  primaryStyle: QuestStyleKey | null,
  secondaryStyle?: QuestStyleKey | null,
): boolean {
  if (!primaryStyle) return false;
  if (secondaryStyle && secondaryStyle === primaryStyle) return false;
  return true;
}

export function getActiveQuestStyleKeys(profile: QuestStyleProfile | undefined): QuestStyleKey[] {
  if (!profile?.primaryStyle) return [];

  const keys: QuestStyleKey[] = [profile.primaryStyle];
  if (profile.secondaryStyle && profile.secondaryStyle !== profile.primaryStyle) {
    keys.push(profile.secondaryStyle);
  }
  return keys;
}

export function formatQuestStyleSummary(profile: QuestStyleProfile | undefined): string {
  if (!profile?.primaryStyle) return 'Not set';

  const primary = getQuestStyleMeta(profile.primaryStyle).label;
  if (!profile.secondaryStyle) return primary;

  return `${primary} · ${getQuestStyleMeta(profile.secondaryStyle).label}`;
}

export function resolveQuestStyleAddQuestDefaults(
  profile: QuestStyleProfile | undefined,
  category: TaskCategory,
  taskTitle: string,
): ResolvedAddQuestDefaults {
  const styleKey = profile?.primaryStyle;
  if (!styleKey) return {};

  const meta = getQuestStyleMeta(styleKey);
  const trimmedTask = taskTitle.trim();
  const resolved: ResolvedAddQuestDefaults = {};

  if (meta.defaultRiskLevel) {
    resolved.riskLevel = meta.defaultRiskLevel;
  }

  switch (styleKey) {
    case 'quick-wins':
    case 'recovery-mode':
      resolved.starterEnabled = true;
      if (trimmedTask) {
        resolved.starterTitle = generateStarterTaskTitle(trimmedTask, category);
      }
      break;
    case 'deep-work':
      if (category === 'work' || category === 'study') {
        resolved.riskLevel = 'standard';
        resolved.plannedLocation = 'Desk';
        resolved.focusPinned = true;
        resolved.prepEnabled = true;
        resolved.prepStepTitle = getDefaultPrepPreset(category);
        if (trimmedTask) {
          resolved.implementationIntention = `At Desk: ${trimmedTask}`;
        }
      }
      break;
    case 'challenge-seeker':
      resolved.riskLevel = resolved.riskLevel ?? DEFAULT_QUEST_RISK_LEVEL;
      break;
    default:
      break;
  }

  if (profile?.secondaryStyle === 'deep-work' && styleKey !== 'deep-work') {
    if ((category === 'work' || category === 'study') && !resolved.plannedLocation) {
      resolved.plannedLocation = 'Desk';
    }
  }

  if (profile?.secondaryStyle === 'quick-wins' || profile?.secondaryStyle === 'recovery-mode') {
    if (resolved.starterEnabled == null && (styleKey === 'challenge-seeker' || styleKey === 'creative-builder')) {
      resolved.starterEnabled = true;
      if (trimmedTask && !resolved.starterTitle) {
        resolved.starterTitle = generateStarterTaskTitle(trimmedTask, category);
      }
    }
  }

  return resolved;
}

export function mergeResolvedAddQuestDefaults(
  styleDefaults: ResolvedAddQuestDefaults,
  questDefaults: ResolvedAddQuestDefaults,
): ResolvedAddQuestDefaults {
  return {
    ...(styleDefaults.riskLevel != null && questDefaults.riskLevel == null
      ? { riskLevel: styleDefaults.riskLevel }
      : {}),
    ...(questDefaults.riskLevel != null ? { riskLevel: questDefaults.riskLevel } : {}),
    ...(styleDefaults.starterEnabled != null && questDefaults.starterEnabled == null
      ? { starterEnabled: styleDefaults.starterEnabled }
      : {}),
    ...(questDefaults.starterEnabled != null ? { starterEnabled: questDefaults.starterEnabled } : {}),
    ...(questDefaults.starterTitle ?? styleDefaults.starterTitle
      ? { starterTitle: questDefaults.starterTitle ?? styleDefaults.starterTitle }
      : {}),
    ...(styleDefaults.prepEnabled != null && questDefaults.prepEnabled == null
      ? { prepEnabled: styleDefaults.prepEnabled }
      : {}),
    ...(questDefaults.prepEnabled != null ? { prepEnabled: questDefaults.prepEnabled } : {}),
    ...(questDefaults.prepStepTitle ?? styleDefaults.prepStepTitle
      ? { prepStepTitle: questDefaults.prepStepTitle ?? styleDefaults.prepStepTitle }
      : {}),
    ...(questDefaults.rewardEnabled ?? styleDefaults.rewardEnabled
      ? { rewardEnabled: questDefaults.rewardEnabled ?? styleDefaults.rewardEnabled }
      : {}),
    ...(questDefaults.afterQuestReward ?? styleDefaults.afterQuestReward
      ? { afterQuestReward: questDefaults.afterQuestReward ?? styleDefaults.afterQuestReward }
      : {}),
    ...(questDefaults.plannedTimeLabel ?? styleDefaults.plannedTimeLabel
      ? { plannedTimeLabel: questDefaults.plannedTimeLabel ?? styleDefaults.plannedTimeLabel }
      : {}),
    ...(questDefaults.plannedLocation ?? styleDefaults.plannedLocation
      ? { plannedLocation: questDefaults.plannedLocation ?? styleDefaults.plannedLocation }
      : {}),
    ...(questDefaults.afterCurrentHabit ?? styleDefaults.afterCurrentHabit
      ? { afterCurrentHabit: questDefaults.afterCurrentHabit ?? styleDefaults.afterCurrentHabit }
      : {}),
    ...(questDefaults.focusPinned != null
      ? { focusPinned: questDefaults.focusPinned }
      : styleDefaults.focusPinned != null
        ? { focusPinned: styleDefaults.focusPinned }
        : {}),
    ...(questDefaults.implementationIntention ?? styleDefaults.implementationIntention
      ? {
          implementationIntention:
            questDefaults.implementationIntention ?? styleDefaults.implementationIntention,
        }
      : {}),
  };
}

export function getSuggestedPackOrder(profile: QuestStyleProfile | undefined): string[] {
  const keys = getActiveQuestStyleKeys(profile);
  const ordered: string[] = [];
  const seen = new Set<string>();

  for (const key of keys) {
    for (const packId of getQuestStyleMeta(key).suggestedPackIds) {
      if (seen.has(packId)) continue;
      seen.add(packId);
      ordered.push(packId);
    }
  }

  return ordered;
}

export function sortPackIdsByStyle(allPackIds: string[], profile: QuestStyleProfile | undefined): string[] {
  const preferred = getSuggestedPackOrder(profile);
  const preferredSet = new Set(preferred);

  return [
    ...preferred.filter((id) => allPackIds.includes(id)),
    ...allPackIds.filter((id) => !preferredSet.has(id)),
  ];
}

export function getTraitKeysForStyleSuggestions(
  desiredTraits: IdentityTraitKey[],
  profile: QuestStyleProfile | undefined,
): IdentityTraitKey[] {
  const styleKeys = getActiveQuestStyleKeys(profile);
  const boosted = new Set<IdentityTraitKey>(desiredTraits);

  for (const styleKey of styleKeys) {
    for (const trait of getQuestStyleMeta(styleKey).traitBoost ?? []) {
      boosted.add(trait);
    }
  }

  if (boosted.size === 0 && profile?.primaryStyle === 'creative-builder') {
    boosted.add('builder');
  }

  if (boosted.size === 0 && profile?.primaryStyle === 'recovery-mode') {
    boosted.add('resilient');
  }

  return [...boosted].slice(0, 3);
}

export function applyQuestStyleToTraitSuggestions<
  T extends { category: TaskCategory; enableStarter: boolean },
>(suggestions: T[], profile: QuestStyleProfile | undefined): T[] {
  const styleKey = profile?.primaryStyle;
  if (!styleKey) return suggestions;

  let next = suggestions.map((entry) => ({ ...entry }));

  if (styleKey === 'quick-wins' || styleKey === 'recovery-mode') {
    next = next.map((entry) => ({ ...entry, enableStarter: true }));
  }

  if (styleKey === 'creative-builder') {
    next.sort((left, right) => {
      const leftBoost = left.category === 'creative' || left.category === 'work' ? 0 : 1;
      const rightBoost = right.category === 'creative' || right.category === 'work' ? 0 : 1;
      return leftBoost - rightBoost;
    });
  }

  if (styleKey === 'recovery-mode') {
    next.sort((left, right) => {
      const leftBoost = left.category === 'health' || left.category === 'cleaning' ? 0 : 1;
      const rightBoost = right.category === 'health' || right.category === 'cleaning' ? 0 : 1;
      return leftBoost - rightBoost;
    });
  }

  return next;
}

export function getStoryDrivenBriefingHint(profile: QuestStyleProfile | undefined): string | null {
  if (profile?.primaryStyle !== 'story-driven' && profile?.secondaryStyle !== 'story-driven') {
    return null;
  }

  return 'Your style favors story bounties — check the Story trail when you want narrative momentum.';
}

export function getDailyAwarenessStyleRecommendation(
  blocker: import('@/types/narrative').DailyAwarenessBlocker,
  profile: QuestStyleProfile | undefined,
): string | null {
  const styleKey = profile?.primaryStyle;
  if (!styleKey) return null;

  switch (blocker) {
    case 'low-energy':
      if (styleKey === 'recovery-mode' || profile?.secondaryStyle === 'recovery-mode') {
        return 'Try the Low Energy Recovery pack or one tiny health quest.';
      }
      if (styleKey === 'quick-wins') {
        return 'Start with a 2-minute starter on the smallest quest you see.';
      }
      break;
    case 'unclear-priorities':
      if (styleKey === 'story-driven') {
        return 'Pick one chapter bounty before adding more personal quests.';
      }
      if (styleKey === 'deep-work') {
        return 'Open Focus Mode and anchor one quest to your desk.';
      }
      break;
    case 'too-many-tasks':
      if (styleKey === 'quick-wins') {
        return 'Keep today to one or two quick wins, then stop.';
      }
      break;
    case 'emotional-resistance':
      if (styleKey === 'deep-work') {
        return 'Use Focus Mode and begin with the starter move only.';
      }
      break;
    case 'ready':
      if (styleKey === 'story-driven') {
        return 'Follow one chapter bounty while energy is with you.';
      }
      if (styleKey === 'challenge-seeker') {
        return 'Pick one standard quest you can finish cleanly today.';
      }
      break;
    default:
      break;
  }

  return null;
}

export function createQuestStyleProfileUpdate(
  primaryStyle: QuestStyleKey,
  secondaryStyle?: QuestStyleKey | null,
): QuestStyleProfile {
  return {
    primaryStyle,
    ...(secondaryStyle && secondaryStyle !== primaryStyle ? { secondaryStyle } : {}),
    updatedAt: new Date().toISOString(),
  };
}
