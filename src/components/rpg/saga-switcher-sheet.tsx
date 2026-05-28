import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';

import { ContentProgressBar } from '@/components/rpg/content-progress-bar';
import { SagaCard } from '@/components/rpg/saga-card';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { useModalBottomInset } from '@/hooks/use-scroll-insets';
import {
  formatChapterProgress,
  getSagaLibraryProgress,
  getUniverseLibraryProgress,
} from '@/lib/content-library-progress';
import { getSagaUnlockHint, isSagaUnlocked } from '@/lib/reward-unlocks';

type SagaSwitcherSheetProps = {
  visible: boolean;
  onClose: () => void;
};

export function SagaSwitcherSheet({ visible, onClose }: SagaSwitcherSheetProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, playerProgress, switchSaga } = useGame();
  const { palette } = activeUniverse;
  const modalBottomInset = useModalBottomInset(32);
  const universeLibrary = getUniverseLibraryProgress(activeUniverse, playerProgress);

  if (!visible) return null;

  const unlockedSagas = activeUniverse.sagas.filter((saga) =>
    isSagaUnlocked(saga, playerProgress.unlockedRewards),
  );

  const handleSelect = (sagaId: string) => {
    const saga = activeUniverse.sagas.find((entry) => entry.id === sagaId);
    if (!saga || !isSagaUnlocked(saga, playerProgress.unlockedRewards)) {
      return;
    }

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
            <Text style={[styles.eyebrow, { color: palette.accent }]}>
              {activeUniverse.name.toUpperCase()} · SAGA LIBRARY
            </Text>
            <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
              CHOOSE YOUR SAGA
            </Text>
            <Text style={[styles.subtitle, { color: palette.fog }]}>
              {universeLibrary.playableSagas}/{universeLibrary.totalSagas} sagas unlocked · progress
              saved per saga
            </Text>
            {universeLibrary.totalChapters > 0 && (
              <View style={styles.universeProgress}>
                <Text style={[styles.progressLabel, { color: palette.fog }]}>
                  Universe progress ·{' '}
                  {formatChapterProgress(
                    universeLibrary.completedChapters,
                    universeLibrary.totalChapters,
                  )}
                </Text>
                <ContentProgressBar
                  completed={universeLibrary.completedChapters}
                  total={universeLibrary.totalChapters}
                  palette={palette}
                />
              </View>
            )}
          </Animated.View>

          <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {activeUniverse.sagas.length === 0 ? (
              <CinematicEmptyState
                title="No sagas available."
                message={ui.sagaSwitcherEmptyMessage}
                primaryLabel="CLOSE"
                onPrimaryPress={onClose}
              />
            ) : (
              <>
                {unlockedSagas.length === 0 && (
                  <Text style={[styles.lockedHint, { color: palette.fog }]}>
                    {ui.sagaSwitcherEmptyMessage}
                  </Text>
                )}
                {activeUniverse.sagas.map((saga, index) => {
                  const unlocked = isSagaUnlocked(saga, playerProgress.unlockedRewards);

                  return (
                    <SagaCard
                      key={saga.id}
                      saga={saga}
                      palette={palette}
                      selected={activeSaga.id === saga.id}
                      unlocked={unlocked}
                      unlockHint={getSagaUnlockHint(saga)}
                      libraryProgress={getSagaLibraryProgress(saga, playerProgress)}
                      index={index}
                      onPress={() => handleSelect(saga.id)}
                    />
                  );
                })}
              </>
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
  universeProgress: { gap: 4, marginTop: 4 },
  progressLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
  scroll: { flexShrink: 1 },
  scrollContent: { gap: 4, paddingBottom: 4 },
  lockedHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 18,
    fontStyle: 'italic',
    marginBottom: 8,
  },
  closeButton: {
    borderWidth: 1,
    paddingVertical: 12,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  closeLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
});
