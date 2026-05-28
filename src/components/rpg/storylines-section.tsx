import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import { isSagaUnlocked } from '@/lib/reward-unlocks';

type StorylinesSectionProps = {
  onOpenSwitcher: () => void;
};

export function StorylinesSection({ onOpenSwitcher }: StorylinesSectionProps) {
  const { activeUniverse, activeSaga, player, playerProgress } = useGame();
  const { palette } = activeUniverse;

  const unlockedSagas = activeUniverse.sagas.filter((saga) =>
    isSagaUnlocked(saga, playerProgress.unlockedRewards),
  );
  const completedChapters = getCompletedChapterCountForSaga(activeSaga, playerProgress);
  const totalChapters = activeSaga.chapters.length;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>STORYLINES</Text>
        <Text style={[styles.unlockedCount, { color: palette.fog }]}>
          {unlockedSagas.length}/{activeUniverse.sagas.length} UNLOCKED
        </Text>
      </View>

      <Text style={[styles.currentLabel, { color: palette.accent }]}>CURRENT SAGA</Text>
      <Text style={[styles.sagaTitle, { color: palette.bone }]} numberOfLines={2}>
        {activeSaga.title}
      </Text>
      <Text style={[styles.role, { color: palette.fog }]} numberOfLines={2}>
        {player.rank}
        {totalChapters > 0 ? ` · ${completedChapters}/${totalChapters} chapters` : ''}
      </Text>

      <Pressable
        onPress={onOpenSwitcher}
        style={[styles.switchButton, { borderColor: palette.gold }]}>
        <Text style={[styles.switchLabel, { color: palette.gold }]}>CHANGE SAGA</Text>
        <Text style={[styles.switchHint, { color: palette.fog }]}>
          View unlocked storylines and switch campaigns
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  eyebrow: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  unlockedCount: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
  currentLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 4 },
  sagaTitle: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2 },
  role: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1 },
  switchButton: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    marginTop: 8,
    transform: [{ skewX: '-4deg' }],
  },
  switchLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  switchHint: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
});
