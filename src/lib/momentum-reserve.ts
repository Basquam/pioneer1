import { isHighRiskQuest } from '@/lib/quest-risk';
import type { BoardQuest, PlayerProgress } from '@/types/narrative';

export const MOMENTUM_USER_QUEST_GAIN = 1;
export const MOMENTUM_TEMPLATE_QUEST_GAIN = 2;
export const MOMENTUM_HIGH_RISK_BONUS = 2;

export const MOMENTUM_RESERVE_EXPLANATION =
  'Small wins are stored here until they become breakthroughs.';

export const MOMENTUM_MILESTONE_REACHED_MESSAGE = 'Momentum milestone reached.';

export type MomentumMilestone = {
  threshold: number;
  label: string;
};

export const MOMENTUM_MILESTONES: MomentumMilestone[] = [
  { threshold: 10, label: 'Momentum building' },
  { threshold: 25, label: 'Pressure rising' },
  { threshold: 50, label: 'Breakthrough near' },
  { threshold: 100, label: 'Compounding force' },
];

type MomentumUniverseCopy = {
  label: string;
  copy: string;
  unit: string;
};

const UNIVERSE_MOMENTUM_COPY: Record<string, MomentumUniverseCopy> = {
  'dust-and-iron': {
    label: 'Frontier Momentum',
    copy: 'Every small ride hardens the trail.',
    unit: 'Frontier Momentum',
  },
  neuronet: {
    label: 'Signal Charge',
    copy: 'Each operation strengthens the network.',
    unit: 'Signal Charge',
  },
  'neon-ashes': {
    label: 'Case Pressure',
    copy: 'Every lead adds pressure to the truth.',
    unit: 'Case Pressure',
  },
};

const DEFAULT_MOMENTUM_COPY = UNIVERSE_MOMENTUM_COPY['dust-and-iron'];

export type MomentumGainResult = {
  gain: number;
  progress: PlayerProgress;
  milestoneUnlock: MomentumMilestone | null;
};

export function getMomentumUniverseCopy(universeId: string): MomentumUniverseCopy {
  return UNIVERSE_MOMENTUM_COPY[universeId] ?? DEFAULT_MOMENTUM_COPY;
}

export function computeMomentumGain(
  source: BoardQuest['source'],
  riskLevel: BoardQuest['riskLevel'],
): number {
  const base =
    source === 'user' ? MOMENTUM_USER_QUEST_GAIN : MOMENTUM_TEMPLATE_QUEST_GAIN;
  const bonus = isHighRiskQuest(riskLevel) ? MOMENTUM_HIGH_RISK_BONUS : 0;
  return base + bonus;
}

export function computeMomentumGainFromQuest(quest: Pick<BoardQuest, 'source' | 'riskLevel'>): number {
  return computeMomentumGain(quest.source, quest.riskLevel);
}

export function detectMomentumMilestoneUnlock(
  previousTotal: number,
  newTotal: number,
  alreadyReached: number[] = [],
): MomentumMilestone | null {
  const reachedSet = new Set(alreadyReached);
  let unlocked: MomentumMilestone | null = null;

  for (const milestone of MOMENTUM_MILESTONES) {
    if (
      previousTotal < milestone.threshold &&
      newTotal >= milestone.threshold &&
      !reachedSet.has(milestone.threshold)
    ) {
      unlocked = milestone;
    }
  }

  return unlocked;
}

export function applyMomentumGain(progress: PlayerProgress, gain: number): MomentumGainResult {
  const previousTotal = sanitizeMomentumReserve(progress.momentumReserve);
  const nextTotal = previousTotal + Math.max(0, gain);
  const alreadyReached = sanitizeMomentumMilestonesReached(progress.momentumMilestonesReached);
  const milestoneUnlock = detectMomentumMilestoneUnlock(previousTotal, nextTotal, alreadyReached);

  const momentumMilestonesReached = milestoneUnlock
    ? [...alreadyReached, milestoneUnlock.threshold]
    : alreadyReached;

  return {
    gain: Math.max(0, gain),
    progress: {
      ...progress,
      momentumReserve: nextTotal,
      momentumMilestonesReached,
    },
    milestoneUnlock,
  };
}

export function getCurrentMomentumMilestone(total: number): MomentumMilestone | null {
  let current: MomentumMilestone | null = null;
  for (const milestone of MOMENTUM_MILESTONES) {
    if (total >= milestone.threshold) {
      current = milestone;
    }
  }
  return current;
}

export function getNextMomentumMilestone(total: number): MomentumMilestone | null {
  for (const milestone of MOMENTUM_MILESTONES) {
    if (total < milestone.threshold) {
      return milestone;
    }
  }
  return null;
}

export function formatMomentumGainOverlayLine(universeId: string, gain: number): string {
  const unit = getMomentumUniverseCopy(universeId).unit;
  return `+${gain} ${unit}`;
}

export function formatMomentumGainGenericLine(gain: number): string {
  return `+${gain} Momentum`;
}

export function sanitizeMomentumReserve(raw: unknown): number {
  if (typeof raw !== 'number' || !Number.isFinite(raw)) return 0;
  return Math.max(0, Math.floor(raw));
}

export function sanitizeMomentumMilestonesReached(raw: unknown): number[] {
  if (!Array.isArray(raw)) return [];

  const validThresholds = new Set(MOMENTUM_MILESTONES.map((milestone) => milestone.threshold));
  return raw.filter(
    (entry): entry is number =>
      typeof entry === 'number' && validThresholds.has(entry),
  );
}
