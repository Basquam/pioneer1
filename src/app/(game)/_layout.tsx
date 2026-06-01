import { Tabs } from 'expo-router';

import { GameFlowOverlays } from '@/components/rpg/game-flow-overlays';
import { GameTabBar } from '@/components/rpg/game-tab-bar';
import { OnboardingGameGate } from '@/components/rpg/onboarding-game-gate';

export default function GameLayout() {
  return (
    <OnboardingGameGate>
      <Tabs
        tabBar={(props) => <GameTabBar {...(props as Parameters<typeof GameTabBar>[0])} />}
        screenOptions={{ headerShown: false }}>
        <Tabs.Screen name="hq" options={{ title: 'HQ' }} />
        <Tabs.Screen name="quests" options={{ title: 'Quests' }} />
        <Tabs.Screen name="story" options={{ title: 'Story' }} />
        <Tabs.Screen name="map" options={{ title: 'Map' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
      <GameFlowOverlays />
    </OnboardingGameGate>
  );
}
