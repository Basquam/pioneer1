import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { computeGlobalProfileStats, type GlobalProfileStats } from '@/lib/profile-progress-stats';
import type { PlayerProgress } from '@/types/narrative';

type GlobalProgressPanelProps = {
  progress: PlayerProgress;
  totalXp: number;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    xpTrack: string;
    xpFill: string;
    accent: string;
  };
};

export function GlobalProgressPanel({ progress, totalXp, palette }: GlobalProgressPanelProps) {
  const stats = computeGlobalProfileStats(progress, totalXp);

  return (
    <View style={styles.wrap}>
      <View style={[styles.heroCard, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
        <Text style={[styles.levelLabel, { color: palette.bone }]}>LEVEL {stats.level}</Text>
        <View style={[styles.xpBar, { backgroundColor: palette.xpTrack }]}>
          <View
            style={[
              styles.xpFill,
              { width: `${Math.round(stats.xpProgress * 100)}%`, backgroundColor: palette.xpFill },
            ]}
          />
        </View>
        <Text style={[styles.xpMeta, { color: palette.fog }]}>
          {stats.xpInLevel} / {stats.xpToNext} XP · {stats.totalXp} total
        </Text>
      </View>

      <View style={styles.grid}>
        <StatChip label="Quests cleared" value={String(stats.totalQuestsCompleted)} palette={palette} />
        <StatChip label="Chapters cleared" value={String(stats.chaptersCompleted)} palette={palette} />
        <StatChip label="Focus sessions" value={String(stats.focusSessions)} palette={palette} />
        <StatChip label="Identity votes" value={String(stats.identityVotesTotal)} palette={palette} />
        <StatChip label="Momentum reserve" value={String(stats.momentumReserve)} palette={palette} />
        <StatChip
          label="Process marks"
          value={String(stats.processAchievementsCount)}
          palette={palette}
        />
        <StatChip label="Daily streak" value={String(stats.dailyStreak)} palette={palette} />
        <StatChip label="Active days" value={String(stats.activeDays)} palette={palette} />
      </View>

      {stats.topIdentityTraitLabel ? (
        <Text style={[styles.identityHint, { color: palette.accent }]}>
          Strongest evidence: {stats.topIdentityTraitLabel}
        </Text>
      ) : null}
    </View>
  );
}

function StatChip({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: GlobalProgressPanelProps['palette'];
}) {
  return (
    <View style={[styles.chip, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.chipLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.chipValue, { color: palette.bone }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
  },
  heroCard: {
    alignItems: 'center',
    padding: 16,
    borderWidth: 2,
    gap: 8,
  },
  levelLabel: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    letterSpacing: 3,
  },
  xpBar: {
    width: '100%',
    height: 8,
    overflow: 'hidden',
  },
  xpFill: {
    height: '100%',
  },
  xpMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.6,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    width: '47%',
    flexGrow: 1,
    minWidth: 128,
    padding: 10,
    borderWidth: 1,
    gap: 3,
  },
  chipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  chipValue: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
  },
  identityHint: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});

export type { GlobalProfileStats };
