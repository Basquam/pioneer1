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
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';

import { GameProvider } from '@/context/game-context';
import { AmbientAudioProvider } from '@/context/ambient-audio-context';

SplashScreen.preventAutoHideAsync();

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

  if (!fontsLoaded) {
    return null;
  }

  return (
    <GameProvider>
      <AmbientAudioProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
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
        </ThemeProvider>
      </AmbientAudioProvider>
    </GameProvider>
  );
}
