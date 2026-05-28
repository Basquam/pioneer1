import { StatusBar } from 'expo-status-bar';
import { type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CinematicBackground } from '@/components/rpg/cinematic-background';
import { GameLayout } from '@/constants/layout';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';

type ScreenShellProps = {
  children: ReactNode;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  padded?: boolean;
};

export function ScreenShell({ children, edges = ['top'], padded = true }: ScreenShellProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;

  return (
    <View style={[styles.root, { backgroundColor: palette.void }]}>
      <StatusBar style="light" />
      <CinematicBackground />
      {visualTheme.backgroundVariant === 'chrome' && (
        <View
          pointerEvents="none"
          style={[styles.chromeFrame, { borderColor: `${palette.accent}33` }]}
        />
      )}
      {visualTheme.backgroundVariant === 'noir' && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.noirFrame,
              {
                borderColor: `${palette.primary}44`,
                backgroundColor: `${palette.panel}22`,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[
              styles.noirInnerFrame,
              { borderColor: `${palette.gold}22` },
            ]}
          />
        </>
      )}
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
  chromeFrame: {
    position: 'absolute',
    top: 6,
    left: 6,
    right: 6,
    bottom: 6,
    borderWidth: 1,
  },
  noirFrame: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    bottom: 8,
    borderWidth: 1,
    borderRadius: 2,
  },
  noirInnerFrame: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    bottom: 12,
    borderWidth: 1,
    borderRadius: 1,
  },
  safe: { flex: 1 },
  padded: { paddingHorizontal: GameLayout.screenPaddingHorizontal },
});
