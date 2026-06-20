import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HqPrototypeCta } from '@/components/design-lab/hq-prototype-card';
import { GameFonts } from '@/constants/typography';
import {
  getHqLabProgressRatio,
  HQ_LAB_ASSETS,
  HQ_LAB_SAMPLE,
} from '@/lib/design-lab/hq-lab-sample-data';
import { QuestoryTypography } from '@/theme/typography';

const BRASS = '#f4a261';
const SEPIA = '#c9956a';
const BURNT = '#e85d04';
const INK = '#1a0f0c';
const BONE = '#f5f0e6';
const DESK = '#0d0a08';

/** Variant B — pulp dossier: poster-dominant, stamps, tactile field report on dark desk. */
export function HqVariantPulpDossier() {
  const sample = HQ_LAB_SAMPLE;
  const ratio = getHqLabProgressRatio();

  return (
    <View style={styles.root}>
      <View style={styles.fileTab}>
        <Text style={styles.fileTabText}>SHERIFF FILE · #{sample.chapterOrder}04</Text>
      </View>

      <View style={styles.posterOuter}>
        <View style={styles.poster}>
          <Image source={HQ_LAB_ASSETS.dustChapterHero} style={StyleSheet.absoluteFill} contentFit="cover" />
          <LinearGradient
            colors={['rgba(60, 35, 20, 0.15)', 'transparent', 'rgba(12, 8, 6, 0.92)']}
            locations={[0, 0.45, 1]}
            style={StyleSheet.absoluteFill}
          />
          <View style={[styles.cornerBracket, styles.cornerTL]} />
          <View style={[styles.cornerBracket, styles.cornerTR]} />
          <View style={styles.stampPrimary}>
            <Text style={styles.stampPrimaryText}>ACTIVE{'\n'}BOUNTY</Text>
          </View>
          <View style={styles.stampSecondary}>
            <Text style={styles.stampSecondaryText}>HIGH NOON</Text>
          </View>
          <View style={styles.posterCopy}>
            <Text style={styles.posterEyebrow}>{sample.chapterLabel.toUpperCase()}</Text>
            <Text style={styles.posterTitle}>{sample.chapterTitle}</Text>
            <Text style={styles.posterSaga}>{sample.saga} · {sample.universe}</Text>
          </View>
          <View style={styles.posterProgressBand}>
            <Text style={styles.posterProgressText}>
              {sample.progressCleared}/{sample.progressTotal} RECLAIMED · VILLAIN {sample.villainInfluence}%
            </Text>
            <View style={styles.posterProgressTrack}>
              <View style={[styles.posterProgressFill, { width: `${ratio * 100}%` }]} />
            </View>
          </View>
        </View>
        <View style={styles.halftoneBand}>
          {Array.from({ length: 12 }).map((_, i) => (
            <View key={i} style={[styles.halftoneDot, { opacity: 0.2 + (i % 4) * 0.08 }]} />
          ))}
        </View>
      </View>

      <View style={styles.paperOnDesk}>
        <View style={styles.paperShadow} />
        <View style={styles.paper}>
          <View style={styles.paperHeader}>
            <Text style={styles.paperStamp}>FIELD REPORT</Text>
            <Text style={styles.paperDate}>DUSTFALL · DAWN WATCH</Text>
          </View>
          <View style={styles.paperBody}>
            <Image source={HQ_LAB_ASSETS.sashaPortrait} style={styles.paperPortrait} contentFit="cover" />
            <View style={styles.paperCopy}>
              <Text style={styles.paperFrom}>{sample.guide.label}</Text>
              <Text style={[QuestoryTypography.sectionTitle, { color: INK, fontSize: 17 }]}>
                {sample.guide.title}
              </Text>
              <Text style={[QuestoryTypography.flavor, { color: '#5c4030', fontSize: 13, lineHeight: 20 }]}>
                {sample.guide.message}
              </Text>
            </View>
          </View>
          <View style={styles.slipDivider}>
            <Text style={styles.slipDividerText}>OPEN BOUNTIES</Text>
          </View>
          {sample.quests.map((quest, i) => (
            <View key={quest} style={styles.bountySlip}>
              <Text style={styles.bountyNum}>{String(i + 1).padStart(2, '0')}</Text>
              <Text style={styles.bountyText}>{quest}</Text>
              <Text style={styles.bountyStamp}>WANTED</Text>
            </View>
          ))}
        </View>
      </View>

      <HqPrototypeCta
        label={sample.ctaLabel}
        hint={sample.ctaHint}
        backgroundColor={BRASS}
        textColor={INK}
        hintColor="#3d2818"
        large
      />

      <View style={styles.brassTiles}>
        {[
          { label: 'QUEST BOARD', sub: 'Primary trail', primary: true },
          { label: 'STORY', sub: 'Chapter map' },
          { label: 'ADD QUEST', sub: 'New bounty' },
          { label: 'PROFILE', sub: 'Standing' },
        ].map((tile) => (
          <Pressable
            key={tile.label}
            style={[styles.brassTile, tile.primary && styles.brassTilePrimary]}>
            <Text style={styles.brassTileLabel}>{tile.label}</Text>
            <Text style={styles.brassTileSub}>{tile.sub}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { gap: 16, backgroundColor: DESK, marginHorizontal: -4, paddingHorizontal: 4, paddingVertical: 8, borderRadius: 4 },
  fileTab: {
    alignSelf: 'flex-start',
    backgroundColor: `${BRASS}44`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    transform: [{ skewX: '-2deg' }],
  },
  fileTabText: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: BRASS,
  },
  posterOuter: { gap: 8 },
  poster: {
    height: 320,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: INK,
    transform: [{ skewX: '-0.8deg' }],
  },
  cornerBracket: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: `${BRASS}88`,
  },
  cornerTL: { top: 12, left: 12, borderTopWidth: 2, borderLeftWidth: 2 },
  cornerTR: { top: 12, right: 12, borderTopWidth: 2, borderRightWidth: 2 },
  stampPrimary: {
    position: 'absolute',
    top: 20,
    right: 18,
    borderWidth: 3,
    borderColor: BRASS,
    paddingHorizontal: 12,
    paddingVertical: 10,
    transform: [{ rotate: '12deg' }],
    backgroundColor: 'rgba(26, 15, 12, 0.6)',
  },
  stampPrimaryText: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 2,
    color: BRASS,
    textAlign: 'center',
    lineHeight: 15,
  },
  stampSecondary: {
    position: 'absolute',
    top: 88,
    right: 28,
    borderWidth: 1,
    borderColor: `${SEPIA}aa`,
    paddingHorizontal: 8,
    paddingVertical: 4,
    transform: [{ rotate: '-8deg' }],
  },
  stampSecondaryText: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 2,
    color: SEPIA,
  },
  posterCopy: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 48,
    paddingHorizontal: 20,
    gap: 4,
  },
  posterEyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 3,
    color: BRASS,
  },
  posterTitle: {
    fontFamily: GameFonts.display,
    fontSize: 38,
    lineHeight: 42,
    color: BONE,
  },
  posterSaga: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    color: SEPIA,
  },
  posterProgressBand: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(42, 24, 16, 0.92)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    gap: 6,
  },
  posterProgressText: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1.5,
    color: SEPIA,
  },
  posterProgressTrack: {
    height: 6,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  posterProgressFill: {
    height: '100%',
    backgroundColor: BURNT,
    borderRadius: 3,
  },
  halftoneBand: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  halftoneDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: BRASS,
  },
  paperOnDesk: { position: 'relative', marginTop: 4 },
  paperShadow: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: -6,
    bottom: -6,
    backgroundColor: 'rgba(244, 162, 97, 0.08)',
    borderRadius: 6,
  },
  paper: {
    backgroundColor: 'rgba(232, 210, 185, 0.94)',
    borderRadius: 4,
    padding: 16,
    gap: 12,
    transform: [{ rotate: '0.6deg' }],
  },
  paperHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(92, 64, 48, 0.25)',
    paddingBottom: 8,
  },
  paperStamp: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    color: BURNT,
  },
  paperDate: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 1,
    color: '#6b4a32',
  },
  paperBody: { flexDirection: 'row', gap: 14 },
  paperPortrait: {
    width: 96,
    height: 120,
    borderRadius: 4,
    backgroundColor: '#2a1810',
    borderWidth: 2,
    borderColor: 'rgba(92, 64, 48, 0.3)',
  },
  paperCopy: { flex: 1, gap: 6 },
  paperFrom: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
    color: '#8b6914',
  },
  slipDivider: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(92, 64, 48, 0.35)',
    paddingTop: 10,
  },
  slipDividerText: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 2,
    color: '#6b4a32',
  },
  bountySlip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(244, 162, 97, 0.18)',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 3,
  },
  bountyNum: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    color: BURNT,
    letterSpacing: 1,
  },
  bountyText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    color: INK,
    flex: 1,
  },
  bountyStamp: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 1,
    color: BURNT,
    transform: [{ rotate: '-6deg' }],
  },
  brassTiles: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  brassTile: {
    width: '47%',
    flexGrow: 1,
    minWidth: '46%',
    backgroundColor: 'rgba(42, 24, 16, 0.95)',
    borderRadius: 6,
    padding: 14,
    gap: 4,
    minHeight: 72,
    borderLeftWidth: 3,
    borderLeftColor: `${BRASS}55`,
  },
  brassTilePrimary: {
    backgroundColor: `${BRASS}28`,
    borderLeftColor: BRASS,
  },
  brassTileLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 1.5,
    color: BONE,
  },
  brassTileSub: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    color: SEPIA,
  },
});
