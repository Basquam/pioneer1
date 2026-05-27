import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { Chapter } from '@/types/narrative';

type ChapterCardProps = {
  chapter: Chapter;
  unlocked: boolean;
  active: boolean;
  index: number;
};

export function ChapterCard({ chapter, unlocked, active, index }: ChapterCardProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 90).springify()}
      style={[
        styles.card,
        {
          backgroundColor: palette.panel,
          borderColor: active ? palette.gold : palette.panelBorder,
          opacity: unlocked ? 1 : 0.45,
        },
      ]}>
      <View style={[styles.index, { backgroundColor: unlocked ? palette.primary : palette.ink }]}>
        <Text style={[styles.indexText, { color: palette.bone }]}>
          {unlocked ? chapter.order : '🔒'}
        </Text>
      </View>
      <View style={styles.body}>
        <Text style={[styles.title, { color: palette.bone }]}>{chapter.title}</Text>
        <Text style={[styles.summary, { color: palette.fog }]}>{chapter.summary}</Text>
        {active && unlocked && (
          <Text style={[styles.dialogue, { color: palette.accent }]}>{chapter.dramaticPurpose}</Text>
        )}
      </View>
    </Animated.View>
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
  body: { flex: 1, gap: 4 },
  title: { fontFamily: GameFonts.ui, fontSize: 16, letterSpacing: 1 },
  summary: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic' },
  dialogue: { fontFamily: GameFonts.displayRegular, fontSize: 14, marginTop: 6, fontStyle: 'italic' },
});
