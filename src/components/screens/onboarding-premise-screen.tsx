import { type Href, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestorySectionHeader } from '@/components/ui/questory-section-header';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { ONBOARDING_PREMISE_BEATS } from '@/data/narrative/onboarding-premise';
import { GameLayout } from '@/constants/layout';
import { QuestoryTypography } from '@/theme/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingPremiseScreen() {
  const { activeUniverse, recordOnboardingStep } = useGame();
  const { palette } = activeUniverse;
  const [beatIndex, setBeatIndex] = useState(0);

  const beat = ONBOARDING_PREMISE_BEATS[beatIndex];
  const isLast = beatIndex >= ONBOARDING_PREMISE_BEATS.length - 1;

  const advance = useCallback(() => {
    if (isLast) return;
    setBeatIndex((index) => index + 1);
  }, [isLast]);

  if (!beat) return null;

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          isLast ? (
            <GlowButton
              label="CHOOSE YOUR UNIVERSE"
              hint="BEGIN YOUR SAGA"
              onPress={() => {
                recordOnboardingStep('theme');
                router.push('/onboarding/theme' as Href);
              }}
            />
          ) : (
            <Pressable onPress={advance} style={styles.tapZone}>
              <Animated.Text entering={FadeIn} style={[styles.tapHint, { color: palette.gold }]}>
                TAP TO CONTINUE ›
              </Animated.Text>
            </Pressable>
          )
        }>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <QuestorySectionHeader eyebrow="THE PREMISE" title="HOW QUESTORY\nWORKS" />
        </Animated.View>

        <View style={styles.beatArea}>
          <Animated.View
            key={beat.badge}
            entering={FadeIn.duration(450)}
            exiting={FadeOut.duration(200)}>
            <QuestoryCard variant="elevated" contentStyle={styles.beatContent}>
              <QuestoryStatusPill label={`BEAT ${beat.badge}`} tone="accent" />
              <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 24, lineHeight: 30 }]} numberOfLines={3}>
                {beat.title}
              </Text>
              <Text style={[QuestoryTypography.flavor, { color: palette.fog, fontSize: 17, lineHeight: 26 }]}>
                {beat.line}
              </Text>
            </QuestoryCard>
          </Animated.View>

          <View style={styles.dots}>
            {ONBOARDING_PREMISE_BEATS.map((item, index) => (
              <View
                key={item.badge}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index <= beatIndex ? palette.gold : palette.panelBorder,
                    width: index === beatIndex ? 22 : 8,
                  },
                ]}
              />
            ))}
          </View>
        </View>

      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 24 },
  beatArea: { justifyContent: 'center', gap: GameLayout.screenContentGap, minHeight: 280 },
  beatContent: { gap: 10 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 1 },
  tapZone: { alignItems: 'flex-end', paddingBottom: 4 },
  tapHint: { ...QuestoryTypography.caption, letterSpacing: 2 },
});
