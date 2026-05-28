import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ContentProgressBar } from '@/components/rpg/content-progress-bar';
import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatChapterProgress,
  getSagaLibraryProgress,
  getUniverseLibraryProgress,
} from '@/lib/content-library-progress';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';

type StorylinesSectionProps = {
  onOpenSwitcher: () => void;
};

export function StorylinesSection({ onOpenSwitcher }: StorylinesSectionProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, player, playerProgress } = useGame();
  const { palette } = activeUniverse;

  const universeLibrary = getUniverseLibraryProgress(activeUniverse, playerProgress);
  const sagaLibrary = getSagaLibraryProgress(activeSaga, playerProgress);
  const hasUnlockedSagas = universeLibrary.playableSagas > 0;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: palette.panel, borderColor: palette.panelBorder },
      ]}>
      <View style={styles.headerRow}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>SAGA LIBRARY</Text>
        <Text style={[styles.unlockedCount, { color: palette.fog }]}>
          {universeLibrary.playableSagas}/{universeLibrary.totalSagas} unlocked
        </Text>
      </View>

      {universeLibrary.totalChapters > 0 && (
        <View style={styles.universeProgress}>
          <Text style={[styles.progressLabel, { color: palette.fog }]}>
            Universe ·{' '}
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

      <Text style={[styles.currentLabel, { color: palette.accent }]}>CURRENT SAGA</Text>
      <Text style={[styles.sagaTitle, { color: palette.bone }]} numberOfLines={2}>
        {activeSaga.title}
      </Text>
      <Text style={[styles.role, { color: palette.fog }]} numberOfLines={2}>
        {player.rank}
        {sagaLibrary.totalChapters > 0
          ? ` · ${formatChapterProgress(sagaLibrary.completedChapters, sagaLibrary.totalChapters)}`
          : ''}
      </Text>

      {sagaLibrary.totalChapters > 0 && (
        <ContentProgressBar
          completed={sagaLibrary.completedChapters}
          total={sagaLibrary.totalChapters}
          palette={palette}
        />
      )}

      <Pressable
        onPress={hasUnlockedSagas ? onOpenSwitcher : undefined}
        disabled={!hasUnlockedSagas}
        style={[
          styles.switchButton,
          { borderColor: palette.gold, opacity: hasUnlockedSagas ? 1 : 0.55 },
        ]}>
        <Text style={[styles.switchLabel, { color: palette.gold }]}>
          {hasUnlockedSagas ? 'OPEN SAGA LIBRARY' : 'NO SAGAS UNLOCKED'}
        </Text>
        <Text style={[styles.switchHint, { color: palette.fog }]}>
          {hasUnlockedSagas
            ? 'Browse sagas, allies, villains, and progress'
            : ui.sagaSwitcherEmptyMessage}
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
  universeProgress: { gap: 4, marginTop: 2, marginBottom: 4 },
  progressLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
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
