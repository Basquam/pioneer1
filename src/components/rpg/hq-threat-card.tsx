import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { computeHqMissionStats } from '@/lib/hq-mission-stats';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

const HIGH_THREAT = 65;
const MID_THREAT = 35;

function resolveThreatLevel(value: number): 'high' | 'mid' | 'low' {
  if (value >= HIGH_THREAT) return 'high';
  if (value >= MID_THREAT) return 'mid';
  return 'low';
}

export function HqThreatCard() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, villainInfluence } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isDossier = skin.id === 'dust-and-iron';
  const isProtocol = skin.id === 'neuronet';

  const level = resolveThreatLevel(villainInfluence);
  const isHigh = level === 'high';
  const statusText = ui.villainMeterStatus(level);

  const fill = isHigh
    ? 'rgba(232, 93, 93, 0.2)'
    : isDossier
      ? 'rgba(42, 24, 16, 0.96)'
      : isProtocol
        ? 'rgba(8, 14, 32, 0.96)'
        : 'rgba(20, 16, 28, 0.96)';

  const accent = isHigh ? palette.villainGlow : palette.fog;
  const eyebrow = isProtocol ? 'NETWORK STATUS' : isDossier ? 'TERRITORY STATUS' : ui.villainStatLabel;

  return (
    <View style={[styles.card, { backgroundColor: fill }, QuestoryTheme.shadow.soft]}>
      <View style={[styles.rail, { backgroundColor: isHigh ? palette.villainGlow : skin.accentPrimary, width: skin.accentStripWidth }]} />
      <View style={styles.cardInner}>
        <Text style={[QuestoryTypography.sectionEyebrow, styles.eyebrow, { color: palette.fog }]}>
          {eyebrow}
        </Text>
        <Text style={[QuestoryTypography.statValue, styles.stat, { color: accent }]}>
          {villainInfluence}%
        </Text>
        <View style={[styles.meterTrack, { backgroundColor: `${palette.panelBorder}88` }]}>
          <View
            style={[
              styles.meterFill,
              {
                width: `${Math.min(100, villainInfluence)}%`,
                backgroundColor: isHigh ? palette.villainGlow : `${palette.fog}88`,
              },
            ]}
          />
        </View>
        <Text style={[QuestoryTypography.caption, { color: isHigh ? palette.villainGlow : palette.fog, fontSize: 10 }]}>
          {statusText}
        </Text>
      </View>
    </View>
  );
}

export function HqBountyProgressCard() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, quests } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isDossier = skin.id === 'dust-and-iron';
  const isProtocol = skin.id === 'neuronet';
  const stats = useMemo(() => computeHqMissionStats(quests), [quests]);
  const pct = Math.round(stats.bountyProgress * 100);

  const fill = isDossier
    ? 'rgba(36, 22, 14, 0.96)'
    : isProtocol
      ? 'rgba(10, 16, 34, 0.96)'
      : 'rgba(20, 16, 28, 0.96)';

  const eyebrow = isProtocol ? 'ACTIVE PROTOCOL' : isDossier ? 'ACTIVE BOUNTY' : ui.operationsLeftLabel;
  const footer =
    stats.totalBounties > 0
      ? isProtocol
        ? `${stats.completedBounties} cleared · ${stats.remainingBounties} routing`
        : `${stats.completedBounties} reclaimed · ${stats.remainingBounties} active`
      : ui.noActiveChapterBriefing;

  return (
    <View style={[styles.card, { backgroundColor: fill }, QuestoryTheme.shadow.soft]}>
      <View style={[styles.rail, { backgroundColor: skin.accentSecondary, width: skin.accentStripWidth }]} />
      <View style={styles.cardInner}>
        <Text style={[QuestoryTypography.sectionEyebrow, styles.eyebrow, { color: palette.fog }]}>
          {eyebrow}
        </Text>
        <Text style={[QuestoryTypography.statValue, styles.stat, { color: skin.accentPrimary }]}>
          {stats.remainingBounties}
        </Text>
        <View style={[styles.meterTrack, { backgroundColor: `${palette.panelBorder}88` }]}>
          <View
            style={[styles.meterFill, { width: `${pct}%`, backgroundColor: skin.accentPrimary }]}
          />
        </View>
        <Text style={[QuestoryTypography.caption, { color: palette.fog, fontSize: 10 }]} numberOfLines={2}>
          {footer}
        </Text>
      </View>
    </View>
  );
}

export function HqCompactStatsRow() {
  return (
    <View style={styles.row}>
      <View style={styles.half}>
        <HqThreatCard />
      </View>
      <View style={styles.half}>
        <HqBountyProgressCard />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 4,
  },
  half: { flex: 1, minWidth: 0 },
  card: {
    borderRadius: 14,
    overflow: 'hidden',
    flexDirection: 'row',
    minHeight: 118,
  },
  rail: {
    flexShrink: 0,
  },
  cardInner: {
    flex: 1,
    padding: 14,
    gap: 6,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  eyebrow: {
    fontSize: 9,
    letterSpacing: 2,
  },
  stat: {
    fontSize: 30,
    lineHeight: 34,
    letterSpacing: 1.5,
  },
  meterTrack: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  meterFill: {
    height: '100%',
    borderRadius: 3,
  },
});
