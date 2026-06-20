import type { ViewStyle } from 'react-native';

import { QuestoryTheme, type QuestoryCardVariant } from '@/theme/questory-theme';

export type UniverseSkinId = 'dust-and-iron' | 'neuronet' | 'default';

export type UniverseSkin = {
  id: UniverseSkinId;
  label: string;
  cardVariant: QuestoryCardVariant;
  accentPrimary: string;
  accentSecondary: string;
  surfaceBackground: string;
  surfaceBorder: string;
  glowColor: string;
  cardSkew: number;
  accentStripWidth: number;
  panelShadow: ViewStyle;
};

const DUST_AND_IRON_SKIN: UniverseSkin = {
  id: 'dust-and-iron',
  label: 'Mission Dossier',
  cardVariant: 'dossier',
  accentPrimary: QuestoryTheme.colors.universe.dustIron.primary,
  accentSecondary: QuestoryTheme.colors.universe.dustIron.secondary,
  surfaceBackground: QuestoryTheme.colors.universe.dustIron.surface,
  surfaceBorder: QuestoryTheme.colors.universe.dustIron.border,
  glowColor: QuestoryTheme.colors.universe.dustIron.glow,
  cardSkew: -2,
  accentStripWidth: 4,
  panelShadow: QuestoryTheme.shadow.soft,
};

const NEURONET_SKIN: UniverseSkin = {
  id: 'neuronet',
  label: 'Neon Tactical Terminal',
  cardVariant: 'terminal',
  accentPrimary: QuestoryTheme.colors.universe.neuroNet.primary,
  accentSecondary: QuestoryTheme.colors.universe.neuroNet.secondary,
  surfaceBackground: QuestoryTheme.colors.universe.neuroNet.surface,
  surfaceBorder: QuestoryTheme.colors.universe.neuroNet.border,
  glowColor: QuestoryTheme.colors.universe.neuroNet.glow,
  cardSkew: 0,
  accentStripWidth: 2,
  panelShadow: QuestoryTheme.shadow.glowCyan,
};

const DEFAULT_SKIN: UniverseSkin = {
  id: 'default',
  label: 'Cinematic Quest OS',
  cardVariant: 'default',
  accentPrimary: QuestoryTheme.colors.universe.default.primary,
  accentSecondary: QuestoryTheme.colors.universe.default.secondary,
  surfaceBackground: QuestoryTheme.colors.universe.default.surface,
  surfaceBorder: QuestoryTheme.colors.universe.default.border,
  glowColor: QuestoryTheme.colors.universe.default.glow,
  cardSkew: -1,
  accentStripWidth: 3,
  panelShadow: QuestoryTheme.shadow.glowGold,
};

const SKINS: Record<UniverseSkinId, UniverseSkin> = {
  'dust-and-iron': DUST_AND_IRON_SKIN,
  neuronet: NEURONET_SKIN,
  default: DEFAULT_SKIN,
};

function normalizeUniverseId(universeId: string): UniverseSkinId {
  if (universeId === 'dust-and-iron') return 'dust-and-iron';
  if (universeId === 'neuronet') return 'neuronet';
  return 'default';
}

export function getUniverseSkin(universeId: string): UniverseSkin {
  return SKINS[normalizeUniverseId(universeId)];
}

export function getUniverseAccent(universeId: string): { primary: string; secondary: string } {
  const skin = getUniverseSkin(universeId);
  return { primary: skin.accentPrimary, secondary: skin.accentSecondary };
}

export function getUniverseSurfaceStyle(
  universeId: string,
  variant: QuestoryCardVariant = 'default',
): ViewStyle {
  const skin = getUniverseSkin(universeId);

  const borderColor =
    variant === 'danger'
      ? QuestoryTheme.colors.accent.danger
      : variant === 'success'
        ? QuestoryTheme.colors.accent.success
        : skin.surfaceBorder;

  const backgroundColor =
    variant === 'elevated'
      ? QuestoryTheme.colors.surface.raised
      : skin.surfaceBackground;

  return {
    backgroundColor,
    borderColor,
    borderWidth: 1,
    ...(variant === 'elevated' || variant === 'terminal' ? skin.panelShadow : {}),
  };
}

export function getUniverseCardVariant(universeId: string): QuestoryCardVariant {
  return getUniverseSkin(universeId).cardVariant;
}
