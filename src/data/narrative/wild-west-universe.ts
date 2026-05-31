import { HONEST_BUSINESSMAN_CHAPTERS } from '@/data/narrative/honest-businessman-chapters';
import {
  HONEST_BUSINESSMAN_CHARACTERS,
  VICTOR_CRANE_ID,
} from '@/data/narrative/honest-businessman-characters';
import { IRON_RAILWAY_CHAPTERS } from '@/data/narrative/iron-railway-chapters';
import {
  IRON_RAILWAY_CHARACTERS,
  SILAS_VANE_ID,
} from '@/data/narrative/iron-railway-characters';
import { VULTURE_GANG_CHAPTERS } from '@/data/narrative/vulture-gang-chapters';
import {
  ELIAS_CROW_ID,
  VULTURE_GANG_CHARACTERS,
} from '@/data/narrative/vulture-gang-characters';
import type { Saga, Universe, UniverseFaction, UniverseTerminology } from '@/types/narrative';

export const DUST_AND_IRON_THEME = 'Order is fragile.';

export const DUST_AND_IRON_TERMINOLOGY: UniverseTerminology = {
  questTerm: 'Quest',
  mapTerm: 'Territory Map',
  streakTerm: 'Town Stability',
  reputationTerm: 'Reputation',
  chapterCompleteTerm: 'Chapter Complete',
};

export const DUST_AND_IRON_FACTIONS: UniverseFaction[] = [
  {
    id: 'vulture-gang',
    name: 'Vulture Gang',
    theme: 'Order is fragile.',
    description: 'Outlaws preying on Dustfall where discipline breaks and fear spreads fastest.',
  },
  {
    id: 'iron-railway-company',
    name: 'Iron Railway Company',
    theme: 'Progress always costs something.',
    description: 'Corporate rail barons who treat towns as assets and timetables as leverage.',
  },
  {
    id: 'dustfall-settlers',
    name: 'Dustfall Settlers',
    theme: 'Every habit holds the line.',
    description: 'Frontier folk building a town one honest day of work at a time.',
  },
];

const vultureGangSaga: Saga = {
  id: 'vulture-gang',
  title: 'Vulture Gang',
  media: { bannerImageKey: 'dust-and-iron.saga.vulture-gang-banner' },
  allyName: 'Sheriff Ada Mercer',
  villainName: 'Elias Crow',
  villainTitle: 'Black Vulture Leader',
  villainCharacterId: ELIAS_CROW_ID,
  status: 'available',
  summary:
    'Outlaws prey on Dustfall where order is fragile — one skipped duty and the whole town learns how fast courage unravels.',
  rankTitles: ['Rookie Deputy', 'Trail Marshal', 'Frontier Legend'],
  crewCode: [
    'A deputy keeps order before chaos asks permission.',
    'The town holds when someone shows up.',
  ],
  characters: VULTURE_GANG_CHARACTERS,
  chapters: VULTURE_GANG_CHAPTERS,
};

const ironRailwayCompanySaga: Saga = {
  id: 'iron-railway-company',
  title: 'Iron Railway Company',
  media: {
    bannerImageKey: 'dust-and-iron.saga.iron-railway-company-banner',
    detailImageKey: 'dust-and-iron.saga.iron-railway-office',
  },
  allyName: 'Station Master Briggs',
  villainName: 'Silas Vane',
  villainTitle: 'Corrupt Railway Baron',
  villainCharacterId: SILAS_VANE_ID,
  status: 'locked',
  requiredUnlockId: 'high-noon-story-unlock',
  unlockRequirementLabel: 'Complete Vulture Gang',
  summary:
    'Build and defend a railway lifeline knowing progress always costs something — steel, sweat, and the compromises no one puts on the manifest.',
  rankTitles: ['Junior Logistics Manager', 'Route Marshal', 'Network Warden'],
  crewCode: [
    'The line runs because someone checks the details.',
    'A delayed shipment is a broken promise.',
  ],
  characters: IRON_RAILWAY_CHARACTERS,
  chapters: IRON_RAILWAY_CHAPTERS,
};

const honestBusinessmanSaga: Saga = {
  id: 'honest-businessman',
  title: 'Honest Businessman',
  allyName: 'Mara Bell',
  villainName: 'Victor Crane',
  villainTitle: 'Corrupt Merchant Prince',
  villainCharacterId: VICTOR_CRANE_ID,
  status: 'locked',
  requiredUnlockId: 'honest-businessman-story-unlock',
  unlockRequirementLabel: 'Complete Iron Railway Company',
  summary:
    'Build a legitimate business in Dustfall while gangs, corrupt officials, and railway monopolies squeeze every honest coin — because honesty is expensive.',
  rankTitles: ['Frontier Shop Owner', 'Young Entrepreneur', 'Honest Businessman'],
  crewCode: [
    'Honesty is expensive, but debt costs more.',
    'A clean ledger is a quiet weapon.',
  ],
  characters: HONEST_BUSINESSMAN_CHARACTERS,
  chapters: HONEST_BUSINESSMAN_CHAPTERS,
};

export const DUST_AND_IRON_UNIVERSE: Universe = {
  id: 'dust-and-iron',
  name: 'Dust & Iron',
  tagline: 'Dust storms, hard law, and fragile hope.',
  icon: '🤠',
  media: { moodImageKey: 'dust-and-iron.mood' },
  mentorName: 'Sheriff Ada Mercer',
  locationName: 'Dustfall',
  mood: 'Dusty, dark, dramatic — a frontier where order is fragile and every habit holds the line.',
  theme: DUST_AND_IRON_THEME,
  coreProgressionName: 'Deputy Reputation',
  terminology: DUST_AND_IRON_TERMINOLOGY,
  factions: DUST_AND_IRON_FACTIONS,
  ambientAudioId: 'dustfall-ambient',
  status: 'available',
  palette: {
    void: '#050308',
    night: '#0c0610',
    primary: '#c41e3a',
    accent: '#e85d04',
    gold: '#f4a261',
    bone: '#f5f0e8',
    fog: '#a8a29e',
    ink: '#1a0f14',
    panel: 'rgba(20, 8, 12, 0.92)',
    panelBorder: 'rgba(196, 30, 58, 0.55)',
    xpFill: '#f4a261',
    xpTrack: 'rgba(255,255,255,0.08)',
    glow: 'rgba(244, 162, 97, 0.65)',
    villain: '#4a1942',
    villainGlow: '#9d4edd',
    gradient: ['#050308', '#1a0a12', '#2d1518'],
  },
  sagas: [vultureGangSaga, ironRailwayCompanySaga, honestBusinessmanSaga],
};
