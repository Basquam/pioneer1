import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseAccent } from '@/theme/universe-skins';

type QuestoryProgressBarProps = {
  progress: number;
  label?: string;
  meta?: string;
  universeId?: string;
  danger?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function QuestoryProgressBar({
  progress,
  label,
  meta,
  universeId,
  danger = false,
  style,
}: QuestoryProgressBarProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const resolvedUniverseId = universeId ?? activeUniverse.id;
  const accent = getUniverseAccent(resolvedUniverseId);
  const clamped = Math.max(0, Math.min(1, progress));
  const fillColor = danger ? palette.villainGlow : palette.xpFill || accent.primary;

  return (
    <View style={[styles.wrap, style]}>
      {label || meta ? (
        <View style={styles.metaRow}>
          {label ? (
            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>{label}</Text>
          ) : (
            <View />
          )}
          {meta ? (
            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>{meta}</Text>
          ) : null}
        </View>
      ) : null}
      <View style={[styles.track, { backgroundColor: palette.xpTrack }]}>
        <View style={[styles.fill, { width: `${Math.round(clamped * 100)}%`, backgroundColor: fillColor }]} />
        <View style={[styles.trackHighlight, { borderColor: `${accent.primary}33` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
  },
  track: {
    height: 8,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  trackHighlight: {
    ...StyleSheet.absoluteFill,
    borderWidth: 1,
    borderRadius: 2,
  },
});
