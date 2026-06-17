import { type Href, router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
    getInternalToolsSectionHint,
    getInternalToolsSectionLabel,
    IS_PREVIEW_INTERNAL_TOOLS,
    SHOW_INTERNAL_TOOLS,
} from '@/lib/internal-test-tools';
import { testSaveMigration } from '@/lib/player-progress-migration';
import { restorePlayerProgress } from '@/lib/player-progress-storage';
import { trackResetProgressUsed } from '@/lib/analytics/questory-analytics';
import { crashForTest, reportError } from '@/lib/crash/crash-service';

const RESET_CONFIRM_TITLE = 'Erase All Progress?';
const RESET_CONFIRM_MESSAGE =
  'This erases all local save data and sends you back to onboarding.\n\n' +
  'You will lose:\n' +
  '• XP, level, and standing\n' +
  '• Completed chapters and quests\n' +
  '• Personal quests and relationships\n' +
  '• Villain progress and unlocked rewards\n\n' +
  'This is permanent. There is no undo.';

type DevToolButton = {
  label: string;
  hint: string;
  onPress: () => void;
  destructive?: boolean;
};

export function DevToolsPanel({ embedded = false }: { embedded?: boolean }) {
  const {
    activeUniverse,
    devAddXp,
    devCompleteCurrentChapter,
    devUnlockVultureGangChapters,
    devUnlockIronRailwayCompany,
    devUnlockNeuroNet,
    devUnlockNeonAshes,
    devSwitchToNeuroNet,
    devSwitchToNeonAshes,
    devSwitchToDustAndIron,
    devUnlockTodayFocus,
    resetProgress,
  } = useGame();
  const { palette } = activeUniverse;

  if (!SHOW_INTERNAL_TOOLS) return null;

  const sectionLabel = getInternalToolsSectionLabel();
  const sectionHint = getInternalToolsSectionHint();

  const performReset = async () => {
    trackResetProgressUsed();
    await resetProgress();
    router.replace('/onboarding' as Href);
  };

  const handleReset = () => {
    if (Platform.OS === 'web') {
      const confirmed = window.confirm(`${RESET_CONFIRM_TITLE}\n\n${RESET_CONFIRM_MESSAGE}`);
      if (confirmed) void performReset();
      return;
    }

    Alert.alert(RESET_CONFIRM_TITLE, RESET_CONFIRM_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Erase Everything', style: 'destructive', onPress: () => void performReset() },
    ]);
  };

  const handleTestSaveMigration = () => {
    const result = testSaveMigration(restorePlayerProgress);
    if (__DEV__) {
      console.log('[PlayerProgress] TEST SAVE MIGRATION', result);
    }

    if (Platform.OS === 'web') {
      window.alert(result.message);
      return;
    }

    Alert.alert(
      result.ok ? 'Migration Test Passed' : 'Migration Test Failed',
      result.message,
    );
  };

  const handleTestCrashReport = () => {
    reportError(new Error('Questory test crash report'), {
      feature: 'dev_tools',
      action: 'test_report',
    });

    if (Platform.OS === 'web') {
      window.alert('Test crash report sent (dev console on web).');
      return;
    }

    Alert.alert('Test Crash Report', 'Non-fatal test error reported to Crashlytics.');
  };

  const handleForceNativeCrash = () => {
    if (Platform.OS === 'web') {
      window.alert('Native crash test is unavailable on web.');
      return;
    }

    Alert.alert('Force Native Crash', 'This will crash the app for Crashlytics testing.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Crash', style: 'destructive', onPress: () => crashForTest() },
    ]);
  };

  const devCrashTools: DevToolButton[] = __DEV__
    ? [
        {
          label: 'TEST CRASH REPORT',
          hint: 'Send a non-fatal test error to Crashlytics',
          onPress: handleTestCrashReport,
        },
        {
          label: 'FORCE NATIVE CRASH',
          hint: 'Triggers a native Crashlytics test crash (dev only)',
          onPress: handleForceNativeCrash,
          destructive: true,
        },
      ]
    : [];

  const tools: DevToolButton[] = [
    ...devCrashTools,
    {
      label: 'TEST SAVE MIGRATION',
      hint: 'Simulate loading a legacy minimal save and verify migration',
      onPress: handleTestSaveMigration,
    },
    {
      label: 'ADD +100 XP',
      hint: 'Bump operative level for quick testing',
      onPress: () => devAddXp(100),
    },
    {
      label: 'COMPLETE CURRENT CHAPTER',
      hint: 'Clear all operations and advance the story trail',
      onPress: devCompleteCurrentChapter,
    },
    {
      label: 'UNLOCK ALL VULTURE GANG CHAPTERS',
      hint: 'Mark every Vulture Gang chapter as cleared',
      onPress: devUnlockVultureGangChapters,
    },
    {
      label: 'UNLOCK IRON RAILWAY COMPANY',
      hint: 'Grant the High Noon story unlock reward',
      onPress: devUnlockIronRailwayCompany,
    },
    {
      label: 'UNLOCK NEURONET',
      hint: 'Grant the NeuroNet universe unlock reward',
      onPress: devUnlockNeuroNet,
    },
    {
      label: 'UNLOCK NEON ASHES',
      hint: 'Grant the Neon Ashes universe unlock reward',
      onPress: devUnlockNeonAshes,
    },
    {
      label: 'SWITCH TO NEURONET',
      hint: 'Jump to NeuroNet and restore last Ghost Protocol sector',
      onPress: devSwitchToNeuroNet,
    },
    {
      label: 'SWITCH TO NEON ASHES',
      hint: 'Jump to Neon Ashes · Hollow Syndicate Case 1 (Cold File)',
      onPress: devSwitchToNeonAshes,
    },
    {
      label: 'SWITCH TO DUST & IRON',
      hint: 'Return to Dust & Iron and restore last active saga/chapter',
      onPress: devSwitchToDustAndIron,
    },
    {
      label: 'UNLOCK TODAY\'S FOCUS',
      hint: 'Clear focus lock for today (testing only)',
      onPress: devUnlockTodayFocus,
    },
    {
      label: 'RESET PROGRESS',
      hint: 'Erases all save data and restarts onboarding. Permanent.',
      onPress: handleReset,
      destructive: true,
    },
  ];

  return (
    embedded ? (
      <View style={styles.embeddedBody}>
        {IS_PREVIEW_INTERNAL_TOOLS ? (
          <Text style={[styles.previewWarning, { color: palette.primary }]}>Preview build only</Text>
        ) : null}
        <Text style={[styles.sectionHint, { color: palette.fog }]}>{sectionHint}</Text>
        {tools.map((tool) => (
          <Pressable
            key={tool.label}
            onPress={tool.onPress}
            style={[
              styles.toolButton,
              {
                borderColor: tool.destructive ? palette.primary : palette.panelBorder,
                backgroundColor: tool.destructive ? `${palette.primary}18` : palette.panel,
              },
            ]}>
            <Text style={[styles.toolLabel, { color: tool.destructive ? palette.primary : palette.bone }]}>
              {tool.label}
            </Text>
            <Text style={[styles.toolHint, { color: palette.fog }]} numberOfLines={2}>
              {tool.hint}
            </Text>
          </Pressable>
        ))}
      </View>
    ) : (
    <View
      style={[
        styles.panel,
        { backgroundColor: `${palette.primary}12`, borderColor: palette.primary },
      ]}>
      <Text style={[styles.sectionLabel, { color: palette.primary }]}>{sectionLabel}</Text>
      {IS_PREVIEW_INTERNAL_TOOLS ? (
        <Text style={[styles.previewWarning, { color: palette.primary }]}>Preview build only</Text>
      ) : null}
      <Text style={[styles.sectionHint, { color: palette.fog }]}>{sectionHint}</Text>

      {tools.map((tool) => (
        <Pressable
          key={tool.label}
          onPress={tool.onPress}
          style={[
            styles.toolButton,
            {
              borderColor: tool.destructive ? palette.primary : palette.panelBorder,
              backgroundColor: tool.destructive ? `${palette.primary}18` : palette.panel,
            },
          ]}>
          <Text style={[styles.toolLabel, { color: tool.destructive ? palette.primary : palette.bone }]}>
            {tool.label}
          </Text>
          <Text style={[styles.toolHint, { color: palette.fog }]} numberOfLines={2}>
            {tool.hint}
          </Text>
        </Pressable>
      ))}
    </View>
    )
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: GameLayout.panelPadding,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  sectionLabel: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3 },
  previewWarning: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  sectionHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
    lineHeight: 15,
    marginBottom: 4,
  },
  embeddedBody: { gap: 10 },
  toolButton: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-3deg' }],
  },
  toolLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  toolHint: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 0.5, lineHeight: 13 },
});
