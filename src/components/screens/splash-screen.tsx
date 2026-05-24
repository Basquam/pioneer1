import { type Href, router } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function SplashScreen() {
  const { hasOnboarded } = useGame();
  const logoScale = useSharedValue(0.85);
  const logoOpacity = useSharedValue(0);

  useEffect(() => {
    logoOpacity.value = withTiming(1, { duration: 800, easing: Easing.out(Easing.cubic) });
    logoScale.value = withTiming(1, { duration: 900, easing: Easing.out(Easing.back(1.2)) });
  }, [logoOpacity, logoScale]);

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
    transform: [{ scale: logoScale.value }, { skewX: '-6deg' }],
  }));

  return (
    <View style={styles.root}>
      <Animated.View entering={FadeIn.duration(400)} style={logoStyle}>
        <Text style={styles.title}>PIONEER</Text>
        <View style={styles.rule} />
        <Text style={styles.sub}>NARRATIVE PRODUCTIVITY RPG</Text>
      </Animated.View>
      <Animated.Text entering={FadeIn.delay(600)} exiting={FadeOut} style={styles.loader}>
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
    gap: 48,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 56,
    color: '#f5f0e8',
    letterSpacing: 8,
    textShadowColor: '#c41e3a',
    textShadowOffset: { width: 4, height: 4 },
    textShadowRadius: 0,
  },
  rule: {
    height: 3,
    width: 120,
    backgroundColor: '#c41e3a',
    marginVertical: 12,
    transform: [{ skewX: '-12deg' }],
  },
  sub: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    color: '#a8a29e',
    letterSpacing: 4,
    textAlign: 'center',
  },
  loader: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    color: '#f4a261',
    letterSpacing: 3,
    position: 'absolute',
    bottom: 80,
  },
});
