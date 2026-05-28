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

import {
  GridDotOverlay,
  RainStreakOverlay,
  ScanlineOverlay,
  TypewriterTextureOverlay,
} from '@/components/rpg/visual-theme-overlay';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';

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
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const pulse = useSharedValue(0);
  const glitch = useSharedValue(0);

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

  useEffect(() => {
    if (!visualTheme.showScanlines) return;
    glitch.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glitch, visualTheme.showScanlines]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: interpolate(pulse.value, [0, 1], [0.15, 0.35]),
  }));

  const glitchStyle = useAnimatedStyle(() => ({
    opacity: visualTheme.showScanlines ? interpolate(glitch.value, [0, 1], [0.35, 0.65]) : 0,
  }));

  const isChrome = visualTheme.backgroundVariant === 'chrome';
  const isNoir = visualTheme.backgroundVariant === 'noir';

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <LinearGradient colors={palette.gradient} locations={[0, 0.5, 1]} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={
          isChrome
            ? ['transparent', `${palette.accent}22`, `${palette.primary}18`]
            : isNoir
              ? ['transparent', `${palette.primary}28`, `${palette.accent}14`]
              : ['transparent', `${palette.primary}33`, `${palette.accent}18`]
        }
        locations={[0.5, 0.85, 1]}
        style={StyleSheet.absoluteFill}
      />
      {visualTheme.showRainStreaks && (
        <RainStreakOverlay color={palette.bone} streakCount={32} />
      )}
      {visualTheme.showTypewriterTexture && (
        <TypewriterTextureOverlay color={palette.bone} lineCount={72} />
      )}
      {visualTheme.ambientParticles === 'stars' &&
        stars.map((s) => (
          <Star key={s.id} {...s} color={isNoir ? palette.accent : palette.bone} />
        ))}
      {visualTheme.showGridDots && (
        <GridDotOverlay color={palette.accent} accentColor={palette.primary} />
      )}
      <Animated.View
        style={[
          styles.ambientGlow,
          glowStyle,
          {
            backgroundColor: palette.glow,
            top: isChrome ? height * 0.08 : isNoir ? height * 0.12 : height * 0.15,
            right: isChrome ? -20 : isNoir ? -30 : -40,
          },
        ]}
      />
      {isNoir && (
        <View
          style={[
            styles.ambientGlow,
            {
              backgroundColor: palette.primary,
              top: height * 0.38,
              left: -50,
              width: 140,
              height: 140,
              opacity: 0.1,
            },
          ]}
        />
      )}
      {isChrome && (
        <Animated.View
          style={[
            styles.ambientGlow,
            glitchStyle,
            {
              backgroundColor: palette.primary,
              top: height * 0.42,
              left: -60,
              width: 160,
              height: 160,
            },
          ]}
        />
      )}
      {visualTheme.showScanlines && <ScanlineOverlay color={palette.accent} />}
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
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
