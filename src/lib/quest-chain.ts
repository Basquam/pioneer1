import { createUserQuestFromTask, createUserQuestId } from '@/lib/convert-task-to-quest';
import { LOW_READINESS_THRESHOLD } from '@/lib/quest-friction';
import { isQuestLifecycleArchived } from '@/lib/quest-lifecycle';
import { isHighRiskQuest } from '@/lib/quest-risk';
import { recordQuestCompletedAt } from '@/lib/motion-vs-action';
import type { BoardQuest, Chapter, PlayerProgress, Saga, TaskCategory, Universe, UserQuest } from '@/types/narrative';

export const MIN_CHAIN_STEPS = 2;
export const MAX_CHAIN_STEPS = 5;

export type QuestChainStepInput = {
  title: string;
  category?: TaskCategory;
  starterTaskTitle?: string;
};

export type QuestChainProgress = {
  completed: number;
  total: number;
};

export type QuestBoardEntry =
  | { kind: 'quest'; quest: BoardQuest }
  | { kind: 'chain'; parent: BoardQuest; children: BoardQuest[] };

const CHAIN_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Break the trail into smaller rides.',
  neuronet: 'Split the operation into executable packets.',
  'neon-ashes': 'Divide the case into leads you can follow.',
};

export function getQuestChainFlavor(universeId: string): string {
  return CHAIN_FLAVOR[universeId] ?? CHAIN_FLAVOR['dust-and-iron'];
}

export function formatChainProgressLabel(completed: number, total: number): string {
  return `Quest Chain: ${completed}/${total} steps cleared`;
}

export function formatChainCompleteLine(chainTitle: string, total: number): string {
  return `Quest Chain complete — ${chainTitle} (${total}/${total} steps cleared)`;
}

export function splitChildXpReward(parentXp: number, stepCount: number): number {
  return Math.max(5, Math.floor(parentXp / stepCount));
}

export function splitChildReputationReward(parentRep: number, stepCount: number): number {
  return Math.max(1, Math.floor(parentRep / stepCount));
}

export function isQuestChainSplittable(
  quest: Pick<UserQuest, 'id' | 'isCompleted' | 'archivedAt' | 'status' | 'isQuestChainParent' | 'parentQuestId'>,
): boolean {
  if (!quest.id.startsWith('user-')) return false;
  if (quest.isCompleted || quest.status === 'completed') return false;
  if (isQuestLifecycleArchived(quest)) return false;
  if (quest.isQuestChainParent) return false;
  if (quest.parentQuestId) return false;
  return true;
}

export function shouldHighlightQuestChainSplit(quest: BoardQuest): boolean {
  if (quest.source !== 'user' || quest.completed) return false;
  if (quest.isQuestChainParent || quest.parentQuestId) return false;

  if (isHighRiskQuest(quest.riskLevel)) return true;
  if (quest.readinessScore != null && quest.readinessScore <= LOW_READINESS_THRESHOLD) return true;

  const lastFriction = quest.frictionReviews?.[quest.frictionReviews.length - 1];
  if (lastFriction?.reason === 'too-big') return true;

  return false;
}

export function computeChainProgress(
  parent: Pick<UserQuest, 'childQuestIds'>,
  userQuests: UserQuest[],
): QuestChainProgress | null {
  const childIds = parent.childQuestIds ?? [];
  if (childIds.length === 0) return null;

  const children = childIds
    .map((id) => userQuests.find((quest) => quest.id === id))
    .filter((quest): quest is UserQuest => quest != null);

  if (children.length === 0) return null;

  return {
    completed: children.filter((child) => child.isCompleted).length,
    total: children.length,
  };
}

export function areAllChainChildrenComplete(
  parent: Pick<UserQuest, 'childQuestIds'>,
  userQuests: UserQuest[],
): boolean {
  const progress = computeChainProgress(parent, userQuests);
  return progress != null && progress.completed === progress.total;
}

export function isQuestChainParentBlocked(boardQuest: BoardQuest): boolean {
  if (!boardQuest.isQuestChainParent || !boardQuest.chainProgress) return false;
  return boardQuest.chainProgress.completed < boardQuest.chainProgress.total;
}

export function buildQuestChainFromParent(
  parent: UserQuest,
  steps: QuestChainStepInput[],
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  existingQuests: UserQuest[],
  routineProgress: Pick<PlayerProgress, 'routineRepetitionByKey'>,
  createdOnDate: string,
): { updatedParent: UserQuest; childQuests: UserQuest[] } {
  const trimmedSteps = steps
    .map((step) => ({
      title: step.title.trim(),
      category: step.category ?? parent.category,
      starterTaskTitle: step.starterTaskTitle?.trim(),
    }))
    .filter((step) => step.title.length > 0);

  if (trimmedSteps.length < MIN_CHAIN_STEPS || trimmedSteps.length > MAX_CHAIN_STEPS) {
    throw new Error(`Quest chain requires ${MIN_CHAIN_STEPS}–${MAX_CHAIN_STEPS} steps.`);
  }

  const chainTitle = parent.originalTitle.trim();
  const childXp = splitChildXpReward(parent.xpReward, trimmedSteps.length);
  const childRep = splitChildReputationReward(parent.reputationReward, trimmedSteps.length);

  const childQuests: UserQuest[] = [];
  let recentQuests = [...existingQuests];

  trimmedSteps.forEach((step, index) => {
    const child = createUserQuestFromTask(
      step.title,
      step.category,
      universe,
      saga,
      chapter,
      recentQuests,
      {
        ...(step.starterTaskTitle ? { starterTaskTitle: step.starterTaskTitle } : {}),
        riskLevel: 'standard',
      },
      createdOnDate,
      routineProgress,
    );

    const childWithChain: UserQuest = {
      ...child,
      id: createUserQuestId(),
      xpReward: childXp,
      reputationReward: childRep,
      parentQuestId: parent.id,
      chainStepOrder: index + 1,
      chainTitle,
    };

    childQuests.push(childWithChain);
    recentQuests = [...recentQuests, childWithChain];
  });

  const updatedParent: UserQuest = {
    ...parent,
    isQuestChainParent: true,
    chainTitle,
    childQuestIds: childQuests.map((child) => child.id),
  };

  return { updatedParent, childQuests };
}

export function markQuestChainParentComplete(userQuests: UserQuest[], parentId: string): UserQuest[] {
  return userQuests.map((quest) =>
    quest.id === parentId && !quest.isCompleted
      ? recordQuestCompletedAt({ ...quest, isCompleted: true })
      : quest,
  );
}

export function buildUserQuestBoardEntries(userQuests: BoardQuest[]): QuestBoardEntry[] {
  const byId = new Map(userQuests.map((quest) => [quest.id, quest]));
  const entries: QuestBoardEntry[] = [];

  for (const quest of userQuests) {
    if (quest.parentQuestId) continue;

    if (quest.isQuestChainParent && quest.childQuestIds?.length) {
      const children = quest.childQuestIds
        .map((id) => byId.get(id))
        .filter((child): child is BoardQuest => child != null);
      entries.push({ kind: 'chain', parent: quest, children });
      continue;
    }

    entries.push({ kind: 'quest', quest });
  }

  return entries;
}

export function sanitizeChildQuestIds(raw: unknown): string[] | undefined {
  if (!Array.isArray(raw)) return undefined;

  const ids = raw.filter((entry): entry is string => typeof entry === 'string' && entry.startsWith('user-'));
  return ids.length > 0 ? ids.slice(0, MAX_CHAIN_STEPS) : undefined;
}
