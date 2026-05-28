import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AmbientAudioToggle } from '@/components/rpg/ambient-audio-toggle';
import { AudioDevTools } from '@/components/rpg/audio-dev-tools';
import { CharacterCard } from '@/components/rpg/character-card';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { DevToolsPanel } from '@/components/rpg/dev-tools-panel';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { SectionLabel } from '@/components/rpg/section-label';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import { getUnlockedRewardEntries, isSagaUnlocked, REWARD_TYPE_LABELS } from '@/lib/reward-unlocks';
import { getSagaActiveChapter } from '@/lib/saga-progress';

export function ProfileScreen() {
  const {
    activeUniverse,
    activeSaga,
    player,
    characters,
    playerProgress,
    completedQuestCount,
    quests,
  } = useGame();

  const unlockedSagas = useMemo(
    () =>
      activeUniverse.sagas.filter((saga) =>
        isSagaUnlocked(saga, playerProgress.unlockedRewards),
      ),
    [activeUniverse.sagas, playerProgress.unlockedRewards],
  );

  const unlockedRewards = useMemo(
    () => getUnlockedRewardEntries(activeUniverse, playerProgress.unlockedRewards),
    [activeUniverse, playerProgress.unlockedRewards],
  );

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow="OPERATIVE FILE" title="PROFILE" />
        </Animated.View>

        <View style={[styles.card, { backgroundColor: activeUniverse.palette.panel, borderColor: activeUniverse.palette.gold }]}>
          <Text style={styles.avatar}>{activeUniverse.icon}</Text>
          <Text style={[styles.rank, { color: activeUniverse.palette.gold }]}>{player.rank.toUpperCase()}</Text>
          <Text style={[styles.level, { color: activeUniverse.palette.bone }]}>
            LEVEL {player.level}
          </Text>
          <View style={[styles.xpBar, { backgroundColor: activeUniverse.palette.xpTrack }]}>
            <View
              style={[
                styles.xpFill,
                { width: `${player.xpProgress * 100}%`, backgroundColor: activeUniverse.palette.xpFill },
              ]}
            />
          </View>
          <Text style={[styles.xpText, { color: activeUniverse.palette.fog }]}>
            {player.xpInLevel} / {player.xpToNext} XP to next level · {player.totalXp} total
          </Text>
        </View>

        <View style={styles.statsGrid}>
          <StatBox label="GRIT" value={String(player.stats.grit)} colors={activeUniverse.palette} />
          <StatBox label="FOCUS" value={String(player.stats.focus)} colors={activeUniverse.palette} />
          <StatBox label="LEGEND" value={`${player.stats.legend}%`} colors={activeUniverse.palette} />
          <StatBox label="BOUNTIES" value={`${completedQuestCount}/${quests.length}`} colors={activeUniverse.palette} />
          <StatBox label="REPUTATION" value={`${player.reputation}`} colors={activeUniverse.palette} />
        </View>

        <SectionLabel>AUDIO</SectionLabel>
        <AmbientAudioToggle />
        <AudioDevTools />

        <SectionLabel>UNLOCKS / REWARDS</SectionLabel>
        {unlockedRewards.length === 0 ? (
          <CinematicEmptyState
            title="No rewards unlocked yet."
            message="Complete chapters to earn badges, titles, and story unlocks."
            primaryLabel="VIEW STORY TRAIL"
            onPrimaryPress={() => router.push('/(game)/story' as Href)}
          />
        ) : (
          unlockedRewards.map((reward) => (
            <View
              key={reward.id}
              style={[
                styles.rewardRow,
                { backgroundColor: activeUniverse.palette.panel, borderColor: activeUniverse.palette.panelBorder },
              ]}>
              <Text style={[styles.rewardType, { color: activeUniverse.palette.accent }]}>
                {REWARD_TYPE_LABELS[reward.type]}
              </Text>
              <Text style={[styles.rewardName, { color: activeUniverse.palette.bone }]} numberOfLines={2}>
                {reward.name}
              </Text>
            </View>
          ))
        )}

        <SectionLabel>SAGA PROGRESS</SectionLabel>
        {unlockedSagas.map((saga) => {
          const completedChapters = getCompletedChapterCountForSaga(saga, playerProgress);
          const activeChapter = getSagaActiveChapter(saga, playerProgress);
          const totalChapters = saga.chapters.length;

          return (
            <View
              key={saga.id}
              style={[
                styles.sagaProgressRow,
                {
                  backgroundColor: activeUniverse.palette.panel,
                  borderColor:
                    saga.id === activeSaga.id
                      ? activeUniverse.palette.gold
                      : activeUniverse.palette.panelBorder,
                },
              ]}>
              <View style={styles.sagaProgressHeader}>
                <Text
                  style={[styles.sagaProgressTitle, { color: activeUniverse.palette.bone }]}
                  numberOfLines={2}>
                  {saga.title}
                </Text>
                {saga.id === activeSaga.id && (
                  <Text style={[styles.sagaProgressActive, { color: activeUniverse.palette.gold }]}>
                    ACTIVE
                  </Text>
                )}
              </View>
              <Text style={[styles.sagaProgressMeta, { color: activeUniverse.palette.fog }]} numberOfLines={2}>
                {completedChapters}/{totalChapters} chapters cleared
                {activeChapter ? ` · riding ${activeChapter.title}` : ''}
              </Text>
            </View>
          );
        })}

        <SectionLabel>ALLIES & ENEMIES</SectionLabel>
        {characters.map((character, i) => (
          <CharacterCard
            key={character.id}
            character={character}
            index={i}
            affinity={playerProgress.characterAffinity[character.id] ?? 0}
          />
        ))}

        <DevToolsPanel />
      </ScreenScroll>
    </ScreenShell>
  );
}

function StatBox({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { panel: string; panelBorder: string; gold: string; bone: string };
}) {
  return (
    <View style={[styles.statBox, { backgroundColor: colors.panel, borderColor: colors.panelBorder }]}>
      <Text style={[styles.statLabel, { color: colors.gold }]}>{label}</Text>
      <Text style={[styles.statValue, { color: colors.bone }]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    padding: 24,
    borderWidth: 2,
    transform: [{ skewX: '-2deg' }],
    gap: 8,
  },
  avatar: { fontSize: 48 },
  rank: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 3 },
  level: { fontFamily: GameFonts.display, fontSize: 36, letterSpacing: 4 },
  xpBar: { width: '100%', height: 8, overflow: 'hidden', marginTop: 8 },
  xpFill: { height: '100%' },
  xpText: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '47%',
    flexGrow: 1,
    minWidth: 130,
    padding: 14,
    borderWidth: 1,
    transform: [{ skewX: '-3deg' }],
    gap: 4,
  },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 22 },
  rewardRow: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  rewardType: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardName: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1, lineHeight: 20 },
  sagaProgressRow: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  sagaProgressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  sagaProgressTitle: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1, flex: 1, minWidth: 0 },
  sagaProgressActive: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5, flexShrink: 0 },
  sagaProgressMeta: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 0.5, lineHeight: 15 },
});
