import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { useEffect } from 'react';

import { GameFonts } from '@/constants/typography';
import { skewTransform } from '@/constants/universe-visual-theme';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import type { ChapterStatus } from '@/lib/chapter-progress';
import type { Chapter, UniversePalette } from '@/types/narrative';

type TerritoryNodeProps = {
  chapter: Chapter;
  status: ChapterStatus;
  palette: UniversePalette;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function TerritoryNode({ chapter, status, palette, onPress }: TerritoryNodeProps) {
  const visualTheme = useUniverseVisualTheme();
  const glow = useSharedValue(0);
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  useEffect(() => {
    if (!isActive) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1200, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [glow, isActive]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: isActive ? 0.25 + glow.value * 0.45 : 0,
    transform: [{ scale: 1 + glow.value * 0.15 }],
  }));

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <AnimatedPressable
      entering={FadeIn.duration(400)}
      onPress={handlePress}
      style={[
        styles.node,
        {
          backgroundColor: isCompleted
            ? `${palette.accent}22`
            : isLocked
              ? `${palette.villain}55`
              : `${palette.primary}33`,
          borderColor: isCompleted
            ? palette.accent
            : isActive
              ? palette.primary
              : isLocked
                ? palette.villainGlow
                : palette.panelBorder,
          borderRadius: visualTheme.nodeBorderRadius,
          opacity: isLocked ? 0.65 : 1,
          transform: skewTransform(visualTheme.nodeSkew),
        },
      ]}>
      {isActive && (
        <Animated.View
          style={[styles.glow, glowStyle, { backgroundColor: palette.accent, shadowColor: palette.accent }]}
        />
      )}
      <Text style={[styles.order, { color: isLocked ? palette.fog : palette.accent }]}>
        {isLocked ? '🔒' : chapter.order}
      </Text>
      <Text style={[styles.name, { color: palette.bone }]} numberOfLines={2}>
        {chapter.territoryName}
      </Text>
      {isCompleted && (
        <Text style={[styles.stamp, { color: palette.accent }]}>{visualTheme.completedStamp}</Text>
      )}
      {isActive && <Text style={[styles.stamp, { color: palette.primary }]}>{visualTheme.activeStamp}</Text>}
      {isLocked && <Text style={[styles.stamp, { color: palette.villainGlow }]}>{visualTheme.lockedStamp}</Text>}
    </AnimatedPressable>
  );
}

const NODE_WIDTH = 108;

const styles = StyleSheet.create({
  node: {
    width: NODE_WIDTH,
    minHeight: 88,
    borderWidth: 2,
    padding: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  glow: {
    position: 'absolute',
    inset: -8,
    borderRadius: 2,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
    elevation: 6,
  },
  order: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1 },
  name: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 14,
  },
  stamp: { fontFamily: GameFonts.uiSemi, fontSize: 7, letterSpacing: 1.5, marginTop: 2 },
});

export const TERRITORY_NODE_WIDTH = NODE_WIDTH;
