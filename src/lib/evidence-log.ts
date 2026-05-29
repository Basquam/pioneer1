import { getLocalDateKey } from '@/lib/daily-streak';
import { getIdentityTraitMeta, getTraitForCategory } from '@/lib/identity-votes';
import type {
  BoardQuest,
  EvidenceEvent,
  EvidenceEventSource,
  IdentityTraitKey,
  PlayerProgress,
  TaskCategory,
} from '@/types/narrative';

export const MAX_EVIDENCE_LOG_EVENTS = 200;

const TASK_CATEGORIES = new Set<TaskCategory>([
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
]);

const UNIVERSE_EVIDENCE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Another mark on the badge.',
  neuronet: 'Another signal recorded.',
  'neon-ashes': 'Another clue filed.',
};

export type EvidenceEventInput = {
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
  date?: string;
  timestamp?: string;
};

export type EvidenceDateGroup = {
  date: string;
  label: string;
  events: EvidenceEvent[];
};

export function createEvidenceEventId(): string {
  return `evidence-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getUniverseEvidenceFlavorLine(universeId: string): string {
  return UNIVERSE_EVIDENCE_FLAVOR[universeId] ?? UNIVERSE_EVIDENCE_FLAVOR['dust-and-iron'];
}

export function createEvidenceEvent(input: EvidenceEventInput): EvidenceEvent {
  const originalTaskTitle = input.originalTaskTitle?.trim();

  return {
    id: createEvidenceEventId(),
    date: input.date ?? getLocalDateKey(),
    timestamp: input.timestamp ?? new Date().toISOString(),
    universeId: input.universeId,
    sagaId: input.sagaId,
    chapterId: input.chapterId,
    questTitle: input.questTitle.trim(),
    category: input.category,
    xpEarned: input.xpEarned,
    reputationEarned: input.reputationEarned,
    source: input.source,
    ...(originalTaskTitle ? { originalTaskTitle } : {}),
    ...(input.identityTraitGained ? { identityTraitGained: input.identityTraitGained } : {}),
    ...(input.characterId ? { characterId: input.characterId } : {}),
    ...(input.rewardRitual?.trim() ? { rewardRitual: input.rewardRitual.trim() } : {}),
  };
}

export function buildEvidenceEventFromQuestCompletion(
  boardQuest: Pick<
    BoardQuest,
    | 'source'
    | 'narrativeTitle'
    | 'originalTitle'
    | 'category'
    | 'xpReward'
    | 'reputationReward'
    | 'reactionCharacterId'
    | 'afterQuestReward'
  >,
  context: {
    universeId: string;
    sagaId: string;
    chapterId: string;
    traitKey: IdentityTraitKey;
  },
): EvidenceEvent {
  const trait = getIdentityTraitMeta(context.traitKey);
  const originalTaskTitle =
    boardQuest.source === 'user' ? boardQuest.originalTitle.trim() : undefined;

  return createEvidenceEvent({
    universeId: context.universeId,
    sagaId: context.sagaId,
    chapterId: context.chapterId,
    questTitle: boardQuest.narrativeTitle,
    originalTaskTitle,
    category: boardQuest.category,
    identityTraitGained: trait.label,
    xpEarned: boardQuest.xpReward,
    reputationEarned: boardQuest.reputationReward,
    characterId: boardQuest.reactionCharacterId,
    rewardRitual: boardQuest.afterQuestReward,
    source: boardQuest.source === 'user' ? 'userQuest' : 'chapterBounty',
  });
}

export function pruneEvidenceLog(events: EvidenceEvent[]): EvidenceEvent[] {
  return events.slice(0, MAX_EVIDENCE_LOG_EVENTS);
}

export function appendEvidenceEvent(
  progress: PlayerProgress,
  event: EvidenceEvent,
): PlayerProgress {
  return {
    ...progress,
    evidenceLog: pruneEvidenceLog([event, ...progress.evidenceLog]),
  };
}

function isEvidenceEventSource(value: unknown): value is EvidenceEventSource {
  return value === 'userQuest' || value === 'chapterBounty';
}

function isTaskCategory(value: unknown): value is TaskCategory {
  return typeof value === 'string' && TASK_CATEGORIES.has(value as TaskCategory);
}

export function sanitizeEvidenceEvent(raw: unknown): EvidenceEvent | null {
  if (!raw || typeof raw !== 'object') return null;

  const event = raw as Record<string, unknown>;
  if (typeof event.id !== 'string' || !event.id.startsWith('evidence-')) return null;
  if (typeof event.date !== 'string' || event.date.length === 0) return null;
  if (typeof event.timestamp !== 'string' || event.timestamp.length === 0) return null;
  if (typeof event.universeId !== 'string') return null;
  if (typeof event.sagaId !== 'string') return null;
  if (typeof event.chapterId !== 'string') return null;
  if (typeof event.questTitle !== 'string' || event.questTitle.trim().length === 0) return null;
  if (!isTaskCategory(event.category)) return null;
  if (typeof event.xpEarned !== 'number' || !Number.isFinite(event.xpEarned)) return null;
  if (typeof event.reputationEarned !== 'number' || !Number.isFinite(event.reputationEarned)) {
    return null;
  }
  if (!isEvidenceEventSource(event.source)) return null;

  const sanitized: EvidenceEvent = {
    id: event.id,
    date: event.date,
    timestamp: event.timestamp,
    universeId: event.universeId,
    sagaId: event.sagaId,
    chapterId: event.chapterId,
    questTitle: event.questTitle.trim(),
    category: event.category,
    xpEarned: Math.floor(event.xpEarned),
    reputationEarned: Math.floor(event.reputationEarned),
    source: event.source,
  };

  if (typeof event.originalTaskTitle === 'string' && event.originalTaskTitle.trim().length > 0) {
    sanitized.originalTaskTitle = event.originalTaskTitle.trim();
  }

  if (typeof event.identityTraitGained === 'string' && event.identityTraitGained.length > 0) {
    sanitized.identityTraitGained = event.identityTraitGained;
  }

  if (typeof event.characterId === 'string' && event.characterId.length > 0) {
    sanitized.characterId = event.characterId;
  }

  if (typeof event.rewardRitual === 'string' && event.rewardRitual.trim().length > 0) {
    sanitized.rewardRitual = event.rewardRitual.trim();
  }

  return sanitized;
}

export function sanitizeEvidenceLog(raw: unknown): EvidenceEvent[] {
  if (!Array.isArray(raw)) return [];

  return pruneEvidenceLog(
    raw
      .map((entry) => sanitizeEvidenceEvent(entry))
      .filter((entry): entry is EvidenceEvent => entry !== null)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
  );
}

function parseLocalDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T12:00:00`);
}

