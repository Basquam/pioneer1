import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import {
  getHqLabProgressRatio,
  HQ_LAB_ASSETS,
  HQ_LAB_SAMPLE,
} from '@/lib/design-lab/hq-lab-sample-data';

const GOLD = '#D4AF37';
const INK = '#050308';
const BONE = '#f5f0e6';
const MIST = '#c8c0b8';
const RULE = 'rgba(255,255,255,0.12)';

/** Variant A — Swiss editorial: typography-first, rules not cards, asymmetric bento. */
export function HqVariantEditorialConsole() {
  const sample = HQ_LAB_SAMPLE;
  const ratio = getHqLabProgressRatio();
  const remaining = sample.progressTotal - sample.progressCleared;
  const pct = Math.round(ratio * 100);

  return (
    <View style={styles.root}>
      <View style={styles.ruleTop} />

      <View style={styles.metaRow}>
        <Text style={styles.metaLeft}>QUESTORY</Text>
        <Text style={styles.metaRight}>
          {String(sample.level).padStart(2, '0')} / {sample.reputation}
        </Text>
      </View>

      <View style={styles.heroBlock}>
        <Text style={styles.heroIndex}>02</Text>
        <View style={styles.heroTypeCol}>
          <Text style={styles.heroKicker}>{sample.saga.toUpperCase()}</Text>
          <Text style={styles.heroTitleLine}>Smoke</Text>
          <Text style={styles.heroTitleLineAccent}>at Dawn</Text>
          <Text style={styles.heroDeck}>{sample.chapterSummary}</Text>
        </View>
        <View style={styles.heroArtSlot}>
          <Image source={HQ_LAB_ASSETS.dustChapterHero} style={StyleSheet.absoluteFill} contentFit="cover" />
          <View style={styles.artFrame} />
        </View>
      </View>

      <View style={styles.infographic}>
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>PROGRESS</Text>
          <Text style={styles.infoValue}>
            {sample.progressCleared}/{sample.progressTotal}
          </Text>
          <View style={styles.infoBar}>
            <View style={[styles.infoBarFill, { width: `${pct}%` }]} />
          </View>
          <Text style={styles.infoSub}>{remaining} remaining</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>THREAT</Text>
          <Text style={styles.infoValue}>{sample.villainInfluence}%</Text>
          <Text style={styles.infoSub}>Contained</Text>
        </View>
        <View style={styles.infoDivider} />
        <View style={styles.infoCell}>
          <Text style={styles.infoLabel}>QUESTS</Text>
          <Text style={styles.infoValue}>3</Text>
          <Text style={styles.infoSub}>Personal</Text>
        </View>
      </View>

      <View style={styles.quoteBlock}>
        <View style={styles.quoteRule} />
        <View style={styles.quoteBody}>
          <Text style={styles.quoteEyebrow}>{sample.guide.label}</Text>
          <Text style={styles.quoteMark}>“</Text>
          <Text style={styles.quoteText}>{sample.guide.message}</Text>
          <View style={styles.quoteFooter}>
            <Image source={HQ_LAB_ASSETS.sashaPortrait} style={styles.quotePortrait} contentFit="cover" />
            <View>
              <Text style={styles.quoteAuthor}>{sample.guide.title}</Text>
              <Text style={styles.quoteRole}>Field directive · Ch. 2</Text>
            </View>
          </View>
        </View>
      </View>

      <Pressable style={styles.primaryAction}>
        <Text style={styles.primaryActionText}>{sample.ctaLabel}</Text>
        <View style={styles.primaryActionLine} />
      </Pressable>

      <View style={styles.ghostActions}>
        {['STORY', 'ADD QUEST', 'PROFILE'].map((label) => (
          <Text key={label} style={styles.ghostAction}>
            {label}
          </Text>
        ))}
      </View>

      <View style={styles.ruleBottom} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 20, paddingVertical: 4 },
  ruleTop: { height: 1, backgroundColor: RULE },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  metaLeft: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 4,
    color: GOLD,
  },
  metaRight: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    color: MIST,
  },
  heroBlock: {
    flexDirection: 'row',
    gap: 14,
    minHeight: 200,
    alignItems: 'stretch',
  },
  heroIndex: {
    fontFamily: GameFonts.display,
    fontSize: 72,
    lineHeight: 72,
    color: 'rgba(212, 175, 55, 0.15)',
    width: 56,
    marginTop: -8,
  },
  heroTypeCol: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
  },
  heroKicker: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 3,
    color: MIST,
    marginBottom: 6,
  },
  heroTitleLine: {
    fontFamily: GameFonts.display,
    fontSize: 36,
    lineHeight: 38,
    color: BONE,
  },
  heroTitleLineAccent: {
    fontFamily: GameFonts.display,
    fontSize: 36,
    lineHeight: 38,
    color: GOLD,
    marginBottom: 10,
  },
  heroDeck: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    lineHeight: 18,
    color: MIST,
    maxWidth: 200,
  },
  heroArtSlot: {
    width: 112,
    borderRadius: 2,
    overflow: 'hidden',
    backgroundColor: INK,
    position: 'relative',
  },
  artFrame: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderColor: RULE,
  },
  infographic: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingVertical: 16,
  },
  infoCell: {
    flex: 1,
    paddingHorizontal: 12,
    gap: 4,
    alignItems: 'center',
  },
  infoDivider: {
    width: 1,
    backgroundColor: RULE,
    marginVertical: 4,
  },
  infoLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 2.5,
    color: MIST,
  },
  infoValue: {
    fontFamily: GameFonts.ui,
    fontSize: 28,
    lineHeight: 32,
    color: BONE,
    letterSpacing: 1,
  },
  infoBar: {
    width: '100%',
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginTop: 4,
  },
  infoBarFill: {
    height: '100%',
    backgroundColor: GOLD,
  },
  infoSub: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    color: MIST,
    marginTop: 2,
  },
  quoteBlock: {
    flexDirection: 'row',
    gap: 14,
    paddingVertical: 8,
  },
  quoteRule: {
    width: 3,
    backgroundColor: GOLD,
    borderRadius: 1,
  },
  quoteBody: { flex: 1, gap: 6 },
  quoteEyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: GOLD,
  },
  quoteMark: {
    fontFamily: GameFonts.display,
    fontSize: 48,
    lineHeight: 40,
    color: 'rgba(212, 175, 55, 0.35)',
    marginTop: -4,
  },
  quoteText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 14,
    lineHeight: 22,
    color: BONE,
    marginTop: -16,
  },
  quoteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8,
  },
  quotePortrait: {
    width: 48,
    height: 60,
    borderRadius: 2,
  },
  quoteAuthor: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 1,
    color: BONE,
  },
  quoteRole: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    color: MIST,
    marginTop: 2,
  },
  primaryAction: {
    alignSelf: 'flex-start',
    gap: 6,
    paddingVertical: 4,
  },
  primaryActionText: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 3,
    color: BONE,
  },
  primaryActionLine: {
    height: 2,
    width: '100%',
    backgroundColor: GOLD,
  },
  ghostActions: {
    flexDirection: 'row',
    gap: 20,
    paddingTop: 4,
  },
  ghostAction: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    color: MIST,
  },
  ruleBottom: { height: 1, backgroundColor: RULE, marginTop: 4 },
});
