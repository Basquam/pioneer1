import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestorySectionHeader } from '@/components/ui/questory-section-header';
import { QUEST_SUITES } from '@/constants/quest-suites';
import { QuestoryTypography } from '@/theme/typography';
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
              <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>Skip for now</Text>
            </Pressable>
          </>
        }>
        <Animated.View entering={FadeInDown.duration(500)}>
          <QuestorySectionHeader eyebrow="YOUR FOCUS" title="OPTIONAL: PICK A QUEST SUITE" />
        </Animated.View>

        <Text style={[QuestoryTypography.flavor, { color: palette.fog, marginTop: -4 }]}>
          Shapes suggestions only. Skip if you are not sure yet.
        </Text>

        <View style={styles.list}>
          {QUEST_SUITES.map((suite, index) => {
            const selected = selectedSuiteId === suite.id;
            return (
              <Animated.View key={suite.id} entering={FadeInDown.duration(450).delay(index * 40)}>
                <Pressable onPress={() => handleSelect(suite.id)}>
                  <QuestoryCard
                    variant={selected ? 'elevated' : 'default'}
                    contentStyle={styles.card}>
                    <Text style={styles.cardIcon}>{suite.icon}</Text>
                    <View style={styles.cardCopy}>
                      <Text style={[QuestoryTypography.body, { color: palette.bone }]}>{suite.label}</Text>
                      <Text style={[QuestoryTypography.bodySmall, { color: palette.fog }]} numberOfLines={2}>
                        {suite.description}
                      </Text>
                    </View>
                  </QuestoryCard>
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
  list: { gap: 8 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  cardIcon: { fontSize: 22 },
  cardCopy: { flex: 1, gap: 4 },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 10,
  },
});
