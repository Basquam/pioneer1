import { useEffect } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import type { QuestCompletionPayload, RewardEvent } from '@/lib/reward-event-queue';

type Props = {
  event: RewardEvent;
  payload: QuestCompletionPayload;
  onDismiss: () => void;
};

export function QuestCompletionCelebration({ event, payload, onDismiss }: Props) {
  const ui = useUniverseUiCopy();
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const stampScale = useSharedValue(0.4);
  const stampRotate = useSharedValue(-12);

  useEffect(() => {
    stampScale.value = 0.4;
    stampRotate.value = -12;
    stampScale.value = withSequence(
      withSpring(1.12, { damping: 8, stiffness: 220 }),
      withSpring(1, { damping: 12, stiffness: 180 }),
    );
    stampRotate.value = withTiming(0, { duration: 500 });
  }, [event.id, stampRotate, stampScale]);

  const stampStyle = useAnimatedStyle(() => ({
    transform: [{ scale: stampScale.value }, { rotate: `${stampRotate.value}deg` }],
  }));

  const isUserQuest = payload.source === 'user';
  const stampLabel = isUserQuest ? ui.userQuestClearedLabel : ui.templateQuestClearedLabel;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onDismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <Pressable style={styles.content} onPress={onDismiss}>
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
                {payload.narrativeTitle}
              </Animated.Text>

              <Animated.Text
                entering={FadeInDown.duration(450).delay(260)}
                style={[styles.progressMessage, { color: palette.fog }]}>
                {event.message}
              </Animated.Text>

              <Animated.View entering={FadeInUp.duration(500).delay(340)} style={styles.rewardsRow}>
                <RewardStat label="XP EARNED" value={`+${payload.earnedXp}`} palette={palette} />
                <View style={[styles.rewardDivider, { backgroundColor: palette.panelBorder }]} />
                <RewardStat
                  label={ui.reputationLabel}
                  value={`+${payload.earnedReputation}`}
                  palette={palette}
                />
              </Animated.View>

              {payload.momentumGainLine && (
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(440)}
                  style={[styles.momentumGain, { color: palette.gold }]}>
                  {payload.momentumGainLine}
                </Animated.Text>
              )}

              {payload.questChainCompleteLine && (
                <Animated.Text
                  entering={FadeInUp.duration(450).delay(480)}
                  style={[styles.chainCompleteLine, { color: palette.gold }]}>
                  {payload.questChainCompleteLine}
                </Animated.Text>
              )}

              {(payload.identityVoteGainLine ||
                payload.recoveryCompleteLine ||
                payload.minimumViableDayCompleteLine) && (
                <Animated.View
                  entering={FadeInUp.duration(450).delay(460)}
                  style={[styles.outcomesBox, { borderColor: palette.panelBorder }]}>
                  {payload.identityVoteGainLine && (
                    <View style={styles.outcomeBlock}>
                      <Text style={[styles.outcomeLabel, { color: palette.gold }]}>IDENTITY</Text>
                      {payload.desiredIdentityHighlightLine ? (
                        <Text style={[styles.desiredIdentityHighlight, { color: palette.gold }]}>
                          {payload.desiredIdentityHighlightLine}
                        </Text>
                      ) : null}
                      <Text style={[styles.identityVoteGain, { color: palette.bone }]}>
                        {payload.identityVoteGainLine}
                      </Text>
                      {payload.identityUniverseLine && (
                        <Text style={[styles.identityUniverseLine, { color: palette.fog }]}>
                          {payload.identityUniverseLine}
                        </Text>
                      )}
                    </View>
                  )}

                  {payload.recoveryCompleteLine && (
                    <View style={styles.outcomeBlock}>
                      <Text style={[styles.recoveryComplete, { color: palette.accent }]}>
                        {payload.recoveryCompleteLine}
                      </Text>
                    </View>
                  )}

                  {payload.minimumViableDayCompleteLine && (
                    <View style={styles.outcomeBlock}>
                      <Text style={[styles.recoveryComplete, { color: palette.accent }]}>
                        {payload.minimumViableDayCompleteLine}
                      </Text>
                      {payload.minimumViableDayFlavorLine ? (
                        <Text style={[styles.identityUniverseLine, { color: palette.fog }]}>
                          {payload.minimumViableDayFlavorLine}
                        </Text>
                      ) : null}
                    </View>
                  )}
                </Animated.View>
              )}

              <Animated.Text
                entering={FadeInUp.duration(400).delay(520)}
                style={[styles.tapHint, { color: palette.accent }]}>
                TAP TO CONTINUE ›
              </Animated.Text>
            </Animated.View>
          </Pressable>
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
  momentumGain: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
    letterSpacing: 1.2,
    textAlign: 'center',
  },
  chainCompleteLine: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 0.6,
    textAlign: 'center',
    lineHeight: 16,
  },
  outcomesBox: {
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
    width: '100%',
    transform: [{ skewX: '-2deg' }],
  },
  outcomeBlock: { gap: 4, alignItems: 'center' },
  outcomeLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  identityVoteGain: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  desiredIdentityHighlight: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  identityUniverseLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
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
});
