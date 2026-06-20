import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { STYLE_LAB_ASSETS, STYLE_LAB_SAMPLE, styleLabProgressRatio } from '@/lib/design-lab/style-lab-sample-data';

/** Neo psychedelic story engine — liquid shapes, dreamlike mission. */
export function StyleVariantNeoPsychedelic() {
  const s = STYLE_LAB_SAMPLE;
  const ratio = styleLabProgressRatio();

  return (
    <View style={styles.root}>
      <LinearGradient colors={['#1a0533', '#0d0220', '#050308']} style={StyleSheet.absoluteFill} />
      <View style={[styles.blob, styles.blobA]} />
      <View style={[styles.blob, styles.blobB]} />
      <View style={[styles.blob, styles.blobC]} />
      <Text style={styles.kicker}>enter the chapter</Text>
      <Text style={styles.title}>{s.chapterTitle}</Text>
      <View style={styles.orbitCard}>
        <Image source={STYLE_LAB_ASSETS.dustChapter} style={styles.orbitImg} contentFit="cover" />
        <View style={styles.orbitRing}>
          <View style={[styles.orbitDot, { transform: [{ rotate: `${ratio * 360}deg` }, { translateY: -52 }] }]} />
        </View>
        <Text style={styles.orbitLabel}>{s.progressCleared} of {s.progressTotal} orbits cleared</Text>
      </View>
      <View style={styles.threatBubble}>
        <Text style={styles.threatText}>shadow pressure {s.threat}%</Text>
      </View>
      <View style={styles.dreamMsg}>
        <Image source={STYLE_LAB_ASSETS.sasha} style={styles.portrait} contentFit="cover" />
        <Text style={styles.dreamText}>{s.mentorMessage}</Text>
      </View>
      <Pressable style={styles.cta}>
        <LinearGradient colors={['#ff6b9d', '#c44dff', '#4d9fff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGrad}>
          <Text style={styles.ctaText}>{s.primaryCta}</Text>
        </LinearGradient>
      </Pressable>
      <View style={styles.actions}>
        {s.secondaryActions.map((a) => <Text key={a} style={styles.action}>{a}</Text>)}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { padding: 20, gap: 14, minHeight: 640, overflow: 'hidden' },
  blob: { position: 'absolute', borderRadius: 999, opacity: 0.45 },
  blobA: { width: 180, height: 180, backgroundColor: '#ff6b9d', top: -40, right: -60 },
  blobB: { width: 140, height: 140, backgroundColor: '#4d9fff', bottom: 120, left: -50 },
  blobC: { width: 100, height: 100, backgroundColor: '#c44dff', top: '40%', right: 20 },
  kicker: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: '#e8b4ff', letterSpacing: 3, fontStyle: 'italic' },
  title: { fontFamily: GameFonts.display, fontSize: 36, color: '#fff', lineHeight: 40 },
  orbitCard: { alignItems: 'center', gap: 12, paddingVertical: 16 },
  orbitImg: { width: 120, height: 120, borderRadius: 60, borderWidth: 2, borderColor: '#ffffff44' },
  orbitRing: { width: 110, height: 110, borderRadius: 55, borderWidth: 1, borderColor: '#ffffff33', position: 'absolute', top: 28 },
  orbitDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#ffe600', position: 'absolute', top: '50%', left: '50%', marginLeft: -5, marginTop: -5 },
  orbitLabel: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: '#c8b8e8', marginTop: 100 },
  threatBubble: { alignSelf: 'center', backgroundColor: 'rgba(255,107,157,0.25)', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  threatText: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: '#ffb4d0', fontStyle: 'italic' },
  dreamMsg: { flexDirection: 'row', gap: 12, backgroundColor: 'rgba(255,255,255,0.06)', padding: 14, borderRadius: 16 },
  portrait: { width: 56, height: 72, borderRadius: 28, opacity: 0.9 },
  dreamText: { flex: 1, fontFamily: GameFonts.displayRegular, fontSize: 14, lineHeight: 20, color: '#e8e0ff', fontStyle: 'italic' },
  cta: { borderRadius: 28, overflow: 'hidden' },
  ctaGrad: { paddingVertical: 18, alignItems: 'center' },
  ctaText: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 2, color: '#fff' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'center' },
  action: { fontFamily: GameFonts.uiSemi, fontSize: 11, color: '#a890c8' },
});
