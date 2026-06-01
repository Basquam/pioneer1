import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { QUEST_SUITES } from '@/constants/quest-suites';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { QuestSuiteId } from '@/types/narrative';

export function OnboardingSuiteScreen() {
  const { activeUniverse, playerProgress, setActiveSuiteId, clearActiveSuiteId, markOnboardingSuiteComplete } =
    useGame();
  const { palette } = activeUniverse;
  const [selectedSuiteId, setSelectedSuiteId] = useState<QuestSuiteId | null>(
    playerProgress.activeSuiteId ?? null,
  );

  const continueNext = () => {
    markOnboardingSuiteComplete();
    router.push('/onboarding/first-quest' as Href);
  };

  const handleSelect = (suiteId: QuestSuiteId) => {
    void Haptics.selectionAsync();
    setSelectedSuiteId(suiteId);
    setActiveSuiteId(suiteId);
  };

  const handleSkip = () => {
    void Haptics.selectionAsync();
    setSelectedSuiteId(null);
    clearActiveSuiteId();
    continueNext();
  };

  const handleContinue = () => {
    if (selectedSuiteId) {
      setActiveSuiteId(selectedSuiteId);
    }
    continueNext();
  };

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <>
            <GlowButton
              label="CONTINUE"
              hint={selectedSuiteId ? 'ADD YOUR FIRST QUEST' : 'Pick a suite or skip'}
              onPress={handleContinue}
            />
            <Pressable onPress={handleSkip} style={styles.skipButton}>
              <Text style={[styles.skipLabel, { color: palette.fog }]}>Skip for now</Text>
            </Pressable>
          </>
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="YOUR FOCUS" title="WHERE SHOULD YOUR FIRST QUESTS HELP YOU?" />
        </Animated.View>

        <Text style={[styles.subtitle, { color: palette.fog }]}>
          You can change this anytime. This only shapes suggestions.
        </Text>

        <View style={styles.list}>
          {QUEST_SUITES.map((suite, index) => {
            const selected = selectedSuiteId === suite.id;
            return (
              <Animated.View key={suite.id} entering={FadeInDown.duration(450).delay(index * 40)}>
                <Pressable
                  onPress={() => handleSelect(suite.id)}
                  style={[
                    styles.card,
                    {
                      backgroundColor: selected ? palette.primary : palette.panel,
                      borderColor: selected ? palette.gold : palette.panelBorder,
                    },
                  ]}>
                  <Text style={styles.cardIcon}>{suite.icon}</Text>
                  <View style={styles.cardCopy}>
                    <Text style={[styles.cardTitle, { color: palette.bone }]}>{suite.label}</Text>
                    <Text style={[styles.cardDescription, { color: palette.fog }]} numberOfLines={2}>
                      {suite.description}
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </View>
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    lineHeight: 20,
    fontStyle: 'italic',
    marginTop: -4,
  },
  list: { gap: 8 },
  card: {
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    transform: [{ skewX: '-2deg' }],
  },
  cardIcon: { fontSize: 22 },
  cardCopy: { flex: 1, gap: 4 },
  cardTitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 15,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  skipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
  },
});
