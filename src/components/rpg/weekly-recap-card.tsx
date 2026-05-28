import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { formatStreakDays } from '@/lib/daily-streak';
import { computeWeeklyRecap } from '@/lib/weekly-recap';

export function WeeklyRecapCard() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, playerProgress } = useGame();
  const { palette } = activeUniverse;

  const recap = useMemo(
    () => computeWeeklyRecap(playerProgress, activeSaga.id, new Date(), activeUniverse.id),
    [activeSaga.id, activeUniverse.id, playerProgress],
  );

  const isQuietWeek =
    recap.questsCompleted === 0 &&
    recap.xpEarned === 0 &&
    recap.reputationEarned === 0 &&
    recap.chaptersCompleted === 0;

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(80)}
      style={[
        styles.card,
        { backgroundColor: palette.panel, borderColor: palette.gold },
      ]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />

      <View style={styles.inner}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>WEEKLY RECAP</Text>
        <Text style={[styles.weekLabel, { color: palette.fog }]}>{recap.weekLabel}</Text>
        <Text style={[styles.flavor, { color: palette.bone }]}>{recap.flavorLine}</Text>

        {isQuietWeek ? (
          <Text style={[styles.quietHint, { color: palette.fog }]}>
            {ui.weeklyRecapQuietHint}
          </Text>
        ) : (
          <View style={styles.statsGrid}>
            <RecapStat label="CLEARED" value={String(recap.questsCompleted)} palette={palette} />
            <RecapStat label="XP EARNED" value={`+${recap.xpEarned}`} palette={palette} />
            <RecapStat
              label={ui.reputationLabel}
              value={`+${recap.reputationEarned}`}
              palette={palette}
            />
            <RecapStat label={ui.weeklyRecapSectorsLabel} value={String(recap.chaptersCompleted)} palette={palette} />
          </View>
        )}

        <View style={[styles.streakRow, { borderColor: palette.panelBorder }]}>
          <Text style={[styles.streakLabel, { color: palette.accent }]}>DAILY STREAK</Text>
          <Text style={[styles.streakValue, { color: palette.gold }]}>
            {formatStreakDays(recap.dailyStreak)}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}

function RecapStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { gold: string; fog: string; bone: string };
}) {
  return (
    <View style={styles.statCell}>
      <Text style={[styles.statLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.statValue, { color: palette.bone }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 5 },
  inner: { padding: 18, paddingLeft: 22, gap: 10, transform: [{ skewX: '2deg' }] },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  weekLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quietHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 2,
  },
  statCell: {
    width: '47%',
    minWidth: 120,
    flexGrow: 1,
    gap: 2,
  },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 20, letterSpacing: 1 },
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 2,
    gap: 8,
  },
  streakLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  streakValue: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1 },
});
