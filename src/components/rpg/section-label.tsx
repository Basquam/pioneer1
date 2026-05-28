import { StyleSheet, Text, type StyleProp, type TextStyle } from 'react-native';

import { GameLayout } from '@/constants/layout';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

type SectionLabelProps = {
  children: string;
  style?: StyleProp<TextStyle>;
};

export function SectionLabel({ children, style }: SectionLabelProps) {
  const { activeUniverse } = useGame();

  return (
    <Text style={[styles.label, { color: activeUniverse.palette.gold }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    letterSpacing: 3,
    marginTop: GameLayout.sectionLabelMarginTop,
  },
});
