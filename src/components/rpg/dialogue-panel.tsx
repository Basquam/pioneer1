import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn, FadeInLeft } from 'react-native-reanimated';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

const CHAR_DELAY_MS = 24;

type DialoguePanelProps = {
  line: string;
  speaker?: string;
  badge?: string;
  animate?: boolean;
  onTypingComplete?: () => void;
};

export function DialoguePanel({
  line,
  speaker,
  badge = 'STORY',
  animate = true,
  onTypingComplete,
}: DialoguePanelProps) {
  const { theme } = useGame();
  const { colors, mentorName } = theme;
  const [visibleText, setVisibleText] = useState(animate ? '' : line);

  useEffect(() => {
    if (!animate) {
      setVisibleText(line);
      return;
    }
    setVisibleText('');
    let index = 0;
    const interval = setInterval(() => {
      index += 1;
      setVisibleText(line.slice(0, index));
      if (index >= line.length) {
        clearInterval(interval);
        onTypingComplete?.();
      }
    }, CHAR_DELAY_MS);
    return () => clearInterval(interval);
  }, [animate, line, onTypingComplete]);

  return (
    <Animated.View entering={FadeInLeft.duration(400)} style={styles.wrapper}>
      <View style={[styles.panel, { backgroundColor: colors.panel, borderColor: colors.panelBorder }]}>
        <View style={[styles.accent, { backgroundColor: colors.primary }]} />
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={[styles.speaker, { color: colors.gold }]}>{speaker ?? mentorName}</Text>
            <View style={[styles.badge, { backgroundColor: colors.primary }]}>
              <Text style={[styles.badgeText, { color: colors.bone }]}>{badge}</Text>
            </View>
          </View>
          <Animated.Text entering={FadeIn.duration(300)} key={line} style={[styles.line, { color: colors.bone }]}>
            {visibleText}
            {animate && visibleText.length < line.length && (
              <Text style={{ color: colors.accent }}>▌</Text>
            )}
          </Animated.Text>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: { alignSelf: 'stretch' },
  panel: { borderWidth: 1, overflow: 'hidden', transform: [{ skewX: '-2deg' }] },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  content: { padding: 16, paddingLeft: 20, gap: 8 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  speaker: { fontFamily: GameFonts.ui, fontSize: 11, letterSpacing: 3, flex: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 2, transform: [{ skewX: '-8deg' }] },
  badgeText: { fontFamily: GameFonts.uiSemi, fontSize: 9, letterSpacing: 2 },
  line: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 16,
    lineHeight: 24,
    fontStyle: 'italic',
  },
});
