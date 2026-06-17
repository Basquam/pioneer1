import { Image, Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { APP_MASCOTS } from '@/constants/app-mascots';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
    getMascotCoachDisplay,
    getMascotPreference,
    type MascotCoachContext,
    type MascotCoachDisplay,
} from '@/lib/app-mascot-coach';

type CoachMascotTipProps = {
  context: MascotCoachContext;
  messageOverride?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  /** When off/fallback and true, render nothing instead of plain text. */
  suppressFallback?: boolean;
  /** Compact inline variant for nested use. */
  variant?: 'card' | 'inline';
};

export function CoachMascotTip({
  context,
  messageOverride,
  ctaLabel,
  onCtaPress,
  dismissible = false,
  onDismiss,
  style,
  suppressFallback = false,
  variant = 'card',
}: CoachMascotTipProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const display = getMascotCoachDisplay(context, getMascotPreference(playerProgress), messageOverride);

  if (display.mode === 'fallback') {
    if (suppressFallback) return null;
    return (
      <Text style={[styles.fallback, { color: palette.fog }, style as object]}>{display.message}</Text>
    );
  }

  if (display.mode === 'minimal') {
    return (
      <View style={[styles.minimalWrap, style]}>
        <Text style={[styles.minimalLabel, { color: palette.accent }]}>
          {display.name}
        </Text>
        <Text style={[styles.minimalMessage, { color: palette.fog }]}>{display.message}</Text>
      </View>
    );
  }

  return (
    <MascotCard
      display={display}
      palette={palette}
      ctaLabel={ctaLabel}
      onCtaPress={onCtaPress}
      dismissible={dismissible}
      onDismiss={onDismiss}
      style={style}
      compact={variant === 'inline'}
    />
  );
}

type MascotCardProps = {
  display: MascotCoachDisplay;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
    primary: string;
    night: string;
  };
  ctaLabel?: string;
  onCtaPress?: () => void;
  dismissible?: boolean;
  onDismiss?: () => void;
  style?: StyleProp<ViewStyle>;
  compact?: boolean;
};

function MascotCard({
  display,
  palette,
  ctaLabel,
  onCtaPress,
  dismissible,
  onDismiss,
  style,
  compact = false,
}: MascotCardProps) {
  if (!display.mascotId) return null;

  const mascot = APP_MASCOTS[display.mascotId];

  return (
    <View
      style={[
        compact ? styles.inlineCard : styles.card,
        { backgroundColor: palette.night, borderColor: palette.panelBorder },
        style,
      ]}>
      <View style={styles.header}>
        <MascotAvatar mascotId={display.mascotId} palette={palette} compact={compact} />
        <View style={styles.copy}>
          <Text style={[styles.name, { color: palette.bone }]}>
            {display.name}
            {display.role ? (
              <Text style={[styles.role, { color: palette.fog }]}> · {display.role}</Text>
            ) : null}
          </Text>
          <Text style={[styles.message, { color: palette.fog }]}>{display.message}</Text>
        </View>
        {dismissible && onDismiss ? (
          <Pressable onPress={onDismiss} hitSlop={10}>
            <Text style={[styles.dismiss, { color: palette.fog }]}>×</Text>
          </Pressable>
        ) : null}
      </View>

      {ctaLabel && onCtaPress ? (
        <Pressable
          onPress={onCtaPress}
          style={[styles.cta, { borderColor: palette.gold, backgroundColor: `${palette.primary}88` }]}>
          <Text style={[styles.ctaText, { color: palette.bone }]}>{ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function MascotAvatar({
  mascotId,
  palette,
  compact,
}: {
  mascotId: import('@/types/narrative').AppMascotId;
  palette: MascotCardProps['palette'];
  compact?: boolean;
}) {
  const mascot = APP_MASCOTS[mascotId];
  const size = compact ? 28 : 34;

  if (mascot.portrait) {
    return (
      <Image
        source={mascot.portrait}
        style={[styles.avatarImage, { width: size, height: size, borderColor: palette.gold }]}
      />
    );
  }

  return (
    <View
      style={[
        styles.avatarPlaceholder,
        {
          width: size,
          height: size,
          borderColor: palette.gold,
          backgroundColor: `${palette.primary}55`,
        },
      ]}>
      <Text style={[styles.avatarInitials, { color: palette.bone, fontSize: compact ? 12 : 14 }]}>
        {mascot.initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  inlineCard: {
    borderWidth: 1,
    padding: 8,
    gap: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  name: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.4,
  },
  role: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
  },
  message: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  dismiss: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 16,
    lineHeight: 18,
    paddingHorizontal: 2,
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  fallback: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  minimalWrap: {
    gap: 2,
  },
  minimalLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
  },
  minimalMessage: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  avatarPlaceholder: {
    borderWidth: 1,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  avatarImage: {
    borderWidth: 1,
    borderRadius: 999,
    flexShrink: 0,
  },
  avatarInitials: {
    fontFamily: GameFonts.uiSemi,
    letterSpacing: 0.5,
  },
});
