import { type Href, router } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInDown, FadeOut } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { ONBOARDING_PREMISE_BEATS } from '@/data/narrative/onboarding-premise';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingPremiseScreen() {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;
  const [beatIndex, setBeatIndex] = useState(0);

  const beat = ONBOARDING_PREMISE_BEATS[beatIndex];
  const isLast = beatIndex >= ONBOARDING_PREMISE_BEATS.length - 1;

  const advance = useCallback(() => {
    if (isLast) return;
    setBeatIndex((index) => index + 1);
  }, [isLast]);

  if (!beat) return null;

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
        <SectionHeader eyebrow="THE PREMISE" title="HOW PIONEER\nWORKS" />
      </Animated.View>

      <View style={styles.beatArea}>
        <Animated.View
          key={beat.badge}
          entering={FadeIn.duration(450)}
          exiting={FadeOut.duration(200)}
          style={[styles.beatCard, { backgroundColor: palette.panel, borderColor: palette.gold }]}>
          <View style={[styles.accent, { backgroundColor: palette.primary }]} />
          <View style={styles.beatInner}>
            <Text style={[styles.beatBadge, { color: palette.accent }]}>BEAT {beat.badge}</Text>
            <Text style={[styles.beatTitle, { color: palette.bone }]}>{beat.title}</Text>
            <Text style={[styles.beatLine, { color: palette.fog }]}>{beat.line}</Text>
          </View>
        </Animated.View>

        <View style={styles.dots}>
          {ONBOARDING_PREMISE_BEATS.map((item, index) => (
            <View
              key={item.badge}
              style={[
                styles.dot,
                {
                  backgroundColor: index <= beatIndex ? palette.gold : palette.panelBorder,
                  width: index === beatIndex ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
      </View>

      {!isLast && (
        <Pressable onPress={advance} style={styles.tapZone}>
          <Animated.Text entering={FadeIn} style={[styles.tapHint, { color: palette.gold }]}>
            TAP TO CONTINUE ›
          </Animated.Text>
        </Pressable>
      )}

      {isLast && (
        <GlowButton
          label="CHOOSE YOUR UNIVERSE"
          hint="BEGIN YOUR SAGA"
          onPress={() => router.push('/onboarding/theme' as Href)}
        />
      )}
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  header: { paddingTop: 24 },
  beatArea: { flex: 1, justifyContent: 'center', gap: 20 },
  beatCard: {
    borderWidth: 2,
    overflow: 'hidden',
    transform: [{ skewX: '-2deg' }],
  },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  beatInner: { padding: 22, paddingLeft: 26, gap: 10, transform: [{ skewX: '2deg' }] },
  beatBadge: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 3 },
  beatTitle: { fontFamily: GameFonts.display, fontSize: 26, letterSpacing: 2, lineHeight: 32 },
  beatLine: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 17,
    lineHeight: 26,
    fontStyle: 'italic',
  },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, alignItems: 'center' },
  dot: { height: 8, borderRadius: 1 },
  tapZone: { alignItems: 'flex-end', paddingBottom: 8 },
  tapHint: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 2 },
});
