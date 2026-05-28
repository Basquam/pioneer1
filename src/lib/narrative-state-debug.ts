export function narrativeWarn(message: string, details?: unknown): void {
  if (__DEV__) {
    console.warn(`[narrative] ${message}`, details ?? '');
  }
}
