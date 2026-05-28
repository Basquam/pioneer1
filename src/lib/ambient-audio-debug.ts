const TAG = '[AmbientAudio]';

export function ambientDebug(message: string, data?: unknown): void {
  if (!__DEV__) return;

  if (data !== undefined) {
    console.log(TAG, message, data);
    return;
  }

  console.log(TAG, message);
}