export function formatEvidenceDateLabel(dateKey: string, today = getLocalDateKey()): string {
  if (dateKey === today) return 'Today';

  const todayDate = parseLocalDateKey(today);
  const targetDate = parseLocalDateKey(dateKey);
  const diffDays = Math.round((todayDate.getTime() - targetDate.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 1) return 'Yesterday';

  return targetDate.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function groupEvidenceByDate(
  events: EvidenceEvent[],
  today = getLocalDateKey(),
): EvidenceDateGroup[] {
  const grouped = new Map<string, EvidenceEvent[]>();

  for (const event of events) {
    const bucket = grouped.get(event.date) ?? [];
    bucket.push(event);
    grouped.set(event.date, bucket);
  }

  return [...grouped.entries()]
    .sort(([left], [right]) => right.localeCompare(left))
    .map(([date, dateEvents]) => ({
      date,
      label: formatEvidenceDateLabel(date, today),
      events: dateEvents.sort((a, b) => b.timestamp.localeCompare(a.timestamp)),
    }));
}

export function formatEvidenceRewards(event: EvidenceEvent): string {
  return `+${event.xpEarned} XP · +${event.reputationEarned} rep`;
}

export function getTraitLabelForCategory(category: TaskCategory): string {
  return getIdentityTraitMeta(getTraitForCategory(category)).label;
}
