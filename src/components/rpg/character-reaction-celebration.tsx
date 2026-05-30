import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getCharacter } from '@/lib/narrative-helpers';
import { formatAffinityGain } from '@/lib/relationship-progress';
import type { CharacterReactionPayload, RewardEvent } from '@/lib/reward-event-queue';

type Props = {
  event: RewardEvent;
  payload: CharacterReactionPayload;
  onDismiss: () => void;
};

export function CharacterReactionCelebration({ payload, onDismiss }: Props) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga } = useGame();
  const { palette } = activeUniverse;
  const character = getCharacter(activeSaga, payload.characterId);
  const affinityGainLabel = character ? formatAffinityGain(character) : null;
  const reactionBadge = character?.isVillain ? ui.antagonistReactionBadge : ui.allyReactionBadge;

  return (
    <Modal visible transparent animationType="fade" statusBarTranslucent onRequestClose={onDismiss}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onDismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}>
          <Pressable style={styles.content} onPress={(event) => event.stopPropagation()}>
            <Animated.View entering={ZoomIn.duration(400)} style={styles.reactionPhase}>
              <Pressable
                onPress={onDismiss}
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
                    <Text style={[styles.affinityGain, { color: palette.accent }]}>{affinityGainLabel}</Text>
                  )}
                  <Text style={[styles.reactionQuest, { color: palette.fog }]} numberOfLines={2}>
                    {payload.narrativeTitle}
                  </Text>
                  <Text style={[styles.reactionLine, { color: palette.bone }]}>{payload.characterLine}</Text>
                  <Text style={[styles.tapHint, { color: palette.fog }]}>TAP TO DISMISS</Text>
                </View>
              </Pressable>
            </Animated.View>
          </Pressable>
        </ScrollView>
      </Pressable>
    </Modal>
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
  affinityGain: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1,
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
