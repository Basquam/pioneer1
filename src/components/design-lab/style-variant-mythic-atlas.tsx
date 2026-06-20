import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

const GOLD = '#c9a227';
const CREAM = '#f5f0e6';
const INK = '#1a1410';

/** Mythic editorial atlas — warm relic panel, story collectible. */
export function StyleVariantMythicAtlas() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a1410', '#0d0a08']} style={StyleSheet.absoluteFill} />
      <Text style={styles.atlas}>ATLAS · {s.universe}</Text>
      <Text style={styles.chapter}>Chapter {s.chapterOrder}</Text>
      <Text style={styles.title}>{s.chapterTitle}</Text>
      <View style={styles.relicPanel}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
        <LinearGradient colors={['transparent', 'rgba(13,10,8,0.92)']} style={StyleSheet.absoluteFill} />
        <View style={styles.relicFrame} />
        <Text style={styles.relicCaption}>{s.saga} · Territory Record</Text>
      </View>
      <View style={styles.progressRow}>
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Trail cleared</Text>
          <Text style={styles.progressValue}>{s.progressCleared} / {s.progressTotal}</Text>
        </View>
        <View style={styles.progressDivider} />
        <View style={styles.progressItem}>
          <Text style={styles.progressLabel}>Shadow</Text>
          <Text style={styles.progressValue}>{s.threat}%</Text>
        </View>
      </View>
      <View style={styles.bar}><View style={[styles.barFill, { width: `${ratio * 100}%` }]} /></View>
      <View style={styles.letter}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <View style={styles.letterBody}>
          <Text style={styles.letterFrom}>{s.mentorLabel}</Text>
          <Text style={styles.letterText}>{s.mentorMessage}</Text>
        </View>
      </View>
      <Pressable style={styles.cta}><Text style={styles.ctaText}>{s.primaryCta}</Text></Pressable>
      <View style={styles.nav}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.navItem}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 22, gap: 12, minHeight: 640 },
  atlas: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 4, color: GOLD },
  chapter: { fontFamily: GameFonts.displayRegular, fontSize: 14, color: '#a89070', fontStyle: 'italic' },
  title: { fontFamily: GameFonts.display, fontSize: 34, color: CREAM, lineHeight: 40, marginBottom: 4 },
  relicPanel: { height: 240, borderRadius: 4, overflow: 'hidden', position: 'relative' },
  relicFrame: { ...StyleSheet.absoluteFill, borderWidth: 1, borderColor: `${GOLD}66`, margin: 8 },
  relicCaption: {
    position: 'absolute', bottom: 16, left: 16,
    fontFamily: GameFonts.displayRegular, fontSize: 12, color: CREAM, fontStyle: 'italic',
  },
  progressRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
  progressItem: { flex: 1, alignItems: 'center', gap: 4 },
  progressDivider: { width: 1, height: 32, backgroundColor: `${GOLD}44` },
  progressLabel: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: '#888' },
  progressValue: { fontFamily: GameFonts.display, fontSize: 22, color: CREAM },
  bar: { height: 2, backgroundColor: `${GOLD}33` },
  barFill: { height: '100%', backgroundColor: GOLD },
  letter: { flexDirection: 'row', gap: 14, paddingTop: 8 },
  portrait: { width: 72, height: 92, borderRadius: 2, borderWidth: 1, borderColor: `${GOLD}55` },
  letterBody: { flex: 1, gap: 6 },
  letterFrom: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2, color: GOLD },
  letterText: { fontFamily: GameFonts.displayRegular, fontSize: 15, lineHeight: 22, color: '#c8c0b8', fontStyle: 'italic' },
  cta: { borderWidth: 1, borderColor: GOLD, paddingVertical: 16, alignItems: 'center', marginTop: 4 },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 3, color: GOLD },
  nav: { flexDirection: 'row', flexWrap: 'wrap', gap: 18, justifyContent: 'center', marginTop: 4 },
  navItem: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: '#888' },
});
