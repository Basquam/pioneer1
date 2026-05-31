import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ContentProgressBar } from '@/components/rpg/content-progress-bar';
import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { GameFonts } from '@/constants/typography';
import {
  formatChapterProgress,
  type UniverseLibraryProgress,
} from '@/lib/content-library-progress';
import { getUniverseMoodImage } from '@/lib/narrative-media';
import type { Universe } from '@/types/narrative';

type ThemeCardProps = {
  universe: Universe;
  selected: boolean;
  index: number;
  locked?: boolean;
  libraryProgress: UniverseLibraryProgress;
  onPress: () => void;
};

export function ThemeCard({
  universe,
  selected,
  index,
  locked,
  libraryProgress,
  onPress,
}: ThemeCardProps) {
  const { palette } = universe;
  const moodImage = getUniverseMoodImage(universe);
  const isLocked = locked ?? !libraryProgress.unlocked;
  const statusLabel = isLocked ? 'LOCKED' : 'PLAYABLE';
  const sagaMeta = `${libraryProgress.totalSagas} ${libraryProgress.totalSagas === 1 ? 'saga' : 'sagas'}`;
  const playableMeta = isLocked
    ? sagaMeta
    : `${libraryProgress.playableSagas}/${libraryProgress.totalSagas} sagas unlocked`;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        disabled={isLocked}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.panel,
            borderColor: selected ? palette.gold : palette.panelBorder,
            opacity: isLocked ? 0.72 : 1,
          },
        ]}>
        {moodImage ? (
          <NarrativeMediaFrame
            source={moodImage}
            height={88}
            scrim="bottom"
            style={styles.banner}
            fallback={
              <View style={[styles.bannerFallback, { backgroundColor: palette.ink }]}>
                <Text style={styles.icon}>{universe.icon}</Text>
              </View>
            }
          />
        ) : null}

        <View style={styles.bodyRow}>
          {!moodImage && <Text style={styles.icon}>{universe.icon}</Text>}
          <View style={styles.text}>
            <View style={styles.titleRow}>
              <Text style={[styles.name, { color: palette.bone }]} numberOfLines={2}>
                {universe.name}
              </Text>
              <View
                style={[
                  styles.statusBadge,
                  {
                    borderColor: isLocked ? palette.fog : palette.gold,
                    backgroundColor: isLocked ? `${palette.ink}88` : `${palette.primary}33`,
                  },
                ]}>
                <Text style={[styles.statusText, { color: isLocked ? palette.fog : palette.gold }]}>
                  {statusLabel}
                </Text>
              </View>
            </View>

            <Text style={[styles.meta, { color: palette.fog }]}>
              {playableMeta} · {universe.coreProgressionName}
            </Text>

            <Text style={[styles.themeLine, { color: palette.accent }]} numberOfLines={2}>
              {universe.theme}
            </Text>

            {libraryProgress.totalChapters > 0 && (
              <View style={styles.progressBlock}>
                <View style={styles.progressRow}>
                  <Text style={[styles.progressLabel, { color: palette.fog }]}>
                    {formatChapterProgress(
                      libraryProgress.completedChapters,
                      libraryProgress.totalChapters,
                    )}
                  </Text>
                </View>
                <ContentProgressBar
                  completed={libraryProgress.completedChapters}
                  total={libraryProgress.totalChapters}
                  palette={palette}
                />
              </View>
            )}

            {isLocked && universe.unlockRequirementLabel && (
              <Text style={[styles.requirement, { color: palette.villainGlow }]}>
                REQUIRES: {universe.unlockRequirementLabel.toUpperCase()}
              </Text>
            )}
          </View>
          {selected && !isLocked && (
            <View style={[styles.check, { backgroundColor: palette.primary }]}>
              <Text style={[styles.checkText, { color: palette.bone }]}>✓</Text>
            </View>
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    marginBottom: 12,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  banner: { marginBottom: 0 },
  bannerFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bodyRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    gap: 14,
  },
  icon: { fontSize: 36, marginTop: 2 },
  text: { flex: 1, gap: 6, minWidth: 0 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  name: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2, flex: 1, minWidth: 120 },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-8deg' }],
  },
  statusText: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  meta: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, lineHeight: 14 },
  themeLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 18,
  },
  progressBlock: { gap: 4, marginTop: 2 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  progressLabel: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5 },
  requirement: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5, marginTop: 2 },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '8deg' }],
  },
  checkText: { fontFamily: GameFonts.ui, fontSize: 16 },
});
