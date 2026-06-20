import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { QuestoryTypography } from '@/theme/typography';

type HqPrototypeCardProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  accentColor?: string;
  railWidth?: number;
  onPress?: () => void;
};

/** Filled surface block for design lab prototypes — no thin-outline dashboard styling. */
export function HqPrototypeCard({
  children,
  style,
  backgroundColor = 'rgba(18, 14, 24, 0.96)',
  accentColor,
  railWidth = 0,
  onPress,
}: HqPrototypeCardProps) {
  const body = (
    <View style={[styles.card, { backgroundColor }, style]}>
      {accentColor && railWidth > 0 ? (
        <View style={[styles.rail, { width: railWidth, backgroundColor: accentColor }]} />
      ) : null}
      <View style={styles.content}>{children}</View>
    </View>
  );

  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.9 : 1 }]}>
        {body}
      </Pressable>
    );
  }

  return body;
}

type HqPrototypeCtaProps = {
  label: string;
  hint?: string;
  onPress?: () => void;
  backgroundColor: string;
  textColor?: string;
  hintColor?: string;
  large?: boolean;
};

export function HqPrototypeCta({
  label,
  hint,
  onPress,
  backgroundColor,
  textColor = '#050308',
  hintColor = '#1a2830',
  large = false,
}: HqPrototypeCtaProps) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.cta,
        large && styles.ctaLarge,
        { backgroundColor, opacity: pressed ? 0.88 : 1 },
      ]}>
      <Text style={[QuestoryTypography.sectionTitle, styles.ctaLabel, { color: textColor }]}>{label}</Text>
      {hint ? (
        <Text style={[QuestoryTypography.caption, { color: hintColor, fontSize: 10 }]}>{hint}</Text>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  rail: { flexShrink: 0 },
  content: { flex: 1 },
  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 3,
    minHeight: 48,
    justifyContent: 'center',
  },
  ctaLarge: {
    paddingVertical: 18,
    minHeight: 56,
  },
  ctaLabel: {
    letterSpacing: 2,
    fontSize: 14,
  },
});
