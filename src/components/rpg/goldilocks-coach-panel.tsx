import { type Href, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  generateGoldilocksRecommendationWithStyle,
  formatGoldilocksCoachEmptyMessage,
  getGoldilocksCoachFlavor,
  type GoldilocksCoachAction,
  type GoldilocksRecommendation,
} from '@/lib/goldilocks-coach';

const ACTION_LABELS: Record<GoldilocksCoachAction, string> = {
  'split-high-risk': 'SPLIT A HIGH-RISK QUEST',
  'add-starter-move': 'ADD STARTER MOVE',
  'add-standard-quest': 'ADD STANDARD QUEST',
  'add-high-risk-quest': 'ADD HIGH-RISK QUEST',
  'view-quest-board': 'OPEN QUEST BOARD',
};

export function GoldilocksCoachPanel() {
  const { activeUniverse, playerProgress, openAddQuestSheet, openImproveQuest, openSplitQuestChain } =
    useGame();
  const { palette } = activeUniverse;

  const recommendation = useMemo(
    () => generateGoldilocksRecommendationWithStyle(playerProgress),
    [playerProgress],
  );

  const handleAction = (action: GoldilocksCoachAction, targetQuestId?: string) => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (action) {
      case 'split-high-risk':
        router.push('/(game)/quests' as Href);
        if (targetQuestId) {
          openSplitQuestChain(targetQuestId);
        }
        break;
      case 'add-starter-move':
        router.push('/(game)/quests' as Href);
        if (targetQuestId) {
          openImproveQuest(targetQuestId);
        }
        break;
      case 'add-standard-quest':
      case 'add-high-risk-quest':
        router.push('/(game)/quests' as Href);
        openAddQuestSheet();
        break;
      case 'view-quest-board':
        router.push('/(game)/quests' as Href);
        break;
      default:
        break;
    }
  };

  return (
    <View style={[styles.panel, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.sectionLabel, { color: palette.accent }]}>GOLDILOCKS COACH</Text>
      <Text style={[styles.headerFlavor, { color: palette.gold }]}>
        {getGoldilocksCoachFlavor(activeUniverse.id)}
      </Text>

      {recommendation ? (
        <RecommendationCard
          recommendation={recommendation}
          palette={palette}
          onAction={handleAction}
        />
      ) : (
        <Text style={[styles.emptyMessage, { color: palette.fog }]}>
          {formatGoldilocksCoachEmptyMessage()}
        </Text>
      )}
    </View>
  );
}

function RecommendationCard({
  recommendation,
  palette,
  onAction,
}: {
  recommendation: GoldilocksRecommendation;
  palette: {
    panelBorder: string;
    night: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
  };
  onAction: (action: GoldilocksCoachAction, targetQuestId?: string) => void;
}) {
  return (
    <View style={[styles.card, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <Text style={[styles.cardTitle, { color: palette.bone }]}>{recommendation.title}</Text>
      <Text style={[styles.cardInsight, { color: palette.fog }]}>{recommendation.insight}</Text>
      <Text style={[styles.cardAction, { color: palette.gold }]}>{recommendation.suggestedAction}</Text>

      {recommendation.action ? (
        <Pressable
          onPress={() => onAction(recommendation.action!, recommendation.targetQuestId)}
          style={[styles.ctaButton, { borderColor: palette.accent }]}>
          <Text style={[styles.ctaLabel, { color: palette.accent }]}>
            {ACTION_LABELS[recommendation.action]}
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
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  emptyMessage: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
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
