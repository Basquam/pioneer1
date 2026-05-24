import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MapNode } from '@/components/rpg/map-node';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { THEME_LIST } from '@/data/themes';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { ThemeId } from '@/types/theme';

export function MapScreen() {
  const { activeThemeId, switchTheme, themeProgressMap } = useGame();

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader eyebrow="MULTIVERSE" title="WORLD MAP" />
          <Text style={styles.hint}>
            Tap a region to deploy. Each world has its own villain and bounties.
          </Text>
          {THEME_LIST.map((t) => {
            const progress = themeProgressMap[t.id as ThemeId];
            return (
              <MapNode
                key={t.id}
                themeId={t.id}
                active={activeThemeId === t.id}
                influence={progress?.villainInfluence ?? 100}
                onPress={() => switchTheme(t.id)}
              />
            );
          })}
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 10, paddingTop: 8 },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    color: '#a8a29e',
    fontStyle: 'italic',
    marginBottom: 8,
  },
});
