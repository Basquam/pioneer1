import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE } from '@/lib/design-lab/style-lab-sample-data';

const BLACK = '#0a0a0a';
const YELLOW = '#ffe600';
const RED = '#ff3333';

/** Brutalist billboard — loud blocks, stickers, deconstructed type. */
export function StyleVariantBrutalist() {
  const s = STYLE_LAB_SAMPLE;

  return (
    <View style={styles.root}>
      <View style={styles.blockYellow}>
        <Text style={styles.blockYellowText}>QUESTORY</Text>
      </View>
      <Text style={styles.title}>SMOKE</Text>
      <Text style={[styles.title, styles.titleOffset]}>AT DAWN</Text>
      <View style={styles.heroBlock}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={StyleSheet.absoluteFill} contentFit="cover" />
        <View style={styles.heroOverlay} />
        <View style={styles.sticker}><Text style={styles.stickerText}>3/8{'\n'}DONE</Text></View>
      </View>
      <View style={styles.row}>
        <View style={styles.redBox}><Text style={styles.redText}>THREAT{'\n'}{s.threat}%</Text></View>
        <View style={styles.blackBox}><Text style={styles.whiteText}>LVL {s.level}{'\n'}REP {s.reputation}</Text></View>
      </View>
      <View style={styles.msg}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.msgText}>{s.mentorMessage.toUpperCase()}</Text>
      </View>
      <Pressable style={styles.cta}>
        <Text style={styles.ctaText}>{s.primaryCta.toUpperCase()}</Text>
      </Pressable>
      <View style={styles.stickers}>
        {s.secondaryActions.map((a, i) => (
          <View key={a} style={[styles.miniSticker, i % 2 === 1 && { transform: [{ rotate: '3deg' }] }]}>
            <Text style={styles.miniStickerText}>{a}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { backgroundColor: '#f0f0f0', padding: 12, gap: 8, minHeight: 640 },
  blockYellow: { backgroundColor: YELLOW, padding: 8, alignSelf: 'flex-start', transform: [{ skewX: '-6deg' }] },
  blockYellowText: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 4, color: BLACK },
  title: { fontFamily: GameFonts.ui, fontSize: 48, lineHeight: 44, color: BLACK, letterSpacing: -1 },
  titleOffset: { marginTop: -8, marginLeft: 24, color: RED },
  heroBlock: { height: 180, backgroundColor: BLACK, overflow: 'hidden', position: 'relative' },
  heroOverlay: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(0,0,0,0.35)' },
  sticker: {
    position: 'absolute', bottom: 12, right: 12, backgroundColor: YELLOW,
    padding: 10, transform: [{ rotate: '-8deg' }], borderWidth: 3, borderColor: BLACK,
  },
  stickerText: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1, color: BLACK, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 8 },
  redBox: { flex: 1, backgroundColor: RED, padding: 14 },
  redText: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 1, color: '#fff', lineHeight: 20 },
  blackBox: { flex: 1, backgroundColor: BLACK, padding: 14 },
  whiteText: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1, color: '#fff', lineHeight: 18 },
  msg: { flexDirection: 'row', gap: 10, backgroundColor: BLACK, padding: 12, transform: [{ skewX: '2deg' }] },
  portrait: { width: 60, height: 76 },
  msgText: { flex: 1, fontFamily: GameFonts.ui, fontSize: 11, lineHeight: 16, color: YELLOW, letterSpacing: 0.5 },
  cta: { backgroundColor: BLACK, paddingVertical: 20, alignItems: 'center', borderWidth: 4, borderColor: YELLOW },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 4, color: YELLOW },
  stickers: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  miniSticker: { backgroundColor: '#fff', borderWidth: 2, borderColor: BLACK, paddingHorizontal: 10, paddingVertical: 8 },
  miniStickerText: { fontFamily: GameFonts.ui, fontSize: 9, letterSpacing: 1, color: BLACK },
});
