import {
    BarlowCondensed_600SemiBold,
    BarlowCondensed_700Bold,
    useFonts as useBarlowFonts,
} from '@expo-google-fonts/barlow-condensed';
import {
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    useFonts as usePlayfairFonts,
} from '@expo-google-fonts/playfair-display';
import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { NarrativeRecoveryGate } from '@/components/rpg/narrative-recovery-gate';
import { AppErrorBoundary } from '@/components/system/app-error-boundary';
import { AmbientAudioProvider } from '@/context/ambient-audio-context';
import { GameProvider } from '@/context/game-context';
import { initAnalytics } from '@/lib/analytics/analytics-service';
import { initCrashReporting } from '@/lib/crash/crash-service';
import { configureLocalNotifications } from '@/lib/local-notifications';
import { useRouteAnalytics } from '@/hooks/useRouteAnalytics';

SplashScreen.preventAutoHideAsync();
SplashScreen.setOptions({
  duration: 500,
  fade: true,
});

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [barlowLoaded] = useBarlowFonts({
    BarlowCondensed_700Bold,
    BarlowCondensed_600SemiBold,
  });
  const [playfairLoaded] = usePlayfairFonts({
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular,
  });

  const fontsLoaded = barlowLoaded && playfairLoaded;

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    void configureLocalNotifications();
    void initAnalytics();
    void initCrashReporting();
  }, []);

  useRouteAnalytics();

  if (!fontsLoaded) {
    return null;
  }

  return (
    <AppErrorBoundary>
      <GameProvider>
        <AmbientAudioProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <NarrativeRecoveryGate>
              <Stack
                screenOptions={{
                  headerShown: false,
                  animation: 'fade',
                  contentStyle: { backgroundColor: '#050308' },
                }}>
                <Stack.Screen name="index" />
                <Stack.Screen name="onboarding" options={{ animation: 'slide_from_right' }} />
                <Stack.Screen name="(game)" options={{ animation: 'fade_from_bottom' }} />
              </Stack>
            </NarrativeRecoveryGate>
          </ThemeProvider>
        </AmbientAudioProvider>
      </GameProvider>
    </AppErrorBoundary>
  );
}
