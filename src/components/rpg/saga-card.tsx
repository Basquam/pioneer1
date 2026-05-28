import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import type { Saga, UniversePalette } from '@/types/narrative';

type SagaCardProps = {
  saga: Saga;
  palette: UniversePalette;
  selected: boolean;
  unlocked: boolean;
  unlockHint?: string;
  index: number;
  onPress: () => void;
};

export function SagaCard({
  saga,
  palette,
  selected,
  unlocked,
  unlockHint,
  index,
  onPress,
}: SagaCardProps) {
  const ui = useUniverseUiCopy();
  const playerRole = saga.rankTitles[0];

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        disabled={!unlocked}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.panel,
            borderColor: selected ? palette.gold : palette.panelBorder,
            opacity: unlocked ? 1 : 0.5,
          },
        ]}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: palette.bone }]} numberOfLines={2}>
            {saga.title}
          </Text>
          <View
            style={[
              styles.statusBadge,
              {
                borderColor: unlocked ? palette.gold : palette.fog,
                backgroundColor: unlocked ? `${palette.primary}33` : `${palette.ink}88`,
              },
            ]}>
            <Text style={[styles.statusText, { color: unlocked ? palette.gold : palette.fog }]}>
              {unlocked ? 'UNLOCKED' : 'LOCKED'}
            </Text>
          </View>
        </View>

        <Text style={[styles.label, { color: palette.accent }]}>YOUR ROLE</Text>
        <Text style={[styles.value, { color: palette.bone }]}>{playerRole}</Text>

        <Text style={[styles.label, { color: palette.accent }]}>STORY FANTASY</Text>
        <Text style={[styles.summary, { color: palette.fog }]} numberOfLines={4}>
          {saga.summary}
        </Text>

        {saga.allyName ? (
          <>
            <Text style={[styles.label, { color: palette.accent }]}>MAIN ALLY</Text>
            <Text style={[styles.value, { color: palette.bone }]}>{saga.allyName}</Text>
          </>
        ) : null}

        {saga.villainName ? (
          <>
            <Text style={[styles.label, { color: palette.accent }]}>{ui.villainLabel}</Text>
            <Text style={[styles.villain, { color: palette.villainGlow }]}>
              {saga.villainName} · {saga.villainTitle}
            </Text>
          </>
        ) : null}

        {!unlocked && saga.requiredUnlockId && unlockHint && (
          <Text style={[styles.requirement, { color: palette.villainGlow }]}>
            REQUIRES: {unlockHint}
          </Text>
        )}

        {selected && unlocked && (
          <Text style={[styles.selected, { color: palette.gold }]}>SELECTED</Text>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 4,
    transform: [{ skewX: '-2deg' }],
  },
  headerRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  title: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2, flex: 1, minWidth: 120 },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-8deg' }],
  },
  statusText: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  label: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 6 },
  value: { fontFamily: GameFonts.ui, fontSize: 14, letterSpacing: 1 },
  summary: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  villain: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1.5 },
  requirement: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5, marginTop: 8 },
  selected: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    letterSpacing: 2,
    textAlign: 'right',
    marginTop: 8,
  },
});
