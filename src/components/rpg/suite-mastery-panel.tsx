import { StyleSheet, Text, View } from 'react-native';

import { getQuestSuiteById } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import { listSuiteMasteryEntries, QUESTS_PER_SUITE_LEVEL } from '@/lib/quest-suite-stats';
import type { PlayerProgress } from '@/types/narrative';

type SuiteMasteryPanelProps = {
  progress: PlayerProgress;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    primary: string;
  };
};

export function SuiteMasteryPanel({ progress, palette }: SuiteMasteryPanelProps) {
  const entries = listSuiteMasteryEntries(progress);

  if (entries.length === 0) {
    return (
      <Text style={[styles.empty, { color: palette.fog }]}>
        Complete quests with a suite selected to build mastery here.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {entries.map(({ suiteId, stats, level, progress: levelProgress }) => {
        const suite = getQuestSuiteById(suiteId);
        if (!suite) return null;

        return (
          <View
            key={suiteId}
            style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
            <View style={styles.rowHeader}>
              <Text style={styles.icon}>{suite.icon}</Text>
              <View style={styles.copy}>
                <Text style={[styles.label, { color: palette.bone }]}>{suite.label}</Text>
                <Text style={[styles.meta, { color: palette.fog }]}>
                  Level {level} · {stats.questsCompleted} cleared
                </Text>
              </View>
              <Text style={[styles.levelBadge, { color: palette.gold }]}>L{level}</Text>
            </View>
            <View style={[styles.track, { backgroundColor: palette.panelBorder }]}>
              <View
                style={[
                  styles.fill,
                  {
                    backgroundColor: palette.primary,
                    width: `${Math.max(8, Math.round(levelProgress * 100))}%`,
                  },
                ]}
              />
            </View>
            <Text style={[styles.progressHint, { color: palette.fog }]}>
              {stats.questsCompleted % QUESTS_PER_SUITE_LEVEL}/{QUESTS_PER_SUITE_LEVEL} to next level
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 8,
  },
  empty: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  rowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  icon: {
    fontSize: 18,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
  },
  meta: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
  },
  levelBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.8,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  progressHint: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 0.4,
  },
});
