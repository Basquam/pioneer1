import { useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getCharacter } from '@/lib/narrative-helpers';
import { formatAffinityGain } from '@/lib/relationship-progress';

type QuestCompletePhase = 'stamp' | 'reaction';

export function QuestCompleteOverlay() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, questComplete, dismissQuestComplete } = useGame();
  const { palette } = activeUniverse;
  const [phase, setPhase] = useState<QuestCompletePhase>('stamp');
  const stampScale = useSharedValue(0.4);
  const stampRotate = useSharedValue(-12);

  useEffect(() => {
    if (!questComplete) return;

    setPhase('stamp');
    stampScale.value = 0.4;
    stampRotate.value = -12;
    stampScale.value = withSequence(
      withSpring(1.12, { damping: 8, stiffness: 220 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
    stampRotate.value = withTiming(0, { duration: 500 });
  }, [questComplete?.questId, stampRotate, stampScale]);

  const stampStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stampScale.value }, { rotate: `${stampRotate.value}deg` }],
  }));

  if (!questComplete) return null;

  const character = getCharacter(activeSaga, questComplete.characterId);
  const isUserQuest = questComplete.source === 'user';
  const stampLabel = isUserQuest ? ui.userQuestClearedLabel : ui.templateQuestClearedLabel;
  const progressMessage = isUserQuest
    ? ui.userQuestCompleteMessage
    : ui.templateQuestCompleteMessage;
  const affinityGainLabel = character ? formatAffinityGain(character) : null;
  const reactionBadge = character?.isVillain ? ui.antagonistReactionBadge : ui.allyReactionBadge;

  const advanceToReaction = () => {
    if (phase === 'stamp') setPhase('reaction');
  };

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent>
      <Pressable
        style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]}
        onPress={phase === 'reaction' ? dismissQuestComplete : advanceToReaction}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          {phase === 'stamp' ? (
            <Pressable style={styles.content} onPress={advanceToReaction}>
              <Animated.View entering={FadeIn.duration(300)} style={styles.stampPhase}>
                <Animated.View
                  style={[
                    styles.stampWrap,
                    stampStyle,
                    { borderColor: palette.gold, backgroundColor: `${palette.primary}33` },
                  ]}>
                  <Text style={[styles.stamp, { color: palette.gold }]}>{stampLabel}</Text>
                </Animated.View>

                <Animated.Text
                  entering={FadeInDown.duration(450).delay(180)}
                  style={[styles.questTitle, { color: palette.bone }]}>
                  {questComplete.narrativeTitle}
                </Animated.Text>

              <Animated.Text
                entering={FadeInDown.duration(450).delay(260)}
                style={[styles.progressMessage, { color: palette.fog }]}>
                {progressMessage}
              </Animated.Text>

              <Animated.View entering={FadeInUp.duration(500).delay(340)} style={styles.rewardsRow}>
                <RewardStat label="XP EARNED" value={`+${questComplete.earnedXp}`} palette={palette} />
                <View style={[styles.rewardDivider, { backgroundColor: palette.panelBorder }]} />
                <RewardStat
                  label={ui.reputationLabel}
                  value={`+${questComplete.earnedReputation}`}
                  palette={palette}
                />
              </Animated.View>

              {affinityGainLabel && (
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(420)}
                  style={[styles.affinityGain, { color: palette.accent }]}>
                  {affinityGainLabel}
                </Animated.Text>
              )}

              {questComplete.identityVoteGainLine && (
                <Animated.View
                  entering={FadeInUp.duration(450).delay(460)}
                  style={[styles.identityVoteBox, { borderColor: palette.panelBorder }]}>
                  <Text style={[styles.identityVoteGain, { color: palette.gold }]}>
                    {questComplete.identityVoteGainLine}
                  </Text>
                  {questComplete.identityUniverseLine && (
                    <Text style={[styles.identityUniverseLine, { color: palette.bone }]}>
                      {questComplete.identityUniverseLine}
                    </Text>
                  )}
                </Animated.View>
              )}

              {questComplete.recoveryCompleteLine && (
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(500)}
                  style={[styles.recoveryComplete, { color: palette.accent }]}>
                  {questComplete.recoveryCompleteLine}
                </Animated.Text>
              )}

              <Animated.Text
                entering={FadeInUp.duration(400).delay(560)}
                style={[styles.tapHint, { color: palette.accent }]}>
                TAP TO CONTINUE ›
              </Animated.Text>
            </Animated.View>
            </Pressable>
          ) : (
            <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
              <Animated.View entering={ZoomIn.duration(400)} style={styles.reactionPhase}>
                <Pressable
                  onPress={dismissQuestComplete}
                  style={[
                    styles.reactionCard,
                    { backgroundColor: palette.panel, borderColor: palette.gold },
                  ]}>
                  {character && <CharacterPortrait character={character} />}
                  <View style={styles.reactionBody}>
                    <Text style={[styles.reactionBadge, { color: palette.gold }]}>{reactionBadge}</Text>
                    {character && (
                      <Text style={[styles.reactionName, { color: palette.bone }]}>{character.name}</Text>
                    )}
                    {affinityGainLabel && (
                      <Text style={[styles.affinityGain, { color: palette.accent }]}>
                        {affinityGainLabel}
                      </Text>
                    )}
                    <Text style={[styles.reactionQuest, { color: palette.fog }]} numberOfLines={2}>
                      {questComplete.narrativeTitle}
                    </Text>
                    <Text style={[styles.reactionLine, { color: palette.bone }]}>
                      {questComplete.characterLine}
                    </Text>
                    <Text style={[styles.tapHint, { color: palette.fog }]}>TAP TO DISMISS</Text>
                  </View>
                </Pressable>
              </Animated.View>
            </Pressable>
          )}
        </ScrollView>
      </Pressable>
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

