import { getLocalDateKey } from '@/lib/daily-streak';
import type { MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import type { PlayerProgress } from '@/types/narrative';

const VILLAIN_INFLUENCE_HIGH_THRESHOLD = 65;

function countUserQuestsCompletedToday(progress: PlayerProgress, today: string): number {
  return progress.userQuests.filter(
    (quest) => quest.isCompleted && quest.completedAt?.startsWith(today),
  ).length;
}

function hasAnyUserQuest(progress: PlayerProgress): boolean {
  return progress.userQuests.length > 0;
}

export function resolveHqGuideContext(input: {
  playerProgress: PlayerProgress;
  completedQuestCount: number;
  totalQuests: number;
  allQuestsComplete: boolean;
  villainInfluence: number;
  hasOnboarded: boolean;
  earlyHq: boolean;
}): MascotGuideContextId | null {
  if (!input.hasOnboarded) return null;

  const today = getLocalDateKey();
  const completedToday = countUserQuestsCompletedToday(input.playerProgress, today);
  const hasUserQuest = hasAnyUserQuest(input.playerProgress);
  const bountiesRemain =
    input.totalQuests > 0 && input.completedQuestCount < input.totalQuests;

  if (!hasUserQuest && input.earlyHq) {
    return 'hq_no_user_quest';
  }

  if (input.allQuestsComplete && input.totalQuests > 0) {
    return 'hq_story_continue';
  }

  if (input.villainInfluence >= VILLAIN_INFLUENCE_HIGH_THRESHOLD && bountiesRemain) {
    return 'hq_villain_high';
  }

  if (completedToday > 0) {
    return 'hq_progress_acknowledged';
  }

  if (bountiesRemain) {
    return 'hq_bounties_remain';
  }

  if (!hasUserQuest) {
    return 'hq_no_user_quest';
  }

  return null;
}
