import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AmbientAudioToggle } from '@/components/rpg/ambient-audio-toggle';
import { AudioDevTools } from '@/components/rpg/audio-dev-tools';
import { CharacterCard } from '@/components/rpg/character-card';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { DailyStreakDisplay } from '@/components/rpg/daily-streak-display';
import { BecomingPathPanel } from '@/components/rpg/identity-evidence-panel';
import { IdentityCompassSheet } from '@/components/rpg/identity-compass-sheet';
import { QuestStyleSheet } from '@/components/rpg/quest-style-sheet';
import { ReminderPreferencesSheet } from '@/components/rpg/reminder-preferences-sheet';
import { EvidenceTimelinePanel } from '@/components/rpg/evidence-timeline-panel';
import { MomentumReservePanel } from '@/components/rpg/momentum-reserve-panel';
import { TodayFocusDisplay } from '@/components/rpg/today-focus-display';
import { WeeklyRecapCard } from '@/components/rpg/weekly-recap-card';
import { MonthlySeasonReportCard } from '@/components/rpg/monthly-season-report-card';
import { MinimumViableDayProfileStat } from '@/components/rpg/minimum-viable-day-profile-stat';
import { RoutineMaintenancePanel } from '@/components/rpg/routine-maintenance-panel';
import { FeatureDiscoverySettings } from '@/components/rpg/feature-discovery-settings';
import { FeatureDiscoveryGate } from '@/components/rpg/feature-discovery-gate';
import {
  FeatureDiscoveryBadge,
  FeatureDiscoveryHint,
} from '@/components/rpg/feature-discovery-badge';
import { isFeatureNewlyIntroduced } from '@/lib/feature-discovery';
import { QuestCalendarPanel } from '@/components/rpg/quest-calendar-panel';
import { SystemsInsightPanel } from '@/components/rpg/systems-insight-panel';
import { GoldilocksCoachPanel } from '@/components/rpg/goldilocks-coach-panel';
import { DailyShutdownBanner } from '@/components/rpg/daily-shutdown-banner';
import { DevToolsPanel } from '@/components/rpg/dev-tools-panel';
import { GlossaryHelpButton } from '@/components/rpg/glossary-help-button';
import { GlossarySheet } from '@/components/rpg/glossary-sheet';
import { QuestDefaultsPanel } from '@/components/rpg/quest-defaults-panel';
import { RecurringQuestsPanel } from '@/components/rpg/recurring-quests-panel';
import { ProfileAppInfo } from '@/components/rpg/profile-app-info';
import { ProcessAchievementsPanel } from '@/components/rpg/process-achievements-panel';
import { ProfileSection } from '@/components/rpg/profile-section';
import { ProgressBackupPanel } from '@/components/rpg/progress-backup-panel';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { getCompletedChapterCountForSaga } from '@/lib/chapter-progress';
import {
  formatOnboardingStartedOn,
  getSagaTitleById,
  getUniverseNameById,
} from '@/lib/onboarding-origin-display';
import { getUnlockedRewardEntries, isSagaUnlocked, REWARD_TYPE_LABELS } from '@/lib/reward-unlocks';
import { formatQuestStyleSummary } from '@/lib/quest-style-profile';
import { sanitizeReminderPreferences } from '@/lib/reminder-preferences';
import { getSagaActiveChapter } from '@/lib/saga-progress';

