import { BRIGGS_ID } from '@/data/narrative/vulture-gang-characters';
import type { NarrativeCharacter } from '@/types/narrative';

export const SILAS_VANE_ID = 'silas-vane';

export const IRON_RAILWAY_CHARACTERS: NarrativeCharacter[] = [
  {
    id: BRIGGS_ID,
    sagaId: 'iron-railway-company',
    name: 'Station Master Briggs',
    portrait: '🚂',
    role: 'Main Ally · Station Master',
    personality: 'Practical, dry-humored, loyal to the working folk on the line.',
    lines: {
      greeting: [
        'Junior manager — the rails don’t care about excuses. They care about schedules.',
        'You’re on my platform now. Keep the freight moving and Dustfall eats.',
      ],
      chapterIntro: [
        'Every shipment you clear is a town that stays fed. Don’t let Vane clog the line.',
        'Logistics is war with paperwork. Win the small battles and the route holds.',
      ],
      questComplete: [
        'Good. That’s one less delay on my manifest.',
        'Clean handoff. Vane hates when we keep pace without him.',
        'Briggs taps the ledger — for once, the numbers smile back.',
      ],
      questMissed: [
        'Missed deadlines stack like derailed cars. Clear the dock.',
        'Vane’s men watch our delays. Don’t give them a telegram to celebrate.',
      ],
    },
  },
  {
    id: SILAS_VANE_ID,
    sagaId: 'iron-railway-company',
    name: 'Silas Vane',
    portrait: '🎩',
    role: 'Corrupt Railway Baron',
    personality: 'Smug, calculating, treats towns as assets to squeeze.',
    isVillain: true,
    lines: {
      greeting: [
        'Ah — the junior manager. How quaint. The rails belong to those who can afford them.',
        'Your little logistics network amuses me. Until the invoice arrives.',
      ],
      chapterIntro: [
        'Another shipment due? How unfortunate — I own the timetable.',
        'Every delay you suffer is a dividend I collect.',
      ],
      questComplete: [],
      questMissed: [
        'Cargo sitting idle? Excellent. Silence on the line suits my shareholders.',
        'While you stall, my contracts tighten around Dustfall’s throat.',
        'Broken schedule, broken town. Simple arithmetic, manager.',
        'The Golden Route was never meant for people like you.',
      ],
    },
  },
];
