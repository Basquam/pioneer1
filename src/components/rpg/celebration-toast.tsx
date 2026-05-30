import { useEffect } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInUp, FadeOut } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getCelebrationEyebrow, type RewardEvent } from '@/lib/reward-event-queue';

type Props = {
  event: RewardEvent;
  onDismiss: () => void;
};

export function CelebrationToast({ event, onDismiss }: Props) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  useEffect(() => {
    const timer = setTimeout(onDismiss, 2800);
    return () => clearTimeout(timer);
  }, [event.id, onDismiss]);

  return (
    <Animated.View
      entering={FadeInUp.duration(220)}
      exiting={FadeOut.duration(180)}
      style={[styles.wrap, { backgroundColor: palette.panel, borderColor: palette.gold }]}
      pointerEvents="box-none">
      <Pressable onPress={onDismiss} style={styles.pressable}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>{getCelebrationEyebrow(event.type)}</Text>
        <Text style={[styles.title, { color: palette.bone }]}>{event.title}</Text>
        <Text style={[styles.meaning, { color: palette.fog }]}>{event.message}</Text>
        {event.flavorLine ? (
          <Text style={[styles.flavor, { color: palette.accent }]}>{event.flavorLine}</Text>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: '14%',
    left: 18,
    right: 18,
    zIndex: 220,
    borderWidth: 1,
    transform: [{ skewX: '-2deg' }],
  },
  pressable: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 8,
    letterSpacing: 1.6,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 15,
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  meaning: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  flavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
    fontStyle: 'italic',
    marginTop: 2,
  },
});
