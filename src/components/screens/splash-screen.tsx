import { LinearGradient } from 'expo-linear-gradient';
import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

const { width, height } = Dimensions.get('window');

const DUST = Array.from({ length: 28 }, (_, index) => ({
  id: index,
  x: (index * 97) % width,
  y: (index * 53) % height,
  size: 1 + (index % 3),
  delay: (index % 6) * 180,
  tone: index % 3 === 0 ? '#f4a261' : index % 3 === 1 ? '#c41e3a' : '#a8a29e',
}));

function DustMote({
  x,
  y,
  size,
  delay,
  tone,
}: {
  x: number;
  y: number;
  size: number;
  delay: number;
  tone: string;
}) {
  const opacity = useSharedValue(0.12);
  const drift = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.55, { duration: 1800, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.08, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
    drift.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(8, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
          withTiming(-6, { duration: 3200, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        true,
      ),
    );
  }, [delay, drift, opacity]);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: drift.value }],
  }));

  return (
    <Animated.View
      style={[
        styles.dust,
        { left: x, top: y, width: size, height: size, backgroundColor: tone },
        style,
      ]}
    />
  );
}

export function SplashScreen() {
  const { hasOnboarded } = useGame();
  const logoScale = useSharedValue(0.88);
  const logoOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0.25);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.back(1.15)) });
    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.55, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.2, { duration: 2200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glowOpacity, logoOpacity, logoScale]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (hasOnboarded) {
        router.replace('/(game)/hq' as Href);
      } else {
        router.replace('/onboarding' as Href);
      }
    }, 2800);
    return () => clearTimeout(timer);
  }, [hasOnboarded]);

  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }, { skewX: '-5deg' }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={['#050308', '#1a0a12', '#2d1518', '#0c0610']}
        locations={[0, 0.35, 0.72, 1]}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.vignetteTop} />
      <View style={styles.vignetteBottom} />

      {DUST.map((mote) => (
        <DustMote key={mote.id} {...mote} />
      ))}

      <Animated.View style={[styles.glowOrb, glowStyle]} />

      <Animated.View entering={FadeIn.duration(500)} style={logoStyle}>
        <Text style={styles.badge}>☆ FRONTIER BADGE ☆</Text>
        <Text style={styles.title}>PIONEER</Text>
        <View style={styles.rule} />
        <Text style={styles.tagline}>Your tasks become stories.</Text>
      </Animated.View>

      <Animated.Text entering={FadeIn.delay(700)} exiting={FadeOut} style={styles.loader}>
        LOADING YOUR SAGA...
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#050308',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  vignetteTop: {
    position: 'absolute',
    top: -80,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#c41e3a',
    opacity: 0.08,
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: -100,
    right: -40,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: '#f4a261',
    opacity: 0.06,
  },
  dust: {
    position: 'absolute',
    borderRadius: 999,
    opacity: 0.2,
  },
  glowOrb: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: '#f4a261',
    opacity: 0.18,
  },
  badge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    color: '#f4a261',
    letterSpacing: 4,
    textAlign: 'center',
    marginBottom: 10,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 58,
    color: '#f4a261',
    letterSpacing: 10,
    textAlign: 'center',
    textShadowColor: '#c41e3a',
    textShadowOffset: { width: 3, height: 3 },
    textShadowRadius: 0,
  },
  rule: {
    height: 2,
    width: 140,
    backgroundColor: '#c41e3a',
    marginVertical: 14,
    alignSelf: 'center',
    transform: [{ skewX: '-12deg' }],
  },
  tagline: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 18,
    color: '#f5f0e8',
    letterSpacing: 0.5,
    textAlign: 'center',
    fontStyle: 'italic',
    lineHeight: 26,
    paddingHorizontal: 24,
  },
  loader: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    color: '#a8a29e',
    letterSpacing: 3,
    position: 'absolute',
    bottom: 80,
  },
});
