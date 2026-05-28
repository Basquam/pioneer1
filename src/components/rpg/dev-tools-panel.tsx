import { type Href, router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

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
    resetProgress,
  } = useGame();
  const { palette } = activeUniverse;

  if (!__DEV__) return null;

  const performReset = async () => {
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

  const tools: DevToolButton[] = [
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
      label: 'RESET PROGRESS',
      hint: 'Erases all save data and restarts onboarding. Permanent.',
      onPress: handleReset,
      destructive: true,
    },
  ];

  return (
    embedded ? (
      <View style={styles.embeddedBody}>
        <Text style={[styles.sectionHint, { color: palette.fog }]}>
          Dev shortcuts — hidden in production builds.
        </Text>
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
      <Text style={[styles.sectionLabel, { color: palette.primary }]}>DEV / TESTING</Text>
      <Text style={[styles.sectionHint, { color: palette.fog }]}>
        Dev shortcuts — hidden in production builds.
      </Text>

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
