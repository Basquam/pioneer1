import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';

import { CharacterPortrait } from '@/components/rpg/character-portrait';
import { PanelChrome } from '@/components/rpg/panel-chrome';
import { GameFonts } from '@/constants/typography';
import {
  getPanelAccentColor,
  getPanelBorderColor,
  getPanelShadow,
  skewTransform,
} from '@/constants/universe-visual-theme';
import { getCharacter } from '@/lib/narrative-helpers';
import { inferPortraitContextFromDialogueBeat } from '@/lib/narrative-media';
import { formatRelationshipHeader, getRelationshipProgress } from '@/lib/relationship-progress';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
import type { DialogueBeat } from '@/types/narrative';

const CHAR_DELAY_MS = 22;

type CharacterDialoguePanelProps = {
  beat: DialogueBeat;
  animate?: boolean;
  onTypingComplete?: () => void;
};

export function CharacterDialoguePanel({
  beat,
  animate = true,
  onTypingComplete,
}: CharacterDialoguePanelProps) {
  const { activeUniverse, activeSaga, playerProgress } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;
  const panelBorder = getPanelBorderColor(palette, visualTheme);
  const accentColor = getPanelAccentColor(palette, visualTheme);
  const goldAccent = getPanelAccentColor(palette, visualTheme, 'gold');
  const character = getCharacter(activeSaga, beat.characterId);
  const [visibleText, setVisibleText] = useState(animate ? '' : beat.line);

  useEffect(() => {
    if (!animate) {
      setVisibleText(beat.line);
      return;
    }
    setVisibleText('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisibleText(beat.line.slice(0, index));
      if (index >= beat.line.length) {
        clearInterval(interval);
        onTypingComplete?.();
      }
    }, CHAR_DELAY_MS);
    return () => clearInterval(interval);
  }, [animate, beat.line, onTypingComplete]);

  if (!character) return null;

  const affinity = playerProgress.characterAffinity[character.id] ?? 0;
  const { tier } = getRelationshipProgress(affinity);
  const relationshipHeader = formatRelationshipHeader(character, tier);
  const portraitContext = inferPortraitContextFromDialogueBeat(beat, character);

  return (
    <Animated.View entering={FadeInLeft.duration(400)} style={styles.wrapper}>
      <View
        style={[
          styles.panel,
          {
            backgroundColor: palette.panel,
            borderColor: character.isVillain ? palette.villainGlow : panelBorder,
            borderWidth: visualTheme.panelBorderWidth,
            transform: skewTransform(visualTheme.cardSkew),
          },
          getPanelShadow(palette, visualTheme),
        ]}>
        <PanelChrome
          palette={palette}
          theme={visualTheme}
          isVillain={character.isVillain}
          allowVillain={false}
        />
        <View
          style={[
            styles.accent,
            {
              backgroundColor: character.isVillain ? palette.villainGlow : accentColor,
              width: visualTheme.accentLineWidth,
            },
          ]}
        />
        <View style={styles.row}>
          <CharacterPortrait character={character} size="md" context={portraitContext} />
          <View style={styles.body}>
            <View style={styles.headerRow}>
              <View style={styles.nameBlock}>
                <Text style={[styles.speaker, { color: goldAccent }]}>{character.name.toUpperCase()}</Text>
                <Text style={[styles.role, { color: palette.fog }]}>{character.role}</Text>
              </View>
              {beat.badge && (
                <View style={[styles.badge, { backgroundColor: character.isVillain ? palette.villain : palette.primary }]}>
                  <Text style={[styles.badgeText, { color: palette.bone }]}>{beat.badge}</Text>
                </View>
              )}
            </View>
            <Animated.Text entering={FadeIn.duration(250)} key={beat.line} style={[styles.line, { color: palette.bone }]}>
              {visibleText}
              {animate && visibleText.length < beat.line.length && (
                <Text style={{ color: palette.accent }}>▌</Text>
              )}
            </Animated.Text>
            {affinity > 0 || !character.isVillain ? (
              <Text style={[styles.tier, { color: palette.accent }]}>{relationshipHeader}</Text>
            ) : null}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch' },
  panel: { borderWidth: 1, overflow: 'hidden' },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0 },
  row: { flexDirection: 'row', padding: 14, paddingLeft: 18, gap: 12 },
  body: { flex: 1, gap: 6 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 },
  nameBlock: { flex: 1, gap: 2 },
  speaker: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
  role: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, transform: [{ skewX: '-8deg' }] },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  line: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 15,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  tier: { fontFamily: GameFonts.uiSemi, fontSize: 8, letterSpacing: 2, marginTop: 2 },
});
