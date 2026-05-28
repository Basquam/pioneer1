import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type GameHudProps = {
  compact?: boolean;
};

export function GameHud({ compact }: GameHudProps) {
  const { activeUniverse, player, completedQuestCount, quests } = useGame();
  const { palette } = activeUniverse;
  const fill = useSharedValue(player.xpProgress);

  useEffect(() => {
    fill.value = withTiming(player.xpProgress, { duration: 600 });
  }, [fill, player.xpProgress]);

  const fillStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: fill.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <View style={[styles.levelBadge, { backgroundColor: palette.primary, borderColor: palette.gold }]}>
          <Text style={[styles.levelLabel, { color: palette.bone }]}>LV</Text>
          <Text style={[styles.levelValue, { color: palette.gold }]}>{player.level}</Text>
        </View>
        <View style={styles.titleBlock}>
          <Text style={[styles.rank, { color: palette.bone }]}>{player.rank.toUpperCase()}</Text>
          <Text style={[styles.subtitle, { color: palette.fog }]}>
            {player.totalXp} XP · {completedQuestCount}/{quests.length} MISSIONS
          </Text>
        </View>
      </View>

      {!compact && (
        <>
          <View style={[styles.barTrack, { backgroundColor: palette.xpTrack, borderColor: `${palette.gold}40` }]}>
            <Animated.View style={[styles.barFill, fillStyle, { backgroundColor: palette.xpFill }]} />
          </View>
          <View style={styles.statRow}>
            <Stat label="GRIT" value={`${player.stats.grit}`} colors={palette} />
            <Stat label="FOCUS" value={`${player.stats.focus}`} colors={palette} />
            <Stat label="LEGEND" value={`${player.stats.legend}%`} colors={palette} />
          </View>
        </>
      )}
    </View>
  );
}

function Stat({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { fog: string; gold: string };
}) {
  return (
    <View style={styles.stat}>
      <Text style={[styles.statLabel, { color: colors.fog }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.gold }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 10 },
  topRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    transform: [{ skewX: '-8deg' }],
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
    borderWidth: 1,
  },
  levelLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
  levelValue: { fontFamily: GameFonts.ui, fontSize: 22, lineHeight: 24 },
  titleBlock: { flex: 1, transform: [{ skewX: '-6deg' }] },
  rank: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 2 },
  subtitle: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1, marginTop: 2 },
  barTrack: { height: 8, overflow: 'hidden', borderWidth: 1 },
  barFill: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '100%' },
  statRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 4 },
  stat: { alignItems: 'center', minWidth: 72 },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 14, marginTop: 2, letterSpacing: 1 },
});
