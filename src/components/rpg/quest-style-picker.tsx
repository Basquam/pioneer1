import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  getQuestStyleMeta,
  QUEST_STYLE_KEYS,
  sanitizeQuestStyleKey,
} from '@/lib/quest-style-profile';
import type { QuestStyleKey } from '@/types/narrative';

type QuestStylePickerProps = {
  primaryStyle: QuestStyleKey | null;
  secondaryStyle: QuestStyleKey | null;
  onPrimaryChange: (style: QuestStyleKey | null) => void;
  onSecondaryChange: (style: QuestStyleKey | null) => void;
  showSecondary?: boolean;
};

export function QuestStylePicker({
  primaryStyle,
  secondaryStyle,
  onPrimaryChange,
  onSecondaryChange,
  showSecondary = true,
}: QuestStylePickerProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  const handlePrimaryPress = (styleKey: QuestStyleKey) => {
    void Haptics.selectionAsync();
    if (primaryStyle === styleKey) {
      onPrimaryChange(null);
      if (secondaryStyle === styleKey) onSecondaryChange(null);
      return;
    }
    onPrimaryChange(styleKey);
    if (secondaryStyle === styleKey) onSecondaryChange(null);
  };

  const handleSecondaryPress = (styleKey: QuestStyleKey) => {
    void Haptics.selectionAsync();
    if (styleKey === primaryStyle) return;
    onSecondaryChange(secondaryStyle === styleKey ? null : styleKey);
  };

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.sectionLabel, { color: palette.gold }]}>PRIMARY STYLE</Text>
      <View style={styles.grid}>
        {QUEST_STYLE_KEYS.map((styleKey) => {
          const meta = getQuestStyleMeta(styleKey);
          const selected = primaryStyle === styleKey;

          return (
            <Pressable
              key={`primary-${styleKey}`}
              onPress={() => handlePrimaryPress(styleKey)}
              style={[
                styles.card,
                {
                  borderColor: selected ? palette.gold : palette.panelBorder,
                  backgroundColor: selected ? `${palette.primary}66` : palette.panel,
                },
              ]}>
              <Text style={[styles.cardLabel, { color: selected ? palette.bone : palette.fog }]}>
                {meta.label.toUpperCase()}
              </Text>
              <Text style={[styles.cardTagline, { color: selected ? palette.bone : palette.fog }]}>
                {meta.tagline}
              </Text>
              <Text style={[styles.cardDescription, { color: palette.fog }]}>{meta.description}</Text>
            </Pressable>
          );
        })}
      </View>

      {showSecondary && primaryStyle ? (
        <>
          <Text style={[styles.sectionLabel, { color: palette.accent, marginTop: 6 }]}>
            OPTIONAL SECONDARY
          </Text>
          <Text style={[styles.secondaryHint, { color: palette.fog }]}>
            Adds emphasis without hiding other features.
          </Text>
          <View style={styles.secondaryRow}>
            {QUEST_STYLE_KEYS.filter((key) => key !== primaryStyle).map((styleKey) => {
              const meta = getQuestStyleMeta(styleKey);
              const selected = secondaryStyle === styleKey;

              return (
                <Pressable
                  key={`secondary-${styleKey}`}
                  onPress={() => handleSecondaryPress(styleKey)}
                  style={[
                    styles.secondaryChip,
                    {
                      borderColor: selected ? palette.gold : palette.panelBorder,
                      backgroundColor: selected ? palette.primary : palette.night,
                    },
                  ]}>
                  <Text style={[styles.secondaryChipText, { color: selected ? palette.bone : palette.fog }]}>
                    {meta.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </>
      ) : null}
    </View>
  );
}

export function questStyleSelectionFromProfile(
  profile: { primaryStyle?: QuestStyleKey; secondaryStyle?: QuestStyleKey } | undefined,
): { primary: QuestStyleKey | null; secondary: QuestStyleKey | null } {
  return {
    primary: sanitizeQuestStyleKey(profile?.primaryStyle) ?? null,
    secondary: sanitizeQuestStyleKey(profile?.secondaryStyle) ?? null,
  };
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.4,
  },
  secondaryHint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  grid: { gap: 8 },
  card: {
    borderWidth: 1,
    padding: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  cardLabel: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
  },
  cardTagline: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  cardDescription: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
  },
  secondaryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  secondaryChip: {
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryChipText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 0.4,
  },
});
