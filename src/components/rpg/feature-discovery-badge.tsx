import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import type { FeatureDiscoveryKey } from '@/lib/feature-discovery';

type FeatureDiscoveryBadgeProps = {
  label?: 'NEW' | 'TRY THIS';
  palette: {
    gold: string;
    accent: string;
    bone: string;
    fog: string;
  };
};

export function FeatureDiscoveryBadge({
  label = 'NEW',
  palette,
}: FeatureDiscoveryBadgeProps) {
  return (
    <View style={[styles.badge, { borderColor: palette.gold, backgroundColor: `${palette.accent}44` }]}>
      <Text style={[styles.text, { color: palette.bone }]}>{label}</Text>
    </View>
  );
}

type FeatureDiscoveryHintProps = {
  hint: string;
  feature?: FeatureDiscoveryKey;
  showTryThis?: boolean;
  palette: {
    gold: string;
    fog: string;
    bone: string;
    accent: string;
  };
};

export function FeatureDiscoveryHint({
  hint,
  showTryThis = false,
  palette,
}: FeatureDiscoveryHintProps) {
  return (
    <View style={styles.hintRow}>
      {showTryThis ? <FeatureDiscoveryBadge label="TRY THIS" palette={palette} /> : null}
      <Text style={[styles.hint, { color: palette.fog }]}>{hint}</Text>
    </View>
  );
}

type FeatureDiscoveryTeaserProps = {
  message: string;
  palette: { fog: string; panelBorder: string; panel: string };
};

export function FeatureDiscoveryTeaser({ message, palette }: FeatureDiscoveryTeaserProps) {
  return (
    <View style={[styles.teaser, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.teaserText, { color: palette.fog }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-6deg' }],
  },
  text: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  hintRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    flexWrap: 'wrap',
  },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
    flex: 1,
    minWidth: 0,
  },
  teaser: {
    borderWidth: 1,
    padding: 10,
    transform: [{ skewX: '-2deg' }],
  },
  teaserText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 0.3,
  },
});
