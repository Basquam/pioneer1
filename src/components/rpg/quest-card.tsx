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
import type { QuestTemplateState } from '@/context/game-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const CATEGORY_LABEL: Record<QuestTemplateState['category'], string> = {
  cleaning: 'BOUNTY',
  fitness: 'TRAINING',
  study: 'INTEL',
  work: 'CONTRACT',
  health: 'SURVIVAL',
  social: 'ALLIANCE',
  creative: 'LEGEND',
  errand: 'SUPPLY',
};

type QuestCardProps = {
  quest: QuestTemplateState;
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
        <Text style={[styles.doneTitle, { color: palette.fog }]}>{quest.title}</Text>
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
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <View style={[styles.accent, { backgroundColor: palette.primary }]} />
      <View style={styles.inner}>
        <View style={styles.topRow}>
          <View style={[styles.badge, { backgroundColor: palette.primary }]}>
            <Text style={[styles.badgeText, { color: palette.bone }]}>{CATEGORY_LABEL[quest.category]}</Text>
          </View>
          <Text style={[styles.xp, { color: palette.gold }]}>+{quest.xpReward} XP</Text>
        </View>
        <Text style={[styles.title, { color: palette.bone }]}>{quest.title}</Text>
        <Text style={[styles.sub, { color: palette.fog }]}>{quest.dramaticHook}</Text>
        <View style={styles.realRow}>
          <Text style={[styles.realLabel, { color: palette.fog }]}>OBJECTIVE</Text>
          <Text style={[styles.realTask, { color: palette.gold }]}>{quest.objective}</Text>
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
