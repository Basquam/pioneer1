import { type ReactNode, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type ProfileSectionBadge = 'experimental' | 'dev';

type ProfileSectionProps = {
  title: string;
  badge?: ProfileSectionBadge;
  hint?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ProfileSection({
  title,
  badge,
  hint,
  collapsible = false,
  defaultExpanded = true,
  children,
  style,
}: ProfileSectionProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const borderColor =
    badge === 'dev'
      ? palette.primary
      : badge === 'experimental'
        ? palette.gold
        : palette.panelBorder;

  const backgroundColor =
    badge === 'dev'
      ? `${palette.primary}10`
      : badge === 'experimental'
        ? `${palette.gold}08`
        : `${palette.panel}88`;

  const badgeLabel = badge === 'dev' ? 'DEV' : badge === 'experimental' ? 'EXPERIMENTAL' : null;
  const badgeColor = badge === 'dev' ? palette.primary : palette.gold;

  const handleToggle = () => {
    if (!collapsible) return;
    void Haptics.selectionAsync();
    setExpanded((current) => !current);
  };

  return (
    <View style={[styles.section, style]}>
      <Pressable
        onPress={handleToggle}
        disabled={!collapsible}
        style={styles.headerRow}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.gold }]}>{title}</Text>
          {hint ? <Text style={[styles.hint, { color: palette.fog }]}>{hint}</Text> : null}
        </View>
        {badgeLabel ? (
          <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}18` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        ) : null}
        {collapsible ? (
          <Text style={[styles.chevron, { color: palette.gold }]}>{expanded ? '−' : '+'}</Text>
        ) : null}
      </Pressable>
      {expanded ? (
        <View style={[styles.body, { borderColor, backgroundColor }]}>{children}</View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: 8,
    marginTop: GameLayout.sectionLabelMarginTop,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 3,
    flex: 1,
    minWidth: 0,
  },
  badge: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    transform: [{ skewX: '-6deg' }],
    flexShrink: 0,
  },
  badgeText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  hint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    lineHeight: 14,
  },
  chevron: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 18,
    lineHeight: 20,
    flexShrink: 0,
    marginTop: -2,
  },
  body: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
});
