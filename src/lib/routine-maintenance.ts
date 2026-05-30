import { getTraitForCategory } from '@/lib/identity-votes';
import {
  formatRecurrenceLabel,
  getRecurringTemplateInstances,
} from '@/lib/recurring-quests';
import { getLocalDateKey } from '@/lib/daily-streak';
import { isHighRiskQuest, resolveQuestRiskLevel } from '@/lib/quest-risk';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import type {
  IdentityTraitKey,
  PlayerProgress,
  QuestRiskLevel,
  RecurringQuestTemplate,
  UserQuest,
} from '@/types/narrative';

export type RoutineMaintenanceStatus =
  | 'healthy'
  | 'needs-adjustment'
  | 'stale'
  | 'too-heavy';

export type RoutineMaintenanceAction =
  | 'edit'
  | 'pause'
  | 'lower-difficulty'
  | 'add-starter'
  | 'archive'
  | 'keep-steady';

export type RoutineMaintenanceStats = {
  totalGeneratedInstances: number;
  completedInstances: number;
  completionRate: number;
  recentCompletionRate: number;
  lastCompletedDate: string | null;
  skippedIncompleteCount: number;
  averageRiskLevel: QuestRiskLevel;
  supportsDesiredIdentityTrait: boolean;
  desiredIdentityTrait: IdentityTraitKey | null;
};

export type RoutineMaintenanceEntry = {
  template: RecurringQuestTemplate;
  stats: RoutineMaintenanceStats;
  status: RoutineMaintenanceStatus;
  statusLabel: string;
  suggestion: string;
  primaryAction: RoutineMaintenanceAction;
  availableActions: RoutineMaintenanceAction[];
};

export type RoutineMaintenanceSummary = {
  entries: RoutineMaintenanceEntry[];
  universeFlavor: string;
  activeRoutineCount: number;
  needsAttentionCount: number;
};

export type RoutineMaintenanceContext = {
  progress: PlayerProgress;
  universeId: string;
  today?: string;
};

const STALE_DAYS = 14;
const RECENT_WINDOW_DAYS = 30;
const RECENT_ACTIVITY_DAYS = 7;
const HEALTHY_COMPLETION_RATE = 0.6;
const LOW_COMPLETION_RATE = 0.4;

const STATUS_LABELS: Record<RoutineMaintenanceStatus, string> = {
  healthy: 'HEALTHY',
  'needs-adjustment': 'NEEDS ADJUSTMENT',
  stale: 'STALE',
  'too-heavy': 'TOO HEAVY',
};

const STATUS_SUGGESTIONS: Record<RoutineMaintenanceStatus, string> = {
  healthy: 'This routine is working. Keep it steady.',
  'needs-adjustment': 'This routine may need a smaller version.',
  stale: 'This routine has gone quiet. Pause or redesign it?',
  'too-heavy': 'This routine may need a smaller version.',
};

const UNIVERSE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Keep only the trails worth riding.',
  neuronet: 'Retire unstable protocols.',
  'neon-ashes': 'Close cold leads or rewrite the case.',
};

function getUniverseFlavor(universeId: string): string {
  return UNIVERSE_FLAVOR[universeId] ?? UNIVERSE_FLAVOR['dust-and-iron'];
}

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

function daysBetween(startKey: string, endKey: string): number {
  const start = parseLocalDateKey(startKey).getTime();
  const end = parseLocalDateKey(endKey).getTime();
  return Math.floor((end - start) / (24 * 60 * 60 * 1000));
}

function subtractDays(dateKey: string, days: number): string {
  const date = parseLocalDateKey(dateKey);
  date.setDate(date.getDate() - days);
  return getLocalDateKey(date);
}

function filterInstancesInWindow(
  instances: UserQuest[],
  today: string,
  windowDays: number,
): UserQuest[] {
  const cutoff = subtractDays(today, windowDays);
  return instances.filter((quest) => {
    const createdOn = quest.createdOnDate ?? quest.createdDate ?? '';
    return createdOn.length > 0 && createdOn >= cutoff;
  });
}

function computeCompletionRate(instances: UserQuest[]): number {
  if (instances.length === 0) return 0;
  const completed = instances.filter((quest) => quest.isCompleted).length;
  return completed / instances.length;
}

