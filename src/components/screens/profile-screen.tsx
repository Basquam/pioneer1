import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CharacterCard } from '@/components/rpg/character-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getUnlockedRewardEntries, REWARD_TYPE_LABELS } from '@/lib/reward-unlocks';

const RESET_CONFIRM_MESSAGE =
  'This will erase all local save data and return you to onboarding:\n\n' +
  '• XP, level, and reputation\n' +
  '• Completed quests and chapters\n' +
  '• User-created quests\n' +
  '• Character relationships\n' +
  '• Villain influence\n' +
  '• Unlocked rewards\n\n' +
  'This cannot be undone.';

export function ProfileScreen() {
  const {
    activeUniverse,
    activeSaga,
    player,
    characters,
    playerProgress,
    completedQuestCount,
    quests,
    resetProgress,
  } = useGame();

  const unlockedRewards = useMemo(
    () => getUnlockedRewardEntries(activeUniverse, playerProgress.unlockedRewards),
    [activeUniverse, playerProgress.unlockedRewards],
  );

  const performReset = async () => {
    console.log('[ResetProgress] confirmed, calling resetProgress()');
    await resetProgress();
    console.log('[ResetProgress] resetProgress() complete');
    router.replace('/onboarding' as Href);
  };

  const handleReset = () => {
    console.log('[ResetProgress] button pressed, showing confirmation');

    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`Reset Progress\n\n${RESET_CONFIRM_MESSAGE}`);
      console.log('[ResetProgress] confirmation result:', confirmed);
      if (confirmed) {
        void performReset();
      }
      return;
    }

    Alert.alert('Reset Progress', RESET_CONFIRM_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reset',
        style: 'destructive',
        onPress: () => {
          console.log('[ResetProgress] confirmation result: true');
          void performReset();
        },
      },
    ]);
  };

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader eyebrow="OPERATIVE FILE" title="PROFILE" />

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

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>UNLOCKS / REWARDS</Text>
          {unlockedRewards.length === 0 ? (
            <Text style={[styles.emptyRewards, { color: activeUniverse.palette.fog }]}>
              Complete chapters to earn badges, titles, and story unlocks.
            </Text>
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
                <Text style={[styles.rewardName, { color: activeUniverse.palette.bone }]}>{reward.name}</Text>
              </View>
            ))
          )}

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>ALLIES & ENEMIES</Text>
          {characters.map((character, i) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={i}
              relationship={playerProgress.relationshipByCharacter[character.id]}
            />
          ))}

          <Text style={[styles.section, { color: activeUniverse.palette.gold }]}>ACTIVE SAGA</Text>
          {[activeSaga].map((saga) => (
            <View
              key={saga.id}
              style={[styles.worldRow, { borderColor: activeUniverse.palette.panelBorder }]}>
              <Text style={styles.worldIcon}>{activeUniverse.icon}</Text>
              <Text style={[styles.worldName, { color: activeUniverse.palette.bone }]}>{saga.title}</Text>
              <Text style={[styles.worldVillain, { color: activeUniverse.palette.fog }]}>
                vs {saga.villainName}
              </Text>
            </View>
          ))}

          <Text style={[styles.section, { color: activeUniverse.palette.fog }]}>DEV / TESTING</Text>
          <Pressable
            onPress={handleReset}
            style={[styles.resetButton, { borderColor: activeUniverse.palette.primary, backgroundColor: `${activeUniverse.palette.primary}18` }]}>
            <Text style={[styles.resetLabel, { color: activeUniverse.palette.primary }]}>
              RESET PROGRESS
            </Text>
            <Text style={[styles.resetSub, { color: activeUniverse.palette.fog }]}>
              Clears AsyncStorage and restores Dust & Iron · Chapter I
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
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
      <Text style={[styles.statValue, { color: colors.bone }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 14, paddingTop: 8 },
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
  xpText: { fontFamily: GameFonts.uiSemi, fontSize: 11, letterSpacing: 1 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statBox: {
    width: '47%',
    padding: 14,
    borderWidth: 1,
    transform: [{ skewX: '-3deg' }],
    gap: 4,
  },
  statLabel: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  statValue: { fontFamily: GameFonts.ui, fontSize: 22 },
  section: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, marginTop: 8 },
  emptyRewards: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    fontStyle: 'italic',
    lineHeight: 19,
  },
  rewardRow: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    marginBottom: 8,
    transform: [{ skewX: '-2deg' }],
  },
  rewardType: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardName: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1 },
  worldRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  worldIcon: { fontSize: 22 },
  worldName: { fontFamily: GameFonts.ui, fontSize: 14, flex: 1, letterSpacing: 1 },
  worldVillain: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
  resetButton: {
    borderWidth: 1,
    padding: 14,
    gap: 4,
    marginTop: 12,
    transform: [{ skewX: '-3deg' }],
  },
  resetLabel: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 2, textAlign: 'center' },
  resetSub: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, textAlign: 'center' },
});
