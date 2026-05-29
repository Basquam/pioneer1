import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  formatSystemsInsightEmptyMessage,
  generateSystemsInsights,
  getSystemsInsightHeaderFlavor,
  pickQuestIdForFocusInsight,
  type SystemsInsightAction,
  type SystemsInsightCard,
} from '@/lib/systems-insights';

const ACTION_LABELS: Record<SystemsInsightAction, string> = {
  'add-quest': 'ADD QUEST',
  'open-focus-mode': 'OPEN FOCUS MODE',
  'view-quest-board': 'VIEW QUEST BOARD',
  'edit-identity-compass': 'EDIT IDENTITY COMPASS',
};

type SystemsInsightPanelProps = {
  onEditIdentityCompass?: () => void;
};

export function SystemsInsightPanel({ onEditIdentityCompass }: SystemsInsightPanelProps) {
  const { activeUniverse, playerProgress, openAddQuestSheet, openQuestFocus } = useGame();
  const { palette } = activeUniverse;

  const insights = useMemo(() => generateSystemsInsights(playerProgress), [playerProgress]);

  const handleAction = (action: SystemsInsightAction) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (action) {
      case 'add-quest':
        router.push('/(game)/quests' as Href);
        openAddQuestSheet();
        break;
      case 'open-focus-mode': {
        const questId = pickQuestIdForFocusInsight(playerProgress);
        if (questId) {
          openQuestFocus(questId);
        } else {
          router.push('/(game)/quests' as Href);
        }
        break;
      }
      case 'view-quest-board':
        router.push('/(game)/quests' as Href);
        break;
      case 'edit-identity-compass':
        onEditIdentityCompass?.();
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.panel, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.sectionLabel, { color: palette.accent }]}>SYSTEMS INSIGHT</Text>
      <Text style={[styles.headerFlavor, { color: palette.gold }]}>
        {getSystemsInsightHeaderFlavor(activeUniverse.id)}
      </Text>

      {insights.length === 0 ? (
        <Text style={[styles.emptyMessage, { color: palette.fog }]}>
          {formatSystemsInsightEmptyMessage()}
        </Text>
      ) : (
        <View style={styles.cards}>
          {insights.map((card) => (
            <InsightCard
              key={card.id}
              card={card}
              palette={palette}
              onAction={handleAction}
            />
          ))}
        </View>
      )}
    </View>
  );
}

function InsightCard({
  card,
  palette,
  onAction,
}: {
  card: SystemsInsightCard;
  palette: {
    panelBorder: string;
    night: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
  };
  onAction: (action: SystemsInsightAction) => void;
}) {
  return (
    <View style={[styles.card, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <Text style={[styles.cardTitle, { color: palette.bone }]}>{card.title}</Text>
      <Text style={[styles.cardInsight, { color: palette.fog }]}>{card.insight}</Text>
      <Text style={[styles.cardAction, { color: palette.gold }]}>{card.suggestedAction}</Text>

      {card.action ? (
        <Pressable
          onPress={() => onAction(card.action!)}
          style={[styles.ctaButton, { borderColor: palette.accent }]}>
          <Text style={[styles.ctaLabel, { color: palette.accent }]}>
            {ACTION_LABELS[card.action]}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  headerFlavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  emptyMessage: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  cards: {
    gap: 10,
  },
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  cardTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  cardInsight: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
  },
  cardAction: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  ctaButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  ctaLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.1,
  },
});
