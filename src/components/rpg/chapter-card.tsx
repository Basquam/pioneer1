import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
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
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
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
          backgroundColor: isActive ? `${palette.primary}22` : palette.panel,
          borderColor: isActive ? palette.gold : isCompleted ? palette.accent : palette.panelBorder,
          opacity: isLocked ? 0.45 : 1,
        },
      ]}>
      <View
        style={[
          styles.index,
          {
            backgroundColor: isLocked ? palette.ink : isCompleted ? palette.accent : palette.primary,
            borderColor: isActive ? palette.gold : 'transparent',
            borderWidth: isActive ? 1 : 0,
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
            <View style={[styles.stamp, { borderColor: palette.gold }]}>
              <Text style={[styles.stampText, { color: palette.gold }]}>CLEARED</Text>
            </View>
          )}
          {isActive && (
            <View style={[styles.stamp, { borderColor: palette.accent, backgroundColor: `${palette.accent}22` }]}>
              <Text style={[styles.stampText, { color: palette.accent }]}>ACTIVE</Text>
            </View>
          )}
        </View>
        <Text style={[styles.summary, { color: palette.fog }]} numberOfLines={isLocked ? 2 : 3}>
          {isLocked ? 'Complete previous chapters to unlock this trail.' : chapter.summary}
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
    transform: [{ skewX: '-1deg' }],
  },
  index: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '-6deg' }],
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