function resolveLastCompletedDate(instances: UserQuest[]): string | null {
  const completed = instances
    .filter((quest) => quest.isCompleted)
    .sort((left, right) => (right.completedAt ?? '').localeCompare(left.completedAt ?? ''));

  const latest = completed[0];
  if (!latest) return null;

  return latest.completedAt?.slice(0, 10) ?? latest.createdOnDate ?? null;
}

function resolveAverageRiskLevel(
  template: RecurringQuestTemplate,
  instances: UserQuest[],
): QuestRiskLevel {
  const levels = instances
    .map((quest) => resolveQuestRiskLevel(quest.riskLevel ?? template.riskLevel))
    .concat(resolveQuestRiskLevel(template.riskLevel));

  const score =
    levels.reduce((sum, level) => {
      if (level === 'high') return sum + 3;
      if (level === 'standard') return sum + 2;
      return sum + 1;
    }, 0) / levels.length;

  if (score >= 2.5) return 'high';
  if (score >= 1.5) return 'standard';
  return 'low';
}

function supportsDesiredIdentityTrait(
  progress: PlayerProgress,
  template: RecurringQuestTemplate,
): { supports: boolean; trait: IdentityTraitKey | null } {
  const trait = getTraitForCategory(template.category);
  const desired = progress.desiredIdentityTraits ?? [];
  return {
    supports: desired.includes(trait),
    trait,
  };
}

function hasRecentSpawn(instances: UserQuest[], today: string): boolean {
  const cutoff = subtractDays(today, RECENT_ACTIVITY_DAYS);
  return instances.some((quest) => {
    const createdOn = quest.createdOnDate ?? quest.createdDate ?? '';
    return createdOn >= cutoff;
  });
}

function resolveRoutineStatus(input: {
  template: RecurringQuestTemplate;
  stats: RoutineMaintenanceStats;
  today: string;
  hasRecentSpawn: boolean;
}): RoutineMaintenanceStatus {
  const { template, stats, today, hasRecentSpawn: recentSpawn } = input;
  const createdDate = template.createdAt.slice(0, 10);
  const daysSinceCreated = daysBetween(createdDate, today);

  if (stats.lastCompletedDate) {
    const daysSinceCompletion = daysBetween(stats.lastCompletedDate, today);
    if (daysSinceCompletion >= STALE_DAYS) {
      return 'stale';
    }
  } else if (daysSinceCreated >= STALE_DAYS && stats.totalGeneratedInstances > 0) {
    return 'stale';
  } else if (daysSinceCreated >= STALE_DAYS && stats.totalGeneratedInstances === 0) {
    return 'stale';
  }

  if (
    isHighRiskQuest(stats.averageRiskLevel) &&
    stats.recentCompletionRate < LOW_COMPLETION_RATE &&
    stats.totalGeneratedInstances >= 2
  ) {
    return 'too-heavy';
  }

  if (stats.recentCompletionRate >= HEALTHY_COMPLETION_RATE && stats.totalGeneratedInstances > 0) {
    return 'healthy';
  }

  if (stats.recentCompletionRate < HEALTHY_COMPLETION_RATE && recentSpawn) {
    return 'needs-adjustment';
  }

  if (stats.totalGeneratedInstances === 0 && daysSinceCreated < STALE_DAYS) {
    return 'healthy';
  }

  if (stats.recentCompletionRate < HEALTHY_COMPLETION_RATE) {
    return 'needs-adjustment';
  }

  return 'healthy';
}

function buildAvailableActions(
  status: RoutineMaintenanceStatus,
  template: RecurringQuestTemplate,
): RoutineMaintenanceAction[] {
  const actions: RoutineMaintenanceAction[] = ['edit'];

  if (status === 'healthy') {
    actions.push('keep-steady');
    return actions;
  }

  if (status === 'needs-adjustment' || status === 'too-heavy') {
    if (!template.starterTaskTitle?.trim()) {
      actions.push('add-starter');
    }
    if (resolveQuestRiskLevel(template.riskLevel) !== 'low') {
      actions.push('lower-difficulty');
    }
  }

  if (status === 'stale' || status === 'too-heavy' || status === 'needs-adjustment') {
    actions.push('pause', 'archive');
  }

  return actions;
}

