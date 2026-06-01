import { Asset } from 'expo-asset';

import {
  AMBIENT_AUDIO_BY_UNIVERSE_ID,
  getAmbientAudioModule,
  getAmbientTensionAudioModule,
} from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';

async function resolveModuleUri(module: number | string | { uri: string }): Promise<string> {
  ambientDebug('Asset load started', {
    moduleType: typeof module,
    module,
  });

  if (typeof module === 'string') {
    ambientDebug('Asset loaded (string module)', { uri: module });
    return module;
  }

  if (module && typeof module === 'object' && 'uri' in module && typeof module.uri === 'string') {
    ambientDebug('Asset loaded (object uri)', { uri: module.uri });
    return module.uri;
  }

  const asset = Asset.fromModule(module as number);
  if (!asset.downloaded) {
    await asset.downloadAsync();
  }

  const uri = asset.localUri ?? asset.uri;
  ambientDebug('Asset loaded (expo-asset)', {
    uri,
    localUri: asset.localUri,
    name: asset.name,
    type: asset.type,
  });

  return uri;
}

export async function resolveAmbientAudioUri(universeId: string): Promise<string> {
  const module = getAmbientAudioModule(universeId);
  if (!module) {
    throw new Error(`No ambient audio module for universe: ${universeId}`);
  }

  return resolveModuleUri(module);
}

export async function resolveAmbientTensionAudioUri(universeId: string): Promise<string> {
  const module = getAmbientTensionAudioModule(universeId);
  if (!module) {
    throw new Error(`No ambient tension audio module for universe: ${universeId}`);
  }

  return resolveModuleUri(module);
}

export function listAmbientUniverseIds(): string[] {
  return Object.entries(AMBIENT_AUDIO_BY_UNIVERSE_ID)
    .filter(([, module]) => module !== null)
    .map(([universeId]) => universeId);
}
