import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CinematicBackground } from '@/components/rpg/cinematic-background';
import { useGame } from '@/hooks/use-game';

type ScreenShellProps = {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
};

export function ScreenShell({ children, edges = ['top'], padded = true }: ScreenShellProps) {
  const { theme } = useGame();

  return (
    <View style={[styles.root, { backgroundColor: theme.colors.void }]}>
      <StatusBar style="light" />
      <CinematicBackground />
      <SafeAreaView
        style={[styles.safe, padded && styles.padded]}
        edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  safe: { flex: 1 },
  padded: { paddingHorizontal: 20 },
});
