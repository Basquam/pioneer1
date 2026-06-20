import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseAccent } from '@/theme/universe-skins';

type QuestorySectionHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  right?: string;
  universeId?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function QuestorySectionHeader({
  eyebrow,
  title,
  subtitle,
  right,
  universeId,
  compact = false,
  style,
}: QuestorySectionHeaderProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const resolvedUniverseId = universeId ?? activeUniverse.id;
  const accent = getUniverseAccent(resolvedUniverseId);

  return (
    <View style={[styles.row, style]}>
      <View style={styles.left}>
        {eyebrow ? (
          <View style={styles.eyebrowRow}>
            <View style={[styles.eyebrowMark, { backgroundColor: accent.primary }]} />
            <Text
              style={[
                compact ? styles.eyebrowCompact : QuestoryTypography.sectionEyebrow,
                { color: accent.primary },
              ]}
              numberOfLines={2}>
              {eyebrow}
            </Text>
          </View>
        ) : null}
        <Text
          style={[
            compact ? styles.titleCompact : QuestoryTypography.screenTitle,
            { color: palette.bone },
          ]}
          numberOfLines={compact ? 2 : 3}
          adjustsFontSizeToFit={!compact}
          minimumFontScale={0.82}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[QuestoryTypography.bodySmall, { color: palette.fog }]} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
        {visualTheme.headerUnderline !== false ? (
          <View style={[styles.underline, { backgroundColor: `${accent.primary}55` }]}>
            <View style={[styles.underlineAccent, { backgroundColor: accent.primary }]} />
          </View>
        ) : null}
      </View>
      {right ? (
        <Text
          style={[
            QuestoryTypography.caption,
            {
              color: visualTheme.panelUsesHolographic ? palette.primary : palette.gold,
            },
          ]}
          numberOfLines={3}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {right}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flex: 1, flexShrink: 1, minWidth: 0, gap: 6 },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  eyebrowMark: { width: 3, height: 14 },
  eyebrowCompact: {
    ...QuestoryTypography.sectionEyebrow,
    fontSize: 9,
    letterSpacing: 2.2,
  },
  titleCompact: {
    ...QuestoryTypography.sectionTitle,
    letterSpacing: 0.8,
  },
  underline: {
    height: 2,
    width: '100%',
    maxWidth: 220,
    marginTop: 4,
    overflow: 'hidden',
  },
  underlineAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '38%',
    height: '100%',
    opacity: 0.85,
  },
});
