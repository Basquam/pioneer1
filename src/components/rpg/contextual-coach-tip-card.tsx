import * as Haptics from 'expo-haptics';
import { type Href, router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CoachMascotTip } from '@/components/rpg/coach-mascot-tip';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTraitForCategory } from '@/lib/identity-votes';
import {
  getContextualCoachTip,
  type CoachTip,
  type CoachTipActionType,
} from '@/lib/contextual-coach-tip';
import {
  isNextBestActionDismissedToday,
  type NextBestAction,
} from '@/lib/next-best-action';
import { isFeatureUnlocked } from '@/lib/feature-discovery';
import { getLocalDateKey } from '@/lib/daily-streak';
import { getTomorrowSetupForDate } from '@/lib/tomorrow-setup';
import type { PlayerProgress } from '@/types/narrative';

export function ContextualCoachTipCard() {
  const {
    activeUniverse,
    playerProgress,
    dismissCoachTipForToday,
    openImproveQuest,
    openQuestFocus,
    requestQuestBoardTab,
    activateMinimumViableDay,
    convertInboxItem,
    openAddQuestFromTraitSuggestion,
  } = useGame();
  const { palette } = activeUniverse;
  const today = getLocalDateKey();

  const tip = useMemo(
    () =>
      getContextualCoachTip({
        progress: playerProgress,
        universeId: activeUniverse.id,
        today,
      }),
    [activeUniverse.id, playerProgress, today],
  );

  const nextBestActionVisible = useMemo(() => {
    if (isNextBestActionDismissedToday(playerProgress)) return false;
    return true;
  }, [playerProgress]);

  if (nextBestActionVisible) return null;

  if (!tip) return null;

  if (!isFeatureUnlocked(playerProgress, 'coachTips')) {
    return null;
  }

  const handleDismiss = () => {
    void Haptics.selectionAsync();
    dismissCoachTipForToday(tip.id);
  };

  const handlePress = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    executeCoachTipAction(tip, {
      playerProgress,
      today,
      openImproveQuest,
      openQuestFocus,
      requestQuestBoardTab,
      activateMinimumViableDay,
      convertInboxItem,
      openAddQuestFromTraitSuggestion,
    });
  };

  return (
    <View style={[styles.card, { backgroundColor: palette.night, borderColor: palette.accent }]}>
      <View style={styles.header}>
        <Text style={[styles.eyebrow, { color: palette.accent }]}>COACH TIP</Text>
        {tip.dismissible ? (
          <Pressable onPress={handleDismiss} hitSlop={12}>
            <Text style={[styles.dismiss, { color: palette.fog }]}>Not today</Text>
          </Pressable>
        ) : null}
      </View>

      <CoachMascotTip
        context={{ kind: 'coach-tip', tipId: tip.id }}
        messageOverride={tip.message}
        variant="inline"
      />

      <Text style={[styles.title, { color: palette.bone }]}>{tip.title}</Text>

      {tip.ctaLabel ? (
        <Pressable
          onPress={handlePress}
          style={[styles.cta, { borderColor: palette.accent, backgroundColor: `${palette.primary}88` }]}>
          <Text style={[styles.ctaText, { color: palette.bone }]}>{tip.ctaLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

function executeCoachTipAction(
  tip: CoachTip,
  handlers: {
    playerProgress: PlayerProgress;
    today: string;
    openImproveQuest: (questId: string) => void;
    openQuestFocus: (questId: string) => void;
    requestQuestBoardTab: (tab: 'review' | 'today' | 'focus') => void;
    activateMinimumViableDay: () => void;
    convertInboxItem: (inboxItemId: string) => void;
    openAddQuestFromTraitSuggestion: (input: {
      title: string;
      category: 'health';
      traitKey: ReturnType<typeof getTraitForCategory>;
      reason: 'tomorrow-setup';
      enableStarter: boolean;
    }) => void;
  },
) {
  const action = tip.actionType as CoachTipActionType | undefined;
  if (!action) return;

  switch (action) {
    case 'add-starter-move':
    case 'improve-quest':
      if (tip.targetQuestId) {
        handlers.openImproveQuest(tip.targetQuestId);
      }
      return;
    case 'review-quest':
      handlers.requestQuestBoardTab('review');
      router.push('/(game)/quests' as Href);
      return;
    case 'review-quest-load':
      handlers.requestQuestBoardTab('review');
      router.push('/(game)/quests' as Href);
      return;
    case 'activate-minimum-day':
      handlers.activateMinimumViableDay();
      return;
    case 'review-routines':
      router.push('/(game)/profile' as Href);
      return;
    case 'start-focus':
      if (tip.targetQuestId) {
        router.push('/(game)/quests' as Href);
        handlers.openQuestFocus(tip.targetQuestId);
      }
      return;
    case 'start-prepared-quest': {
      const entry = getTomorrowSetupForDate(handlers.playerProgress, handlers.today);
      if (!entry) return;

      if (entry.selectedTomorrowQuestId) {
        const quest = handlers.playerProgress.userQuests.find(
          (item) => item.id === entry.selectedTomorrowQuestId,
        );
        if (quest && !quest.isCompleted) {
          handlers.openQuestFocus(entry.selectedTomorrowQuestId);
          return;
        }
      }

      if (entry.plannedTomorrowInboxItemId) {
        handlers.convertInboxItem(entry.plannedTomorrowInboxItemId);
        return;
      }

      if (entry.plannedTomorrowTaskTitle) {
        handlers.openAddQuestFromTraitSuggestion({
          title: entry.plannedTomorrowTaskTitle,
          category: 'health',
          traitKey: getTraitForCategory('health'),
          reason: 'tomorrow-setup',
          enableStarter: true,
        });
      }
      return;
    }
    default:
      return;
  }
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 2,
  },
  dismiss: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.3,
  },
  cta: {
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
    marginTop: 2,
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
    textAlign: 'center',
  },
});