const styles = StyleSheet.create({
  backdrop: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: GameLayout.modalHorizontalPadding,
    paddingVertical: GameLayout.modalVerticalPadding,
  },
  content: { gap: 16, width: '100%' },
  stampPhase: { alignItems: 'center', gap: 14 },
  stampWrap: {
    borderWidth: 2,
    paddingHorizontal: 18,
    paddingVertical: 10,
    transform: [{ skewX: '-8deg' }],
  },
  stamp: {
    fontFamily: GameFonts.ui,
    fontSize: 16,
    letterSpacing: 4,
    textAlign: 'center',
  },
  questTitle: {
    fontFamily: GameFonts.display,
    fontSize: 24,
    letterSpacing: 1,
    textAlign: 'center',
    lineHeight: 30,
    paddingHorizontal: 8,
  },
  progressMessage: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    fontStyle: 'italic',
    lineHeight: 20,
    textAlign: 'center',
    paddingHorizontal: 12,
  },
  rewardsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 8,
    transform: [{ skewX: '-2deg' }],
  },
  rewardStat: { alignItems: 'center', gap: 4, minWidth: 120 },
  rewardLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardValue: { fontFamily: GameFonts.ui, fontSize: 28, letterSpacing: 2 },
  rewardDivider: { width: 1, height: 36 },
  affinityGain: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
    textAlign: 'center',
  },
  identityVoteBox: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 4,
    width: '100%',
    transform: [{ skewX: '-2deg' }],
    alignItems: 'center',
  },
  identityVoteGain: {
    fontFamily: GameFonts.ui,
    fontSize: 20,
    letterSpacing: 2,
    textAlign: 'center',
  },
  identityUniverseLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
    textAlign: 'center',
  },
  recoveryComplete: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  tapHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 2,
    marginTop: 4,
    textAlign: 'center',
  },
  reactionPhase: { width: '100%' },
  reactionCard: {
    borderWidth: 2,
    padding: 20,
    flexDirection: 'row',
    gap: 14,
    transform: [{ skewX: '-2deg' }],
    alignItems: 'flex-start',
  },
  reactionBody: { flex: 1, gap: 6, minWidth: 0 },
  reactionBadge: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  reactionName: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 2 },
  reactionQuest: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1 },
  reactionLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
    marginTop: 4,
  },
});
