import type { ImageSourcePropType } from 'react-native';

import { DUST_AND_IRON_MEDIA_ASSETS } from '@/constants/narrative-media/dust-and-iron';
import { NEURONET_MEDIA_ASSETS } from '@/constants/narrative-media/neuronet';
import { resolveMascotImageSource } from '@/lib/mascot-assets';

/** Static sample data for HQ Design Lab — not connected to GameContext. */
export const HQ_LAB_SAMPLE = {
  level: 12,
  reputation: 340,
  universe: 'Dust & Iron',
  universeIcon: '🌵',
  saga: 'Vulture Gang',
  chapterOrder: 2,
  chapterTitle: 'Smoke at Dawn',
  chapterLabel: 'Ch. 2 — Smoke at Dawn',
  chapterSummary:
    'Smoke rises from the east warehouse. The outriders were here — three bounties cleared, five still burning on the trail.',
  progressCleared: 3,
  progressTotal: 8,
  villainInfluence: 28,
  guide: {
    mascot: 'sasha' as const,
    label: 'SASHA DIRECTIVE',
    title: 'Keep the pressure on',
    message:
      'Three bounties down. The trail runs hot toward the warehouse district — do not let this chapter go cold.',
    actionLabel: 'ADD QUEST',
  },
  quests: ['Chase the Outriders', 'Repair the Signal Post', 'Clear the Supply Trail'],
  ctaLabel: 'GO TO QUEST BOARD',
  ctaHint: 'VIEW BOUNTIES & QUESTS',
};

export const HQ_LAB_ASSETS = {
  dustChapterHero: DUST_AND_IRON_MEDIA_ASSETS['dust-and-iron.chapter.02-burnt-warehouse'] as ImageSourcePropType,
  dustSagaBanner: DUST_AND_IRON_MEDIA_ASSETS['dust-and-iron.saga.vulture-gang-banner'] as ImageSourcePropType,
  dustMood: DUST_AND_IRON_MEDIA_ASSETS['dust-and-iron.mood'] as ImageSourcePropType,
  neuroHero: NEURONET_MEDIA_ASSETS['neuronet.chapter.ghost-protocol.02-blackline-drop'] as ImageSourcePropType,
  neuroMood: NEURONET_MEDIA_ASSETS['neuronet.mood'] as ImageSourcePropType,
  sashaPortrait: resolveMascotImageSource('sasha', 'inviting', 'half'),
  marcusPortrait: resolveMascotImageSource('marcus', 'neutral', 'half'),
};

export type HqLabVariantId = 'editorial' | 'pulp' | 'neuronet';

export type HqLabViewMode = 'single' | 'compare';

export type HqLabVariantMeta = {
  id: HqLabVariantId;
  label: string;
  fullTitle: string;
  dnaNotes: string[];
};

export const HQ_LAB_VARIANTS: HqLabVariantMeta[] = [
  {
    id: 'editorial',
    label: 'Editorial',
    fullTitle: 'Variant A — Editorial Story Console',
    dnaNotes: [
      'Best for global Questory system',
      'Clean, premium, scalable',
      'Risk: can feel too generic if not given stronger world flavor',
    ],
  },
  {
    id: 'pulp',
    label: 'Pulp',
    fullTitle: 'Variant B — Pulp Mission Dossier',
    dnaNotes: [
      'Best for Dust & Iron skin',
      'Strongest story/poster personality',
      'Risk: can become too western if overused globally',
    ],
  },
  {
    id: 'neuronet',
    label: 'NeuroNet',
    fullTitle: 'Variant C — NeuroNet Protocol Console',
    dnaNotes: [
      'Best for NeuroNet skin',
      'Strongest cyber mission feel',
      'Risk: can become too technical/cold if used globally',
    ],
  },
];

export const HQ_LAB_RECOMMENDATION =
  'Use this lab to choose the global Questory structure and the universe-specific skin language. The final product should be 70–75% global system and 25–30% universe skin.';

export function getHqLabProgressRatio(): number {
  const { progressCleared, progressTotal } = HQ_LAB_SAMPLE;
  return progressTotal > 0 ? progressCleared / progressTotal : 0;
}
