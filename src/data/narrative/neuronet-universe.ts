import { GHOST_PROTOCOL_CHAPTERS } from '@/data/narrative/ghost-protocol-chapters';
import {
  DIRECTOR_CAIN_ID,
  GHOST_PROTOCOL_CHARACTERS,
} from '@/data/narrative/ghost-protocol-characters';
import { ZENITH_CORPORATION_CHAPTERS } from '@/data/narrative/zenith-corporation-chapters';
import {
  EXECUTIVE_HELIX_ID,
  ZENITH_CORPORATION_CHARACTERS,
} from '@/data/narrative/zenith-corporation-characters';
import { NEON_DELIVERY_CHAPTERS } from '@/data/narrative/neon-delivery-chapters';
import {
  NEON_DELIVERY_CHARACTERS,
  RAZOR_JACKAL_ID,
} from '@/data/narrative/neon-delivery-characters';
import type { Saga, Universe, UniverseFaction, UniverseTerminology } from '@/types/narrative';

export const NEURONET_UNIVERSE_UNLOCK_ID = 'neuronet-universe-unlock';
export const NEURONET_DEFAULT_SAGA_ID = 'ghost-protocol';
export const NEURONET_THEME = 'Memories can be edited.';

export const NEURONET_TERMINOLOGY: UniverseTerminology = {
  questTerm: 'Operation',
  mapTerm: 'District Nodes',
  streakTerm: 'Signal Stability',
  reputationTerm: 'Network Standing',
  chapterCompleteTerm: 'Sector Stabilized',
};

export const NEURONET_FACTIONS: UniverseFaction[] = [
  {
    id: 'zenith-corporation',
    name: 'Zenith Corporation',
    theme: 'Efficiency is obedience.',
    description:
      'Mega-corporation controlling city infrastructure and neural systems — every outage is a policy decision.',
  },
  {
    id: 'ghost-runners',
    name: 'Ghost Runners',
    theme: 'Memories can be edited.',
    description:
      'Illegal memory couriers and signal smugglers who trade in stolen recollections and forbidden data.',
  },
  {
    id: 'signal-ministry',
    name: 'Signal Ministry',
    theme: 'Safety requires visibility.',
    description:
      'Government-like oversight organization monitoring neural activity across the Neon Spire grid.',
  },
];

const ghostProtocolSaga: Saga = {
  id: 'ghost-protocol',
  title: 'Ghost Protocol',
  allyName: 'Lyra Voss',
  villainName: 'Director Cain',
  villainTitle: 'Signal Ministry Director',
  villainCharacterId: DIRECTOR_CAIN_ID,
  status: 'locked',
  requiredUnlockId: NEURONET_UNIVERSE_UNLOCK_ID,
  unlockRequirementLabel: 'Unlock NeuroNet',
  summary:
    'Smuggle dangerous memories through the Neon Spire as a Memory Runner — your mind is the battlefield, and every packet leaves a trace.',
  rankTitles: ['Memory Runner', 'Ghost Courier', 'Protocol Breaker'],
  characters: GHOST_PROTOCOL_CHARACTERS,
  chapters: GHOST_PROTOCOL_CHAPTERS,
};

const zenithCorporationSaga: Saga = {
  id: 'zenith-corporation',
  title: 'Zenith Corporation',
  allyName: 'Mira Kade',
  villainName: 'Executive Helix',
  villainTitle: 'Corporate Strategist',
  villainCharacterId: EXECUTIVE_HELIX_ID,
  status: 'locked',
  requiredUnlockId: 'zenith-corporation-story-unlock',
  unlockRequirementLabel: 'Complete Ghost Protocol',
  summary:
    'Climb inside a mega-corporation while discovering that productivity metrics are being used to control human memory and behavior.',
  rankTitles: ['Junior Systems Analyst', 'Compliance Lead', 'Network Architect'],
  characters: ZENITH_CORPORATION_CHARACTERS,
  chapters: ZENITH_CORPORATION_CHAPTERS,
};

const neonDeliverySaga: Saga = {
  id: 'neon-delivery',
  title: 'Neon Delivery',
  allyName: 'Juno Vale',
  villainName: 'Razor Jackal',
  villainTitle: 'Courier Gang Leader',
  villainCharacterId: RAZOR_JACKAL_ID,
  status: 'locked',
  requiredUnlockId: 'neon-delivery-story-unlock',
  unlockRequirementLabel: 'Complete Zenith Corporation',
  summary:
    'Survive high-risk deliveries across the neon city while discovering that every package carries someone’s secret.',
  rankTitles: ['Courier Rider', 'Route Phantom', 'Neon Legend'],
  characters: NEON_DELIVERY_CHARACTERS,
  chapters: NEON_DELIVERY_CHAPTERS,
};

export const NEURONET_UNIVERSE: Universe = {
  id: 'neuronet',
  name: 'NeuroNet',
  tagline: 'Neon rain, signal decay, and memories for sale.',
  icon: '💠',
  mentorName: 'Lyra Voss',
  locationName: 'Neon Spire',
  mood: 'Neon dystopia — rain-slick chrome, holographic UI, glitch artifacts, memory corruption, and constant overstimulation.',
  theme: NEURONET_THEME,
  coreProgressionName: 'Signal Integrity',
  terminology: NEURONET_TERMINOLOGY,
  factions: NEURONET_FACTIONS,
  ambientAudioId: 'neuronet-ambient',
  status: 'locked',
  requiredUnlockId: NEURONET_UNIVERSE_UNLOCK_ID,
  unlockRequirementLabel: 'Coming Soon',
  palette: {
    void: '#020408',
    night: '#060a14',
    primary: '#d946ef',
    accent: '#22d3ee',
    gold: '#e879f9',
    bone: '#e2e8f0',
    fog: '#94a3b8',
    ink: '#0f172a',
    panel: 'rgba(8, 12, 28, 0.92)',
    panelBorder: 'rgba(34, 211, 238, 0.38)',
    xpFill: '#22d3ee',
    xpTrack: 'rgba(255,255,255,0.06)',
    glow: 'rgba(34, 211, 238, 0.55)',
    villain: '#1e1b4b',
    villainGlow: '#f472b6',
    gradient: ['#020408', '#0c1222', '#1a0a2e'],
  },
  sagas: [ghostProtocolSaga, zenithCorporationSaga, neonDeliverySaga],
};
