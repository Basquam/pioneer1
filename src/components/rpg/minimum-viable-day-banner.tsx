import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  getMinimumViableDayCopy,
  isMinimumViableDaySecuredToday,
  MINIMUM_VIABLE_DAY_BANNER_COPY,
} from '@/lib/minimum-viable-day';

export function MinimumViableDayBanner() {
  const { activeUniverse, playerProgress, showMinimumViableDayActive, doOneSmallQuest } = useGame();
  const { palette } = activeUniverse;

  if (!showMinimumViableDayActive) return null;

  const copy = getMinimumViableDayCopy(activeUniverse.id);
  const secured = isMinimumViableDaySecuredToday(playerProgress);

  return (
    <View style={[styles.banner, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <Text style={[styles.status, { color: palette.bone }]}>{MINIMUM_VIABLE_DAY_BANNER_COPY}</Text>
      <Text style={[styles.flavor, { color: palette.fog }]}>{copy.title}</Text>
      {secured ? (
        <Text style={[styles.secured, { color: palette.accent }]}>{copy.bannerHint}</Text>
      ) : (
        <Pressable
          onPress={() => {
            void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            doOneSmallQuest();
          }}
          style={[styles.cta, { backgroundColor: palette.primary, borderColor: palette.gold }]}>
          <Text style={[styles.ctaText, { color: palette.bone }]}>DO ONE SMALL QUEST</Text>
        </Pressable>
      )}
    </View>
  );
}

export function MinimumViableDayBriefingActivate() {
  const { activeUniverse, showMinimumViableDayActive, activateMinimumViableDay } = useGame();
  const { palette } = activeUniverse;

  if (showMinimumViableDayActive) return null;

  return (
    <Pressable
      onPress={() => {
        void Haptics.selectionAsync();
        activateMinimumViableDay('briefing');
      }}
      style={[styles.activateRow, { borderColor: palette.panelBorder }]}>
      <Text style={[styles.activateText, { color: palette.fog }]}>
        Low energy today?{' '}
        <Text style={{ color: palette.gold }}>Enable Minimum Viable Day</Text>
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  banner: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  status: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 1,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  secured: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 0.5,
    fontStyle: 'italic',
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
    marginTop: 4,
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  activateRow: {
    borderTopWidth: 1,
    paddingTop: 10,
  },
  activateText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
});
