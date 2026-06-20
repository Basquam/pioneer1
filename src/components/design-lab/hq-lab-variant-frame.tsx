import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import type { HqLabVariantMeta } from '@/lib/design-lab/hq-lab-sample-data';
import { QuestoryTheme } from '@/theme/questory-theme';

type HqLabVariantFrameProps = {
  meta: HqLabVariantMeta;
  children: ReactNode;
  compareMode?: boolean;
};

export function HqLabVariantFrame({ meta, children, compareMode = false }: HqLabVariantFrameProps) {
  return (
    <View style={[styles.frame, compareMode && styles.frameCompare]}>
      <Text style={styles.variantTitle}>{meta.fullTitle}</Text>
      <View style={styles.dnaBox}>
        <Text style={styles.dnaHeading}>Design DNA</Text>
        {meta.dnaNotes.map((note) => (
          <Text key={note} style={styles.dnaLine}>
            · {note}
          </Text>
        ))}
      </View>
      <View style={styles.prototype}>{children}</View>
      {compareMode ? <View style={styles.divider} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { gap: 10 },
  frameCompare: {
    paddingBottom: 8,
  },
  variantTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    color: QuestoryTheme.colors.text.primary,
    textTransform: 'uppercase',
  },
  dnaBox: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  dnaHeading: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: QuestoryTheme.colors.accent.gold,
    marginBottom: 2,
  },
  dnaLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    color: QuestoryTheme.colors.text.muted,
  },
  prototype: { gap: 0 },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 20,
    marginBottom: 4,
  },
});
