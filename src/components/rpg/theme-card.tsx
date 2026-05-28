import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import type { Universe } from '@/types/narrative';

type ThemeCardProps = {
  universe: Universe;
  selected: boolean;
  index: number;
  locked?: boolean;
  onPress: () => void;
};

export function ThemeCard({ universe, selected, index, locked, onPress }: ThemeCardProps) {
  const { palette } = universe;
  const isLocked = locked ?? universe.status === 'locked';

  return (
    <Animated.View entering={FadeInDown.delay(index * 80).springify()}>
      <Pressable
        disabled={isLocked}
        onPress={onPress}
        style={[
          styles.card,
          {
            backgroundColor: palette.panel,
            borderColor: selected ? palette.gold : palette.panelBorder,
            opacity: isLocked ? 0.5 : 1,
          },
        ]}>
        <Text style={styles.icon}>{universe.icon}</Text>
        <View style={styles.text}>
          <View style={styles.titleRow}>
            <Text style={[styles.name, { color: palette.bone }]} numberOfLines={2}>
              {universe.name}
            </Text>
            <View
              style={[
                styles.statusBadge,
                {
                  borderColor: isLocked ? palette.fog : palette.gold,
                  backgroundColor: isLocked ? `${palette.ink}88` : `${palette.primary}33`,
                },
              ]}>
              <Text style={[styles.statusText, { color: isLocked ? palette.fog : palette.gold }]}>
                {isLocked ? 'LOCKED' : 'UNLOCKED'}
              </Text>
            </View>
          </View>
          <Text style={[styles.moodLabel, { color: palette.accent }]}>THEME</Text>
          <Text style={[styles.mood, { color: palette.fog }]} numberOfLines={2}>
            {universe.theme}
          </Text>
          <Text style={[styles.moodLabel, { color: palette.accent }]}>MOOD</Text>
          <Text style={[styles.mood, { color: palette.fog }]} numberOfLines={3}>
            {universe.mood}
          </Text>
          <Text style={[styles.moodLabel, { color: palette.accent }]}>CORE PROGRESSION</Text>
          <Text style={[styles.progression, { color: palette.bone }]}>{universe.coreProgressionName}</Text>
          <Text style={[styles.tag, { color: palette.fog }]} numberOfLines={2}>
            {universe.tagline}
          </Text>
          {isLocked && universe.unlockRequirementLabel && (
            <Text style={[styles.requirement, { color: palette.villainGlow }]}>
              REQUIRES: {universe.unlockRequirementLabel.toUpperCase()}
            </Text>
          )}
        </View>
        {selected && !isLocked && (
          <View style={[styles.check, { backgroundColor: palette.primary }]}>
            <Text style={[styles.checkText, { color: palette.bone }]}>✓</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 14,
    transform: [{ skewX: '-2deg' }],
  },
  icon: { fontSize: 36, marginTop: 2 },
  text: { flex: 1, gap: 4, minWidth: 0 },
  titleRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  name: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2, flex: 1, minWidth: 120 },
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    transform: [{ skewX: '-8deg' }],
  },
  statusText: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 1.5 },
  moodLabel: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 4 },
  mood: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 18 },
  progression: { fontFamily: GameFonts.ui, fontSize: 13, letterSpacing: 1 },
  tag: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 1, marginTop: 2 },
  requirement: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1.5, marginTop: 6 },
  check: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ skewX: '8deg' }],
  },
  checkText: { fontFamily: GameFonts.ui, fontSize: 16 },
});
