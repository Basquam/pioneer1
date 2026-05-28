import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getTaskCategoryMeta } from '@/lib/task-categories';

export function QuestCreatedOverlay() {
  const ui = useUniverseUiCopy();
  const {
    activeUniverse,
    questCreated,
    viewCreatedQuestOnBoard,
    addAnotherQuest,
  } = useGame();
  const { palette } = activeUniverse;

  if (!questCreated) return null;

  const categoryMeta = getTaskCategoryMeta(questCreated.category);

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <View style={[styles.backdrop, { backgroundColor: `${palette.void}f2` }]}>
        <View style={[styles.vignetteTop, { backgroundColor: palette.primary }]} />
        <View style={[styles.vignetteBottom, { backgroundColor: palette.accent }]} />

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <Animated.View entering={FadeIn.duration(500)} style={styles.content}>
          <Animated.Text
            entering={ZoomIn.duration(650).delay(120)}
            style={[styles.stamp, { color: palette.gold, borderColor: palette.gold }]}>
            {ui.newQuestAddedStamp}
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.duration(550).delay(220)}
            style={[styles.questCard, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
            <Text style={[styles.realLabel, { color: palette.accent }]}>{ui.realTaskLabel}</Text>
            <Text style={[styles.realTask, { color: palette.bone }]}>{questCreated.originalTitle}</Text>

            <View style={[styles.divider, { backgroundColor: palette.panelBorder }]} />

            <Text style={[styles.narrativeLabel, { color: palette.gold }]}>{ui.sagaQuestLabel}</Text>
            <Text style={[styles.narrativeTitle, { color: palette.bone }]}>
              {questCreated.narrativeTitle}
            </Text>
            <Text style={[styles.narrativeDescription, { color: palette.fog }]}>
              {questCreated.narrativeDescription}
            </Text>

            <View style={[styles.archetypeRow, { borderColor: palette.panelBorder }]}>
              <Text style={[styles.archetypeIcon, { color: palette.bone }]}>{categoryMeta.icon}</Text>
              <View style={styles.archetypeText}>
                <Text style={[styles.archetypeFlavor, { color: palette.bone }]}>{categoryMeta.label}</Text>
                <Text style={[styles.archetypeReal, { color: palette.fog }]}>
                  {categoryMeta.realWorldLabel}
                </Text>
              </View>
            </View>
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(420)} style={styles.rewardsRow}>
            <RewardStat label="XP REWARD" value={`+${questCreated.xpReward}`} palette={palette} />
            <View style={[styles.rewardDivider, { backgroundColor: palette.panelBorder }]} />
            <RewardStat
              label={ui.reputationLabel}
              value={`+${questCreated.reputationReward}`}
              palette={palette}
            />
          </Animated.View>

          <Animated.View entering={FadeInUp.duration(500).delay(520)} style={styles.buttonWrap}>
            <GlowButton
              label={ui.viewQuestBoardLabel}
              hint={ui.viewQuestBoardHint}
              onPress={viewCreatedQuestOnBoard}
            />
            <SecondaryButton
              label={ui.addAnotherQuestLabel}
              hint={ui.addAnotherQuestHint}
              palette={palette}
              onPress={addAnotherQuest}
            />
          </Animated.View>
          </Animated.View>
        </ScrollView>
      </View>
    </Modal>
  );
}

function RewardStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { gold: string; fog: string; bone: string };
}) {
  return (
    <View style={styles.rewardStat}>
      <Text style={[styles.rewardLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.rewardValue, { color: palette.gold }]}>{value}</Text>
    </View>
  );
}

function SecondaryButton({
  label,
  hint,
  palette,
  onPress,
}: {
  label: string;
  hint?: string;
  palette: { panelBorder: string; fog: string; bone: string };
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.secondaryButton, { borderColor: palette.panelBorder }]}>
      <Text style={[styles.secondaryLabel, { color: palette.bone }]}>{label}</Text>
      {hint ? <Text style={[styles.secondaryHint, { color: palette.fog }]}>{hint}</Text> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: GameLayout.modalHorizontalPadding,
    paddingVertical: GameLayout.modalVerticalPadding,
  },
  vignetteTop: {
    position: 'absolute',
    top: -120,
    left: -80,
    width: 280,
    height: 280,
    opacity: 0.12,
    transform: [{ rotate: '-18deg' }],
  },
  vignetteBottom: {
    position: 'absolute',
    bottom: -100,
    right: -60,
    width: 240,
    height: 240,
    opacity: 0.1,
    transform: [{ rotate: '12deg' }],
  },
  content: { gap: 16 },
  stamp: {
    alignSelf: 'center',
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 3,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    textAlign: 'center',
    transform: [{ skewX: '-8deg' }],
  },
  questCard: {
    borderWidth: 1,
    padding: 16,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  realLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  realTask: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 0.5, lineHeight: 21 },
  divider: { height: 1, marginVertical: 4 },
  narrativeLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2, marginTop: 2 },
  narrativeTitle: { fontFamily: GameFonts.display, fontSize: 22, lineHeight: 28, letterSpacing: 1 },
  narrativeDescription: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  archetypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    paddingTop: 10,
    marginTop: 4,
  },
  archetypeIcon: { fontSize: 18 },
  archetypeText: { flex: 1, gap: 2 },
  archetypeFlavor: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1 },
  archetypeReal: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 4,
    transform: [{ skewX: '-2deg' }],
  },
  rewardStat: { alignItems: 'center', gap: 4, minWidth: 120 },
  rewardLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardValue: { fontFamily: GameFonts.ui, fontSize: 24, letterSpacing: 2 },
  rewardDivider: { width: 1, height: 36 },
  buttonWrap: { gap: 4, marginTop: 4 },
  secondaryButton: {
    width: '100%',
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    transform: [{ skewX: '-6deg' }],
    marginTop: 4,
  },
  secondaryLabel: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2, textAlign: 'center' },
  secondaryHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
});
