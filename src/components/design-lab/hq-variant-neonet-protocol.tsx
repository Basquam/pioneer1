import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HqPrototypeCta } from '@/components/design-lab/hq-prototype-card';
import { GameFonts } from '@/constants/typography';
import {
  getHqLabProgressRatio,
  HQ_LAB_ASSETS,
  HQ_LAB_SAMPLE,
} from '@/lib/design-lab/hq-lab-sample-data';

const CYAN = '#22d3ee';
const VIOLET = '#d946ef';
const VOID = '#050308';
const ICE = '#f5f0e6';
const FOG = '#9a93a8';

const NODES = [
  { x: 15, y: 25, hot: 0.3 },
  { x: 38, y: 18, hot: 0.7 },
  { x: 62, y: 35, hot: 0.9 },
  { x: 78, y: 52, hot: 0.5 },
  { x: 28, y: 58, hot: 0.4 },
  { x: 55, y: 68, hot: 0.85 },
];

const CONNECTIONS: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [0, 4],
  [4, 5],
  [2, 5],
];

/** Variant C — protocol packet / signal grid / heatmap nodes. */
export function HqVariantNeonetProtocol() {
  const sample = HQ_LAB_SAMPLE;
  const ratio = getHqLabProgressRatio();
  const remaining = sample.progressTotal - sample.progressCleared;

  return (
    <View style={styles.root}>
      <View style={styles.packetEnvelope}>
        <View style={styles.envelopeNotch} />
        <View style={styles.packetHero}>
          <Image source={HQ_LAB_ASSETS.neuroHero} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(5,3,8,0.25)', 'rgba(5,3,8,0.55)', 'rgba(5,3,8,0.94)']}
            locations={[0, 0.5, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.heatmapRail}>
            {[0.2, 0.45, 0.7, 0.95, 0.6, 0.35, 0.15].map((heat, i) => (
              <View
                key={i}
                style={[
                  styles.heatCell,
                  {
                    flex: heat,
                    backgroundColor: i % 2 === 0 ? `${CYAN}${Math.round(heat * 99).toString(16).padStart(2, '0')}` : `${VIOLET}${Math.round(heat * 66).toString(16).padStart(2, '0')}`,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.gridLayer} pointerEvents="none">
            {[20, 40, 60, 80].map((pct) => (
              <View key={`h-${pct}`} style={[styles.gridLineH, { top: `${pct}%` as `${number}%` }]} />
            ))}
            {CONNECTIONS.map(([a, b], i) => {
              const na = NODES[a];
              const nb = NODES[b];
              if (!na || !nb) return null;
              return (
                <View
                  key={i}
                  style={[
                    styles.connection,
                    {
                      left: `${na.x}%` as `${number}%`,
                      top: `${na.y}%` as `${number}%`,
                      width: `${Math.abs(nb.x - na.x)}%` as `${number}%`,
                      transform: [{ rotate: `${Math.atan2(nb.y - na.y, nb.x - na.x)}rad` }],
                    },
                  ]}
                />
              );
            })}
            {NODES.map((node, i) => (
              <View
                key={i}
                style={[
                  styles.node,
                  {
                    left: `${node.x}%` as `${number}%`,
                    top: `${node.y}%` as `${number}%`,
                    backgroundColor: node.hot > 0.7 ? VIOLET : CYAN,
                    opacity: 0.5 + node.hot * 0.5,
                  },
                ]}
              />
            ))}
          </View>
          <View style={styles.packetHeader}>
            <Text style={styles.packetId}>PKT-02-7741</Text>
            <Text style={styles.packetStatus}>ROUTING</Text>
          </View>
          <View style={styles.packetCopy}>
            <Text style={styles.packetLabel}>PROTOCOL PACKET</Text>
            <Text style={styles.packetTitle}>{sample.chapterTitle.toUpperCase()}</Text>
            <Text style={styles.packetMeta}>SECTOR 02 · {sample.saga.toUpperCase()}</Text>
          </View>
        </View>
      </View>

      <View style={styles.signalTrace}>
        {Array.from({ length: 24 }).map((_, i) => (
          <View
            key={i}
            style={[
              styles.traceBar,
              {
                height: 8 + (i % 5) * 6 + (i % 3) * 4,
                backgroundColor: i % 4 === 0 ? VIOLET : CYAN,
                opacity: 0.35 + (i % 4) * 0.15,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.hexRow}>
        <View style={styles.hexModule}>
          <Text style={styles.hexLabel}>NETWORK</Text>
          <Text style={[styles.hexValue, { color: CYAN }]}>{sample.villainInfluence}%</Text>
          <Text style={styles.hexMeta}>SIGNAL FADING</Text>
        </View>
        <View style={styles.hexModule}>
          <Text style={styles.hexLabel}>PROTOCOL</Text>
          <Text style={[styles.hexValue, { color: VIOLET }]}>{remaining}</Text>
          <Text style={styles.hexMeta}>{sample.progressCleared}/{sample.progressTotal} CLEARED</Text>
        </View>
      </View>

      <View style={styles.routeTrack}>
        <View style={[styles.routeFill, { width: `${ratio * 100}%` }]} />
      </View>

      <View style={styles.commsPanel}>
        <View style={styles.commsTop}>
          <View style={styles.commsLive} />
          <Text style={styles.commsLabel}>{sample.guide.label}</Text>
          <Text style={styles.commsChannel}>UPLINK · CH02 · 440ms</Text>
        </View>
        <View style={styles.commsBody}>
          <Image source={HQ_LAB_ASSETS.sashaPortrait} style={styles.commsPortrait} contentFit="cover" />
          <View style={styles.commsCopy}>
            <Text style={styles.commsTitle}>{sample.guide.title}</Text>
            <Text style={styles.commsMessage}>{sample.guide.message}</Text>
          </View>
        </View>
        <View style={styles.commsFooter}>
          <Text style={styles.commsFooterText}>SIG_INTEGRITY: 94% · ENCRYPTED</Text>
        </View>
      </View>

      <HqPrototypeCta
        label="GO TO OPERATIONS BOARD"
        hint="VIEW SECTOR OPERATIONS"
        backgroundColor={CYAN}
        textColor={VOID}
        hintColor="#0a2830"
        large
      />

      <View style={styles.cmdRow}>
        {[
          { label: 'OPS BOARD', sub: 'Primary', hot: true },
          { label: 'SECTOR MAP', sub: 'Grid' },
          { label: 'ADD OP', sub: 'Route' },
          { label: 'RUNNER FILE', sub: 'Standing' },
        ].map((cmd) => (
          <Pressable key={cmd.label} style={[styles.cmdCell, cmd.hot && styles.cmdCellHot]}>
            <Text style={[styles.cmdLabel, cmd.hot && { color: CYAN }]}>{cmd.label}</Text>
            <Text style={styles.cmdSub}>{cmd.sub}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 12 },
  packetEnvelope: { position: 'relative' },
  envelopeNotch: {
    alignSelf: 'center',
    width: 48,
    height: 8,
    backgroundColor: 'rgba(8, 14, 32, 0.98)',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    marginBottom: -1,
    zIndex: 1,
  },
  packetHero: {
    height: 290,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: VOID,
    borderWidth: 1,
    borderColor: `${CYAN}33`,
  },
  heatmapRail: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 12,
    flexDirection: 'column',
  },
  heatCell: { width: '100%' },
  gridLayer: { ...StyleSheet.absoluteFill },
  gridLineH: {
    position: 'absolute',
    left: 0,
    right: 12,
    height: 1,
    backgroundColor: `${CYAN}14`,
  },
  connection: {
    position: 'absolute',
    height: 1,
    backgroundColor: `${CYAN}44`,
    transformOrigin: 'left center',
  },
  node: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: -3,
    marginTop: -3,
  },
  packetHeader: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  packetId: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1.5,
    color: FOG,
  },
  packetStatus: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: CYAN,
  },
  packetCopy: {
    position: 'absolute',
    left: 0,
    right: 12,
    bottom: 0,
    padding: 16,
    gap: 4,
  },
  packetLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: CYAN,
  },
  packetTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: 2,
    color: ICE,
  },
  packetMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    color: FOG,
    letterSpacing: 1,
  },
  signalTrace: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: 32,
    paddingHorizontal: 4,
  },
  traceBar: {
    flex: 1,
    borderRadius: 1,
    minWidth: 4,
  },
  hexRow: {
    flexDirection: 'row',
    gap: 10,
  },
  hexModule: {
    flex: 1,
    backgroundColor: 'rgba(8, 14, 32, 0.98)',
    padding: 14,
    gap: 4,
    borderLeftWidth: 2,
    borderLeftColor: CYAN,
  },
  hexLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 2,
    color: FOG,
  },
  hexValue: {
    fontFamily: GameFonts.ui,
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 1,
  },
  hexMeta: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    color: FOG,
    letterSpacing: 0.5,
  },
  routeTrack: {
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: -4,
  },
  routeFill: {
    height: '100%',
    backgroundColor: CYAN,
  },
  commsPanel: {
    backgroundColor: 'rgba(6, 10, 22, 0.98)',
    borderRadius: 8,
    overflow: 'hidden',
    borderLeftWidth: 3,
    borderLeftColor: VIOLET,
  },
  commsTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: 'rgba(8, 14, 32, 0.6)',
  },
  commsLive: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: CYAN,
  },
  commsLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    color: CYAN,
  },
  commsChannel: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1,
    color: FOG,
    marginLeft: 'auto',
  },
  commsBody: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  commsPortrait: {
    width: 80,
    height: 100,
    borderRadius: 4,
    backgroundColor: 'rgba(8, 14, 32, 0.9)',
  },
  commsCopy: { flex: 1, gap: 6 },
  commsTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 15,
    letterSpacing: 0.5,
    color: ICE,
  },
  commsMessage: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 18,
    color: FOG,
  },
  commsFooter: {
    paddingHorizontal: 14,
    paddingBottom: 10,
  },
  commsFooterText: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 1.5,
    color: `${FOG}99`,
  },
  cmdRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  cmdCell: {
    width: '47%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: 'rgba(8, 14, 32, 0.96)',
    padding: 12,
    gap: 2,
    minHeight: 64,
  },
  cmdCellHot: {
    backgroundColor: `${CYAN}18`,
  },
  cmdLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 1.2,
    color: ICE,
  },
  cmdSub: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    color: FOG,
  },
});
