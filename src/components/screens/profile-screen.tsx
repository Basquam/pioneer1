import { type Href, router } from 'expo-router';
import { useMemo, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { AmbientAudioToggle } from '@/components/rpg/ambient-audio-toggle';
import { AudioDevTools } from '@/components/rpg/audio-dev-tools';
import { ChapterRewardBadge } from '@/components/rpg/chapter-reward-badge';
import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { DailyStreakDisplay } from '@/components/rpg/daily-streak-display';
import { BecomingPathPanel } from '@/components/rpg/identity-evidence-panel';
import { IdentityCompassSheet } from '@/components/rpg/identity-compass-sheet';
import { QuestStyleSheet } from '@/components/rpg/quest-style-sheet';
import { ReminderPreferencesSheet } from '@/components/rpg/reminder-preferences-sheet';
import { EvidenceTimelinePanel } from '@/components/rpg/evidence-timeline-panel';
import { GlobalProgressPanel } from '@/components/rpg/global-progress-panel';
import { UniverseProgressPanel } from '@/components/rpg/universe-progress-panel';
import { TodayFocusDisplay } from '@/components/rpg/today-focus-display';
import { WeeklyRecapCard } from '@/components/rpg/weekly-recap-card';
import { MonthlySeasonReportCard } from '@/components/rpg/monthly-season-report-card';
import { MinimumViableDayProfileStat } from '@/components/rpg/minimum-viable-day-profile-stat';
import { RoutineMaintenancePanel } from '@/components/rpg/routine-maintenance-panel';
import { FeatureDiscoverySettings } from '@/components/rpg/feature-discovery-settings';
import { FeatureDiscoveryGate } from '@/components/rpg/feature-discovery-gate';
import { FeatureDiscoveryHint } from '@/components/rpg/feature-discovery-badge';
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
import { MascotPreferenceSettings } from '@/components/rpg/mascot-preference-settings';
import { ProfileAppInfo } from '@/components/rpg/profile-app-info';
import { ProcessAchievementsPanel } from '@/components/rpg/process-achievements-panel';
import { SuiteMasteryPanel } from '@/components/rpg/suite-mastery-panel';
import { ProfileSection } from '@/components/rpg/profile-section';
import { ProgressBackupPanel } from '@/components/rpg/progress-backup-panel';
import { ScreenScroll } from '@/components/rpg/screen-scroll';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import {
  GLOBAL_PROGRESS_HINT,
  SUITE_MASTERY_HINT,
  UNIVERSE_PROGRESS_HINT,
} from '@/constants/profile-universe-labels';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import {
  formatOnboardingStartedOn,
  getSagaTitleById,
  getUniverseNameById,
} from '@/lib/onboarding-origin-display';
import { getUnlockedRewardEntries, REWARD_TYPE_LABELS } from '@/lib/reward-unlocks';
import { formatQuestStyleSummary } from '@/lib/quest-style-profile';
import { sanitizeReminderPreferences } from '@/lib/reminder-preferences';

export function ProfileScreen() {
  const ui = useUniverseUiCopy();
  const [glossaryVisible, setGlossaryVisible] = useState(false);
  const [identityCompassVisible, setIdentityCompassVisible] = useState(false);
  const [questStyleVisible, setQuestStyleVisible] = useState(false);
  const [reminderPrefsVisible, setReminderPrefsVisible] = useState(false);
  const { activeUniverse, player, playerProgress } = useGame();
  const reminderPrefs = sanitizeReminderPreferences(playerProgress.reminderPreferences);
  const palette = activeUniverse.palette;

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

        <ProfileSection title="GLOBAL PROGRESS" hint={GLOBAL_PROGRESS_HINT} style={styles.firstSection}>
          <GlobalProgressPanel progress={playerProgress} totalXp={player.totalXp} palette={palette} />
          {onboardingOrigin ? (
            <View style={styles.originBlock}>
              <OriginRow label="First world" value={onboardingOrigin.universeName} colors={palette} />
              <OriginRow label="First saga" value={onboardingOrigin.sagaTitle} colors={palette} />
              {onboardingOrigin.startedOn ? (
                <OriginRow label="Started" value={onboardingOrigin.startedOn} colors={palette} />
              ) : null}
            </View>
          ) : null}
        </ProfileSection>

        <ProfileSection title="UNIVERSE PROGRESS" hint={UNIVERSE_PROGRESS_HINT}>
          <UniverseProgressPanel
            progress={playerProgress}
            activeUniverseId={activeUniverse.id}
            palette={palette}
          />
        </ProfileSection>

        <ProfileSection title="SUITE MASTERY" hint={SUITE_MASTERY_HINT} collapsible defaultExpanded>
          <SuiteMasteryPanel progress={playerProgress} palette={palette} />
        </ProfileSection>

        <ProfileSection
          title="IDENTITY / BECOMING"
          hint="Every quest is evidence of who you are becoming."
          collapsible
          defaultExpanded>
          {isFeatureNewlyIntroduced(playerProgress, 'identityVotes') ? (
            <FeatureDiscoveryHint
              hint="Each completed quest adds a quiet vote for who you are becoming."
              feature="identityVotes"
              showTryThis
              palette={palette}
            />
          ) : null}
          <Pressable
            onPress={() => setIdentityCompassVisible(true)}
            style={[styles.compassEditButton, { borderColor: palette.gold }]}>
            <Text style={[styles.compassEditLabel, { color: palette.gold }]}>EDIT IDENTITY COMPASS</Text>
          </Pressable>
          <BecomingPathPanel />
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>EVIDENCE TIMELINE</Text>
            <EvidenceTimelinePanel />
          </View>
        </ProfileSection>

        <ProfileSection title="REWARDS / ACHIEVEMENTS" collapsible defaultExpanded={false}>
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>PROCESS ACHIEVEMENTS</Text>
            <ProcessAchievementsPanel />
          </View>
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>UNLOCKS</Text>
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
                    { backgroundColor: palette.panel, borderColor: palette.panelBorder },
                  ]}>
                  <ChapterRewardBadge reward={reward} palette={palette} size="sm" />
                  <View style={styles.rewardCopy}>
                    <Text style={[styles.rewardType, { color: palette.accent }]}>
                      {REWARD_TYPE_LABELS[reward.type]}
                    </Text>
                    <Text style={[styles.rewardName, { color: palette.bone }]} numberOfLines={2}>
                      {reward.name}
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>
        </ProfileSection>

        <ProfileSection title="HABITS & REFLECTION" collapsible defaultExpanded={false}>
          <DailyStreakDisplay variant="profile" />
          <MinimumViableDayProfileStat />
          <TodayFocusDisplay variant="profile" />
          <QuestCalendarPanel />
          <FeatureDiscoveryGate progress={playerProgress} feature="systemsInsight" palette={palette}>
            <SystemsInsightPanel onEditIdentityCompass={() => setIdentityCompassVisible(true)} />
          </FeatureDiscoveryGate>
          <GoldilocksCoachPanel />
          <FeatureDiscoveryGate progress={playerProgress} feature="tomorrowSetup" palette={palette}>
            <DailyShutdownBanner variant="profile" />
          </FeatureDiscoveryGate>
          <FeatureDiscoveryGate progress={playerProgress} feature="weeklyReview" palette={palette}>
            <WeeklyRecapCard />
          </FeatureDiscoveryGate>
          <MonthlySeasonReportCard />
          <RoutineMaintenancePanel />
          <FeatureDiscoveryGate progress={playerProgress} feature="recurringQuest" palette={palette}>
            <View style={styles.subsection}>
              <Text style={[styles.subsectionLabel, { color: palette.gold }]}>RECURRING QUESTS</Text>
              <RecurringQuestsPanel />
            </View>
          </FeatureDiscoveryGate>
        </ProfileSection>

        <ProfileSection title="SETTINGS / BACKUP / DEV TOOLS" collapsible defaultExpanded={false}>
          <MascotPreferenceSettings />
          <FeatureDiscoverySettings />
          <Pressable
            onPress={() => setQuestStyleVisible(true)}
            style={[
              styles.settingsButton,
              { borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: palette.bone }]}>Quest Style</Text>
              <Text style={[styles.settingsSubtitle, { color: palette.fog }]}>
                Tune the app to the way you actually start.
              </Text>
            </View>
            <Text style={[styles.settingsValue, { color: palette.gold }]}>
              {formatQuestStyleSummary(playerProgress.questStyleProfile)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setReminderPrefsVisible(true)}
            style={[
              styles.settingsButton,
              { borderColor: palette.panelBorder, backgroundColor: palette.panel },
            ]}>
            <View style={styles.settingsCopy}>
              <Text style={[styles.settingsTitle, { color: palette.bone }]}>Reminder Preferences</Text>
              <Text style={[styles.settingsSubtitle, { color: palette.fog }]}>
                Optional local cues for important quests.
              </Text>
            </View>
            <Text style={[styles.settingsValue, { color: palette.gold }]}>
              {reminderPrefs.remindersEnabled ? 'On' : 'Off'}
            </Text>
          </Pressable>
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>QUEST DEFAULTS</Text>
            <QuestDefaultsPanel />
          </View>
          <GlossaryHelpButton onPress={() => setGlossaryVisible(true)} />
          <AmbientAudioToggle />
          {__DEV__ ? <AudioDevTools /> : null}
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>BACKUP</Text>
            <ProgressBackupPanel embedded />
          </View>
          {__DEV__ ? (
            <View style={styles.subsection}>
              <Text style={[styles.subsectionLabel, { color: palette.primary }]}>DEV / TESTING</Text>
              <DevToolsPanel embedded />
            </View>
          ) : null}
          <View style={styles.subsection}>
            <Text style={[styles.subsectionLabel, { color: palette.gold }]}>APP INFO</Text>
            <ProfileAppInfo />
          </View>
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
      </ScreenScroll>
    </ScreenShell>
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
  settingsButton: {
    borderWidth: 1,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
    marginBottom: 4,
  },
  settingsCopy: {
    gap: 4,
  },
  settingsTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  settingsSubtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  settingsValue: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.8,
  },
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
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
    transform: [{ skewX: '-2deg' }],
  },
  rewardCopy: { flex: 1, gap: 4, minWidth: 0 },
  rewardType: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  rewardName: { fontFamily: GameFonts.ui, fontSize: 15, letterSpacing: 1, lineHeight: 20 },
});
