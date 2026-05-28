import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

type AddQuestTriggerProps = {
  variant: 'banner' | 'fab';
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function AddQuestTrigger({ variant }: AddQuestTriggerProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, openAddQuestSheet } = useGame();
  const { palette } = activeUniverse;
  const glow = useSharedValue(0);

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
    opacity: 0.35 + glow.value * 0.45,
  }));

  const open = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    openAddQuestSheet();
  };

  return (
    <>
      {variant === 'banner' ? (
        <Pressable
          onPress={open}
          style={[styles.banner, { borderColor: palette.accent, backgroundColor: `${palette.panel}cc` }]}>
          <Text style={[styles.bannerLabel, { color: palette.accent }]}>{ui.addQuestTriggerBanner}</Text>
          <Text style={[styles.bannerSub, { color: palette.fog }]} numberOfLines={2}>
            {ui.addQuestTriggerSub}
          </Text>
        </Pressable>
      ) : (
        <AnimatedPressable
          entering={FadeInUp.delay(300).springify()}
          onPress={open}
          style={[styles.fabWrap, styles.fabPosition]}
          accessibilityRole="button"
          accessibilityLabel={ui.addQuestAccessibilityLabel}>
          <Animated.View
            style={[
              styles.fabGlow,
              glowStyle,
              { backgroundColor: palette.accent, shadowColor: palette.accent },
            ]}
          />
          <View
            style={[
              styles.fab,
              { backgroundColor: palette.primary, borderColor: palette.gold },
            ]}>
            <Text style={[styles.fabPlus, { color: palette.gold }]}>+</Text>
            <Text style={[styles.fabLabel, { color: palette.bone }]}>{ui.addQuestButtonLabel}</Text>
          </View>
        </AnimatedPressable>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    padding: 14,
    gap: 4,
    transform: [{ skewX: '-3deg' }],
    marginBottom: 4,
  },
  bannerLabel: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  bannerSub: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  fabPosition: {
    position: 'absolute',
    right: 20,
    bottom: 24,
    zIndex: 20,
  },
  fabWrap: {
    transform: [{ skewX: '-6deg' }],
  },
  fabGlow: {
    position: 'absolute',
    inset: -6,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 14,
    elevation: 8,
  },
  fab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
  },
  fabPlus: {
    fontFamily: GameFonts.ui,
    fontSize: 22,
    lineHeight: 24,
  },
  fabLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 2,
  },
});
