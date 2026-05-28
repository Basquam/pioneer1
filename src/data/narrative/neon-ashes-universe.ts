import { JAZZ_CLUB_SECRETS_CHAPTERS } from '@/data/narrative/jazz-club-secrets-chapters';
import {
  JAZZ_CLUB_SECRETS_CHARACTERS,
  VINCENT_NOIR_ID,
} from '@/data/narrative/jazz-club-secrets-characters';
import { CAMPUS_MURDERS_CHAPTERS } from '@/data/narrative/campus-murders-chapters';
import {
  CAMPUS_MURDERS_CHARACTERS,
  THE_GLASS_STUDENT_ID,
} from '@/data/narrative/campus-murders-characters';
import { HOLLOW_SYNDICATE_CHAPTERS } from '@/data/narrative/hollow-syndicate-chapters';
import {
  HOLLOW_SYNDICATE_CHARACTERS,
  MARCUS_VALE_ID,
} from '@/data/narrative/hollow-syndicate-characters';
import type { Saga, Universe, UniverseFaction, UniverseTerminology } from '@/types/narrative';

export const NEON_ASHES_UNIVERSE_UNLOCK_ID = 'neon-ashes-universe-unlock';
export const NEON_ASHES_DEFAULT_SAGA_ID = 'hollow-syndicate';
export const NEON_ASHES_THEME = 'Every truth leaves a shadow.';

export const NEON_ASHES_TERMINOLOGY: UniverseTerminology = {
  questTerm: 'Lead',
  mapTerm: 'Case Board',
  streakTerm: 'Case Momentum',
  reputationTerm: 'Detective Standing',
  chapterCompleteTerm: 'Case Advanced',
};

export const NEON_ASHES_FACTIONS: UniverseFaction[] = [
  {
    id: 'hollow-syndicate',
    name: 'Hollow Syndicate',
    theme: 'Power hides in plain sight.',
    description:
      'A criminal network woven through city hall, docks, and backroom deals — influence without fingerprints.',
  },
  {
    id: 'the-precinct',
    name: 'The Precinct',
    theme: 'Law is not always justice.',
    description:
      'The official badge and the old case files — where procedure protects the powerful as often as it protects the people.',
  },
  {
    id: 'red-room-club',
    name: 'Red Room Club',
    theme: 'Everyone tells the truth differently.',
    description:
      'A velvet-lined underworld of jazz, whispers, and witnesses who only speak after midnight.',
  },
];

const hollowSyndicateSaga: Saga = {
  id: 'hollow-syndicate',
  title: 'Hollow Syndicate',
  allyName: 'Evelyn Cross',
  villainName: 'Marcus Vale',
  villainTitle: 'Syndicate Architect',
  villainCharacterId: MARCUS_VALE_ID,
  status: 'locked',
  requiredUnlockId: NEON_ASHES_UNIVERSE_UNLOCK_ID,
  unlockRequirementLabel: 'Unlock Neon Ashes',
  summary:
    'Work the shadows as a private investigator and expose a city-wide criminal conspiracy before the truth is buried for good.',
  rankTitles: ['Private Investigator', 'Conspiracy Breaker', 'City Truthfinder'],
  characters: HOLLOW_SYNDICATE_CHARACTERS,
  chapters: HOLLOW_SYNDICATE_CHAPTERS,
};

const campusMurdersSaga: Saga = {
  id: 'campus-murders',
  title: 'Campus Murders',
  allyName: 'Professor Lena Ward',
  villainName: 'The Glass Student',
  villainTitle: 'Academy Phantom',
  villainCharacterId: THE_GLASS_STUDENT_ID,
  status: 'locked',
  requiredUnlockId: 'campus-murders-story-unlock',
  unlockRequirementLabel: 'Complete Hollow Syndicate',
  summary:
    'Arrive as a visiting investigator at a prestigious academy where polished halls hide a series of murders no one wants solved.',
  rankTitles: ['Visiting Investigator', 'Campus Sleuth', 'Academy Reckoner'],
  characters: CAMPUS_MURDERS_CHARACTERS,
  chapters: CAMPUS_MURDERS_CHAPTERS,
};

const jazzClubSecretsSaga: Saga = {
  id: 'jazz-club-secrets',
  title: 'Jazz Club Secrets',
  allyName: 'Rosa Bell',
  villainName: 'Vincent Noir',
  villainTitle: 'Club Proprietor',
  villainCharacterId: VINCENT_NOIR_ID,
  status: 'locked',
  requiredUnlockId: 'jazz-club-secrets-story-unlock',
  unlockRequirementLabel: 'Complete Campus Murders',
  summary:
    'Patrol the after-hours city as a night detective and uncover secrets buried beneath smoke, saxophone, and silence.',
  rankTitles: ['Night Detective', 'After-Hours Sleuth', 'City Confessor'],
  characters: JAZZ_CLUB_SECRETS_CHARACTERS,
  chapters: JAZZ_CLUB_SECRETS_CHAPTERS,
};

export const NEON_ASHES_UNIVERSE: Universe = {
  id: 'neon-ashes',
  name: 'Neon Ashes',
  tagline: 'Rain, jazz, and truths that refuse to stay buried.',
  icon: '🕵',
  mentorName: 'Evelyn Cross',
  locationName: 'Grayhaven',
  mood: 'Noir detective — rain, jazz, cigarette smoke, old case files, corrupted city officials, and lonely investigation.',
  theme: NEON_ASHES_THEME,
  coreProgressionName: 'Case Integrity',
  terminology: NEON_ASHES_TERMINOLOGY,
  factions: NEON_ASHES_FACTIONS,
  status: 'locked',
  requiredUnlockId: NEON_ASHES_UNIVERSE_UNLOCK_ID,
  unlockRequirementLabel: 'Coming Soon',
  ambientAudioId: 'neon-ashes-ambient',
  palette: {
    void: '#0a0808',
    night: '#121010',
    primary: '#8b1e2f',
    accent: '#c4a574',
    gold: '#b8956a',
    bone: '#f5f0e6',
    fog: '#9a9088',
    ink: '#1a1412',
    panel: 'rgba(18, 14, 12, 0.88)',
    panelBorder: 'rgba(139, 30, 47, 0.45)',
    xpFill: '#c4a574',
    xpTrack: 'rgba(255,255,255,0.06)',
    glow: 'rgba(196, 165, 116, 0.45)',
    villain: '#2a1018',
    villainGlow: '#8b1e2f',
    gradient: ['#0a0808', '#141010', '#1a0c10'],
  },
  sagas: [hollowSyndicateSaga, campusMurdersSaga, jazzClubSecretsSaga],
};
