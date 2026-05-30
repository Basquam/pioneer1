import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { countMinimumDaysSecuredThisMonth } from '@/lib/minimum-viable-day';

export function MinimumViableDayProfileStat() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const securedThisMonth = countMinimumDaysSecuredThisMonth(playerProgress);

  return (
    <Animated.View
      entering={FadeInDown.duration(500).delay(80)}
      style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.panelBorder }]}>
      <Text style={[styles.label, { color: palette.gold }]}>MINIMUM VIABLE DAYS</Text>
      <Text style={[styles.value, { color: palette.bone }]}>
        {securedThisMonth} minimum day{securedThisMonth === 1 ? '' : 's'} secured this month
      </Text>
      <Text style={[styles.hint, { color: palette.fog }]}>
        Low-energy days still count when you return with one small action.
      </Text>
    </Animated.View>
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
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
  },
  value: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.3,
    lineHeight: 20,
  },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
