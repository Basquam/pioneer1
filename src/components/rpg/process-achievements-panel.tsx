import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
    getProcessAchievementDefinition,
    PROCESS_ACHIEVEMENT_IDS,
} from '@/lib/process-achievements';

export function ProcessAchievementsPanel() {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;

  const unlocked = useMemo(() => {
    const entries = playerProgress.processAchievements ?? [];
    return [...entries].sort(
      (left, right) => new Date(right.unlockedAt).getTime() - new Date(left.unlockedAt).getTime(),
    );
  }, [playerProgress.processAchievements]);

  const unlockedIds = useMemo(
    () => new Set(unlocked.map((entry) => entry.achievementId)),
    [unlocked],
  );

  const remainingCount = PROCESS_ACHIEVEMENT_IDS.length - unlockedIds.size;

  if (unlocked.length === 0) {
    return (
      <View style={[styles.panel, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
        <Text style={[styles.empty, { color: palette.fog }]}>
          Process achievements appear when you use healthy behavior systems. More to discover.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      {unlocked.map((entry) => {
        const definition = getProcessAchievementDefinition(entry.achievementId);
        return (
          <View
            key={entry.achievementId}
            style={[styles.row, { borderColor: palette.gold, backgroundColor: `${palette.primary}33` }]}>
            <Text style={[styles.title, { color: palette.bone }]}>
              {definition.getTitle(activeUniverse.id)}
            </Text>
            <Text style={[styles.meaning, { color: palette.fog }]}>{definition.meaning}</Text>
          </View>
        );
      })}
      {remainingCount > 0 ? (
        <Text style={[styles.more, { color: palette.fog }]}>
          {remainingCount} more to discover.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  panel: {
    borderWidth: 1,
    padding: 12,
    transform: [{ skewX: '-2deg' }],
  },
  empty: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  row: {
    borderWidth: 1,
    padding: 10,
    gap: 3,
    transform: [{ skewX: '-2deg' }],
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  meaning: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
  },
  more: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    fontStyle: 'italic',
    paddingHorizontal: 2,
  },
});
