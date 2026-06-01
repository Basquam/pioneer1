import { StyleSheet, Text, View } from 'react-native';

import { getQuestSuiteById } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import type { QuestSuiteId } from '@/types/narrative';

type SuiteBadgeProps = {
  suiteId: QuestSuiteId;
  palette: {
    panel: string;
    panelBorder: string;
    fog: string;
    gold: string;
  };
  compact?: boolean;
};

export function SuiteBadge({ suiteId, palette, compact = true }: SuiteBadgeProps) {
  const suite = getQuestSuiteById(suiteId);
  if (!suite) return null;

  return (
    <View
      style={[
        styles.badge,
        compact && styles.badgeCompact,
        { borderColor: palette.panelBorder, backgroundColor: palette.panel },
      ]}>
      <Text style={[styles.icon, compact && styles.iconCompact]}>{suite.icon}</Text>
      <Text style={[styles.label, { color: palette.fog }, compact && styles.labelCompact]} numberOfLines={1}>
        {compact ? suite.shortLabel.toUpperCase() : suite.label.toUpperCase()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3,
    transform: [{ skewX: '-3deg' }],
  },
  badgeCompact: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  icon: {
    fontSize: 11,
  },
  iconCompact: {
    fontSize: 10,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  labelCompact: {
    fontSize: 7,
    letterSpacing: 0.6,
  },
});
