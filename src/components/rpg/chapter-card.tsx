import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import {
  getHolographicShadow,
  getPanelAccentColor,
  getPanelBorderColor,
  skewTransform,
} from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { HolographicPanelChrome } from '@/components/rpg/visual-theme-overlay';
import type { ChapterStatus } from '@/lib/chapter-progress';
import type { Chapter } from '@/types/narrative';

type ChapterCardProps = {
  chapter: Chapter;
  status: ChapterStatus;
  index: number;
  onPress: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ChapterCard({ chapter, status, index, onPress }: ChapterCardProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');
  const isActive = status === 'active';
  const isCompleted = status === 'completed';
  const isLocked = status === 'locked';

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      void Haptics.selectionAsync();
    }
    onPress();
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 90).springify()}
      onPress={handlePress}
      style={[
        styles.card,
        {
          backgroundColor: isActive ? `${accentColor}22` : palette.panel,
          borderColor: isActive ? goldAccent : isCompleted ? palette.accent : panelBorder,
          borderWidth: visualTheme.panelBorderWidth,
          opacity: isLocked ? 0.45 : 1,
          transform: skewTransform(visualTheme.cardSkew),
        },
        getHolographicShadow(palette, visualTheme),
      ]}>
      {visualTheme.panelTopHighlight && (
        <HolographicPanelChrome accentColor={palette.accent} secondaryColor={palette.primary} />
      )}
      <View
        style={[
          styles.index,
          {
            backgroundColor: isLocked ? palette.ink : isCompleted ? palette.accent : accentColor,
            borderColor: isActive ? goldAccent : 'transparent',
            borderWidth: isActive ? 1 : 0,
            borderRadius: visualTheme.nodeBorderRadius,
          },
        ]}>
        <Text style={[styles.indexText, { color: palette.bone }]}>
          {isLocked ? '🔒' : chapter.order}
        </Text>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
            {chapter.title}
          </Text>
          {isCompleted && (
            <View style={[styles.stamp, { borderColor: goldAccent }]}>
              <Text style={[styles.stampText, { color: goldAccent }]}>{visualTheme.completedStamp}</Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.stamp, { borderColor: palette.accent, backgroundColor: `${palette.accent}22` }]}>
              <Text style={[styles.stampText, { color: palette.accent }]}>{visualTheme.activeStamp}</Text>
            </View>
          )}
        </View>
        <Text style={[styles.summary, { color: palette.fog }]} numberOfLines={isLocked ? 2 : 3}>
          {isLocked ? ui.lockedSectorCardMessage : chapter.summary}
        </Text>
        {isActive && (
          <Text style={[styles.purpose, { color: palette.accent }]}>{chapter.dramaticPurpose}</Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    overflow: 'hidden',
  },
  index: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  indexText: { fontFamily: GameFonts.ui, fontSize: 16 },
  body: { flex: 1, gap: 6, minWidth: 0 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  title: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 1, flex: 1, minWidth: 120 },
  stamp: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-8deg' }],
  },
  stampText: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  summary: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  purpose: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
});
