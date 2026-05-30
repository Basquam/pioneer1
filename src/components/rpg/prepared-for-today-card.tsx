import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getLocalDateKey } from '@/lib/daily-streak';
import { getTraitForCategory } from '@/lib/identity-votes';
import {
  getPreparedTodayDisplay,
  getTomorrowSetupForDate,
  hasTomorrowSetupForToday,
} from '@/lib/tomorrow-setup';

export function PreparedForTodayCard() {
  const {
    activeUniverse,
    playerProgress,
    openQuestFocus,
    convertInboxItem,
    openAddQuestFromTraitSuggestion,
  } = useGame();
  const { palette } = activeUniverse;
  const today = getLocalDateKey();

  const entry = useMemo(
    () => getTomorrowSetupForDate(playerProgress, today),
    [playerProgress, today],
  );

  const display = useMemo(
    () => (entry ? getPreparedTodayDisplay(entry, activeUniverse.id, playerProgress) : null),
    [activeUniverse.id, entry, playerProgress],
  );

  if (!hasTomorrowSetupForToday(playerProgress, today) || !entry || !display) {
    return null;
  }

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    if (entry.selectedTomorrowQuestId) {
      const quest = playerProgress.userQuests.find((item) => item.id === entry.selectedTomorrowQuestId);
      if (quest && !quest.isCompleted) {
        openQuestFocus(entry.selectedTomorrowQuestId);
        return;
      }
    }

    if (entry.plannedTomorrowInboxItemId) {
      convertInboxItem(entry.plannedTomorrowInboxItemId);
      return;
    }

    if (entry.plannedTomorrowTaskTitle) {
      openAddQuestFromTraitSuggestion({
        title: entry.plannedTomorrowTaskTitle,
        category: 'health',
        traitKey: getTraitForCategory('health'),
        reason: 'tomorrow-setup',
        enableStarter: true,
      });
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <Text style={[styles.eyebrow, { color: palette.gold }]}>PREPARED FOR TODAY</Text>
      <Text style={[styles.headline, { color: palette.bone }]}>{display.headline}</Text>
      {display.cueLine ? (
        <Text style={[styles.cue, { color: palette.fog }]}>{display.cueLine}</Text>
      ) : null}

      {display.ctaLabel ? (
        <Pressable
          onPress={handlePress}
          style={[styles.cta, { backgroundColor: palette.primary, borderColor: palette.gold }]}>
          <Text style={[styles.ctaText, { color: palette.bone }]}>{display.ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
  },
  headline: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.4,
    lineHeight: 20,
  },
  cue: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
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
});
