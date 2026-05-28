import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { SagaCard } from '@/components/rpg/saga-card';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import { getSagaUnlockHint, isSagaUnlocked } from '@/lib/reward-unlocks';

type SagaSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function SagaSwitcherSheet({ visible, onClose }: SagaSwitcherSheetProps) {
  const { activeUniverse, activeSaga, playerProgress, switchSaga } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);

  if (!visible) return null;

  const unlockedSagas = activeUniverse.sagas.filter((saga) =>
    isSagaUnlocked(saga, playerProgress.unlockedRewards),
  );

  const handleSelect = (sagaId: string) => {
    if (sagaId === activeSaga.id) {
      onClose();
      return;
    }

    switchSaga(sagaId);
    onClose();
  };

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={[styles.backdrop, { backgroundColor: `${palette.void}ee` }]} onPress={onClose}>
        <Pressable
          style={[
            styles.content,
            {
              backgroundColor: palette.night,
              borderColor: palette.panelBorder,
              maxHeight: GameLayout.modalMaxHeight,
              paddingBottom: modalBottomInset,
            },
          ]}
          onPress={(event) => event.stopPropagation()}>
          <Animated.View entering={FadeInUp.duration(400)} style={styles.header}>
            <Text style={[styles.eyebrow, { color: palette.accent }]}>STORYLINES</Text>
            <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
              CHOOSE YOUR SAGA
            </Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>
              Switch between unlocked campaigns. Progress is saved per storyline.
            </Text>
          </Animated.View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {unlockedSagas.length === 0 ? (
              <CinematicEmptyState
                title="No unlocked storylines yet."
                message="Ride through the Vulture Gang saga to unlock more campaigns across Dustfall."
                primaryLabel="CLOSE"
                onPrimaryPress={onClose}
              />
            ) : (
              activeUniverse.sagas.map((saga, index) => {
                const unlocked = isSagaUnlocked(saga, playerProgress.unlockedRewards);
                const completedChapters = getCompletedChapterCountForSaga(saga, playerProgress);
                const totalChapters = saga.chapters.length;

                return (
                  <View key={saga.id} style={styles.cardWrap}>
                    <SagaCard
                      saga={saga}
                      palette={palette}
                      selected={activeSaga.id === saga.id}
                      unlocked={unlocked}
                      unlockHint={getSagaUnlockHint(saga)}
                      index={index}
                      onPress={() => handleSelect(saga.id)}
                    />
                    {unlocked && totalChapters > 0 && (
                      <Text style={[styles.progressHint, { color: palette.fog }]}>
                        {completedChapters}/{totalChapters} chapters cleared
                      </Text>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>

          <Pressable onPress={onClose} style={[styles.closeButton, { borderColor: palette.panelBorder }]}>
            <Text style={[styles.closeLabel, { color: palette.bone }]}>CLOSE</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  content: {
    borderTopWidth: 1,
    paddingHorizontal: GameLayout.screenPaddingHorizontal,
    paddingTop: 24,
    gap: 12,
  },
  header: { gap: 6 },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  title: { fontFamily: GameFonts.display, fontSize: 26, letterSpacing: 2, lineHeight: 32 },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic',
  },
  scroll: { flexShrink: 1 },
  scrollContent: { gap: 4, paddingBottom: 4 },
  cardWrap: { gap: 4 },
  progressHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    textAlign: 'right',
    marginTop: -8,
    marginBottom: 4,
    paddingRight: 4,
  },
  closeButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  closeLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
});
