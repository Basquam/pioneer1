import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

/** Micrographic mission system — swiss grid, dense metadata, negative space. */
export function StyleVariantMicrographic() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <View style={styles.gridOverlay}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View key={i} style={[styles.gridLine, { left: `${i * 25}%` as `${number}%` }]} />
        ))}
      </View>
      <View style={styles.topMeta}>
        <Text style={styles.meta}>QST</Text>
        <Text style={styles.meta}>LV{s.level}</Text>
        <Text style={styles.meta}>RP{s.reputation}</Text>
      </View>
      <Text style={styles.heroTitle}>{s.chapterTitle}</Text>
      <Text style={styles.heroSub}>{s.saga} / {s.universe} / CH0{s.chapterOrder}</Text>
      <View style={styles.artSlot}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
      </View>
      <View style={styles.dataBlock}>
        <View style={styles.dataRow}>
          <Text style={styles.dataKey}>PRG</Text>
          <Text style={styles.dataVal}>{s.progressCleared}.{s.progressTotal}</Text>
          <View style={styles.dataBar}><View style={[styles.dataBarFill, { width: `${ratio * 100}%` }]} /></View>
        </View>
        <View style={styles.dataRow}>
          <Text style={styles.dataKey}>THR</Text>
          <Text style={styles.dataVal}>{s.threat}</Text>
          <Text style={styles.dataUnit}>%</Text>
        </View>
      </View>
      <View style={styles.msgBlock}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.msg}>{s.mentorMessage}</Text>
      </View>
      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>{s.primaryCta.toUpperCase()}</Text>
      </Pressable>
      <View style={styles.actions}>
        {s.secondaryActions.map((a, i) => (
          <Text key={a} style={styles.action}>{String(i + 1).padStart(2, '0')} {a}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#0a0a0c', padding: 24, gap: 16, minHeight: 640, position: 'relative' },
  gridOverlay: { ...StyleSheet.absoluteFill, opacity: 0.08 },
  gridLine: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: '#fff' },
  topMeta: { flexDirection: 'row', gap: 20 },
  meta: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3, color: '#666' },
  heroTitle: { fontFamily: GameFonts.ui, fontSize: 32, lineHeight: 36, color: '#fff', letterSpacing: -0.5 },
  heroSub: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2, color: '#555', marginTop: -8 },
  artSlot: { height: 160, backgroundColor: '#111' },
  dataBlock: { gap: 12, paddingVertical: 8, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#222' },
  dataRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dataKey: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: '#555', width: 28 },
  dataVal: { fontFamily: GameFonts.ui, fontSize: 18, color: '#fff', letterSpacing: 1, width: 48 },
  dataBar: { flex: 1, height: 2, backgroundColor: '#222' },
  dataBarFill: { height: '100%', backgroundColor: '#fff' },
  dataUnit: { fontFamily: GameFonts.ui, fontSize: 10, color: '#555' },
  msgBlock: { flexDirection: 'row', gap: 14, paddingTop: 8 },
  portrait: { width: 48, height: 60 },
  msg: { flex: 1, fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: '#aaa' },
  cta: { alignSelf: 'flex-start', paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: '#fff' },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 4, color: '#fff' },
  actions: { gap: 8, marginTop: 8 },
  action: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: '#555' },
});
