import type { UniversePalette } from '@/types/narrative';

export type UniverseVisualTheme = {
  cardSkew: number;
  buttonSkew: number;
  panelBorderWidth: number;
  panelUsesHolographic: boolean;
  panelUsesRainGlass: boolean;
  panelTopHighlight: boolean;
  showTypewriterTexture: boolean;
  showRainStreaks: boolean;
  backgroundVariant: 'western' | 'chrome' | 'noir';
  showScanlines: boolean;
  showGridDots: boolean;
  ambientParticles: 'stars' | 'grid-dots';
  accentLineWidth: number;
  mapSkew: number;
  mapShowGrid: boolean;
  nodeBorderRadius: number;
  nodeSkew: number;
  completedStamp: string;
  lockedStamp: string;
  activeStamp: string;
  headerUnderline: boolean;
  buttonBorderWidth: number;
};

const DUST_AND_IRON_VISUAL_THEME: UniverseVisualTheme = {
  cardSkew: -2,
  buttonSkew: -6,
  panelBorderWidth: 1,
  panelUsesHolographic: false,
  panelUsesRainGlass: false,
  panelTopHighlight: false,
  showTypewriterTexture: false,
  showRainStreaks: false,
  backgroundVariant: 'western',
  showScanlines: false,
  showGridDots: false,
  ambientParticles: 'stars',
  accentLineWidth: 4,
  mapSkew: -1,
  mapShowGrid: false,
  nodeBorderRadius: 0,
  nodeSkew: -4,
  completedStamp: 'RECLAIMED',
  lockedStamp: 'THREAT',
  activeStamp: 'ACTIVE',
  headerUnderline: false,
  buttonBorderWidth: 2,
};

const NEON_ASHES_VISUAL_THEME: UniverseVisualTheme = {
  cardSkew: -1,
  buttonSkew: -3,
  panelBorderWidth: 1,
  panelUsesHolographic: false,
  panelUsesRainGlass: true,
  panelTopHighlight: true,
  showTypewriterTexture: true,
  showRainStreaks: true,
  backgroundVariant: 'noir',
  showScanlines: false,
  showGridDots: false,
  ambientParticles: 'stars',
  accentLineWidth: 3,
  mapSkew: -1,
  mapShowGrid: false,
  nodeBorderRadius: 0,
  nodeSkew: -2,
  completedStamp: 'SOLVED',
  lockedStamp: 'COLD',
  activeStamp: 'ACTIVE',
  headerUnderline: true,
  buttonBorderWidth: 1,
};

const NEURONET_VISUAL_THEME: UniverseVisualTheme = {
  cardSkew: 0,
  buttonSkew: 0,
  panelBorderWidth: 1,
  panelUsesHolographic: true,
  panelUsesRainGlass: false,
  panelTopHighlight: true,
  showTypewriterTexture: false,
  showRainStreaks: false,
  backgroundVariant: 'chrome',
  showScanlines: true,
  showGridDots: true,
  ambientParticles: 'grid-dots',
  accentLineWidth: 2,
  mapSkew: 0,
  mapShowGrid: true,
  nodeBorderRadius: 2,
  nodeSkew: 0,
  completedStamp: 'STABILIZED',
  lockedStamp: 'LOCKED',
  activeStamp: 'ROUTING',
  headerUnderline: true,
  buttonBorderWidth: 1,
};

export const UNIVERSE_VISUAL_THEMES: Record<string, UniverseVisualTheme> = {
  'dust-and-iron': DUST_AND_IRON_VISUAL_THEME,
  neuronet: NEURONET_VISUAL_THEME,
  'neon-ashes': NEON_ASHES_VISUAL_THEME,
};

export function getUniverseVisualTheme(universeId: string): UniverseVisualTheme {
  return UNIVERSE_VISUAL_THEMES[universeId] ?? DUST_AND_IRON_VISUAL_THEME;
}

export function skewTransform(degrees: number) {
  return degrees === 0 ? [] : [{ skewX: `${degrees}deg` as const }];
}

export function getPanelBorderColor(palette: UniversePalette, theme: UniverseVisualTheme): string {
  return theme.panelUsesHolographic ? palette.accent : palette.panelBorder;
}

export function getPanelAccentColor(
  palette: UniversePalette,
  theme: UniverseVisualTheme,
  variant: 'primary' | 'gold' = 'primary',
): string {
  if (!theme.panelUsesHolographic) {
    return variant === 'gold' ? palette.gold : palette.primary;
  }
  return variant === 'gold' ? palette.primary : palette.accent;
}

export function getHolographicShadow(palette: UniversePalette, theme: UniverseVisualTheme) {
  if (!theme.panelUsesHolographic) return {};
  return {
    shadowColor: palette.accent,
    shadowOpacity: 0.28,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 0 } as const,
    elevation: 5,
  };
}

export function getRainGlassShadow(palette: UniversePalette, theme: UniverseVisualTheme) {
  if (!theme.panelUsesRainGlass) return {};
  return {
    shadowColor: palette.primary,
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 } as const,
    elevation: 4,
  };
}

/** Universe-aware panel elevation — holographic chrome or rain-glass depth. */
export function getPanelShadow(palette: UniversePalette, theme: UniverseVisualTheme) {
  if (theme.panelUsesHolographic) return getHolographicShadow(palette, theme);
  if (theme.panelUsesRainGlass) return getRainGlassShadow(palette, theme);
  return {};
}
