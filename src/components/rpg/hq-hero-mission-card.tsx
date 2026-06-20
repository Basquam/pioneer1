import { type Href, router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { ScanlineOverlay } from '@/components/rpg/visual-theme-overlay';
import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { useGame } from '@/hooks/use-game';
import { computeHqMissionStats } from '@/lib/hq-mission-stats';
import { getEarlyHqWelcomeLine } from '@/lib/hq-experience';
import { getChapterSceneImage, getSagaBannerImage } from '@/lib/narrative-media';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
import { useMemo } from 'react';

type HqHeroMissionCardProps = {
  earlyHq?: boolean;
};

export function HqHeroMissionCard({ earlyHq = false }: HqHeroMissionCardProps) {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    activeSaga,
    currentChapter,
    playerProgress,
    hasOnboarded,
    quests,
    requestQuestBoardTab,
  } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isDossier = skin.id === 'dust-and-iron';
  const isTerminal = skin.id === 'neuronet';

  const stats = useMemo(() => computeHqMissionStats(quests), [quests]);
  const welcomeLine = useMemo(() => getEarlyHqWelcomeLine(playerProgress), [playerProgress]);

  const sceneImage =
    (currentChapter ? getChapterSceneImage(currentChapter) : null) ?? getSagaBannerImage(activeSaga);

  const handlePrimaryCta = () => {
    if (stats.remainingBounties > 0) {
      requestQuestBoardTab('chapter');
    }
    router.push('/(game)/quests' as Href);
  };

  const primaryCtaLabel =
    stats.remainingBounties > 0 ? 'CONTINUE YOUR STORY' : ui.goToQuestBoardLabel;
  const primaryCtaHint =
    stats.remainingBounties > 0 ? 'Clear the next chapter bounty' : ui.goToQuestBoardHint;

  const operationLabel = isTerminal ? 'PROTOCOL PACKET' : isDossier ? 'BOUNTY DOSSIER' : 'ACTIVE MISSION';

  return (
    <Animated.View entering={FadeInDown.duration(520).delay(80)} style={styles.wrap}>
      <View
        style={[
          styles.glowBackdrop,
          { backgroundColor: skin.glowColor, transform: [{ skewX: `${skin.cardSkew}deg` }] },
        ]}
      />

      <View
        style={[
          styles.hero,
          {
            backgroundColor: QuestoryTheme.colors.background.elevated,
            borderColor: skin.accentPrimary,
            transform: [{ skewX: `${skin.cardSkew}deg` }],
          },
          skin.panelShadow,
        ]}>
        <View style={[styles.accentRail, { backgroundColor: skin.accentPrimary, width: skin.accentStripWidth + 2 }]} />

        <View style={[styles.heroInner, skin.cardSkew !== 0 && styles.heroUnskew]}>
          <View style={styles.heroTop}>
            <QuestoryStatusPill label={operationLabel} tone="accent" universeId={activeUniverse.id} />
            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>
              {stats.remainingBounties} bounties · {stats.userQuestCount} personal
            </Text>
          </View>

          <View style={styles.heroBody}>
            <View style={styles.artColumn}>
              <View
                style={[
                  styles.artFrame,
                  {
                    borderColor: skin.surfaceBorder,
                    backgroundColor: isDossier ? 'rgba(244, 162, 97, 0.1)' : isTerminal ? 'rgba(8, 12, 28, 0.9)' : palette.ink,
                  },
                ]}>
                {isTerminal ? <ScanlineOverlay color={skin.accentPrimary} lineCount={12} /> : null}
                {sceneImage ? (
                  <NarrativeMediaFrame
                    source={sceneImage}
                    height={128}
                    scrim="full"
                    borderRadius={0}
                    style={styles.artImage}
                  />
                ) : (
                  <View style={[styles.artFallback, { backgroundColor: `${skin.accentPrimary}22` }]}>
                    <Text style={[styles.artFallbackIcon, { color: skin.accentPrimary }]}>{activeUniverse.icon}</Text>
                    <Text style={[QuestoryTypography.caption, { color: palette.fog, textAlign: 'center' }]}>
                      {activeSaga.title}
                    </Text>
                  </View>
                )}
                <View style={[styles.artStamp, { borderColor: skin.accentPrimary }]}>
                  <Text style={[QuestoryTypography.caption, { color: skin.accentPrimary, letterSpacing: 2 }]}>
                    {isDossier ? 'WANTED' : isTerminal ? 'SIGNAL' : 'LIVE'}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.copyColumn}>
              <Text style={[QuestoryTypography.sectionEyebrow, { color: skin.accentSecondary }]}>
                {activeUniverse.name} · {activeSaga.title}
              </Text>
              <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 22, lineHeight: 28 }]} numberOfLines={3}>
                {currentChapter
                  ? ui.todaySectorLine(currentChapter.order, currentChapter.title)
                  : ui.noActiveChapterBriefing}
              </Text>

              {earlyHq && welcomeLine ? (
                <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 13 }]} numberOfLines={3}>
                  {welcomeLine}
                </Text>
              ) : currentChapter?.summary ? (
                <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 12 }]} numberOfLines={3}>
                  {currentChapter.summary}
                </Text>
              ) : null}

              <QuestoryProgressBar
                progress={stats.bountyProgress}
                label={ui.operationsLeftLabel}
                meta={`${stats.completedBounties}/${stats.totalBounties || 0} cleared`}
                universeId={activeUniverse.id}
              />

              {hasOnboarded ? (
                earlyHq ? (
                  <GlowButton label={primaryCtaLabel} hint={primaryCtaHint} onPress={handlePrimaryCta} />
                ) : (
                  <Pressable
                    onPress={handlePrimaryCta}
                    style={[styles.inlineCta, { borderColor: skin.accentPrimary, backgroundColor: `${skin.accentPrimary}22` }]}>
                    <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, letterSpacing: 2, fontSize: 14 }]}>
                      {ui.goToQuestBoardLabel}
                    </Text>
                    <Text style={[QuestoryTypography.caption, { color: skin.accentPrimary }]}>
                      {ui.goToQuestBoardHint}
                    </Text>
                  </Pressable>
                )
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 8, position: 'relative' },
  glowBackdrop: {
    position: 'absolute',
    top: 8,
    left: 12,
    right: -4,
    bottom: -6,
    opacity: 0.45,
  },
  hero: {
    borderWidth: 2,
    overflow: 'hidden',
    minHeight: 200,
  },
  accentRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
  },
  heroInner: { padding: 16, paddingLeft: 20, gap: 12 },
  heroUnskew: { transform: [{ skewX: '2deg' }] },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' },
  heroBody: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  artColumn: { width: 112, flexShrink: 0 },
  artFrame: {
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 128,
    position: 'relative',
  },
  artImage: { width: '100%' },
  artFallback: {
    minHeight: 128,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
    gap: 6,
  },
  artFallbackIcon: { fontSize: 32 },
  artStamp: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: 'rgba(0,0,0,0.55)',
  },
  copyColumn: { flex: 1, gap: 8, minWidth: 0 },
  inlineCta: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
    gap: 2,
    marginTop: 2,
  },
});
