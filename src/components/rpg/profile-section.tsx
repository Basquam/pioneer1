import { type ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type ProfileSectionBadge = 'experimental' | 'dev';

type ProfileSectionProps = {
  title: string;
  badge?: ProfileSectionBadge;
  hint?: string;
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function ProfileSection({ title, badge, hint, children, style }: ProfileSectionProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

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

  return (
    <View style={[styles.section, style]}>
      <View style={styles.headerRow}>
        <Text style={[styles.title, { color: palette.gold }]}>{title}</Text>
        {badgeLabel ? (
          <View style={[styles.badge, { borderColor: badgeColor, backgroundColor: `${badgeColor}18` }]}>
            <Text style={[styles.badgeText, { color: badgeColor }]}>{badgeLabel}</Text>
          </View>
        ) : null}
      </View>
      {hint ? <Text style={[styles.hint, { color: palette.fog }]}>{hint}</Text> : null}
      <View style={[styles.body, { borderColor, backgroundColor }]}>{children}</View>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
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
  body: {
    borderWidth: 1,
    padding: 12,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
});
