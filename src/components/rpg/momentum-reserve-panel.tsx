import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  getCurrentMomentumMilestone,
  getMomentumUniverseCopy,
  getNextMomentumMilestone,
  MOMENTUM_RESERVE_EXPLANATION,
} from '@/lib/momentum-reserve';

export function MomentumReservePanel() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const total = playerProgress.momentumReserve ?? 0;
  const copy = getMomentumUniverseCopy(activeUniverse.id);
  const currentMilestone = getCurrentMomentumMilestone(total);
  const nextMilestone = getNextMomentumMilestone(total);

  return (
    <View style={[styles.card, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.label, { color: palette.gold }]}>{copy.label.toUpperCase()}</Text>

      <View style={styles.pointsRow}>
        <Text style={[styles.pointsValue, { color: palette.bone }]}>{total}</Text>
        <Text style={[styles.pointsUnit, { color: palette.fog }]}>stored</Text>
      </View>

      <Text style={[styles.explanation, { color: palette.bone }]}>{MOMENTUM_RESERVE_EXPLANATION}</Text>
      <Text style={[styles.flavor, { color: palette.fog }]}>{copy.copy}</Text>

      {currentMilestone ? (
        <Text style={[styles.milestone, { color: palette.accent }]}>
          {currentMilestone.label}
          {nextMilestone ? ` · ${nextMilestone.threshold - total} to next` : ' · Peak stored force'}
        </Text>
      ) : nextMilestone ? (
        <Text style={[styles.milestone, { color: palette.fog }]}>
          {nextMilestone.threshold - total} to {nextMilestone.label.toLowerCase()}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  pointsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  pointsValue: {
    fontFamily: GameFonts.ui,
    fontSize: 28,
    letterSpacing: 1,
  },
  pointsUnit: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
  },
  explanation: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  flavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
  milestone: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    marginTop: 2,
  },
});
