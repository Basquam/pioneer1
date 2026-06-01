import { StyleSheet, Text, View } from 'react-native';

import { UNIVERSES } from '@/data/narrative/universes';
import { GameFonts } from '@/constants/typography';
import { listSagaEndingRecordsForUniverse } from '@/lib/saga-ending-resolver';

type SagaEndingsPanelProps = {
  progress: import('@/types/narrative').PlayerProgress;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
  };
};

export function SagaEndingsPanel({ progress, palette }: SagaEndingsPanelProps) {
  const entries = UNIVERSES.flatMap((universe) =>
    listSagaEndingRecordsForUniverse(progress, universe).map((entry) => ({
      ...entry,
      universeName: universe.name,
    })),
  );

  if (entries.length === 0) {
    return (
      <Text style={[styles.empty, { color: palette.fog }]}>
        Complete a saga finale to earn a personalized ending here.
      </Text>
    );
  }

  return (
    <View style={styles.list}>
      {entries.map((entry) => (
        <View
          key={entry.sagaId}
          style={[styles.row, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
          <Text style={[styles.universe, { color: palette.fog }]}>{entry.universeName}</Text>
          <Text style={[styles.saga, { color: palette.gold }]}>{entry.sagaTitle}</Text>
          <Text style={[styles.title, { color: palette.bone }]}>{entry.record.title}</Text>
          <Text style={[styles.summary, { color: palette.fog }]} numberOfLines={3}>
            {entry.record.summary}
          </Text>
        </View>
      ))}
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
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  universe: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  saga: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    lineHeight: 18,
  },
  summary: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
});
