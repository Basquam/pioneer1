import { ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { CharacterCard } from '@/components/rpg/character-card';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function ProfileScreen() {
  const { activeUniverse, activeSaga, player, characters, playerProgress, completedQuestCount, quests } = useGame();

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
});
