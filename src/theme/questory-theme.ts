/**
 * Questory global design tokens — Cinematic Quest OS foundation.
 * Universe-specific accents live in universe-skins.ts; runtime palette still comes from narrative data.
 */
export const QuestoryTheme = {
  colors: {
    background: {
      deep: '#050308',
      panel: '#0d0a14',
      elevated: '#12101a',
    },
    surface: {
      primary: 'rgba(16, 12, 20, 0.94)',
      raised: 'rgba(22, 16, 28, 0.96)',
      glass: 'rgba(8, 12, 28, 0.72)',
    },
    text: {
      primary: '#f5f0e6',
      secondary: '#c8c0b8',
      muted: '#9a93a8',
    },
    accent: {
      gold: '#D4AF37',
      danger: '#e85d5d',
      success: '#6bbf8a',
    },
    border: {
      subtle: 'rgba(255, 255, 255, 0.08)',
      strong: 'rgba(212, 175, 55, 0.35)',
      inner: 'rgba(255, 255, 255, 0.04)',
    },
    glow: {
      gold: 'rgba(212, 175, 55, 0.22)',
      cyan: 'rgba(34, 211, 238, 0.18)',
      danger: 'rgba(232, 93, 93, 0.2)',
    },
    universe: {
      dustIron: {
        primary: '#f4a261',
        secondary: '#e85d04',
        surface: 'rgba(28, 16, 14, 0.94)',
        border: 'rgba(244, 162, 97, 0.38)',
        glow: 'rgba(244, 162, 97, 0.2)',
      },
      neuroNet: {
        primary: '#22d3ee',
        secondary: '#d946ef',
        surface: 'rgba(8, 12, 28, 0.92)',
        border: 'rgba(34, 211, 238, 0.34)',
        glow: 'rgba(34, 211, 238, 0.16)',
      },
      default: {
        primary: '#D4AF37',
        secondary: '#c4a35a',
        surface: 'rgba(16, 12, 20, 0.94)',
        border: 'rgba(212, 175, 55, 0.3)',
        glow: 'rgba(212, 175, 55, 0.16)',
      },
    },
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 2,
    md: 4,
    lg: 8,
  },
  shadow: {
    soft: {
      shadowColor: '#000',
      shadowOpacity: 0.22,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    raised: {
      shadowColor: '#000',
      shadowOpacity: 0.32,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 4 },
      elevation: 5,
    },
    glowGold: {
      shadowColor: '#D4AF37',
      shadowOpacity: 0.18,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
    glowCyan: {
      shadowColor: '#22d3ee',
      shadowOpacity: 0.16,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 0 },
      elevation: 4,
    },
  },
  motion: {
    fast: 120,
    normal: 250,
    slow: 500,
  },
} as const;

export type QuestoryCardVariant =
  | 'default'
  | 'elevated'
  | 'dossier'
  | 'terminal'
  | 'danger'
  | 'success';
