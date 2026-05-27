import { useEffect } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, {
  FadeIn,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function XpPopup() {
  const { activeUniverse, xpBurst, dismissXpBurst } = useGame();
  const { palette } = activeUniverse;
  const translateY = useSharedValue(20);
  const scale = useSharedValue(0.6);

  useEffect(() => {
    if (!xpBurst) return;
    translateY.value = withSequence(withTiming(-50, { duration: 600 }), withTiming(-80, { duration: 400 }));
    scale.value = withSequence(withTiming(1.15, { duration: 300 }), withTiming(1, { duration: 200 }));
    const timer = setTimeout(dismissXpBurst, 1100);
    return () => clearTimeout(timer);
  }, [dismissXpBurst, scale, translateY, xpBurst]);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }, { scale: scale.value }],
  }));

  if (!xpBurst) return null;

  return (
    <Animated.View
      entering={FadeIn.duration(150)}
      exiting={FadeOut.duration(200)}
      style={[
        styles.wrap,
        style,
        { backgroundColor: palette.primary, borderColor: palette.gold },
      ]}
      pointerEvents="none">
      <Text style={[styles.amount, { color: palette.gold }]}>+{xpBurst.amount} XP</Text>
      <Text style={[styles.flavor, { color: palette.bone }]}>BOUNTY CLAIMED</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '36%',
    alignSelf: 'center',
    zIndex: 200,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderWidth: 2,
    transform: [{ skewX: '-8deg' }],
  },
  amount: { fontFamily: GameFonts.ui, fontSize: 32, letterSpacing: 4 },
  flavor: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 3, marginTop: 2 },
});
