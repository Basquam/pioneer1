import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

const VOID = '#0c0c0e';
const WHITE = '#e8e8ec';
const HEAT = ['#1a1a2e', '#2d4a6e', '#c45c26', '#e8e8ec'];

/** Techwear signal console — tags, heatmap, segmented surfaces. */
export function StyleVariantTechwear() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <View style={styles.tagRow}>
        <Text style={styles.tag}>NEURONET</Text>
        <Text style={styles.tag}>SIG-7741</Text>
        <Text style={styles.tag}>LV{s.level}</Text>
      </View>
      <View style={styles.hero}>
        <Image source={STYLE_LAB_ASSETS.neuroChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.heroDim} />
        <View style={styles.heatRail}>
          {HEAT.map((c, i) => (
            <View key={i} style={[styles.heatCell, { backgroundColor: c, flex: i + 1 }]} />
          ))}
        </View>
        <Text style={styles.heroLabel}>SECTOR 02 · {s.chapterTitle.toUpperCase()}</Text>
      </View>
      <View style={styles.segmentRow}>
        <View style={styles.segment}>
          <Text style={styles.segLabel}>SIGNAL</Text>
          <Text style={styles.segValue}>{100 - s.threat}%</Text>
        </View>
        <View style={styles.segment}>
          <Text style={styles.segLabel}>ROUTE</Text>
          <Text style={styles.segValue}>{s.progressCleared}/{s.progressTotal}</Text>
        </View>
      </View>
      <View style={styles.meterTrack}>
        <View style={[styles.meterFill, { width: `${ratio * 100}%` }]} />
      </View>
      <View style={styles.comms}>
        <Text style={styles.commsTag}>UPLINK // {s.mentorLabel}</Text>
        <View style={styles.commsBody}>
          <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
          <Text style={styles.commsText}>{s.mentorMessage}</Text>
        </View>
      </View>
      <Pressable style={styles.cta}><Text style={styles.ctaText}>{s.primaryCta.toUpperCase()}</Text></Pressable>
      <View style={styles.footer}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.footerItem}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: VOID, padding: 14, gap: 10, minHeight: 640 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  tag: {
    fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 1, color: VOID,
    backgroundColor: WHITE, paddingHorizontal: 8, paddingVertical: 4,
  },
  hero: { height: 200, position: 'relative', overflow: 'hidden' },
  heroDim: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.5)' },
  heatRail: { position: 'absolute', right: 0, top: 0, bottom: 0, width: 10, flexDirection: 'column' },
  heatCell: { width: '100%' },
  heroLabel: {
    position: 'absolute', bottom: 12, left: 12,
    fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, color: WHITE,
  },
  segmentRow: { flexDirection: 'row', gap: 2 },
  segment: { flex: 1, backgroundColor: '#16161a', padding: 12, gap: 4, borderTopWidth: 2, borderTopColor: WHITE },
  segLabel: { fontFamily: GameFonts.ui, fontSize: 8, letterSpacing: 2, color: '#888' },
  segValue: { fontFamily: GameFonts.ui, fontSize: 22, color: WHITE, letterSpacing: 1 },
  meterTrack: { height: 3, backgroundColor: '#222', overflow: 'hidden' },
  meterFill: { height: '100%', backgroundColor: WHITE },
  comms: { borderWidth: 1, borderColor: '#333', padding: 12, gap: 8 },
  commsTag: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: '#888' },
  commsBody: { flexDirection: 'row', gap: 10 },
  portrait: { width: 56, height: 72, backgroundColor: '#222' },
  commsText: { flex: 1, fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: WHITE },
  cta: { backgroundColor: WHITE, paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 3, color: VOID },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  footerItem: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 1, color: '#666' },
});
