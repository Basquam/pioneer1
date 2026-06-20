import type { ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { QuestoryTheme, type QuestoryCardVariant } from '@/theme/questory-theme';
import { getUniverseSkin, getUniverseSurfaceStyle } from '@/theme/universe-skins';

type QuestoryCardProps = {
  children: ReactNode;
  variant?: QuestoryCardVariant;
  universeId?: string;
  accentStrip?: boolean;
  /** Subtle outer glow from universe skin */
  glow?: boolean;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
};

function resolveVariant(
  universeId: string,
  variant: QuestoryCardVariant | undefined,
): QuestoryCardVariant {
  if (variant) return variant;
  return getUniverseSkin(universeId).cardVariant;
}

export function QuestoryCard({
  children,
  variant,
  universeId,
  accentStrip = true,
  glow = true,
  style,
  contentStyle,
}: QuestoryCardProps) {
  const { activeUniverse } = useGame();
  const resolvedUniverseId = universeId ?? activeUniverse.id;
  const skin = getUniverseSkin(resolvedUniverseId);
  const resolvedVariant = resolveVariant(resolvedUniverseId, variant);
  const surfaceStyle = getUniverseSurfaceStyle(resolvedUniverseId, resolvedVariant);

  const accentColor =
    resolvedVariant === 'danger'
      ? QuestoryTheme.colors.accent.danger
      : resolvedVariant === 'success'
        ? QuestoryTheme.colors.accent.success
        : skin.accentPrimary;

  const showTopHighlight =
    resolvedVariant === 'elevated' ||
    resolvedVariant === 'dossier' ||
    resolvedVariant === 'terminal';

  const shadowStyle =
    resolvedVariant === 'danger'
      ? QuestoryTheme.shadow.soft
      : glow
        ? skin.panelShadow
        : QuestoryTheme.shadow.soft;

  return (
    <View
      style={[
        styles.outerFrame,
        { borderColor: `${accentColor}44` },
        skin.cardSkew !== 0 && { transform: [{ skewX: `${skin.cardSkew}deg` }] },
        shadowStyle,
        style,
      ]}>
      <View style={[styles.card, surfaceStyle]}>
        {showTopHighlight ? (
          <View style={[styles.topHighlight, { backgroundColor: `${accentColor}88` }]} />
        ) : null}
        {accentStrip ? (
          <View
            style={[
              styles.accentStrip,
              { backgroundColor: accentColor, width: skin.accentStripWidth },
            ]}
          />
        ) : null}
        <View
          style={[
            styles.innerBorder,
            { borderColor: QuestoryTheme.colors.border.inner },
            skin.cardSkew !== 0 && styles.innerUnskew,
            contentStyle,
          ]}>
          {children}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerFrame: {
    borderWidth: 1,
    marginBottom: 2,
  },
  card: {
    overflow: 'hidden',
  },
  topHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    zIndex: 2,
  },
  accentStrip: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    zIndex: 1,
  },
  innerBorder: {
    borderLeftWidth: 0,
    padding: QuestoryTheme.spacing.lg,
    paddingLeft: QuestoryTheme.spacing.xl,
    gap: QuestoryTheme.spacing.md,
  },
  innerUnskew: {
    transform: [{ skewX: '2deg' }],
  },
});
