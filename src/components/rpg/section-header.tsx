import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  right?: string;
};

export function SectionHeader({ eyebrow, title, right }: SectionHeaderProps) {
  const { activeUniverse } = useGame();
  const visualTheme = useUniverseVisualTheme();
  const { palette } = activeUniverse;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {eyebrow ? (
          <Text style={[styles.eyebrow, { color: palette.accent }]} numberOfLines={2}>
            {eyebrow}
          </Text>
        ) : null}
        <Text style={[styles.title, { color: palette.bone }]} numberOfLines={3} adjustsFontSizeToFit minimumFontScale={0.82}>
          {title}
        </Text>
        {visualTheme.headerUnderline && (
          <View style={[styles.underline, { backgroundColor: palette.accent }]}>
            <View style={[styles.underlineAccent, { backgroundColor: palette.primary }]} />
          </View>
        )}
      </View>
      {right ? (
        <Text
          style={[styles.right, { color: visualTheme.panelUsesHolographic ? palette.primary : palette.gold }]}
          numberOfLines={3}
          adjustsFontSizeToFit
          minimumFontScale={0.8}>
          {right}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flex: 1, flexShrink: 1, minWidth: 0, gap: 4 },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 3,
    lineHeight: 14,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 26,
    letterSpacing: 1.5,
    lineHeight: 32,
    flexShrink: 1,
  },
  underline: {
    height: 2,
    width: '100%',
    maxWidth: 180,
    marginTop: 6,
    overflow: 'hidden',
  },
  underlineAccent: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: '38%',
    height: '100%',
    opacity: 0.85,
  },
  right: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 1.5,
    lineHeight: 15,
    flexShrink: 0,
    maxWidth: '38%',
    textAlign: 'right',
    marginTop: 2,
  },
});
