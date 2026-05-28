import { Asset } from 'expo-asset';

import { AMBIENT_AUDIO_MODULE } from '@/constants/audio';
import { ambientDebug } from '@/lib/ambient-audio-debug';

export async function resolveAmbientAudioUri(): Promise<string> {
  ambientDebug('Asset load started', {
    moduleType: typeof AMBIENT_AUDIO_MODULE,
    module: AMBIENT_AUDIO_MODULE,
  });

  if (typeof AMBIENT_AUDIO_MODULE === 'string') {
    ambientDebug('Asset loaded (string module)', { uri: AMBIENT_AUDIO_MODULE });
    return AMBIENT_AUDIO_MODULE;
  }

  if (
    AMBIENT_AUDIO_MODULE &&
    typeof AMBIENT_AUDIO_MODULE === 'object' &&
    'uri' in AMBIENT_AUDIO_MODULE &&
    typeof AMBIENT_AUDIO_MODULE.uri === 'string'
  ) {
    ambientDebug('Asset loaded (object uri)', { uri: AMBIENT_AUDIO_MODULE.uri });
    return AMBIENT_AUDIO_MODULE.uri;
  }

  const asset = Asset.fromModule(AMBIENT_AUDIO_MODULE);
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
