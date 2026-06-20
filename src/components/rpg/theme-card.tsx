import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { NarrativeMediaFrame } from '@/components/rpg/narrative-media-frame';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryProgressBar } from '@/components/ui/questory-progress-bar';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import {
  formatChapterProgress,
  type UniverseLibraryProgress,
} from '@/lib/content-library-progress';
import { getUniverseMoodImage } from '@/lib/narrative-media';
import { getUniverseSkin, getUniverseCardVariant } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
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
  const skin = getUniverseSkin(universe.id);
  const moodImage = getUniverseMoodImage(universe);
  const isLocked = locked ?? !libraryProgress.unlocked;
  const sagaMeta = `${libraryProgress.totalSagas} ${libraryProgress.totalSagas === 1 ? 'saga' : 'sagas'}`;
  const playableMeta = isLocked
    ? sagaMeta
    : `${libraryProgress.playableSagas}/${libraryProgress.totalSagas} sagas unlocked`;
  const progressRatio =
    libraryProgress.totalChapters > 0
      ? libraryProgress.completedChapters / libraryProgress.totalChapters
      : 0;

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable disabled={isLocked} onPress={onPress}>
        <QuestoryCard
          variant={selected && !isLocked ? 'elevated' : getUniverseCardVariant(universe.id)}
          universeId={universe.id}
          glow={selected && !isLocked}
          style={{ opacity: isLocked ? 0.72 : 1 }}
          contentStyle={styles.cardBody}>
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
              <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, flex: 1, minWidth: 120 }]} numberOfLines={2}>
                {universe.name}
              </Text>
              <QuestoryStatusPill
                label={isLocked ? 'LOCKED' : 'PLAYABLE'}
                tone={isLocked ? 'muted' : 'accent'}
                universeId={universe.id}
              />
            </View>

            <Text style={[QuestoryTypography.caption, { color: palette.fog }]}>
              {playableMeta} · {universe.coreProgressionName}
            </Text>

            <Text style={[QuestoryTypography.flavor, { color: palette.accent }]} numberOfLines={2}>
              {universe.theme}
            </Text>

            {libraryProgress.totalChapters > 0 && (
              <QuestoryProgressBar
                progress={progressRatio}
                label={formatChapterProgress(
                  libraryProgress.completedChapters,
                  libraryProgress.totalChapters,
                )}
                universeId={universe.id}
              />
            )}

            {isLocked && universe.unlockRequirementLabel && (
              <Text style={[QuestoryTypography.caption, { color: palette.villainGlow, letterSpacing: 1.5 }]}>
                REQUIRES: {universe.unlockRequirementLabel.toUpperCase()}
              </Text>
            )}
          </View>
          {selected && !isLocked && (
            <View style={[styles.check, { backgroundColor: skin.accentPrimary }]}>
              <Text style={[styles.checkText, { color: palette.bone }]}>✓</Text>
            </View>
          )}
        </View>
        </QuestoryCard>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  cardBody: { gap: 0, padding: 0, paddingLeft: 0 },
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
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkText: { fontFamily: 'BarlowCondensed_700Bold', fontSize: 16 },
});
