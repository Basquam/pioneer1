import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import type { ReactNode } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { CinematicBackground } from '@/components/rpg/cinematic-background';
import { GameLayout } from '@/constants/layout';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type QuestoryScreenProps = {
  children: ReactNode;
  edges?: Edge[];
  padded?: boolean;
  /** Show top command-rail atmosphere strip */
  atmosphere?: boolean;
};

export function QuestoryScreen({
  children,
  edges = ['top'],
  padded = true,
  atmosphere = true,
}: QuestoryScreenProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);

  return (
    <View style={[styles.root, { backgroundColor: QuestoryTheme.colors.background.deep }]}>
      <StatusBar style="light" />
      <CinematicBackground />

      {/* Universe radial accent — top-right command glow */}
      <View pointerEvents="none" style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={[`${skin.glowColor}`, 'transparent']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0.2, y: 0.65 }}
          style={styles.topGlow}
        />
        <LinearGradient
          colors={[`${skin.accentSecondary}14`, 'transparent']}
          start={{ x: 0, y: 1 }}
          end={{ x: 0.7, y: 0.3 }}
          style={styles.bottomGlow}
        />
        <LinearGradient
          colors={['transparent', `${palette.void}cc`, palette.void]}
          locations={[0.5, 0.92, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {atmosphere ? (
        <View pointerEvents="none" style={styles.atmosphereLayer}>
          <LinearGradient
            colors={[`${skin.accentPrimary}55`, `${skin.accentPrimary}22`, 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.commandRail}
          />
          <View style={[styles.commandRailLine, { backgroundColor: skin.accentPrimary }]} />
        </View>
      ) : null}

      {visualTheme.backgroundVariant === 'chrome' && (
        <View
          pointerEvents="none"
          style={[styles.chromeFrame, { borderColor: `${skin.accentPrimary}44` }]}
        />
      )}
      {visualTheme.backgroundVariant === 'noir' && (
        <>
          <View
            pointerEvents="none"
            style={[
              styles.noirFrame,
              {
                borderColor: `${skin.accentPrimary}55`,
                backgroundColor: `${palette.panel}18`,
              },
            ]}
          />
          <View
            pointerEvents="none"
            style={[styles.noirInnerFrame, { borderColor: `${skin.accentPrimary}28` }]}
          />
        </>
      )}

      <SafeAreaView style={[styles.safe, padded && styles.padded]} edges={edges}>
        {children}
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topGlow: {
    position: 'absolute',
    top: -40,
    right: -SCREEN_WIDTH * 0.15,
    width: SCREEN_WIDTH * 0.85,
    height: SCREEN_WIDTH * 0.85,
    borderRadius: SCREEN_WIDTH * 0.5,
    opacity: 0.55,
  },
  bottomGlow: {
    position: 'absolute',
    bottom: -60,
    left: -40,
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.5,
    borderRadius: SCREEN_WIDTH * 0.4,
    opacity: 0.45,
  },
  atmosphereLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    zIndex: 2,
  },
  commandRail: {
    height: 3,
    width: '100%',
  },
  commandRailLine: {
    position: 'absolute',
    top: 0,
    left: GameLayout.screenPaddingHorizontal,
    width: 48,
    height: 3,
    opacity: 0.9,
  },
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
