import type { ImageSourcePropType } from 'react-native';

import { DUST_AND_IRON_MEDIA_ASSETS } from '@/constants/narrative-media/dust-and-iron';
import { NEURONET_MEDIA_ASSETS } from '@/constants/narrative-media/neuronet';
import { resolveMascotImageSource } from '@/lib/mascot-assets';

/** Static sample data for Style Lab — not connected to GameContext. */
export const STYLE_LAB_SAMPLE = {
  app: 'Questory',
  universe: 'Dust & Iron',
  universeAlt: 'NeuroNet',
  saga: 'Vulture Gang',
  chapterOrder: 2,
  chapterTitle: 'Smoke at Dawn',
  chapterLabel: 'Ch. 2 — Smoke at Dawn',
  progressCleared: 3,
  progressTotal: 8,
  threat: 28,
  level: 12,
  reputation: 340,
  mentorLabel: 'SASHA DIRECTIVE',
  mentorTitle: 'Keep the pressure on',
  mentorMessage:
    'Three bounties down. The trail runs hot toward the warehouse district.',
  primaryCta: 'Start Next Quest',
  secondaryActions: ['Quest Board', 'Story', 'Add Quest', 'Profile'] as const,
  quests: ['Chase the Outriders', 'Repair the Signal Post', 'Clear the Supply Trail'],
};

export const STYLE_LAB_ASSETS = {
  dustChapter: DUST_AND_IRON_MEDIA_ASSETS['dust-and-iron.chapter.02-burnt-warehouse'] as ImageSourcePropType,
  dustBanner: DUST_AND_IRON_MEDIA_ASSETS['dust-and-iron.saga.vulture-gang-banner'] as ImageSourcePropType,
  neuroChapter: NEURONET_MEDIA_ASSETS['neuronet.chapter.ghost-protocol.02-blackline-drop'] as ImageSourcePropType,
  sasha: resolveMascotImageSource('sasha', 'inviting', 'half'),
  marcus: resolveMascotImageSource('marcus', 'neutral', 'half'),
};

export type StyleLabVariantId =
  | 'riso-pulp'
  | 'blueprint'
  | 'brutalist'
  | 'sketchbook'
  | 'techwear'
  | 'neo-psychedelic'
  | 'pixel-grid'
  | 'mythic-atlas'
  | 'micrographic'
  | 'factory-pomo';

export type StyleLabViewMode = 'single' | 'compare';

export type StyleLabVariantMeta = {
  id: StyleLabVariantId;
  label: string;
  fullTitle: string;
  strongestUse: string;
  risk: string;
  questoryUse: string;
};

export const STYLE_LAB_VARIANTS: StyleLabVariantMeta[] = [
  {
    id: 'riso-pulp',
    label: 'Riso Pulp',
    fullTitle: 'Riso Pulp Quest Poster',
    strongestUse: 'Dust & Iron chapter drops, bounty posters, event screens',
    risk: 'Can feel zine/underground rather than premium app',
    questoryUse: 'Universe skin hero + stamp CTAs; not global chrome',
  },
  {
    id: 'blueprint',
    label: 'Blueprint',
    fullTitle: 'Blueprint Mission Board',
    strongestUse: 'Story map, saga planning, mission diagram screens',
    risk: 'Can read as wireframe or dev tool if over-labeled',
    questoryUse: 'Global structure for progress/node screens',
  },
  {
    id: 'brutalist',
    label: 'Brutalist',
    fullTitle: 'Brutalist Billboard Quest UI',
    strongestUse: 'Onboarding impact, chapter intros, marketing screenshots',
    risk: 'Too loud for daily utility; fatigue on long sessions',
    questoryUse: 'Chapter beats + CTAs; borrow sticker quest states',
  },
  {
    id: 'sketchbook',
    label: 'Sketchbook',
    fullTitle: 'Sketchbook Collage RPG Journal',
    strongestUse: 'Personal quests, journal/reflection, mascot moments',
    risk: 'Can look crafty or juvenile if overdone',
    questoryUse: 'Mascot transmission + user quest surfaces',
  },
  {
    id: 'techwear',
    label: 'Techwear',
    fullTitle: 'Techwear Signal Console',
    strongestUse: 'NeuroNet HQ, threat meters, protocol screens',
    risk: 'Generic tactical/cyber if cyan overused',
    questoryUse: 'NeuroNet universe skin (25–30%)',
  },
  {
    id: 'neo-psychedelic',
    label: 'Neo Psyche',
    fullTitle: 'Neo Psychedelic Story Engine',
    strongestUse: 'Chapter transitions, surreal story beats, rewards',
    risk: 'Unreadable chaos; not for settings/profile',
    questoryUse: 'Cinematic moments only — not daily HQ',
  },
  {
    id: 'pixel-grid',
    label: 'Pixel Grid',
    fullTitle: 'Pixel Grid Relic UI',
    strongestUse: 'Inventory, rewards, achievement grids',
    risk: 'Feels like retro game clone; accessibility',
    questoryUse: 'Reward/inventory modules; optional universe accent',
  },
  {
    id: 'mythic-atlas',
    label: 'Mythic Atlas',
    fullTitle: 'Mythic Editorial Atlas',
    strongestUse: 'Story screen, saga dossier, premium editorial HQ',
    risk: 'Generic fantasy book app if over-illustrated',
    questoryUse: 'Global story/atlas structure + warm narrative tone',
  },
  {
    id: 'micrographic',
    label: 'Micrographic',
    fullTitle: 'Micrographic Mission System',
    strongestUse: 'Global Questory system, metadata-dense HUD',
    risk: 'Too sterile or museum-poster; tiny text',
    questoryUse: 'Strong candidate for 70–75% global DNA',
  },
  {
    id: 'factory-pomo',
    label: 'Factory Pomo',
    fullTitle: 'Factory Pomo Operations Board',
    strongestUse: 'Industrial/future universes, ops-heavy screens',
    risk: 'Enterprise dashboard dullness',
    questoryUse: 'Future universe skin or ops sub-screens',
  },
];

export const STYLE_LAB_INTRO =
  'Radical visual exploration only. Some variants are intentionally too much. Final Questory may combine global structure from one variant and universe skins from others (70–75% / 25–30%).';

export function styleLabProgressRatio(): number {
  const { progressCleared, progressTotal } = STYLE_LAB_SAMPLE;
  return progressTotal > 0 ? progressCleared / progressTotal : 0;
}
