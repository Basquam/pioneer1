import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { PanelChrome } from '@/components/rpg/panel-chrome';
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
import { formatPrepStepLine } from '@/lib/quest-prep';
import { formatStarterMoveLine } from '@/lib/two-minute-starter';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import type { BoardQuest } from '@/types/narrative';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type QuestCardProps = {
  quest: BoardQuest;
  index: number;
};

export function QuestCard({ quest, index }: QuestCardProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, completeQuest } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const scale = useSharedValue(1);
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  if (quest.completed) {
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 100).springify()}
        style={[
          styles.wrapper,
          {
            borderColor: goldAccent,
            backgroundColor: `${accentColor}22`,
            transform: skewTransform(visualTheme.cardSkew),
          },
          getPanelShadow(palette, visualTheme),
        ]}>
        <Text style={[styles.stamp, { color: goldAccent }]}>CLEARED</Text>
        {quest.source === 'user' && quest.isDailyFocus && (
          <Text style={[styles.focusStamp, { color: goldAccent }]}>{ui.focusQuestLabel}</Text>
        )}
        <Text style={[styles.doneTitle, { color: palette.fog }]}>{quest.narrativeTitle}</Text>
        {quest.source === 'user' && (
          <Text style={[styles.doneReal, { color: palette.fog }]}>{quest.originalTitle}</Text>
        )}
      </Animated.View>
    );
  }

  const categoryMeta = getTaskCategoryMeta(quest.category);

  const handlePress = () => {
    scale.value = withSpring(0.94, { damping: 10 }, () => {
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
        {
          backgroundColor: palette.panel,
          borderColor: panelBorder,
          borderWidth: visualTheme.panelBorderWidth,
          transform: skewTransform(visualTheme.cardSkew),
        },
        getPanelShadow(palette, visualTheme),
      ]}>
      <PanelChrome palette={palette} theme={visualTheme} />
      <View style={[styles.accent, { backgroundColor: accentColor, width: visualTheme.accentLineWidth }]} />
      <View style={[styles.inner, visualTheme.cardSkew !== 0 && styles.innerUnskew]}>
        <View style={styles.topRow}>
          <View style={styles.badges}>
            <View style={[styles.badge, { backgroundColor: palette.primary }]}>
              <Text style={[styles.badgeText, { color: palette.bone }]} numberOfLines={1}>
                {categoryMeta.icon} {categoryMeta.label.toUpperCase()}
              </Text>
            </View>
            {quest.source === 'user' && quest.isDailyFocus && (
              <View style={[styles.badge, { backgroundColor: goldAccent }]}>
                <Text style={[styles.badgeText, { color: palette.void }]} numberOfLines={1}>
                  {ui.focusQuestLabel}
                </Text>
              </View>
            )}
            {quest.source === 'user' && (
              <View style={[styles.badge, { backgroundColor: palette.accent }]}>
                <Text style={[styles.badgeText, { color: palette.bone }]} numberOfLines={1}>
                  {ui.yourQuestLabel}
                </Text>
              </View>
            )}
          </View>
          <Text style={[styles.xp, { color: goldAccent }]} numberOfLines={1}>
            +{quest.xpReward} XP
          </Text>
        </View>
        <Text style={[styles.title, { color: palette.bone }]} numberOfLines={3}>
          {quest.narrativeTitle}
        </Text>
        <Text style={[styles.sub, { color: palette.fog }]} numberOfLines={4}>
          {quest.narrativeDescription}
        </Text>
        <Text style={[styles.categoryId, { color: palette.fog }]} numberOfLines={1}>
          {quest.category}
        </Text>
        <View style={styles.realRow}>
          <Text style={[styles.realLabel, { color: palette.fog }]}>
            {quest.source === 'user' ? ui.realTaskLabel : ui.templateQuestLabel}
          </Text>
          <Text style={[styles.realTask, { color: goldAccent }]} numberOfLines={2}>
            {quest.originalTitle}
          </Text>
        </View>
        {quest.starterTaskTitle && (
          <Text style={[styles.starterMove, { color: palette.fog }]} numberOfLines={2}>
            {formatStarterMoveLine(quest.starterTaskTitle, activeUniverse.id)}
          </Text>
        )}
        {quest.prepStepTitle && (
          <Text style={[styles.prepStep, { color: palette.fog }]} numberOfLines={2}>
            {formatPrepStepLine(quest.prepStepTitle)}
          </Text>
        )}
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
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  inner: { paddingLeft: 8, gap: 8, minWidth: 0 },
  innerUnskew: { transform: [{ skewX: '2deg' }] },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  badges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, flex: 1, minWidth: 0 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, transform: [{ skewX: '-8deg' }], maxWidth: '100%' },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  xp: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2, flexShrink: 0 },
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
    flexWrap: 'wrap',
    gap: 8,
    alignItems: 'flex-start',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, flexShrink: 0 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1, flex: 1, minWidth: 120, lineHeight: 18 },
  starterMove: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  prepStep: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  tap: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2, textAlign: 'right' },
  stamp: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  focusStamp: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, marginTop: 2 },
  doneTitle: { fontFamily: GameFonts.displayRegular, fontSize: 14, fontStyle: 'italic', marginTop: 4 },
  doneReal: { fontFamily: GameFonts.uiSemi, fontSize: 11, marginTop: 2, letterSpacing: 0.5 },
});