export function ProfileScreen() {
  const ui = useUniverseUiCopy();
  const [glossaryVisible, setGlossaryVisible] = useState(false);
  const [identityCompassVisible, setIdentityCompassVisible] = useState(false);
  const [questStyleVisible, setQuestStyleVisible] = useState(false);
  const [reminderPrefsVisible, setReminderPrefsVisible] = useState(false);
  const {
    activeUniverse,
    activeSaga,
    player,
    characters,
    playerProgress,
    completedQuestCount,
    quests,
  } = useGame();
  const reminderPrefs = sanitizeReminderPreferences(playerProgress.reminderPreferences);

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

  const onboardingOrigin = useMemo(() => {
    const { firstUniverseId, firstSagaId, onboardingCompletedAt } = playerProgress;
    if (!firstUniverseId || !firstSagaId) return null;

    return {
      universeName: getUniverseNameById(firstUniverseId) ?? firstUniverseId,
      sagaTitle: getSagaTitleById(firstSagaId) ?? firstSagaId,
      startedOn: onboardingCompletedAt ? formatOnboardingStartedOn(onboardingCompletedAt) : null,
    };
  }, [playerProgress]);

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScreenScroll>
        <Animated.View entering={FadeInDown.duration(500)}>
          <SectionHeader eyebrow={ui.operativeFileEyebrow} title="PROFILE" />
        </Animated.View>

        <ProfileSection title="PLAYER PROGRESS" style={styles.firstSection}>
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
            <StatBox label="MISSIONS" value={`${completedQuestCount}/${quests.length}`} colors={activeUniverse.palette} />
            <StatBox label={ui.reputationLabel} value={`${player.reputation}`} colors={activeUniverse.palette} />
          </View>

          {onboardingOrigin ? (
            <View style={styles.originBlock}>
              <OriginRow
                label="First Universe"
                value={onboardingOrigin.universeName}
                colors={activeUniverse.palette}
              />
              <OriginRow
                label="First Storyline"
                value={onboardingOrigin.sagaTitle}
                colors={activeUniverse.palette}
              />
              {onboardingOrigin.startedOn ? (
                <OriginRow
                  label="Started On"
                  value={onboardingOrigin.startedOn}
                  colors={activeUniverse.palette}
                />
              ) : null}
            </View>
          ) : null}

          {unlockedSagas.length > 0 ? (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionLabel, { color: activeUniverse.palette.gold }]}>SAGA PROGRESS</Text>
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
                      {ui.sagaProgressMeta(completedChapters, totalChapters, activeChapter?.title)}
                    </Text>
                  </View>
                );
              })}
            </View>
          ) : null}
        </ProfileSection>

        <ProfileSection
          title="BECOMING"
          hint="Every quest is evidence of who you are becoming.">
          {isFeatureNewlyIntroduced(playerProgress, 'identityVotes') ? (
            <FeatureDiscoveryHint
              hint="Each completed quest adds a quiet vote for who you are becoming."
              showTryThis
              palette={activeUniverse.palette}
            />
          ) : null}
          <Pressable
            onPress={() => setIdentityCompassVisible(true)}
            style={[styles.compassEditButton, { borderColor: activeUniverse.palette.gold }]}>
            <Text style={[styles.compassEditLabel, { color: activeUniverse.palette.gold }]}>
              EDIT IDENTITY COMPASS
            </Text>
          </Pressable>
          <BecomingPathPanel />
        </ProfileSection>

        <ProfileSection title="EVIDENCE TIMELINE" hint="Small wins become proof.">
          <EvidenceTimelinePanel />
        </ProfileSection>

        <ProfileSection title="STORED EFFORT" hint="Progress you cannot see yet still counts.">
          <MomentumReservePanel />
        </ProfileSection>

        <ProfileSection title="HABITS & REFLECTION">
          <DailyStreakDisplay variant="profile" />
          <MinimumViableDayProfileStat />
          <TodayFocusDisplay variant="profile" />
          <QuestCalendarPanel />
          <FeatureDiscoveryGate
            progress={playerProgress}
            feature="systemsInsight"
            palette={activeUniverse.palette}>
            <SystemsInsightPanel onEditIdentityCompass={() => setIdentityCompassVisible(true)} />
          </FeatureDiscoveryGate>
          <GoldilocksCoachPanel />
          <FeatureDiscoveryGate
            progress={playerProgress}
            feature="tomorrowSetup"
            palette={activeUniverse.palette}>
            <DailyShutdownBanner variant="profile" />
          </FeatureDiscoveryGate>
          <FeatureDiscoveryGate
            progress={playerProgress}
            feature="weeklyReview"
            palette={activeUniverse.palette}>
            <WeeklyRecapCard />
          </FeatureDiscoveryGate>
          <MonthlySeasonReportCard />
          <RoutineMaintenancePanel />
        </ProfileSection>

        <ProfileSection title="RECURRING QUESTS">
          <FeatureDiscoveryGate
            progress={playerProgress}
            feature="recurringQuest"
            palette={activeUniverse.palette}>
            <RecurringQuestsPanel />
          </FeatureDiscoveryGate>
        </ProfileSection>

        <ProfileSection title="RELATIONSHIPS">
          {characters.map((character, i) => (
            <CharacterCard
              key={character.id}
              character={character}
              index={i}
              affinity={playerProgress.characterAffinity[character.id] ?? 0}
            />
          ))}
        </ProfileSection>

        <ProfileSection title="PROCESS ACHIEVEMENTS" hint="Marks for using healthy behavior systems.">
          <ProcessAchievementsPanel />
        </ProfileSection>

        <ProfileSection title="REWARDS / UNLOCKS">
          {unlockedRewards.length === 0 ? (
            <CinematicEmptyState
              title="No rewards yet."
              message={ui.unlockRewardsEmptyMessage}
              primaryLabel={ui.viewStoryTrailLabel}
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
        </ProfileSection>

        <ProfileSection title="SETTINGS">
          <FeatureDiscoverySettings />
          <Pressable
            onPress={() => setQuestStyleVisible(true)}
            style={[styles.questStyleButton, { borderColor: activeUniverse.palette.panelBorder, backgroundColor: activeUniverse.palette.panel }]}>
            <View style={styles.questStyleCopy}>
              <Text style={[styles.questStyleTitle, { color: activeUniverse.palette.bone }]}>Quest Style</Text>
              <Text style={[styles.questStyleSubtitle, { color: activeUniverse.palette.fog }]}>
                Tune the app to the way you actually start.
              </Text>
            </View>
            <Text style={[styles.questStyleValue, { color: activeUniverse.palette.gold }]}>
              {formatQuestStyleSummary(playerProgress.questStyleProfile)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setReminderPrefsVisible(true)}
            style={[styles.questStyleButton, { borderColor: activeUniverse.palette.panelBorder, backgroundColor: activeUniverse.palette.panel }]}>
            <View style={styles.questStyleCopy}>
              <Text style={[styles.questStyleTitle, { color: activeUniverse.palette.bone }]}>Reminder Preferences</Text>
              <Text style={[styles.questStyleSubtitle, { color: activeUniverse.palette.fog }]}>
                Optional local cues for important quests.
              </Text>
            </View>
            <Text style={[styles.questStyleValue, { color: activeUniverse.palette.gold }]}>
              {reminderPrefs.remindersEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
          <GlossaryHelpButton onPress={() => setGlossaryVisible(true)} />
          <AmbientAudioToggle />
          {__DEV__ ? <AudioDevTools /> : null}
        </ProfileSection>

        <ProfileSection title="QUEST DEFAULTS" hint="Optional automation for new quests.">
          <QuestDefaultsPanel />
        </ProfileSection>

        <GlossarySheet visible={glossaryVisible} onClose={() => setGlossaryVisible(false)} />
        <IdentityCompassSheet
          visible={identityCompassVisible}
          onClose={() => setIdentityCompassVisible(false)}
        />
        <QuestStyleSheet visible={questStyleVisible} onClose={() => setQuestStyleVisible(false)} />
        <ReminderPreferencesSheet
          visible={reminderPrefsVisible}
          onClose={() => setReminderPrefsVisible(false)}
        />

        <ProfileSection title="BACKUP" badge="experimental">
          <ProgressBackupPanel embedded />
        </ProfileSection>

        {__DEV__ ? (
          <ProfileSection title="DEV / TESTING" badge="dev">
            <DevToolsPanel embedded />
          </ProfileSection>
        ) : null}

        <ProfileSection title="APP INFO">
          <ProfileAppInfo />
        </ProfileSection>
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

function OriginRow({
  label,
  value,
  colors,
}: {
  label: string;
  value: string;
  colors: { fog: string; bone: string };
}) {
  return (
    <View style={styles.originRow}>
      <Text style={[styles.originLabel, { color: colors.fog }]}>{label}</Text>
      <Text style={[styles.originValue, { color: colors.bone }]} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  firstSection: {
    marginTop: 0,
  },
  compassEditButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    transform: [{ skewX: '-4deg' }],
    marginBottom: 4,
  },
  compassEditLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
  questStyleButton: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
    marginBottom: 4,
  },
  questStyleCopy: {
    gap: 4,
  },
  questStyleTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  questStyleSubtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  questStyleValue: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.8,
  },
  card: {
    alignItems: 'center',
    padding: 20,
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
  originBlock: { gap: 6, paddingTop: 2 },
  originRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  originLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
    flexShrink: 0,
  },
  originValue: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.3,
    lineHeight: 14,
    textAlign: 'right',
    flex: 1,
    minWidth: 0,
  },
  subsection: { gap: 8 },
  subsectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
    marginBottom: 2,
  },
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
