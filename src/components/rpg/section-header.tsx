import { StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  right?: string;
};

export function SectionHeader({ eyebrow, title, right }: SectionHeaderProps) {
  const { activeUniverse } = useGame();
  const { palette } = activeUniverse;

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        {eyebrow && (
          <Text style={[styles.eyebrow, { color: palette.accent }]}>{eyebrow}</Text>
        )}
        <Text style={[styles.title, { color: palette.bone }]}>{title}</Text>
      </View>
      {right && (
        <Text style={[styles.right, { color: palette.gold }]}>{right}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 12,
  },
  left: { flex: 1, gap: 2 },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 3,
  },
  title: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    letterSpacing: 2,
  },
  right: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    letterSpacing: 2,
  },
});
