import { UNIVERSES } from '@/data/narrative/universes';

export function getUniverseNameById(universeId: string): string | null {
  return UNIVERSES.find((universe) => universe.id === universeId)?.name ?? null;
}

export function getSagaTitleById(sagaId: string): string | null {
  for (const universe of UNIVERSES) {
    const saga = universe.sagas.find((entry) => entry.id === sagaId);
    if (saga) return saga.title;
  }
  return null;
}

/** Format a stored local ISO date (YYYY-MM-DD) for profile display. */
export function formatOnboardingStartedOn(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number);
  if (!year || !month || !day) return dateKey;

  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
