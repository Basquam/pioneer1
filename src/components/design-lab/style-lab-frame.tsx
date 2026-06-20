import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import type { StyleLabVariantMeta } from '@/lib/design-lab/style-lab-sample-data';
import { QuestoryTheme } from '@/theme/questory-theme';

type StyleLabFrameProps = {
  meta: StyleLabVariantMeta;
  children: ReactNode;
  compareMode?: boolean;
};

export function StyleLabFrame({ meta, children, compareMode = false }: StyleLabFrameProps) {
  return (
    <View style={[styles.frame, compareMode && styles.frameCompare]}>
      <Text style={styles.title}>{meta.fullTitle}</Text>
      <View style={styles.notes}>
        <NoteRow label="Strongest" value={meta.strongestUse} />
        <NoteRow label="Risk" value={meta.risk} />
        <NoteRow label="Questory use" value={meta.questoryUse} />
      </View>
      <View style={styles.phoneMock}>{children}</View>
      {compareMode ? <View style={styles.divider} /> : null}
    </View>
  );
}

function NoteRow({ label, value }: { label: string; value: string }) {
  return (
    <Text style={styles.noteLine}>
      <Text style={styles.noteLabel}>{label}: </Text>
      {value}
    </Text>
  );
}

const styles = StyleSheet.create({
  frame: { gap: 10 },
  frameCompare: { paddingBottom: 4 },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    color: QuestoryTheme.colors.text.primary,
    textTransform: 'uppercase',
  },
  notes: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: 12,
    gap: 6,
  },
  noteLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    color: QuestoryTheme.colors.text.muted,
  },
  noteLabel: {
    fontFamily: GameFonts.ui,
    color: QuestoryTheme.colors.accent.gold,
    letterSpacing: 1,
  },
  phoneMock: {
    borderRadius: 12,
    overflow: 'hidden',
    maxWidth: 430,
    alignSelf: 'center',
    width: '100%',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 20,
  },
});
