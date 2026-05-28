import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { skewTransform } from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlowButtonProps = {
  label: string;
  hint?: string;
  onPress: () => void;
};

export function GlowButton({ label, hint, onPress }: GlowButtonProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const glow = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + glow.value * 0.5,
    transform: [{ scale: 1.04 + glow.value * 0.1 }],
  }));

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.glowOrb, glowStyle, { backgroundColor: palette.glow }]} />
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={() => {
          scale.value = withTiming(0.96, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        style={[
          styles.button,
          btnStyle,
          {
            backgroundColor: visualTheme.panelUsesHolographic
              ? `${palette.primary}cc`
              : palette.primary,
            borderColor: visualTheme.panelUsesHolographic ? palette.accent : palette.gold,
            borderWidth: visualTheme.buttonBorderWidth,
            transform: skewTransform(visualTheme.buttonSkew),
          },
        ]}>
        <Text
          style={[styles.label, { color: palette.bone }]}
          numberOfLines={1}
          adjustsFontSizeToFit
          minimumFontScale={0.75}>
          {label}
        </Text>
        {hint ? (
          <Text
            style={[styles.hint, { color: visualTheme.panelUsesHolographic ? palette.accent : palette.gold }]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.8}>
            {hint}
          </Text>
        ) : null}
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 8 },
  glowOrb: { position: 'absolute', width: '100%', height: 60, borderRadius: 4 },
  button: {
    width: '100%',
    paddingVertical: 16,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  label: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 3, textAlign: 'center' },
  hint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 4,
  },
});
