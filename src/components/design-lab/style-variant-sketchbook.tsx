import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE } from '@/lib/design-lab/style-lab-sample-data';

const PAPER = '#e8dcc8';
const INK = '#2a1810';
const TAPE = 'rgba(210, 190, 150, 0.75)';
const RED_PIN = '#c44';

/** Sketchbook collage — taped notes, torn panels, journal checklist. */
export function StyleVariantSketchbook() {
  const s = STYLE_LAB_SAMPLE;

  return (
    <View style={styles.root}>
      <View style={styles.tapeTop} />
      <Text style={styles.handTitle}>{s.chapterTitle}</Text>
      <Text style={styles.handSub}>chapter {s.chapterOrder} · {s.saga}</Text>
      <View style={styles.polaroid}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={styles.polaroidImg} contentFit="cover" />
        <Text style={styles.polaroidCap}>warehouse smoke — dawn watch</Text>
      </View>
      <View style={[styles.note, styles.noteTilt]}>
        <Text style={styles.noteLabel}>bounty count</Text>
        <Text style={styles.noteBig}>{s.progressCleared} / {s.progressTotal}</Text>
        <Text style={styles.noteSmall}>threat feels like {s.threat}%</Text>
      </View>
      <View style={styles.checklist}>
        {s.quests.map((q, i) => (
          <View key={q} style={styles.checkRow}>
            <Text style={styles.checkBox}>{i < s.progressCleared ? '☑' : '☐'}</Text>
            <Text style={styles.checkText}>{q}</Text>
          </View>
        ))}
      </View>
      <View style={[styles.pinned, styles.pinnedTilt]}>
        <View style={styles.pin} />
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.pinnedText}>Sasha says: {s.mentorMessage}</Text>
      </View>
      <Pressable style={styles.cta}><Text style={styles.ctaText}>{s.primaryCta}</Text></Pressable>
      <View style={styles.tabs}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.tab}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#3d3428', padding: 20, gap: 12, minHeight: 640 },
  tapeTop: { position: 'absolute', top: 8, alignSelf: 'center', width: 80, height: 22, backgroundColor: TAPE, transform: [{ rotate: '-2deg' }] },
  handTitle: { fontFamily: GameFonts.display, fontSize: 32, color: PAPER, fontStyle: 'italic' },
  handSub: { fontFamily: GameFonts.uiSemi, fontSize: 12, color: '#c8b8a0', marginTop: -4 },
  polaroid: { backgroundColor: PAPER, padding: 10, paddingBottom: 28, transform: [{ rotate: '-2deg' }] },
  polaroidImg: { width: '100%', height: 160 },
  polaroidCap: { fontFamily: GameFonts.uiSemi, fontSize: 10, color: INK, marginTop: 8, fontStyle: 'italic' },
  note: { backgroundColor: PAPER, padding: 14, gap: 4 },
  noteTilt: { transform: [{ rotate: '1.5deg' }], alignSelf: 'flex-end', width: '70%' },
  noteLabel: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: INK, fontStyle: 'italic' },
  noteBig: { fontFamily: GameFonts.display, fontSize: 28, color: INK },
  noteSmall: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: '#6b5040' },
  checklist: { backgroundColor: PAPER, padding: 14, gap: 8, transform: [{ rotate: '-0.5deg' }] },
  checkRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  checkBox: { fontSize: 16, color: INK },
  checkText: { fontFamily: GameFonts.uiSemi, fontSize: 13, color: INK, flex: 1 },
  pinned: { flexDirection: 'row', gap: 10, backgroundColor: PAPER, padding: 12, position: 'relative' },
  pinnedTilt: { transform: [{ rotate: '-1deg' }] },
  pin: { position: 'absolute', top: -6, left: '45%', width: 12, height: 12, borderRadius: 6, backgroundColor: RED_PIN },
  portrait: { width: 64, height: 82, borderWidth: 1, borderColor: INK },
  pinnedText: { flex: 1, fontFamily: GameFonts.uiSemi, fontSize: 12, lineHeight: 18, color: INK },
  cta: { backgroundColor: INK, paddingVertical: 16, alignItems: 'center', borderRadius: 4 },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2, color: PAPER },
  tabs: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  tab: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: PAPER, textDecorationLine: 'underline' },
});
