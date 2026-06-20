import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { HqAbstractPoster } from '@/components/rpg/hq-abstract-poster';
import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { useGame } from '@/hooks/use-game';
import { computeHqMissionStats } from '@/lib/hq-mission-stats';
import { getEarlyHqWelcomeLine } from '@/lib/hq-experience';
import { resolveHqHeroVisual } from '@/lib/hq-visual-assets';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

type HqMissionHeroProps = {
  earlyHq?: boolean;
  onPrimaryPress: () => void;
};

const POSTER_HEIGHT = 252;

export function HqMissionHero({ earlyHq = false, onPrimaryPress }: HqMissionHeroProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, currentChapter, playerProgress, quests } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isDossier = skin.id === 'dust-and-iron';
  const isProtocol = skin.id === 'neuronet';

  const stats = useMemo(() => computeHqMissionStats(quests), [quests]);
  const visual = useMemo(
    () => resolveHqHeroVisual(activeUniverse, activeSaga, currentChapter),
    [activeUniverse, activeSaga, currentChapter],
  );
  const welcomeLine = useMemo(() => getEarlyHqWelcomeLine(playerProgress), [playerProgress]);

  const badgeLabel = isDossier
    ? 'BOUNTY DOSSIER'
    : isProtocol
      ? stats.remainingBounties > 0
        ? 'OPERATION LIVE'
        : 'PROTOCOL PACKET'
      : 'ACTIVE CHAPTER';

  const chapterTitle = currentChapter
    ? ui.todaySectorLine(currentChapter.order, currentChapter.title)
    : ui.noActiveChapterBriefing;

  const progressLabel = isProtocol
    ? `${stats.completedBounties}/${stats.totalBounties || 0} nodes cleared`
    : `${stats.completedBounties}/${stats.totalBounties || 0} bounties cleared`;

  const progressMeta = isProtocol
    ? `${stats.remainingBounties} routing · ${stats.userQuestCount} personal ops`
    : `${stats.remainingBounties} active · ${stats.userQuestCount} personal`;

  const bodyBg = isDossier
    ? 'rgba(42, 24, 16, 0.97)'
    : isProtocol
      ? 'rgba(8, 14, 32, 0.97)'
      : QuestoryTheme.colors.background.elevated;

  const ctaTextColor = isDossier ? '#1a0f0c' : '#050308';
  const ctaHintColor = isDossier ? '#3d2818' : '#0a2830';

  return (
    <View style={[styles.outer, isDossier ? styles.dossierSkew : null]}>
      <View style={[styles.card, QuestoryTheme.shadow.raised]}>
        <View style={styles.posterWrap}>
          {visual.source ? (
            <Image source={visual.source} style={styles.posterImage} contentFit="cover" transition={200} />
          ) : (
            <HqAbstractPoster
              skinId={skin.id}
              universeIcon={activeUniverse.icon}
              accentPrimary={skin.accentPrimary}
              accentSecondary={skin.accentSecondary}
            />
          )}
          <LinearGradient
            colors={['transparent', 'rgba(5,3,8,0.45)', 'rgba(5,3,8,0.94)']}
            locations={[0.3, 0.68, 1]}
            style={StyleSheet.absoluteFill}
          />
          {isProtocol ? (
            <View pointerEvents="none" style={[styles.heroGlow, { backgroundColor: skin.glowColor }]} />
          ) : null}
          <View style={styles.posterOverlay}>
            <View style={[styles.badge, { backgroundColor: `${skin.accentPrimary}ee` }]}>
              <Text style={[styles.badgeText, { color: ctaTextColor }]}>{badgeLabel}</Text>
            </View>
            <Text
              style={[QuestoryTypography.cinematicTitle, styles.posterTitle, { color: palette.bone }]}
              numberOfLines={3}>
              {chapterTitle}
            </Text>
            <Text style={[QuestoryTypography.bodySmall, { color: palette.fog }]}>
              {ui.hqChapterEyebrow(activeSaga.title, currentChapter?.order)}
            </Text>
          </View>
        </View>

        <View style={[styles.body, { backgroundColor: bodyBg }]}>
          <View style={[styles.topHighlight, { backgroundColor: `${skin.accentPrimary}55` }]} />
          {earlyHq && welcomeLine ? (
            <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 13 }]} numberOfLines={2}>
              {welcomeLine}
            </Text>
          ) : currentChapter?.summary && !earlyHq ? (
            <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 12 }]} numberOfLines={2}>
              {currentChapter.summary}
            </Text>
          ) : null}

          <QuestoryProgressBar
            progress={stats.bountyProgress}
            label={progressLabel}
            meta={progressMeta}
            universeId={activeUniverse.id}
          />

          <Pressable
            onPress={onPrimaryPress}
            style={({ pressed }) => [
              styles.cta,
              {
                backgroundColor: skin.accentPrimary,
                opacity: pressed ? 0.88 : 1,
              },
              QuestoryTheme.shadow.soft,
            ]}>
            <Text style={[QuestoryTypography.sectionTitle, styles.ctaLabel, { color: ctaTextColor }]}>
              {stats.remainingBounties > 0 && earlyHq ? 'CONTINUE YOUR STORY' : ui.goToQuestBoardLabel}
            </Text>
            <Text style={[QuestoryTypography.caption, { color: ctaHintColor, fontSize: 10 }]}>
              {stats.remainingBounties > 0 ? ui.beginSectorHint : ui.goToQuestBoardHint}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginBottom: 6,
  },
  dossierSkew: {
    transform: [{ skewX: '-1deg' }],
  },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  posterWrap: {
    height: POSTER_HEIGHT,
    position: 'relative',
    backgroundColor: QuestoryTheme.colors.background.deep,
  },
  posterImage: {
    ...StyleSheet.absoluteFill,
  },
  heroGlow: {
    position: 'absolute',
    top: -40,
    right: -40,
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.45,
  },
  posterOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    gap: 6,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 4,
  },
  badgeText: {
    fontFamily: 'BarlowCondensed_700Bold',
    fontSize: 10,
    letterSpacing: 1.5,
  },
  posterTitle: {
    fontSize: 26,
    lineHeight: 32,
  },
  body: {
    padding: 16,
    gap: 12,
    position: 'relative',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 16,
    right: 16,
    height: 1,
  },
  cta: {
    borderRadius: 12,
    paddingVertical: 15,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 3,
    marginTop: 2,
    minHeight: 52,
    justifyContent: 'center',
  },
  ctaLabel: {
    letterSpacing: 2,
    fontSize: 15,
  },
});
