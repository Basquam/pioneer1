import { type Href, router } from 'expo-router';
import { Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

const RESET_CONFIRM_MESSAGE =
  'This will erase all local save data and return you to onboarding:\n\n' +
  '• XP, level, and reputation\n' +
  '• Completed quests and chapters\n' +
  '• User-created quests\n' +
  '• Character relationships\n' +
  '• Villain influence\n' +
  '• Unlocked rewards\n\n' +
  'This cannot be undone.';

type DevToolButton = {
  label: string;
  hint: string;
  onPress: () => void;
  destructive?: boolean;
};

export function DevToolsPanel() {
  const {
    activeUniverse,
    devAddXp,
    devCompleteCurrentChapter,
    devUnlockVultureGangChapters,
    devUnlockIronRailwayCompany,
    devUnlockNeuroNet,
    devSwitchToNeuroNet,
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
      const confirmed = window.confirm(`Reset Progress\n\n${RESET_CONFIRM_MESSAGE}`);
      if (confirmed) void performReset();
      return;
    }

    Alert.alert('Reset Progress', RESET_CONFIRM_MESSAGE, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void performReset() },
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
      hint: 'Clear all bounties and advance the saga trail',
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
      label: 'SWITCH TO NEURONET',
      hint: 'Jump to Ghost Protocol preview (Coming Soon state)',
      onPress: devSwitchToNeuroNet,
    },
    {
      label: 'SWITCH TO DUST & IRON',
      hint: 'Restore previous Dust & Iron saga/chapter when available',
      onPress: devSwitchToDustAndIron,
    },
    {
      label: 'RESET PROGRESS',
      hint: 'Clears AsyncStorage and restores Dust & Iron · Chapter I',
      onPress: handleReset,
      destructive: true,
    },
  ];

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: `${palette.primary}12`, borderColor: palette.primary },
      ]}>
      <Text style={[styles.sectionLabel, { color: palette.primary }]}>DEV / TESTING</Text>
      <Text style={[styles.sectionHint, { color: palette.fog }]}>
        MVP shortcuts — hidden in production builds.
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
  toolButton: {
    borderWidth: 1,
    padding: 12,
    gap: 4,
    transform: [{ skewX: '-3deg' }],
  },
  toolLabel: { fontFamily: GameFonts.ui, fontSize: 12, letterSpacing: 2 },
  toolHint: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 0.5, lineHeight: 13 },
});
