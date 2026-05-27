import { VULTURE_GANG_CHAPTERS } from '@/data/narrative/vulture-gang-chapters';
import {
  ELIAS_CROW_ID,
  VULTURE_GANG_CHARACTERS,
} from '@/data/narrative/vulture-gang-characters';
import type { Saga, Universe } from '@/types/narrative';

const vultureGangSaga: Saga = {
  id: 'vulture-gang',
  title: 'Vulture Gang',
  villainName: 'Black Vulture Gang',
  villainTitle: 'Outlaw Syndicate',
  villainCharacterId: ELIAS_CROW_ID,
  status: 'available',
  summary: 'Outlaws extort Dustfall through fear, sabotage, and public humiliation.',
  rankTitles: ['Rookie Deputy', 'Trail Marshal', 'Frontier Legend'],
  characters: VULTURE_GANG_CHARACTERS,
  chapters: VULTURE_GANG_CHAPTERS,
};

const ironRailwayCompanySaga: Saga = {
  id: 'iron-railway-company',
  title: 'Iron Railway Company',
  villainName: 'Iron Railway Company',
  villainTitle: 'Corporate Barons',
  villainCharacterId: '',
  status: 'locked',
  requiredUnlockId: 'high-noon-story-unlock',
  unlockRequirementLabel: 'Complete High Noon',
  summary: 'A ruthless rail monopoly squeezes towns dry through debt and force.',
  rankTitles: ['Track Scout', 'Rail Ranger', 'Steelbreaker'],
  characters: [],
  chapters: [
    {
      id: 'steel-contract',
      order: 1,
      title: 'Steel Contract',
      territoryName: 'Railyard Gate',
      mapPosition: { x: 50, y: 50 },
      summary: 'Corporate rails tighten around Dustfall. A new saga begins.',
      dramaticPurpose: 'Open the Iron Railway conflict.',
      introDialogue: 'Sheriff Ada Mercer: The rails are moving again — and this time the enemy wears a ledger, not a bandana.',
      introScene: [],
      successDialogue: 'Sheriff Ada Mercer: First contract secured. The rails won’t own us without a fight.',
      failureDialogue: 'Sheriff Ada Mercer: They bought another mile of silence. Push back before the tracks swallow us.',
      questTemplates: [],
      chapterReward: { id: 'steel-contract-badge', type: 'badge', name: 'Rail Scout' },
    },
  ],
};

const honestBusinessmanSaga: Saga = {
  id: 'honest-businessman',
  title: 'Honest Businessman',
  villainName: 'Mr. Halbrook',
  villainTitle: 'Mask of Respectability',
  villainCharacterId: '',
  status: 'locked',
  summary: 'A charming merchant manipulates trade routes and political favors.',
  rankTitles: ['Ledger Hand', 'Dealbreaker', 'Truthbringer'],
  characters: [],
  chapters: [],
};

export const DUST_AND_IRON_UNIVERSE: Universe = {
  id: 'dust-and-iron',
  name: 'Dust & Iron',
  tagline: 'Dust storms, hard law, and fragile hope.',
  icon: '🤠',
  mentorName: 'Sheriff Ada Mercer',
  locationName: 'Dustfall',
  mood: 'Dusty, dark, dramatic, and unforgiving.',
  coreProgressionName: 'Deputy Campaign',
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
