/**
 * In-memory session dedupe for analytics events that must not fire twice
 * due to React re-renders or repeated hydration. Clears on app restart.
 */
const firedKeys = new Set<string>();

/** Fire `track` at most once per unique key for the current app session. */
export function trackAnalyticsOnce(key: string, track: () => void): void {
  if (firedKeys.has(key)) return;
  firedKeys.add(key);
  track();
}
