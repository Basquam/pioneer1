import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

const PINK = '#ff2d8a';
const YELLOW = '#ffe600';
const INK = '#1a0a12';

/** Riso pulp poster — misregistered layers, halftone, stamp CTA. */
export function StyleVariantRisoPulp() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <View style={styles.grain}>
        {Array.from({ length: 40 }).map((_, i) => (
          <View key={i} style={[styles.dot, { left: `${(i * 17) % 100}%`, top: `${(i * 23) % 100}%` }]} />
        ))}
      </View>
      <Text style={[styles.title, styles.titleShift]}>{s.chapterTitle.toUpperCase()}</Text>
      <Text style={styles.title}>{s.chapterTitle.toUpperCase()}</Text>
      <View style={styles.hero}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.heroTint} />
        <View style={styles.stamp}>
          <Text style={styles.stampText}>CH.{s.chapterOrder}{'\n'}ACTIVE</Text>
        </View>
      </View>
      <View style={styles.stripRow}>
        {Array.from({ length: s.progressTotal }).map((_, i) => (
          <View key={i} style={[styles.strip, i < s.progressCleared && styles.stripDone]} />
        ))}
      </View>
      <Text style={styles.meta}>{s.progressCleared}/{s.progressTotal} BOUNTIES · THREAT {s.threat}%</Text>
      <View style={styles.note}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.noteText}>“{s.mentorMessage}”</Text>
      </View>
      <Pressable style={styles.ticket}>
        <Text style={styles.ticketText}>{s.primaryCta.toUpperCase()}</Text>
      </Pressable>
      <View style={styles.actions}>
        {s.secondaryActions.map((a) => (
          <Text key={a} style={styles.action}>{a}</Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: YELLOW, padding: 16, gap: 10, minHeight: 640 },
  grain: { ...StyleSheet.absoluteFill, opacity: 0.15 },
  dot: { position: 'absolute', width: 4, height: 4, borderRadius: 2, backgroundColor: INK },
  title: { fontFamily: GameFonts.ui, fontSize: 32, letterSpacing: 1, color: INK, lineHeight: 34 },
  titleShift: { position: 'absolute', top: 18, left: 20, color: PINK, opacity: 0.85 },
  hero: { height: 220, backgroundColor: PINK, overflow: 'hidden' },
  heroTint: { ...StyleSheet.absoluteFill, backgroundColor: `${PINK}55` },
  stamp: {
    position: 'absolute', top: 12, right: 12, borderWidth: 4, borderColor: INK,
    padding: 8, transform: [{ rotate: '8deg' }], backgroundColor: YELLOW,
  },
  stampText: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 1, color: INK, textAlign: 'center' },
  stripRow: { flexDirection: 'row', gap: 4 },
  strip: { flex: 1, height: 14, backgroundColor: `${INK}22` },
  stripDone: { backgroundColor: PINK },
  meta: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 1, color: INK },
  note: { flexDirection: 'row', gap: 10, backgroundColor: INK, padding: 12 },
  portrait: { width: 56, height: 72 },
  noteText: { flex: 1, fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: YELLOW },
  ticket: {
    backgroundColor: PINK, paddingVertical: 18, alignItems: 'center',
    borderWidth: 3, borderColor: INK, transform: [{ rotate: '-1deg' }],
  },
  ticketText: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 3, color: INK },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  action: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 1, color: INK, textDecorationLine: 'underline' },
});
