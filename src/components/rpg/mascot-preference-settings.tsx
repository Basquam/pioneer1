import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { MASCOT_PREFERENCE_OPTIONS } from '@/constants/app-mascots';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import type { MascotPreference } from '@/types/narrative';

export function MascotPreferenceSettings() {
  const { activeUniverse, playerProgress, setMascotPreference } = useGame();
  const { palette } = activeUniverse;
  const current = playerProgress.mascotPreference ?? 'both';

  const handleSelect = (value: MascotPreference) => {
    if (value === current) return;
    void Haptics.selectionAsync();
    setMascotPreference(value);
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { color: palette.bone }]}>Coach Mascots</Text>
      <Text style={[styles.subtitle, { color: palette.fog }]}>
        Sasha and Marcus are app guides — not story characters. They help with planning and momentum.
      </Text>
      <View style={styles.options}>
        {MASCOT_PREFERENCE_OPTIONS.map((option) => {
          const selected = current === option.value;
          return (
            <Pressable
              key={option.value}
              onPress={() => handleSelect(option.value)}
              style={[
                styles.option,
                {
                  borderColor: selected ? palette.gold : palette.panelBorder,
                  backgroundColor: selected ? `${palette.primary}44` : palette.panel,
                },
              ]}>
              <Text style={[styles.optionLabel, { color: palette.bone }]}>{option.label}</Text>
              <Text style={[styles.optionHint, { color: palette.fog }]}>{option.hint}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  title: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  options: {
    gap: 6,
  },
  option: {
    borderWidth: 1,
    padding: 10,
    gap: 3,
    transform: [{ skewX: '-2deg' }],
  },
  optionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 12,
  },
  optionHint: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
  },
});
