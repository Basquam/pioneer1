import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

const BLUE = '#0a3d62';
const LINE = 'rgba(255,255,255,0.22)';
const CYAN = '#7fdbff';

/** Blueprint mission board — grid, nodes, annotations. */
export function StyleVariantBlueprint() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      {[20, 40, 60, 80].map((p) => (
        <View key={`h${p}`} style={[styles.gridH, { top: `${p}%` as `${number}%` }]} />
      ))}
      {[20, 40, 60, 80].map((p) => (
        <View key={`v${p}`} style={[styles.gridV, { left: `${p}%` as `${number}%` }]} />
      ))}
      <Text style={styles.ref}>REF: VG-CH02 · SCALE 1:1</Text>
      <Text style={styles.title}>MISSION DIAGRAM</Text>
      <Text style={styles.sub}>{s.chapterTitle} · {s.saga}</Text>
      <View style={styles.diagram}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={styles.diagramArt} contentFit="cover" />
        <View style={styles.nodeA}><Text style={styles.nodeLabel}>START</Text></View>
        <View style={styles.nodeB}><Text style={styles.nodeLabel}>YOU</Text></View>
        <View style={styles.nodeC}><Text style={styles.nodeLabel}>WAREHOUSE</Text></View>
        <View style={styles.routeLine} />
      </View>
      <View style={styles.measure}>
        <Text style={styles.measureText}>PROGRESS {Math.round(ratio * 100)}% · {s.progressCleared}/{s.progressTotal}</Text>
        <Text style={styles.measureText}>THREAT VECTOR {s.threat}%</Text>
      </View>
      <View style={styles.annotation}>
        <Text style={styles.annotationTag}>NOTE 04</Text>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.annotationText}>{s.mentorMessage}</Text>
      </View>
      <Pressable style={styles.cta}><Text style={styles.ctaText}>{s.primaryCta.toUpperCase()}</Text></Pressable>
      <View style={styles.footer}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.footerLink}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: BLUE, padding: 18, gap: 10, minHeight: 640, position: 'relative' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: LINE },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: LINE },
  ref: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: CYAN },
  title: { fontFamily: GameFonts.ui, fontSize: 22, letterSpacing: 4, color: '#fff' },
  sub: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: CYAN, marginBottom: 4 },
  diagram: { height: 200, borderWidth: 1, borderColor: CYAN, position: 'relative' },
  diagramArt: { ...StyleSheet.absoluteFill, opacity: 0.35 },
  nodeA: { position: 'absolute', left: '8%', top: '40%', padding: 6, borderWidth: 1, borderColor: CYAN },
  nodeB: { position: 'absolute', left: '42%', top: '55%', padding: 6, borderWidth: 1, borderColor: '#fff', backgroundColor: `${BLUE}cc` },
  nodeC: { position: 'absolute', right: '8%', top: '25%', padding: 6, borderWidth: 1, borderColor: CYAN },
  nodeLabel: { fontFamily: GameFonts.ui, fontSize: 8, letterSpacing: 1, color: '#fff' },
  routeLine: { position: 'absolute', left: '15%', top: '48%', width: '70%', height: 1, backgroundColor: CYAN, transform: [{ rotate: '-12deg' }] },
  measure: { gap: 4, borderLeftWidth: 2, borderLeftColor: CYAN, paddingLeft: 10 },
  measureText: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1.5, color: '#fff' },
  annotation: { borderWidth: 1, borderColor: LINE, padding: 12, gap: 8 },
  annotationTag: { fontFamily: GameFonts.ui, fontSize: 8, letterSpacing: 2, color: CYAN },
  portrait: { width: 64, height: 80, alignSelf: 'flex-start' },
  annotationText: { fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: '#e8f4ff' },
  cta: { backgroundColor: CYAN, paddingVertical: 16, alignItems: 'center' },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 3, color: BLUE },
  footer: { flexDirection: 'row', flexWrap: 'wrap', gap: 14 },
  footerLink: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 1, color: CYAN },
});
