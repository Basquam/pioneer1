import { useMemo, useState } from 'react';
import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { UNIVERSES } from '@/data/narrative/universes';
import { CharacterCard } from '@/components/rpg/character-card';
import { GameFonts } from '@/constants/typography';
import {
  getUniverseSagaSummaries,
  listUniverseProfileStats,
} from '@/lib/profile-progress-stats';
import type { PlayerProgress, Universe } from '@/types/narrative';

type UniverseProgressPanelProps = {
  progress: PlayerProgress;
  activeUniverseId: string;
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
    primary: string;
    night: string;
  };
};

export function UniverseProgressPanel({
  progress,
  activeUniverseId,
  palette,
}: UniverseProgressPanelProps) {
  const entries = useMemo(
    () => listUniverseProfileStats(progress, activeUniverseId),
    [progress, activeUniverseId],
  );

  return (
    <View style={styles.list}>
      {entries.map((entry) => {
        const universe = UNIVERSES.find((item) => item.id === entry.universeId);
        if (!universe) return null;

        return (
          <UniverseProgressCard
            key={entry.universeId}
            universe={universe}
            progress={progress}
            entry={entry}
            palette={palette}
          />
        );
      })}
    </View>
  );
}

type UniverseProgressCardProps = {
  universe: Universe;
  progress: PlayerProgress;
  entry: ReturnType<typeof listUniverseProfileStats>[number];
  palette: UniverseProgressPanelProps['palette'];
};

function UniverseProgressCard({ universe, progress, entry, palette }: UniverseProgressCardProps) {
  const [expanded, setExpanded] = useState(entry.isActive || entry.unlocked);
  const sagaSummaries = useMemo(
    () => getUniverseSagaSummaries(universe, progress),
    [universe, progress],
  );

  const universeCharacters = useMemo(
    () =>
      universe.sagas.flatMap((saga) =>
        saga.characters.map((character) => ({
          character,
          affinity: progress.characterAffinity[character.id] ?? 0,
        })),
      ),
    [universe, progress.characterAffinity],
  );

  const engagedCharacters = universeCharacters.filter((item) => item.affinity > 0);

  const chapterProgress =
    entry.totalChapters > 0 ? entry.chaptersCompleted / entry.totalChapters : 0;

  const handleToggle = () => {
    void Haptics.selectionAsync();
    setExpanded((current) => !current);
  };

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: entry.isActive ? palette.gold : palette.panelBorder,
          backgroundColor: palette.panel,
          opacity: entry.unlocked ? 1 : 0.72,
        },
      ]}>
      <Pressable onPress={handleToggle} style={styles.header}>
        <Text style={styles.icon}>{entry.icon}</Text>
        <View style={styles.headerCopy}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: palette.bone }]} numberOfLines={1}>
              {entry.name}
            </Text>
            <Text style={[styles.statusBadge, { color: entry.isActive ? palette.gold : palette.fog }]}>
              {entry.unlocked ? (entry.isActive ? 'ACTIVE' : 'OPEN') : 'LOCKED'}
            </Text>
          </View>
          {entry.unlocked ? (
            <Text style={[styles.storyLine, { color: palette.fog }]} numberOfLines={2}>
              {entry.activeSagaTitle
                ? `${entry.activeSagaTitle}${entry.activeChapterTitle ? ` · ${entry.activeChapterTitle}` : ''}`
                : 'No active storyline yet.'}
            </Text>
          ) : (
            <Text style={[styles.storyLine, { color: palette.fog }]} numberOfLines={2}>
              {entry.unlockHint ?? 'Complete the previous world to unlock.'}
            </Text>
          )}
        </View>
        <Text style={[styles.chevron, { color: palette.gold }]}>{expanded ? '−' : '+'}</Text>
      </Pressable>

      {entry.unlocked ? (
        <>
          <View style={styles.statRow}>
            <MiniStat label={entry.standingLabel} value={String(entry.standingValue)} palette={palette} />
            <MiniStat label={entry.rankLabel} value={entry.rankTitle} palette={palette} />
            <MiniStat
              label={entry.progressLabel}
              value={`${entry.chaptersCompleted}/${entry.totalChapters}`}
              palette={palette}
            />
          </View>

          <View style={[styles.track, { backgroundColor: palette.night }]}>
            <View
              style={[
                styles.fill,
                {
                  width: `${Math.max(4, Math.round(chapterProgress * 100))}%`,
                  backgroundColor: palette.primary,
                },
              ]}
            />
          </View>

          <Text style={[styles.metaLine, { color: palette.fog }]}>
            {entry.sagasCompleted}/{entry.playableSagas} sagas · {entry.storyUnlocksEarned}/
            {entry.storyUnlocksTotal} story unlocks · {entry.relationshipsEngaged} allies engaged
          </Text>
        </>
      ) : null}

      {expanded && entry.unlocked ? (
        <View style={styles.expanded}>
          {sagaSummaries.length > 0 ? (
            <View style={styles.sagaBlock}>
              <Text style={[styles.sagaBlockLabel, { color: palette.gold }]}>SAGA DETAIL</Text>
              <View style={styles.sagaList}>
                {sagaSummaries.map((saga) => (
                  <View
                    key={saga.sagaId}
                    style={[styles.sagaRow, { borderColor: palette.panelBorder }]}>
                    <Text style={[styles.sagaTitle, { color: palette.bone }]} numberOfLines={2}>
                      {saga.title}
                      {saga.complete ? ' ✓' : ''}
                    </Text>
                    <Text style={[styles.sagaMeta, { color: palette.fog }]}>
                      {saga.completedChapters}/{saga.totalChapters} chapters
                      {saga.activeChapterTitle ? ` · ${saga.activeChapterTitle}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ) : null}

          {engagedCharacters.length > 0 ? (
            <View style={styles.relationshipBlock}>
              <Text style={[styles.relationshipLabel, { color: palette.gold }]}>ALLIES</Text>
              {engagedCharacters.map(({ character, affinity }, index) => (
                <CharacterCard key={character.id} character={character} index={index} affinity={affinity} />
              ))}
            </View>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

function MiniStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: UniverseProgressPanelProps['palette'];
}) {
  return (
    <View style={[styles.miniStat, { borderColor: palette.panelBorder }]}>
      <Text style={[styles.miniLabel, { color: palette.fog }]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.miniValue, { color: palette.bone }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  icon: {
    fontSize: 22,
    marginTop: 2,
  },
  headerCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  name: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    flex: 1,
  },
  statusBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
    flexShrink: 0,
  },
  storyLine: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
  },
  chevron: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 18,
    lineHeight: 20,
    flexShrink: 0,
  },
  statRow: {
    flexDirection: 'row',
    gap: 6,
  },
  miniStat: {
    flex: 1,
    borderWidth: 1,
    padding: 6,
    gap: 2,
    minWidth: 0,
  },
  miniLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 7,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  miniValue: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
  },
  track: {
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 2,
  },
  metaLine: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 0.3,
    lineHeight: 13,
  },
  expanded: {
    gap: 8,
    paddingTop: 4,
  },
  sagaBlock: {
    gap: 6,
  },
  sagaBlockLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.5,
  },
  sagaList: {
    gap: 6,
  },
  sagaRow: {
    borderWidth: 1,
    padding: 8,
    gap: 3,
  },
  sagaTitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
  },
  sagaMeta: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    lineHeight: 13,
  },
  relationshipBlock: {
    gap: 6,
  },
  relationshipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.5,
  },
});
