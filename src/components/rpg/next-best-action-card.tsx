import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GlowButton } from '@/components/rpg/glow-button';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  getNextBestAction,
  isNextBestActionDismissedToday,
  type NextBestAction,
} from '@/lib/next-best-action';

export function NextBestActionCard() {
  const {
    activeUniverse,
    playerProgress,
    quests,
    dismissNextBestActionForToday,
    openRecoveryQuestSheet,
    openQuestFocus,
    convertInboxItem,
    openAddQuestSheet,
    openDailyShutdown,
    requestQuestBoardTab,
    requestHqScrollToDailyAwareness,
    activateMinimumViableDay,
    doOneSmallQuest,
  } = useGame();
  const { palette } = activeUniverse;

  const action = useMemo(() => {
    const remainingChapterBounties = quests.filter(
      (quest) => quest.source === 'template' && !quest.completed,
    ).length;

    return getNextBestAction({
      progress: playerProgress,
      universeId: activeUniverse.id,
      remainingChapterBounties,
    });
  }, [activeUniverse.id, playerProgress, quests]);

  if (isNextBestActionDismissedToday(playerProgress)) {
    return null;
  }

  const handleDismiss = () => {
    void Haptics.selectionAsync();
    dismissNextBestActionForToday();
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    executeNextBestAction(action, {
      openRecoveryQuestSheet,
      openQuestFocus,
      convertInboxItem,
      openAddQuestSheet,
      openDailyShutdown,
      requestQuestBoardTab,
      requestHqScrollToDailyAwareness,
      activateMinimumViableDay,
      doOneSmallQuest,
    });
  };

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: palette.night, borderColor: palette.gold },
      ]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.gold }]}>NEXT BEST ACTION</Text>
        <Pressable onPress={handleDismiss} hitSlop={12}>
          <Text style={[styles.dismiss, { color: palette.fog }]}>Not today</Text>
        </Pressable>
      </View>

      <Text style={[styles.flavor, { color: palette.fog }]}>{action.universeFlavor}</Text>
      <Text style={[styles.title, { color: palette.bone }]}>{action.title}</Text>
      <Text style={[styles.description, { color: palette.fog }]}>{action.description}</Text>

      <GlowButton label={action.ctaLabel} hint="One clear move" onPress={handlePress} />
    </View>
  );
}

function executeNextBestAction(
  action: NextBestAction,
  handlers: {
    openRecoveryQuestSheet: () => void;
    openQuestFocus: (questId: string) => void;
    convertInboxItem: (inboxItemId: string) => void;
    openAddQuestSheet: () => void;
    openDailyShutdown: () => void;
    requestQuestBoardTab: (tab: 'review' | 'chapter' | 'today') => void;
    requestHqScrollToDailyAwareness: () => void;
    activateMinimumViableDay: () => void;
    doOneSmallQuest: () => void;
  },
) {
  switch (action.actionType) {
    case 'recovery-quest':
      handlers.openRecoveryQuestSheet();
      return;
    case 'daily-awareness':
      handlers.requestHqScrollToDailyAwareness();
      return;
    case 'activate-minimum-day':
      handlers.activateMinimumViableDay();
      return;
    case 'do-one-small-quest':
      if (action.targetQuestId && action.route === '/(game)/quests') {
        router.push('/(game)/quests' as Href);
        handlers.openQuestFocus(action.targetQuestId);
        return;
      }
      handlers.doOneSmallQuest();
      return;
    case 'locked-focus':
    case 'continue-started':
      if (action.targetQuestId) {
        if (action.route === '/(game)/quests') {
          router.push('/(game)/quests' as Href);
        }
        handlers.openQuestFocus(action.targetQuestId);
      }
      return;
    case 'review-stale':
      if (action.questBoardTab) {
        handlers.requestQuestBoardTab(action.questBoardTab);
      }
      router.push('/(game)/quests' as Href);
      return;
    case 'convert-inbox':
      if (action.targetInboxItemId) {
        handlers.convertInboxItem(action.targetInboxItemId);
      }
      return;
    case 'add-quest':
      router.push('/(game)/quests' as Href);
      handlers.openAddQuestSheet();
      return;
    case 'advance-story':
      if (action.questBoardTab) {
        handlers.requestQuestBoardTab(action.questBoardTab);
      }
      router.push('/(game)/quests' as Href);
      return;
    case 'daily-shutdown':
      handlers.openDailyShutdown();
      return;
    case 'weekly-review':
    case 'monthly-review':
      router.push('/(game)/profile' as Href);
      return;
    case 'open-quest-board':
    default:
      router.push('/(game)/quests' as Href);
      return;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 2,
    padding: 14,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2.5,
  },
  dismiss: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 16,
    lineHeight: 21,
    letterSpacing: 0.4,
  },
  description: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
  },
});
