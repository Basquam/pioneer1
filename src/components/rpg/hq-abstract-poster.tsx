import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { QuestoryTheme } from '@/theme/questory-theme';
import type { UniverseSkinId } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

type HqAbstractPosterProps = {
  skinId: UniverseSkinId;
  universeIcon: string;
  accentPrimary: string;
  accentSecondary: string;
};

/** Universe-specific abstract hero panel when no chapter/saga/mood image exists. */
export function HqAbstractPoster({ skinId, universeIcon, accentPrimary, accentSecondary }: HqAbstractPosterProps) {
  if (skinId === 'dust-and-iron') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['#3d2818', '#2a1810', '#1a0f0c', '#0d0a14']} style={StyleSheet.absoluteFill} />
        <View style={[styles.brassBar, { backgroundColor: `${accentPrimary}55` }]} />
        <View style={[styles.brassBarThin, { backgroundColor: `${accentSecondary}33` }]} />
        {HALFTONE_DOTS.map((dot, i) => (
          <View
            key={i}
            style={[
              styles.halftoneDot,
              {
                left: `${dot.x}%` as `${number}%`,
                top: `${dot.y}%` as `${number}%`,
                opacity: dot.o,
                backgroundColor: accentPrimary,
              },
            ]}
          />
        ))}
        <View style={[styles.stamp, { borderColor: `${accentPrimary}88` }]}>
          <Text style={[styles.stampText, { color: accentPrimary }]}>ACTIVE{'\n'}BOUNTY</Text>
        </View>
        <View style={styles.iconAnchor}>
          <Text style={styles.universeIcon}>{universeIcon}</Text>
        </View>
      </View>
    );
  }

  if (skinId === 'neuronet') {
    return (
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={['#0c1a32', '#0a1628', '#12082a', '#050308']} style={StyleSheet.absoluteFill} />
        {GRID_LINES.map((line, i) => (
          <View
            key={`h-${i}`}
            style={[
              styles.gridLineH,
              { top: `${line}%` as `${number}%`, backgroundColor: `${accentPrimary}18` },
            ]}
          />
        ))}
        {GRID_LINES.map((line, i) => (
          <View
            key={`v-${i}`}
            style={[
              styles.gridLineV,
              { left: `${line}%` as `${number}%`, backgroundColor: `${accentPrimary}12` },
            ]}
          />
        ))}
        {SIGNAL_NODES.map((node, i) => (
          <View
            key={i}
            style={[
              styles.signalNode,
              {
                left: `${node.x}%` as `${number}%`,
                top: `${node.y}%` as `${number}%`,
                backgroundColor: i % 3 === 0 ? accentSecondary : accentPrimary,
                opacity: node.o,
              },
            ]}
          />
        ))}
        <View style={[styles.scanLine, { backgroundColor: `${accentPrimary}44` }]} />
        <View style={styles.protocolLabel}>
          <Text style={[QuestoryTypography.caption, { color: accentPrimary, letterSpacing: 2, fontSize: 9 }]}>
            PROTOCOL PACKET
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={StyleSheet.absoluteFill}>
      <LinearGradient colors={['#1a1420', '#0d0a14', '#050308']} style={StyleSheet.absoluteFill} />
      <View style={styles.iconAnchor}>
        <Text style={styles.universeIcon}>{universeIcon}</Text>
      </View>
    </View>
  );
}

const HALFTONE_DOTS = [
  { x: 12, y: 18, o: 0.12 },
  { x: 28, y: 32, o: 0.08 },
  { x: 72, y: 14, o: 0.1 },
  { x: 85, y: 38, o: 0.07 },
  { x: 18, y: 55, o: 0.09 },
  { x: 62, y: 48, o: 0.11 },
  { x: 44, y: 22, o: 0.06 },
  { x: 90, y: 62, o: 0.08 },
];

const GRID_LINES = [20, 40, 60, 80];

const SIGNAL_NODES = [
  { x: 22, y: 28, o: 0.7 },
  { x: 48, y: 18, o: 0.5 },
  { x: 74, y: 34, o: 0.85 },
  { x: 36, y: 52, o: 0.45 },
  { x: 68, y: 58, o: 0.6 },
  { x: 88, y: 22, o: 0.35 },
];

const styles = StyleSheet.create({
  brassBar: {
    position: 'absolute',
    width: '140%',
    height: 3,
    top: '38%',
    left: '-20%',
    transform: [{ rotate: '-8deg' }],
  },
  brassBarThin: {
    position: 'absolute',
    width: '120%',
    height: 1,
    top: '52%',
    left: '-10%',
    transform: [{ rotate: '-4deg' }],
  },
  halftoneDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stamp: {
    position: 'absolute',
    top: 16,
    right: 16,
    borderWidth: 2,
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    transform: [{ rotate: '12deg' }],
  },
  stampText: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
    textAlign: 'center',
    lineHeight: 12,
  },
  iconAnchor: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  universeIcon: { fontSize: 64, opacity: 0.28, color: QuestoryTheme.colors.text.primary },
  gridLineH: { position: 'absolute', left: 0, right: 0, height: 1 },
  gridLineV: { position: 'absolute', top: 0, bottom: 0, width: 1 },
  signalNode: { position: 'absolute', width: 5, height: 5, borderRadius: 3 },
  scanLine: { position: 'absolute', left: 0, right: 0, top: '42%', height: 1 },
  protocolLabel: { position: 'absolute', top: 16, left: 16 },
});
