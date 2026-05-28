import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  countTodayUserQuests,
  getDailyFocusLimit,
} from '@/lib/daily-focus';

type TodayFocusDisplayProps = {
  variant?: 'briefing' | 'profile' | 'inline';
};

export function TodayFocusDisplay({ variant = 'briefing' }: TodayFocusDisplayProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const limit = getDailyFocusLimit(playerProgress);
  const count = countTodayUserQuests(playerProgress.userQuests);
  const isProfile = variant === 'profile';
  const isInline = variant === 'inline';

  return (
    <View
      style={[
        styles.wrap,
        isProfile && styles.wrapProfile,
        isInline && styles.wrapInline,
        !isInline && {
          backgroundColor: isProfile ? palette.panel : 'transparent',
          borderColor: palette.panelBorder,
        },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.label, { color: palette.accent }]}>FOCUS QUESTS</Text>
        <Text style={[styles.value, { color: palette.gold }]}>
          {count} / {limit}
        </Text>
      </View>
      <Text style={[styles.hint, { color: palette.fog }]}>
        {count < limit
          ? `${limit - count} Focus Quest ${limit - count === 1 ? 'slot' : 'slots'} left today.`
          : count === limit
            ? 'Focus Quests full — extra quests still count toward progress.'
            : 'Beyond today\'s Focus Quests — the story still moves forward.'}
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
  },
  wrapInline: {
    paddingVertical: 0,
    borderTopWidth: 0,
    borderBottomWidth: 0,
    gap: 2,
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
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
