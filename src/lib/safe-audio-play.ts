import { ambientDebug } from '@/lib/ambient-audio-debug';
import type { PlayResult } from '@/lib/ambient-player-adapter';

type Playable = {
  play: () => unknown;
};

export async function safePlay(player: Playable): Promise<PlayResult> {
  ambientDebug('safePlay called', { playerType: player.constructor?.name ?? 'unknown' });

  try {
    const result = player.play();
    if (result && typeof (result as Promise<unknown>).then === 'function') {
      await (result as Promise<unknown>);
    }
    ambientDebug('player.play succeeded');
    return { ok: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    ambientDebug('player.play failed', { error: message });
    return { ok: false, error: message };
  }
}
