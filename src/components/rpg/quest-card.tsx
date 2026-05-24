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
import type { QuestState } from '@/types/quest';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORY_LABEL: Record<QuestState['category'], string> = {
  chore: 'BOUNTY',
  study: 'INTEL',
  work: 'CONTRACT',
  exercise: 'TRAINING',
};

type QuestCardProps = {
  quest: QuestState;
  index: number;
};

export function QuestCard({ quest, index }: QuestCardProps) {
  const { theme, completeQuest } = useGame();
  const { colors } = theme;
  const scale = useSharedValue(1);

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (quest.completed) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[styles.wrapper, { borderColor: colors.gold, backgroundColor: `${colors.primary}22` }]}>
        <Text style={[styles.stamp, { color: colors.gold }]}>CLEARED</Text>
        <Text style={[styles.doneTitle, { color: colors.fog }]}>{quest.questTitle}</Text>
      </Animated.View>
    );
  }

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
        { backgroundColor: colors.panel, borderColor: colors.panelBorder },
      ]}>
      <View style={[styles.accent, { backgroundColor: colors.primary }]} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={[styles.badgeText, { color: colors.bone }]}>{CATEGORY_LABEL[quest.category]}</Text>
          </View>
          <Text style={[styles.xp, { color: colors.gold }]}>+{quest.xpReward} XP</Text>
        </View>
        <Text style={[styles.title, { color: colors.bone }]}>{quest.questTitle}</Text>
        <Text style={[styles.sub, { color: colors.fog }]}>{quest.questSubtitle}</Text>
        <View style={styles.realRow}>
          <Text style={[styles.realLabel, { color: colors.fog }]}>REAL TASK</Text>
          <Text style={[styles.realTask, { color: colors.gold }]}>{quest.realTask}</Text>
        </View>
        <Text style={[styles.tap, { color: colors.accent }]}>TAP TO COMPLETE ›</Text>
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
  badge: { paddingHorizontal: 8, paddingVertical: 3, transform: [{ skewX: '-8deg' }] },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  xp: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2 },
  title: { fontFamily: GameFonts.display, fontSize: 18, lineHeight: 24 },
  sub: { fontFamily: GameFonts.displayRegular, fontSize: 13, lineHeight: 19, fontStyle: 'italic' },
  realRow: { flexDirection: 'row', gap: 8, alignItems: 'center', paddingTop: 6, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.08)' },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1 },
  tap: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, textAlign: 'right' },
  stamp: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  doneTitle: { fontFamily: GameFonts.displayRegular, fontSize: 14, fontStyle: 'italic', marginTop: 4 },
});
