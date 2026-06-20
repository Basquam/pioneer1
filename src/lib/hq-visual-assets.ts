import type { ImageSourcePropType } from 'react-native';

import type { Chapter, Saga, Universe } from '@/types/narrative';
import {
  getChapterSceneImage,
  getSagaBannerImage,
  getUniverseMoodImage,
} from '@/lib/narrative-media';

export type HqVisualAsset = {
  source: ImageSourcePropType | null;
  kind: 'chapter' | 'saga' | 'universe' | 'abstract';
};

/** Resolve the best available HQ hero poster asset without dynamic require. */
export function resolveHqHeroVisual(
  universe: Universe,
  saga: Saga,
  chapter: Chapter | null | undefined,
): HqVisualAsset {
  if (chapter) {
    const chapterImage = getChapterSceneImage(chapter);
    if (chapterImage) return { source: chapterImage, kind: 'chapter' };
  }

  const sagaImage = getSagaBannerImage(saga);
  if (sagaImage) return { source: sagaImage, kind: 'saga' };

  const moodImage = getUniverseMoodImage(universe);
  if (moodImage) return { source: moodImage, kind: 'universe' };

  return { source: null, kind: 'abstract' };
}
