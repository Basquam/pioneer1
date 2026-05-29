import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  DAILY_AWARENESS_BLOCKER_OPTIONS,
  getDailyAwarenessRecommendation,
  getDailyAwarenessTagline,
} from '@/lib/daily-awareness';
import type { DailyAwarenessBlocker } from '@/types/narrative';

type AwarenessPhase = 'pick' | 'result' | 'hidden';

export function DailyAwarenessCheck() {
  const { activeUniverse, showDailyAwarenessCheck, submitDailyAwareness, dismissDailyAwarenessCheck } =
    useGame();
  const { palette } = activeUniverse;
  const [phase, setPhase] = useState<AwarenessPhase>(() => (showDailyAwarenessCheck ? 'pick' : 'hidden'));
  const [selectedBlocker, setSelectedBlocker] = useState<DailyAwarenessBlocker | null>(null);

  if (phase === 'hidden') return null;
  if (phase === 'pick' && !showDailyAwarenessCheck) return null;

  const tagline = getDailyAwarenessTagline(activeUniverse.id);
  const recommendation = selectedBlocker ? getDailyAwarenessRecommendation(selectedBlocker) : null;

  const handleDismiss = () => {
    void Haptics.selectionAsync();
    if (phase === 'pick') {
      dismissDailyAwarenessCheck();
    }
    setPhase('hidden');
  };

  const handleSelect = (blocker: DailyAwarenessBlocker) => {
    void Haptics.selectionAsync();
    setSelectedBlocker(blocker);
    submitDailyAwareness(blocker);
    setPhase('result');
  };

  return (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={[styles.card, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>DAILY AWARENESS</Text>
        <Pressable onPress={handleDismiss} hitSlop={12}>
          <Text style={[styles.dismiss, { color: palette.fog }]}>Not now</Text>
        </Pressable>
      </View>

      <Text style={[styles.tagline, { color: palette.fog }]}>{tagline}</Text>

      {!recommendation || phase === 'pick' ? (
        <>
          <Text style={[styles.question, { color: palette.bone }]}>
            What might slow you down today?
          </Text>
          <View style={styles.options}>
            {DAILY_AWARENESS_BLOCKER_OPTIONS.map((option) => (
              <Pressable
                key={option.blocker}
                onPress={() => handleSelect(option.blocker)}
                style={[styles.optionChip, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
                <Text style={[styles.optionText, { color: palette.bone }]}>{option.label}</Text>
              </Pressable>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.result}>
          <Text style={[styles.recommendation, { color: palette.bone }]}>{recommendation}</Text>
          <Pressable onPress={handleDismiss} style={[styles.gotIt, { borderColor: palette.gold }]}>
            <Text style={[styles.gotItText, { color: palette.bone }]}>Got it</Text>
          </Pressable>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  dismiss: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  tagline: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 18,
    fontStyle: 'italic',
  },
  question: {
    fontFamily: GameFonts.ui,
    fontSize: 15,
    letterSpacing: 0.3,
    lineHeight: 22,
  },
  options: { gap: 8 },
  optionChip: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    transform: [{ skewX: '-2deg' }],
  },
  optionText: { fontFamily: GameFonts.uiSemi, fontSize: 12, letterSpacing: 0.5 },
  result: { gap: 12 },
  recommendation: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  gotIt: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
    transform: [{ skewX: '-4deg' }],
  },
  gotItText: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
});
