export type UniverseProfileLabels = {
  standing: string;
  rank: string;
  progress: string;
};

export const UNIVERSE_PROFILE_LABELS: Record<string, UniverseProfileLabels> = {
  'dust-and-iron': {
    standing: 'Reputation',
    rank: 'Deputy Rank',
    progress: 'Territories Reclaimed',
  },
  neuronet: {
    standing: 'Network Standing',
    rank: 'Signal Integrity',
    progress: 'Sectors Stabilized',
  },
  'neon-ashes': {
    standing: 'Detective Standing',
    rank: 'Case Integrity',
    progress: 'Leads Closed',
  },
};

export function getUniverseProfileLabels(universeId: string): UniverseProfileLabels {
  return (
    UNIVERSE_PROFILE_LABELS[universeId] ?? {
      standing: 'Standing',
      rank: 'Rank',
      progress: 'Chapters Cleared',
    }
  );
}

export const GLOBAL_PROGRESS_HINT = 'Your progress across every world.';

export const UNIVERSE_PROGRESS_HINT = 'Story progress in each world.';

export const SUITE_MASTERY_HINT = 'Real-life domains you have been building.';
