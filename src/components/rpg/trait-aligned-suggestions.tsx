import * as Haptics from 'expo-haptics';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getTaskCategoryMeta } from '@/lib/task-categories';
import {
  formatTraitSuggestionLabel,
  getTraitAlignedSuggestions,
  getTraitSuggestionFlavor,
  TRAIT_ALIGNED_SECTION_TITLE,
} from '@/lib/trait-aligned-suggestions';

export function TraitAlignedSuggestionsPanel() {
  const { activeUniverse, playerProgress, openAddQuestFromTraitSuggestion } = useGame();
  const { palette } = activeUniverse;

  const suggestions = useMemo(
    () => getTraitAlignedSuggestions(
      playerProgress.desiredIdentityTraits ?? [],
      3,
      playerProgress.questStyleProfile,
    ),
    [playerProgress.desiredIdentityTraits, playerProgress.questStyleProfile],
  );

  if (suggestions.length === 0) return null;

  return (
    <View style={[styles.wrapper, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
      <Text style={[styles.sectionTitle, { color: palette.gold }]}>{TRAIT_ALIGNED_SECTION_TITLE}</Text>
      <Text style={[styles.flavor, { color: palette.fog }]}>{getTraitSuggestionFlavor(activeUniverse.id)}</Text>

      <View style={styles.list}>
        {suggestions.map((suggestion) => {
          const categoryMeta = getTaskCategoryMeta(suggestion.category);
          const traitLabel = formatTraitSuggestionLabel(suggestion.traitKey);

          return (
            <View
              key={`${suggestion.traitKey}-${suggestion.title}`}
              style={[styles.card, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
              <View style={styles.cardHeader}>
                <Text style={[styles.traitBadge, { color: palette.gold }]}>{traitLabel.toUpperCase()}</Text>
                <Text style={[styles.categoryBadge, { color: palette.fog }]}>
                  {categoryMeta.realWorldLabel}
                </Text>
              </View>

              <Text style={[styles.title, { color: palette.bone }]}>{suggestion.title}</Text>
              <Text style={[styles.reason, { color: palette.fog }]}>{suggestion.reason}</Text>

              <Pressable
                onPress={() => {
                  void Haptics.selectionAsync();
                  openAddQuestFromTraitSuggestion(suggestion);
                }}
                style={[styles.cta, { borderColor: palette.gold, backgroundColor: palette.primary }]}>
                <Text style={[styles.ctaText, { color: palette.bone }]}>TURN INTO QUEST</Text>
              </Pressable>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  sectionTitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  list: { gap: 8 },
  card: {
    borderWidth: 1,
    padding: 10,
    gap: 6,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  traitBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  categoryBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.4,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.4,
    lineHeight: 19,
  },
  reason: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  cta: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    marginTop: 2,
    transform: [{ skewX: '-4deg' }],
  },
  ctaText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.5,
  },
});
