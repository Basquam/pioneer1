import { getUniverseVisualTheme } from '@/constants/universe-visual-theme';
import { useGame } from '@/hooks/use-game';

export function useUniverseVisualTheme() {
  const { activeUniverse } = useGame();
  return getUniverseVisualTheme(activeUniverse.id);
}