function resolvePrimaryAction(
  status: RoutineMaintenanceStatus,
  template: RecurringQuestTemplate,
  availableActions: RoutineMaintenanceAction[],
): RoutineMaintenanceAction {
  if (status === 'healthy') return 'keep-steady';
  if (status === 'stale') return availableActions.includes('pause') ? 'pause' : 'archive';
  if (status === 'too-heavy') {
    if (availableActions.includes('lower-difficulty')) return 'lower-difficulty';
    if (availableActions.includes('add-starter')) return 'add-starter';
    return 'pause';
  }
  if (!template.starterTaskTitle?.trim() && availableActions.includes('add-starter')) {
    return 'add-starter';
  }
  if (availableActions.includes('lower-difficulty')) return 'lower-difficulty';
  return 'edit';
}

function analyzeRecurringTemplate(
  progress: PlayerProgress,
  template: RecurringQuestTemplate,
  today: string,
): RoutineMaintenanceEntry {
  const instances = getRecurringTemplateInstances(progress.userQuests, template.id);
  const recentInstances = filterInstancesInWindow(instances, today, RECENT_WINDOW_DAYS);
  const identity = supportsDesiredIdentityTrait(progress, template);

  const completedInstances = instances.filter((quest) => quest.isCompleted).length;
  const stats: RoutineMaintenanceStats = {
    totalGeneratedInstances: instances.length,
    completedInstances,
    completionRate: computeCompletionRate(instances),
    recentCompletionRate: computeCompletionRate(recentInstances),
    lastCompletedDate: resolveLastCompletedDate(instances),
    skippedIncompleteCount: recentInstances.filter(
      (quest) => !quest.isCompleted && !quest.archivedAt,
    ).length,
    averageRiskLevel: resolveAverageRiskLevel(template, instances),
    supportsDesiredIdentityTrait: identity.supports,
    desiredIdentityTrait: identity.trait,
  };

  const status = resolveRoutineStatus({
    template,
    stats,
    today,
    hasRecentSpawn: hasRecentSpawn(instances, today),
  });

  const availableActions = buildAvailableActions(status, template);

  return {
    template,
    stats,
    status,
    statusLabel: STATUS_LABELS[status],
    suggestion: STATUS_SUGGESTIONS[status],
    primaryAction: resolvePrimaryAction(status, template, availableActions),
    availableActions,
  };
}

export function getSuggestedStarterForRoutine(template: RecurringQuestTemplate): string {
  return generateStarterTaskTitle(template.originalTitle, template.category);
}

export function computeRoutineMaintenanceSummary(
  context: RoutineMaintenanceContext,
): RoutineMaintenanceSummary {
  const today = context.today ?? getLocalDateKey();
  const activeTemplates = context.progress.recurringQuestTemplates.filter(
    (template) => template.isActive,
  );

  const entries = activeTemplates
    .map((template) => analyzeRecurringTemplate(context.progress, template, today))
    .sort((left, right) => {
      const severityOrder: Record<RoutineMaintenanceStatus, number> = {
        'too-heavy': 0,
        stale: 1,
        'needs-adjustment': 2,
        healthy: 3,
      };
      const leftRank = severityOrder[left.status];
      const rightRank = severityOrder[right.status];
      if (leftRank !== rightRank) return leftRank - rightRank;
      return left.stats.recentCompletionRate - right.stats.recentCompletionRate;
    });

  const needsAttentionCount = entries.filter((entry) => entry.status !== 'healthy').length;

  return {
    entries,
    universeFlavor: getUniverseFlavor(context.universeId),
    activeRoutineCount: activeTemplates.length,
    needsAttentionCount,
  };
}

export function formatRoutineCompletionRate(rate: number): string {
  return `${Math.round(rate * 100)}%`;
}

export function formatRoutineMaintenanceRecurrence(template: RecurringQuestTemplate): string {
  return formatRecurrenceLabel(template);
}

export function getRoutineMaintenanceActionLabel(action: RoutineMaintenanceAction): string {
  switch (action) {
    case 'edit':
      return 'EDIT ROUTINE';
    case 'pause':
      return 'PAUSE ROUTINE';
    case 'lower-difficulty':
      return 'LOWER DIFFICULTY';
    case 'add-starter':
      return 'ADD STARTER MOVE';
    case 'archive':
      return 'ARCHIVE ROUTINE';
    case 'keep-steady':
    default:
      return 'KEEP STEADY';
  }
}
