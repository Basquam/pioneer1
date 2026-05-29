import type { ReactNode } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { GameFonts } from '@/constants/typography';

type CollapsibleSectionProps = {
  title: string;
  hint?: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
  palette: {
    gold: string;
    fog: string;
    bone: string;
    panelBorder: string;
    panel: string;
  };
  style?: StyleProp<ViewStyle>;
};

export function CollapsibleSection({
  title,
  hint,
  expanded,
  onToggle,
  children,
  palette,
  style,
}: CollapsibleSectionProps) {
  const handleToggle = () => {
    void Haptics.selectionAsync();
    onToggle();
  };

  return (
    <View style={[styles.wrap, { borderColor: palette.panelBorder, backgroundColor: palette.panel }, style]}>
      <Pressable onPress={handleToggle} style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={[styles.title, { color: palette.bone }]}>{title}</Text>
          {hint ? <Text style={[styles.hint, { color: palette.fog }]}>{hint}</Text> : null}
        </View>
        <Text style={[styles.chevron, { color: palette.gold }]}>{expanded ? '−' : '+'}</Text>
      </Pressable>
      {expanded ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderWidth: 1,
    transform: [{ skewX: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  headerCopy: { flex: 1, gap: 3 },
  title: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 1,
  },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  chevron: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    lineHeight: 20,
  },
  body: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: 14,
    paddingBottom: 14,
    paddingTop: 12,
    gap: 12,
  },
});
