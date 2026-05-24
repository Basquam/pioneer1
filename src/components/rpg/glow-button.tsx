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
import { useGame } from '@/hooks/use-game';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlowButtonProps = {
  label: string;
  hint?: string;
  onPress: () => void;
};

export function GlowButton({ label, hint, onPress }: GlowButtonProps) {
  const { theme } = useGame();
  const { colors } = theme;
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
      <Animated.View style={[styles.glowOrb, glowStyle, { backgroundColor: colors.glow }]} />
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
          { backgroundColor: colors.primary, borderColor: colors.gold },
        ]}>
        <Text style={[styles.label, { color: colors.bone }]}>{label}</Text>
        {hint && <Text style={[styles.hint, { color: colors.gold }]}>{hint}</Text>}
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
    alignItems: 'center',
    borderWidth: 2,
    transform: [{ skewX: '-6deg' }],
  },
  label: { fontFamily: GameFonts.ui, fontSize: 20, letterSpacing: 4 },
  hint: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2, marginTop: 4 },
});
