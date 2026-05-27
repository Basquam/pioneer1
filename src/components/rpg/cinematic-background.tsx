import { LinearGradient } from 'expo-linear-gradient';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { useGame } from '@/hooks/use-game';

const { width, height } = Dimensions.get('window');
const STAR_COUNT = 40;

const stars = Array.from({ length: STAR_COUNT }, (_, i) => ({
  id: i,
  x: (i * 73) % width,
  y: (i * 41) % (height * 0.55),
  size: 1 + (i % 3),
  delay: (i % 7) * 200,
}));

function Star({
  x,
  y,
  size,
  delay,
  color,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  color: string;
}) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: 1200 + delay, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.15, { duration: 1400 + delay, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [delay, opacity]);

  const style = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <Animated.View
      style={[
        styles.star,
        { left: x, top: y, width: size, height: size, borderRadius: size, backgroundColor: color },
        style,
      ]}
    />
  );
}

export function CinematicBackground() {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const pulse = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 5000, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [pulse]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.15, 0.35]),
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={palette.gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={['transparent', `${palette.primary}33`, `${palette.accent}18`]}
        locations={[0.5, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
      {stars.map((s) => (
        <Star key={s.id} {...s} color={palette.bone} />
      ))}
      <Animated.View style={[styles.ambientGlow, glowStyle, { backgroundColor: palette.glow }]} />
      <LinearGradient
        colors={['transparent', `${palette.void}99`, palette.void]}
        locations={[0.55, 0.88, 1]}
        style={StyleSheet.absoluteFill}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  star: { position: 'absolute' },
  ambientGlow: {
    position: 'absolute',
    top: height * 0.15,
    right: -40,
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
