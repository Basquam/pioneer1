import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import {
  getIdentityCompassCardCopy,
  getIdentityCompassFlavor,
  MAX_DESIRED_IDENTITY_TRAITS,
  toggleDesiredIdentityTrait,
} from '@/lib/identity-compass';
import { getIdentityTraitMeta, IDENTITY_TRAIT_KEYS } from '@/lib/identity-votes';
import type { IdentityTraitKey } from '@/types/narrative';

type IdentityCompassPickerProps = {
  selectedTraits: IdentityTraitKey[];
  onChange: (traits: IdentityTraitKey[]) => void;
  showFlavor?: boolean;
};

export function IdentityCompassPicker({
  selectedTraits,
  onChange,
  showFlavor = true,
}: IdentityCompassPickerProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  const handleToggle = (traitKey: IdentityTraitKey) => {
    void Haptics.selectionAsync();
    onChange(toggleDesiredIdentityTrait(selectedTraits, traitKey));
  };

  return (
    <View style={styles.wrapper}>
      {showFlavor ? (
        <Text style={[styles.flavor, { color: palette.fog }]}>
          {getIdentityCompassFlavor(activeUniverse.id)}
        </Text>
      ) : null}

      <Text style={[styles.selectionHint, { color: palette.fog }]}>
        Select up to {MAX_DESIRED_IDENTITY_TRAITS} priority traits ({selectedTraits.length}/
        {MAX_DESIRED_IDENTITY_TRAITS})
      </Text>

      <View style={styles.grid}>
        {IDENTITY_TRAIT_KEYS.map((traitKey) => {
          const meta = getIdentityTraitMeta(traitKey);
          const selected = selectedTraits.includes(traitKey);
          const atLimit = !selected && selectedTraits.length >= MAX_DESIRED_IDENTITY_TRAITS;

          return (
            <Pressable
              key={traitKey}
              onPress={() => handleToggle(traitKey)}
              disabled={atLimit}
              style={[
                styles.card,
                {
                  borderColor: selected ? palette.gold : palette.panelBorder,
                  backgroundColor: selected ? `${palette.primary}66` : palette.panel,
                  opacity: atLimit ? 0.45 : 1,
                },
              ]}>
              <Text style={[styles.cardLabel, { color: selected ? palette.bone : palette.fog }]}>
                {meta.label.toUpperCase()}
              </Text>
              <Text style={[styles.cardCopy, { color: selected ? palette.bone : palette.fog }]}>
                {getIdentityCompassCardCopy(traitKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 10 },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  selectionHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1,
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
  cardCopy: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
});
