export function xpRequiredForLevel(level: number): number {
  return level * 250;
}

export function computeLevel(totalXp: number): {
  level: number;
  xpInLevel: number;
  xpToNext: number;
  progress: number;
} {
  let level = 1;
  let accumulated = 0;

  while (totalXp >= accumulated + xpRequiredForLevel(level)) {
    accumulated += xpRequiredForLevel(level);
    level += 1;
  }

  const xpInLevel = totalXp - accumulated;
  const xpToNext = xpRequiredForLevel(level);
  const progress = xpToNext > 0 ? xpInLevel / xpToNext : 0;

  return { level, xpInLevel, xpToNext, progress };
}

export function rankForLevel(themeRanks: string[], level: number): string {
  if (level >= 8) return themeRanks[2] ?? themeRanks[themeRanks.length - 1];
  if (level >= 4) return themeRanks[1] ?? themeRanks[0];
  return themeRanks[0];
}
