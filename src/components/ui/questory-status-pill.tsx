import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { QuestoryTheme } from '@/theme/questory-theme';
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseAccent } from '@/theme/universe-skins';

type QuestoryStatusPillTone = 'default' | 'danger' | 'success' | 'accent' | 'muted';

type QuestoryStatusPillProps = {
  label: string;
  tone?: QuestoryStatusPillTone;
  universeId?: string;
  style?: StyleProp<ViewStyle>;
};

export function QuestoryStatusPill({
  label,
  tone = 'default',
  universeId,
  style,
}: QuestoryStatusPillProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const resolvedUniverseId = universeId ?? activeUniverse.id;
  const accent = getUniverseAccent(resolvedUniverseId);

  const colors = (() => {
    switch (tone) {
      case 'danger':
        return {
          backgroundColor: `${palette.villain}88`,
          borderColor: palette.villainGlow,
          textColor: palette.villainGlow,
        };
      case 'success':
        return {
          backgroundColor: `${QuestoryTheme.colors.accent.success}22`,
          borderColor: QuestoryTheme.colors.accent.success,
          textColor: QuestoryTheme.colors.accent.success,
        };
      case 'accent':
        return {
          backgroundColor: `${palette.primary}66`,
          borderColor: palette.accent,
          textColor: palette.accent,
        };
      case 'muted':
        return {
          backgroundColor: palette.ink,
          borderColor: palette.panelBorder,
          textColor: palette.fog,
        };
      default:
        return {
          backgroundColor: `${palette.primary}55`,
          borderColor: accent.primary,
          textColor: palette.bone,
        };
    }
  })();

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: colors.backgroundColor,
          borderColor: colors.borderColor,
        },
        style,
      ]}>
      <Text style={[QuestoryTypography.caption, { color: colors.textColor }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
  },
});
