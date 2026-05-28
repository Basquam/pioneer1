import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { formatStreakDays, getStreakFlavor } from '@/lib/daily-streak';

type DailyStreakDisplayProps = {
  variant?: 'briefing' | 'profile';
};

export function DailyStreakDisplay({ variant = 'briefing' }: DailyStreakDisplayProps) {
  const { activeUniverse, activeSaga, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const flavor = getStreakFlavor(activeSaga.id);
  const streak = playerProgress.dailyStreak;
  const isProfile = variant === 'profile';

  return (
    <View
      style={[
        styles.wrap,
        isProfile && styles.wrapProfile,
        {
          backgroundColor: isProfile ? palette.panel : 'transparent',
          borderColor: palette.panelBorder,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: palette.accent }]}>{flavor.shortLabel}</Text>
        <Text style={[styles.value, { color: palette.gold }]}>{formatStreakDays(streak)}</Text>
      </View>
      <Text style={[styles.encouragement, { color: palette.fog }]}>
        {flavor.encouragement}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  wrapProfile: {
    borderWidth: 1,
    padding: 14,
    transform: [{ skewX: '-2deg' }],
    borderTopWidth: 1,
    borderBottomWidth: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
    flex: 1,
  },
  value: {
    fontFamily: GameFonts.ui,
    fontSize: 16,
    letterSpacing: 1,
    flexShrink: 0,
  },
  encouragement: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
