import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getLocalDateKey } from '@/lib/daily-streak';
import { getDailyShutdownCopy, getDailyShutdownEntry } from '@/lib/daily-shutdown';

type DailyShutdownBannerProps = {
  variant?: 'hq' | 'profile';
};

export function DailyShutdownBanner({ variant = 'hq' }: DailyShutdownBannerProps) {
  const {
    activeUniverse,
    playerProgress,
    showDailyShutdownPrompt,
    openDailyShutdown,
    dismissDailyShutdownPrompt,
  } = useGame();
  const { palette } = activeUniverse;
  const today = getLocalDateKey();
  const copy = getDailyShutdownCopy(activeUniverse.id);
  const completedToday = Boolean(getDailyShutdownEntry(playerProgress, today));

  if (variant === 'hq' && !showDailyShutdownPrompt) return null;

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[
        styles.card,
        {
          backgroundColor: palette.panel,
          borderColor: completedToday ? palette.panelBorder : palette.gold,
        },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>DAILY SHUTDOWN</Text>
        {variant === 'hq' && showDailyShutdownPrompt ? (
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              dismissDailyShutdownPrompt();
            }}
            hitSlop={12}>
            <Text style={[styles.dismiss, { color: palette.fog }]}>Not now</Text>
          </Pressable>
        ) : null}
      </View>

      <Text style={[styles.title, { color: palette.bone }]}>{copy.title}</Text>
      <Text style={[styles.subtitle, { color: palette.fog }]} numberOfLines={2}>
        {completedToday ? copy.completion : copy.intro}
      </Text>

      <Pressable
        onPress={() => {
          void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          openDailyShutdown();
        }}
        style={[styles.button, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
        <Text style={[styles.buttonText, { color: palette.bone }]}>
          {completedToday ? 'REVIEW SHUTDOWN' : 'CLOSE TODAY'}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-1deg' }],
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  dismiss: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 20,
    lineHeight: 26,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  button: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  buttonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.2,
  },
});
