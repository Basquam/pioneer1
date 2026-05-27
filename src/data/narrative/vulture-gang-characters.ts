import type { NarrativeCharacter } from '@/types/narrative';

export const ADA_MERCER_ID = 'ada-mercer';
export const ELIAS_CROW_ID = 'elias-crow';
export const BRIGGS_ID = 'station-master-briggs';

export const VULTURE_GANG_CHARACTERS: NarrativeCharacter[] = [
  {
    id: ADA_MERCER_ID,
    sagaId: 'vulture-gang',
    name: 'Sheriff Ada Mercer',
    portrait: '★',
    role: 'Town Sheriff',
    personality: 'Steady, protective, and iron-willed under pressure.',
    lines: {
      greeting: [
        'Deputy — eyes up. Dustfall is watching how we carry ourselves.',
        'You showed up. That already puts you ahead of half this territory.',
      ],
      chapterIntro: [
        'They test us because they think discipline breaks first. Prove them wrong.',
        'Every task you finish is a bullet the vultures never get to fire.',
      ],
      questComplete: [
        'Good. That’s the kind of resolve this town needs at its back.',
        'You held the line. Keep that rhythm and they start to fear your shadow.',
        'Mercer nods once — rare praise, and it lands like a blessing.',
      ],
      questMissed: [
        'I won’t lie to you — hesitation costs us streets.',
        'The gang smells delay. Shake it off and ride back in.',
      ],
    },
  },
  {
    id: ELIAS_CROW_ID,
    sagaId: 'vulture-gang',
    name: 'Elias Crow',
    portrait: '🦅',
    role: 'Black Vulture Leader',
    personality: 'Cruel, theatrical, and obsessed with breaking morale.',
    isVillain: true,
    lines: {
      greeting: [
        'Enjoy your little chores, deputy. We own the night either way.',
        'Dustfall still breathes because I allow it.',
      ],
      chapterIntro: [
        'Another dawn, another chance for you to fail in public.',
        'Your discipline is a rumor. My gang is a fact.',
      ],
      questComplete: [],
      questMissed: [
        'Missed again? The town remembers who stayed inside.',
        'While you stall, my boys paint another warning on your walls.',
        'Soft hands, soft town. Keep it up — we’ll take the rest.',
        'You call that a bounty? I call that surrender with extra steps.',
      ],
    },
  },
  {
    id: BRIGGS_ID,
    sagaId: 'vulture-gang',
    name: 'Station Master Briggs',
    portrait: '🚂',
    role: 'Rail Station Master',
    personality: 'Practical, dry-humored, loyal to the working folk.',
    lines: {
      greeting: [
        'Trains run on time when people do. Help me keep both alive.',
        'Supplies don’t move themselves, deputy. Neither does courage.',
      ],
      chapterIntro: [
        'Rails are the town’s veins. Clog one route and everything chokes.',
        'Fix what’s in front of you. Dustfall survives on small victories.',
      ],
      questComplete: [
        'There — that’s one less crisis on my platform.',
        'You handled that cleaner than most freight schedules I’ve seen.',
        'Briggs exhales. For a second, the station feels safe again.',
      ],
      questMissed: [
        'Delayed errands stack like bad cargo. Clear the dock soon.',
        'I’ve seen towns fall from neglected chores. Don’t add Dustfall to the list.',
      ],
    },
  },
];
