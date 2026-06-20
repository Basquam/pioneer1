import { StyleSheet, type TextStyle } from 'react-native';

import { GameFonts } from '@/constants/typography';

/** Cinematic Quest OS typography presets — readable body, accent display only where needed. */
export const QuestoryTypography = {
  cinematicTitle: {
    fontFamily: GameFonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 1.5,
  },
  screenTitle: {
    fontFamily: GameFonts.display,
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: 1.2,
  },
  sectionTitle: {
    fontFamily: GameFonts.ui,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 1,
  },
  sectionEyebrow: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 3,
  },
  body: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    lineHeight: 20,
    letterSpacing: 0.2,
  },
  bodySmall: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 16,
    letterSpacing: 0.3,
  },
  caption: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1.2,
  },
  statValue: {
    fontFamily: GameFonts.ui,
    fontSize: 18,
    lineHeight: 22,
    letterSpacing: 1,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 13,
    lineHeight: 19,
    fontStyle: 'italic' as const,
  },
} as const satisfies Record<string, TextStyle>;

export function mergeTypography(
  preset: TextStyle,
  override?: TextStyle,
): TextStyle {
  return override ? StyleSheet.flatten([preset, override]) : preset;
}
