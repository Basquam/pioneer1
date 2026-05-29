import { getLocalWeekKey } from '@/lib/weekly-recap';
import type {
  PlayerProgress,
  WeeklyReviewEntry,
  WeeklyReviewHelpedFactor,
  WeeklyReviewSlowdownFactor,
} from '@/types/narrative';

export type WeeklyReviewHelpedOption = {
  factor: WeeklyReviewHelpedFactor;
  label: string;
};

export type WeeklyReviewSlowdownOption = {
  factor: WeeklyReviewSlowdownFactor;
  label: string;
};

export const WEEKLY_REVIEW_HELPED_OPTIONS: WeeklyReviewHelpedOption[] = [
  { factor: 'focus-mode', label: 'Focus Mode' },
  { factor: 'starter-moves', label: 'Starter moves' },
  { factor: 'prep-steps', label: 'Prep steps' },
  { factor: 'locked-focus', label: 'Locked focus' },
  { factor: 'character-story', label: 'Character story' },
  { factor: 'ambience', label: 'Ambience' },
  { factor: 'reward-rituals', label: 'Reward rituals' },
];

export const WEEKLY_REVIEW_SLOWDOWN_OPTIONS: WeeklyReviewSlowdownOption[] = [
  { factor: 'too-many-quests', label: 'Too many quests' },
  { factor: 'tasks-too-vague', label: 'Tasks too vague' },
  { factor: 'low-energy', label: 'Low energy' },
  { factor: 'wrong-timing', label: 'Wrong timing' },
  { factor: 'messy-environment', label: 'Messy environment' },
  { factor: 'emotional-resistance', label: 'Emotional resistance' },
  { factor: 'distractions', label: 'Distractions' },
];

const SLOWDOWN_RECOMMENDATIONS: Record<WeeklyReviewSlowdownFactor, string> = {
  'too-many-quests': 'Lock fewer focus quests next week.',
  'tasks-too-vague': 'Add a clearer starter move.',
  'low-energy': 'Use recovery quests earlier.',
  'wrong-timing': 'Add a when/where plan.',
  'messy-environment': 'Add prep steps.',
  'emotional-resistance': 'Use Focus Mode first.',
  distractions: 'Use a distraction shield before starting.',
};

const UNIVERSE_REVIEW_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Review the trail before the next ride.',
  neuronet: 'Audit the signal before the next cycle.',
  'neon-ashes': 'Reopen the file before the next case.',
};

const HELPED_FACTORS = new Set(WEEKLY_REVIEW_HELPED_OPTIONS.map((option) => option.factor));
const SLOWDOWN_FACTORS = new Set(WEEKLY_REVIEW_SLOWDOWN_OPTIONS.map((option) => option.factor));

export function getWeeklyReviewFlavorLine(universeId: string): string {
  return UNIVERSE_REVIEW_FLAVOR[universeId] ?? UNIVERSE_REVIEW_FLAVOR['dust-and-iron'];
}

export function getWeeklyReviewRecommendation(
  slowdownFactor: WeeklyReviewSlowdownFactor,
): string {
  return SLOWDOWN_RECOMMENDATIONS[slowdownFactor];
}

export function getWeeklyReviewEntry(
  progress: Pick<PlayerProgress, 'weeklyReviewByWeek'>,
  weekKey: string = getLocalWeekKey(),
): WeeklyReviewEntry | null {
  return progress.weeklyReviewByWeek?.[weekKey] ?? null;
}

export function recordWeeklyReview(
  progress: PlayerProgress,
  helpedFactors: WeeklyReviewHelpedFactor[],
  slowdownFactor: WeeklyReviewSlowdownFactor,
  weekKey: string = getLocalWeekKey(),
): PlayerProgress {
  const uniqueHelped = [...new Set(helpedFactors)].filter((factor) => HELPED_FACTORS.has(factor));
  const existing = progress.weeklyReviewByWeek ?? {};

  return {
    ...progress,
    weeklyReviewByWeek: {
      ...existing,
      [weekKey]: {
        weekKey,
        helpedFactors: uniqueHelped,
        slowdownFactor,
        submittedAt: new Date().toISOString(),
      },
    },
  };
}

export function sanitizeWeeklyReviewByWeek(
  raw: unknown,
): PlayerProgress['weeklyReviewByWeek'] {
  if (!raw || typeof raw !== 'object') return {};

  const result: PlayerProgress['weeklyReviewByWeek'] = {};

  for (const [weekKey, value] of Object.entries(raw as Record<string, unknown>)) {
    if (!value || typeof value !== 'object') continue;
    const entry = value as Record<string, unknown>;
    if (typeof entry.weekKey !== 'string' || entry.weekKey !== weekKey) continue;
    if (typeof entry.submittedAt !== 'string' || entry.submittedAt.length === 0) continue;
    if (
      typeof entry.slowdownFactor !== 'string' ||
      !SLOWDOWN_FACTORS.has(entry.slowdownFactor as WeeklyReviewSlowdownFactor)
    ) {
      continue;
    }

    const helpedFactors = Array.isArray(entry.helpedFactors)
      ? entry.helpedFactors.filter(
          (factor): factor is WeeklyReviewHelpedFactor =>
            typeof factor === 'string' && HELPED_FACTORS.has(factor as WeeklyReviewHelpedFactor),
        )
      : [];

    result[weekKey] = {
      weekKey,
      helpedFactors: [...new Set(helpedFactors)],
      slowdownFactor: entry.slowdownFactor as WeeklyReviewSlowdownFactor,
      submittedAt: entry.submittedAt,
    };
  }

  return result;
}

/** Drop weekly reviews older than the activity retention window. */
export function pruneWeeklyReviewByWeek(
  weeklyReviewByWeek: PlayerProgress['weeklyReviewByWeek'],
  referenceDate = new Date(),
  retentionDays = 84,
): PlayerProgress['weeklyReviewByWeek'] {
  const cutoff = new Date(referenceDate);
  cutoff.setDate(cutoff.getDate() - retentionDays);
  const cutoffKey = getLocalWeekKey(cutoff);

  return Object.fromEntries(
    Object.entries(weeklyReviewByWeek).filter(([weekKey]) => weekKey >= cutoffKey),
  );
}

export function formatHelpedFactorsSummary(factors: WeeklyReviewHelpedFactor[]): string {
  if (factors.length === 0) return 'Nothing selected';

  const labels = factors
    .map(
      (factor) =>
        WEEKLY_REVIEW_HELPED_OPTIONS.find((option) => option.factor === factor)?.label ?? factor,
    )
    .join(', ');

  return labels;
}

export function formatSlowdownFactorLabel(factor: WeeklyReviewSlowdownFactor): string {
  return (
    WEEKLY_REVIEW_SLOWDOWN_OPTIONS.find((option) => option.factor === factor)?.label ?? factor
  );
}
