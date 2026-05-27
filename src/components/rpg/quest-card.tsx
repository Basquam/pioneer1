import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import type { BoardQuest } from '@/types/narrative';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuestCardProps = {
  quest: BoardQuest;
  index: number;
};

export function QuestCard({ quest, index }: QuestCardProps) {
  const { activeUniverse, completeQuest } = useGame();
  const { palette } = activeUniverse;
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (quest.completed) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[styles.wrapper, { borderColor: palette.gold, backgroundColor: `${palette.primary}22` }]}>
        <Text style={[styles.stamp, { color: palette.gold }]}>CLEARED</Text>
        <Text style={[styles.doneTitle, { color: palette.fog }]}>{quest.narrativeTitle}</Text>
        {quest.source === 'user' && (
          <Text style={[styles.doneReal, { color: palette.fog }]}>{quest.originalTitle}</Text>
        )}
      </Animated.View>
    );
  }

  const categoryMeta = getTaskCategoryMeta(quest.category);

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    scale.value = withSpring(0.97, { damping: 12 }, () => {
      scale.value = withSpring(1);
    });
    completeQuest(quest.id);
  };

  return (
    <AnimatedPressable
      entering={FadeInDown.delay(index * 100).springify()}
      onPress={handlePress}
      style={[
        styles.wrapper,
        cardStyle,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: palette.primary }]}>
              <Text style={[styles.badgeText, { color: palette.bone }]}>
                {categoryMeta.icon} {categoryMeta.label.toUpperCase()}
              </Text>
            </View>
            {quest.source === 'user' && (
              <View style={[styles.badge, { backgroundColor: palette.accent }]}>
                <Text style={[styles.badgeText, { color: palette.bone }]}>YOUR QUEST</Text>
              </View>
            )}
          </View>
          <Text style={[styles.xp, { color: palette.gold }]}>+{quest.xpReward} XP</Text>
        </View>
        <Text style={[styles.title, { color: palette.bone }]}>{quest.narrativeTitle}</Text>
        <Text style={[styles.sub, { color: palette.fog }]}>{quest.narrativeDescription}</Text>
        <Text style={[styles.categoryId, { color: palette.fog }]}>{quest.category}</Text>
        <View style={styles.realRow}>
          <Text style={[styles.realLabel, { color: palette.fog }]}>
            {quest.source === 'user' ? 'REAL TASK' : 'OBJECTIVE'}
          </Text>
          <Text style={[styles.realTask, { color: palette.gold }]}>{quest.originalTitle}</Text>
        </View>
        <Text style={[styles.tap, { color: palette.accent }]}>TAP TO COMPLETE ›</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    padding: 16,
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  inner: { paddingLeft: 8, gap: 8, transform: [{ skewX: '2deg' }] },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badges: { flexDirection: 'row', gap: 6, flexShrink: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, transform: [{ skewX: '-8deg' }] },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  xp: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2 },
  title: { fontFamily: GameFonts.display, fontSize: 18, lineHeight: 24 },
  sub: { fontFamily: GameFonts.displayRegular, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  categoryId: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.5,
    textTransform: 'lowercase',
    opacity: 0.55,
  },
  realRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1, flex: 1 },
  tap: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, textAlign: 'right' },
  stamp: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  doneTitle: { fontFamily: GameFonts.displayRegular, fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  doneReal: { fontFamily: GameFonts.uiSemi, fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
});
