import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { QuestoryTypography } from '@/theme/typography';

const HIGH_THREAT = 65;
const ELEVATED_THREAT = 35;

export function HqThreatMonitor() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, villainInfluence } = useGame();
  const { palette } = activeUniverse;

  const isHigh = villainInfluence >= HIGH_THREAT;
  const isElevated = villainInfluence >= ELEVATED_THREAT;
  const accent = isHigh ? palette.villainGlow : isElevated ? `${palette.villainGlow}cc` : palette.fog;
  const borderColor = isHigh
    ? QuestoryTheme.colors.accent.danger
    : isElevated
      ? `${QuestoryTheme.colors.accent.danger}88`
      : `${palette.panelBorder}`;

  return (
    <Animated.View entering={FadeInDown.duration(480).delay(160)} style={styles.wrap}>
      <View
        style={[
          styles.monitor,
          {
            borderColor,
            backgroundColor: isHigh ? `${QuestoryTheme.colors.accent.danger}18` : QuestoryTheme.colors.background.panel,
          },
          isHigh ? QuestoryTheme.shadow.soft : undefined,
        ]}>
        <View style={[styles.scanLine, { backgroundColor: accent }]} />
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <QuestoryStatusPill label="THREAT MONITOR" tone={isHigh ? 'danger' : 'muted'} />
            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>
              {ui.villainStatLabel}
            </Text>
          </View>
          <View style={[styles.readout, { borderColor: `${accent}66` }]}>
            <Text style={[QuestoryTypography.statValue, { color: accent, fontSize: 26, lineHeight: 30 }]}>
              {villainInfluence}%
            </Text>
          </View>
        </View>

        <QuestoryProgressBar
          progress={villainInfluence / 100}
          meta={isHigh ? 'Critical influence' : isElevated ? 'Elevated influence' : 'Contained for now'}
          danger={isHigh}
        />

        <View style={styles.tickRow}>
          {[0, 25, 50, 75, 100].map((tick) => (
            <View key={tick} style={styles.tickWrap}>
              <View style={[styles.tick, { backgroundColor: `${accent}55` }]} />
              <Text style={[QuestoryTypography.caption, { color: palette.fog, fontSize: 8 }]}>{tick}</Text>
            </View>
          ))}
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 6 },
  monitor: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    overflow: 'hidden',
  },
  scanLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 2,
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerLeft: { flex: 1, gap: 6 },
  readout: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 72,
    alignItems: 'center',
  },
  tickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 2,
  },
  tickWrap: { alignItems: 'center', gap: 2, width: 28 },
  tick: { width: 1, height: 6 },
});
