import { type Href, router } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { MascotGuideFromContext } from '@/components/rpg/mascot-guide-card';
import { OnboardingScroll } from '@/components/rpg/onboarding-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestorySectionHeader } from '@/components/ui/questory-section-header';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { GameLayout } from '@/constants/layout';
import { QuestoryTypography } from '@/theme/typography';
import { useGame } from '@/hooks/use-game';
import { trackOnboardingStarted } from '@/lib/analytics/questory-analytics';

export function OnboardingWelcomeScreen() {
  const { activeUniverse, recordOnboardingStep } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <OnboardingScroll
        footer={
          <GlowButton
            label="BEGIN"
            hint="SEE HOW IT WORKS"
            onPress={() => {
              trackOnboardingStarted();
              recordOnboardingStep('premise');
              router.push('/onboarding/premise' as Href);
            }}
          />
        }>
        <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
          <QuestoryCard variant="elevated" contentStyle={styles.heroCard}>
            <QuestoryStatusPill label="MISSION SYSTEM ONLINE" tone="accent" />
            <QuestorySectionHeader eyebrow="QUESTORY" title="YOUR LIFE\nBECOMES LEGEND" />
            <View style={styles.heroDivider} />
            <Text style={[QuestoryTypography.body, { color: activeUniverse.palette.fog }]}>
              Turn daily life into a cinematic saga. Bounties drive the chapter. You write the quests.
            </Text>
          </QuestoryCard>

          <MascotGuideFromContext
            contextId="onboarding_start"
            mode="full"
            screenName="/onboarding"
          />
        </Animated.View>
      </OnboardingScroll>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: { gap: GameLayout.screenContentGap, paddingTop: 24, minHeight: 280 },
  heroCard: { gap: 12, paddingVertical: 4 },
  heroDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
});
