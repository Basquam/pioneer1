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

import { skewTransform } from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { playButtonTap } from '@/lib/audio/sound-service';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type GlowButtonProps = {
  label: string;
  hint?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function GlowButton({ label, hint, onPress, disabled = false }: GlowButtonProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const glow = useSharedValue(0);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (disabled) return;
    glow.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      true,
    );
  }, [disabled, glow]);

  const glowStyle = useAnimatedStyle(() => ({
    opacity: disabled ? 0.15 : 0.35 + glow.value * 0.45,
    transform: [{ scale: 1.02 + glow.value * 0.06 }],
  }));

  const btnStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    if (disabled) return;
    playButtonTap();
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const accentBorder = visualTheme.panelUsesHolographic ? skin.accentPrimary : skin.accentPrimary;
  const fillColor = disabled
    ? `${palette.panel}cc`
    : visualTheme.panelUsesHolographic
      ? `${palette.primary}cc`
      : palette.primary;

  return (
    <View style={styles.wrap}>
      <Animated.View
        style={[
          styles.glowOrb,
          glowStyle,
          { backgroundColor: disabled ? palette.panelBorder : skin.glowColor },
        ]}
      />
      <AnimatedPressable
        onPress={handlePress}
        disabled={disabled}
        onPressIn={() => {
          if (!disabled) scale.value = withTiming(0.97, { duration: 80 });
        }}
        onPressOut={() => {
          scale.value = withTiming(1, { duration: 120 });
        }}
        style={[
          styles.buttonOuter,
          btnStyle,
          {
            borderColor: disabled ? palette.panelBorder : accentBorder,
            opacity: disabled ? 0.55 : 1,
            transform: skewTransform(visualTheme.buttonSkew),
          },
          !disabled && skin.panelShadow,
        ]}>
        <View style={[styles.buttonInner, { backgroundColor: fillColor, borderColor: `${accentBorder}66` }]}>
          <View style={[styles.topSheen, { backgroundColor: `${skin.accentPrimary}33` }]} />
          <Text
            style={[
              QuestoryTypography.sectionTitle,
              { color: disabled ? palette.fog : palette.bone, letterSpacing: 3, textAlign: 'center' },
            ]}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}>
            {label}
          </Text>
          {hint ? (
            <Text
              style={[
                QuestoryTypography.caption,
                {
                  color: disabled ? palette.fog : skin.accentPrimary,
                  letterSpacing: 1.5,
                  textAlign: 'center',
                },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.8}>
              {hint}
            </Text>
          ) : null}
        </View>
      </AnimatedPressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', marginVertical: 8 },
  glowOrb: {
    position: 'absolute',
    width: '100%',
    height: 64,
    borderRadius: QuestoryTheme.radius.sm,
  },
  buttonOuter: {
    width: '100%',
    borderWidth: 1,
  },
  buttonInner: {
    paddingVertical: 16,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderTopWidth: 1,
    gap: 4,
    overflow: 'hidden',
  },
  topSheen: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },
});
