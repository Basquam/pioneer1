import { getLocalDateKey } from '@/lib/daily-streak';
import type { Saga } from '@/types/narrative';

function hashSeed(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

export function getCrewCodeLines(saga: Pick<Saga, 'crewCode'>): string[] {
  return saga.crewCode?.filter((line) => line.trim().length > 0) ?? [];
}

/** Same saga + date always resolves to the same line — stable for the local day. */
export function getDailyCrewCodeLine(
  saga: Pick<Saga, 'id' | 'crewCode'>,
  dateKey: string = getLocalDateKey(),
): string | null {
  const lines = getCrewCodeLines(saga);
  if (lines.length === 0) return null;

  const index = hashSeed(`${saga.id}:${dateKey}`) % lines.length;
  return lines[index] ?? null;
}

export function hasCrewCode(saga: Pick<Saga, 'crewCode'>): boolean {
  return getCrewCodeLines(saga).length > 0;
}
