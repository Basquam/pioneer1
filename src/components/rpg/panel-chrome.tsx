import {
  HolographicPanelChrome,
  RainGlassPanelChrome,
} from '@/components/rpg/visual-theme-overlay';
import type { UniverseVisualTheme } from '@/constants/universe-visual-theme';
import type { UniversePalette } from '@/types/narrative';

type PanelChromeProps = {
  palette: UniversePalette;
  theme: UniverseVisualTheme;
  /** When false, villain panels skip the ally-style chrome highlight. */
  allowVillain?: boolean;
  isVillain?: boolean;
};

export function PanelChrome({
  palette,
  theme,
  allowVillain = true,
  isVillain = false,
}: PanelChromeProps) {
  if (!theme.panelTopHighlight) return null;
  if (isVillain && !allowVillain) return null;

  if (theme.panelUsesHolographic) {
    return <HolographicPanelChrome accentColor={palette.accent} secondaryColor={palette.primary} />;
  }

  if (theme.panelUsesRainGlass) {
    return (
      <RainGlassPanelChrome
        creamColor={palette.bone}
        redColor={palette.primary}
        goldColor={palette.gold}
      />
    );
  }

  return null;
}
