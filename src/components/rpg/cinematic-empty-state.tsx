import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type CinematicEmptyStateProps = {
  title: string;
  message: string;
  primaryLabel: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
  index?: number;
};

export function CinematicEmptyState({
  title,
  message,
  primaryLabel,
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
  index = 0,
}: CinematicEmptyStateProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  return (
    <Animated.View
      entering={FadeInUp.delay(index * 80).duration(450)}
      style={[
        styles.panel,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <Text style={[styles.eyebrow, { color: palette.accent }]}>FIELD REPORT</Text>
      <Text style={[styles.title, { color: palette.bone }]}>{title}</Text>
      <Text style={[styles.message, { color: palette.fog }]}>{message}</Text>

      <Pressable
        onPress={onPrimaryPress}
        style={[styles.primaryButton, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
        <Text style={[styles.primaryLabel, { color: palette.bone }]}>{primaryLabel}</Text>
      </Pressable>

      {secondaryLabel && onSecondaryPress && (
        <Pressable
          onPress={onSecondaryPress}
          style={[styles.secondaryButton, { borderColor: palette.panelBorder }]}>
          <Text style={[styles.secondaryLabel, { color: palette.gold }]}>{secondaryLabel}</Text>
        </Pressable>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  eyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  title: { fontFamily: GameFonts.display, fontSize: 22, letterSpacing: 1, lineHeight: 28 },
  message: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  primaryButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 6,
    transform: [{ skewX: '-4deg' }],
  },
  primaryLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  secondaryButton: {
    borderWidth: 1,
    paddingVertical: 10,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  secondaryLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
});
