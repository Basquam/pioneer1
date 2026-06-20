import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE } from '@/lib/design-lab/style-lab-sample-data';

const BG = '#1a1a2e';
const PIXEL = '#7fdbff';
const MAGENTA = '#ff6ec7';

/** Pixel grid relic UI — chunky tiles, retro grid map. */
export function StyleVariantPixelGrid() {
  const s = STYLE_LAB_SAMPLE;
  const grid = Array.from({ length: 16 }, (_, i) => i < s.progressCleared);

  return (
    <View style={styles.root}>
      <View style={styles.scanlines}>
        {Array.from({ length: 20 }).map((_, i) => (
          <View key={i} style={styles.scanline} />
        ))}
      </View>
      <Text style={styles.header}>◆ QUESTORY v1.2 ◆</Text>
      <Text style={styles.title}>{s.chapterTitle.toUpperCase()}</Text>
      <View style={styles.heroFrame}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={styles.heroImg} contentFit="cover" />
      </View>
      <Text style={styles.sub}>RELIC MAP · {s.saga.toUpperCase()}</Text>
      <View style={styles.grid}>
        {grid.map((cleared, i) => (
          <View key={i} style={[styles.cell, cleared ? styles.cellClear : styles.cellLock]}>
            <Text style={styles.cellText}>{cleared ? '■' : '□'}</Text>
          </View>
        ))}
      </View>
      <Text style={styles.stats}>THREAT {s.threat}% · LVL {s.level} · REP {s.reputation}</Text>
      <View style={styles.npcBox}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.npcText}>&gt; {s.mentorMessage}</Text>
      </View>
      <Pressable style={styles.cta}><Text style={styles.ctaText}>[ {s.primaryCta.toUpperCase()} ]</Text></Pressable>
      <View style={styles.menu}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.menuItem}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: BG, padding: 16, gap: 10, minHeight: 640 },
  scanlines: { ...StyleSheet.absoluteFill, opacity: 0.06, gap: 4 },
  scanline: { height: 1, backgroundColor: '#fff' },
  header: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2, color: MAGENTA, textAlign: 'center' },
  title: { fontFamily: GameFonts.ui, fontSize: 20, letterSpacing: 2, color: PIXEL, textAlign: 'center' },
  heroFrame: { borderWidth: 4, borderColor: PIXEL, padding: 4, backgroundColor: '#0f0f1a' },
  heroImg: { width: '100%', height: 140 },
  sub: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 2, color: '#888', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, justifyContent: 'center' },
  cell: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  cellClear: { backgroundColor: PIXEL },
  cellLock: { backgroundColor: '#2a2a4e' },
  cellText: { fontFamily: GameFonts.ui, fontSize: 16, color: BG },
  stats: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: '#aaa', textAlign: 'center' },
  npcBox: { flexDirection: 'row', gap: 8, borderWidth: 2, borderColor: MAGENTA, padding: 10, backgroundColor: '#0f0f1a' },
  portrait: { width: 48, height: 48 },
  npcText: { flex: 1, fontFamily: GameFonts.ui, fontSize: 11, lineHeight: 16, color: PIXEL },
  cta: { backgroundColor: MAGENTA, paddingVertical: 14, alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2, color: BG },
  menu: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  menuItem: { fontFamily: GameFonts.ui, fontSize: 10, color: PIXEL, letterSpacing: 1 },
});
