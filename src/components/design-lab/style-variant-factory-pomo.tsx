import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

const STEEL = '#3a3f47';
const LABEL = '#f0c040';
const DARK = '#1e2228';

/** Factory pomo operations board — industrial labels, tactile console. */
export function StyleVariantFactoryPomo() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <View style={styles.plate}>
        <Text style={styles.plateText}>QUESTORY OPERATIONS · UNIT 02</Text>
      </View>
      <View style={styles.display}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.displayOverlay} />
        <View style={styles.labelStrip}>
          <Text style={styles.labelText}>MISSION: {s.chapterTitle.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.gaugeRow}>
        <View style={styles.gauge}>
          <Text style={styles.gaugeLabel}>OUTPUT</Text>
          <Text style={styles.gaugeVal}>{s.progressCleared}/{s.progressTotal}</Text>
          <View style={styles.gaugeTrack}>
            <View style={[styles.gaugeFill, { width: `${ratio * 100}%` }]} />
          </View>
        </View>
        <View style={styles.gauge}>
          <Text style={styles.gaugeLabel}>RISK</Text>
          <Text style={styles.gaugeVal}>{s.threat}%</Text>
        </View>
      </View>
      <View style={styles.readout}>
        <Text style={styles.readoutTag}>SUPERVISOR NOTE</Text>
        <View style={styles.readoutBody}>
          <Image source={STYLE_LAB_ASSETS.marcus} style={styles.portrait} contentFit="cover" />
          <Text style={styles.readoutText}>{s.mentorMessage}</Text>
        </View>
      </View>
      <Pressable style={styles.lever}>
        <View style={styles.leverKnob} />
        <Text style={styles.leverText}>{s.primaryCta.toUpperCase()}</Text>
      </Pressable>
      <View style={styles.switches}>
        {s.secondaryActions.map((a) => (
          <View key={a} style={styles.switch}>
            <View style={styles.switchDot} />
            <Text style={styles.switchLabel}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#2a2e34', padding: 14, gap: 10, minHeight: 640 },
  plate: {
    backgroundColor: STEEL, paddingVertical: 8, paddingHorizontal: 12,
    borderWidth: 2, borderColor: '#555', alignSelf: 'flex-start',
  },
  plateText: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2, color: LABEL },
  display: { height: 200, backgroundColor: DARK, position: 'relative', overflow: 'hidden', borderWidth: 4, borderColor: '#555' },
  displayOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.45)' },
  labelStrip: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: LABEL, padding: 8 },
  labelText: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 1, color: DARK },
  gaugeRow: { flexDirection: 'row', gap: 8 },
  gauge: { flex: 1, backgroundColor: DARK, padding: 12, gap: 4, borderWidth: 2, borderColor: '#444' },
  gaugeLabel: { fontFamily: GameFonts.ui, fontSize: 8, letterSpacing: 2, color: '#888' },
  gaugeVal: { fontFamily: GameFonts.ui, fontSize: 22, color: LABEL, letterSpacing: 1 },
  gaugeTrack: { height: 8, backgroundColor: '#333', overflow: 'hidden' },
  gaugeFill: { height: '100%', backgroundColor: LABEL },
  readout: { backgroundColor: DARK, padding: 12, gap: 8, borderLeftWidth: 4, borderLeftColor: LABEL },
  readoutTag: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: '#888' },
  readoutBody: { flexDirection: 'row', gap: 10 },
  portrait: { width: 56, height: 70, borderWidth: 2, borderColor: '#555' },
  readoutText: { flex: 1, fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: '#ccc' },
  lever: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    backgroundColor: STEEL, padding: 16, borderWidth: 3, borderColor: '#666',
  },
  leverKnob: { width: 24, height: 24, borderRadius: 12, backgroundColor: LABEL, borderWidth: 2, borderColor: DARK },
  leverText: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2, color: '#fff' },
  switches: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  switch: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  switchDot: { width: 10, height: 10, borderRadius: 2, backgroundColor: '#555' },
  switchLabel: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: '#aaa' },
});
