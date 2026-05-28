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
import type { Saga, Universe } from '@/types/narrative';

const vultureGangSaga: Saga = {
  id: 'vulture-gang',
  title: 'Vulture Gang',
  villainName: 'Elias Crow',
  villainTitle: 'Black Vulture Leader',
  villainCharacterId: ELIAS_CROW_ID,
  status: 'available',
  summary:
    'Outlaws prey on Dustfall where order is fragile — one skipped duty and the whole town learns how fast courage unravels.',
  rankTitles: ['Rookie Deputy', 'Trail Marshal', 'Frontier Legend'],
  characters: VULTURE_GANG_CHARACTERS,
  chapters: VULTURE_GANG_CHAPTERS,
};

const ironRailwayCompanySaga: Saga = {
  id: 'iron-railway-company',
  title: 'Iron Railway Company',
  villainName: 'Silas Vane',
  villainTitle: 'Corrupt Railway Baron',
  villainCharacterId: SILAS_VANE_ID,
  status: 'locked',
  requiredUnlockId: 'high-noon-story-unlock',
  unlockRequirementLabel: 'Complete High Noon',
  summary:
    'Build and defend a railway lifeline knowing progress always costs something — steel, sweat, and the compromises no one puts on the manifest.',
  rankTitles: ['Junior Logistics Manager', 'Route Marshal', 'Network Warden'],
  characters: IRON_RAILWAY_CHARACTERS,
  chapters: IRON_RAILWAY_CHAPTERS,
};

const honestBusinessmanSaga: Saga = {
  id: 'honest-businessman',
  title: 'Honest Businessman',
  villainName: 'Victor Crane',
  villainTitle: 'Corrupt Merchant Prince',
  villainCharacterId: VICTOR_CRANE_ID,
  status: 'locked',
  requiredUnlockId: 'honest-businessman-story-unlock',
  unlockRequirementLabel: 'Complete The Golden Route',
  summary:
    'Build a legitimate business in Dustfall while gangs, corrupt officials, and railway monopolies squeeze every honest coin — because honesty is expensive.',
  rankTitles: ['Frontier Shop Owner', 'Young Entrepreneur', 'Honest Businessman'],
  characters: HONEST_BUSINESSMAN_CHARACTERS,
  chapters: HONEST_BUSINESSMAN_CHAPTERS,
};

export const DUST_AND_IRON_UNIVERSE: Universe = {
  id: 'dust-and-iron',
  name: 'Dust & Iron',
  tagline: 'Dust storms, hard law, and fragile hope.',
  icon: '🤠',
  mentorName: 'Sheriff Ada Mercer',
  locationName: 'Dustfall',
  mood: 'Dusty, dark, dramatic — a frontier where order is fragile and every habit holds the line.',
  coreProgressionName: 'Deputy Reputation',
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

export const UNIVERSES: Universe[] = [DUST_AND_IRON_UNIVERSE];

export function getUniverse(universeId: string): Universe {
  const universe = UNIVERSES.find((u) => u.id === universeId);
  if (!universe) {
    throw new Error(`Universe not found: ${universeId}`);
  }
  return universe;
}
