import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { PanelChrome } from '@/components/rpg/panel-chrome';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { QuestoryMissionPill } from '@/components/ui/questory-mission-pill';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
  getPanelShadow,
  skewTransform,
} from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getChapterSceneImage } from '@/lib/narrative-media';
import { QuestoryTypography } from '@/theme/typography';
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
  const sceneImage = getChapterSceneImage(chapter);

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
        getPanelShadow(palette, visualTheme),
      ]}>
      <PanelChrome palette={palette} theme={visualTheme} />
      {sceneImage ? (
        <NarrativeMediaFrame
          source={sceneImage}
          height={52}
          scrim="full"
          style={styles.sceneStrip}
        />
      ) : null}
      <View style={styles.cardBody}>
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
          <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, flex: 1, minWidth: 120 }]} numberOfLines={2}>
            {chapter.title}
          </Text>
          {isCompleted && (
            <QuestoryMissionPill
              status="completed"
              label={visualTheme.completedStamp}
              universeId={activeUniverse.id}
            />
          )}
          {isActive && (
            <QuestoryMissionPill
              status="active"
              label={visualTheme.activeStamp}
              universeId={activeUniverse.id}
            />
          )}
          {isLocked && (
            <QuestoryMissionPill status="locked" universeId={activeUniverse.id} />
          )}
        </View>
        <Text style={[QuestoryTypography.flavor, { color: palette.fog }]} numberOfLines={isLocked ? 2 : 3}>
          {isLocked ? ui.lockedSectorCardMessage : chapter.summary}
        </Text>
        {isActive && (
          <Text style={[QuestoryTypography.flavor, { color: palette.accent }]}>{chapter.dramaticPurpose}</Text>
        )}
      </View>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    marginBottom: 12,
    overflow: 'hidden',
  },
  sceneStrip: { width: '100%' },
  cardBody: {
    flexDirection: 'row',
    padding: 14,
    gap: 12,
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
});
