import type { NarrativeCharacter } from '@/types/narrative';

export const ADA_MERCER_ID = 'ada-mercer';
export const ELIAS_CROW_ID = 'elias-crow';
export const BRIGGS_ID = 'station-master-briggs';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const VULTURE_GANG_THEME = 'Order is fragile.';

export const VULTURE_GANG_CHARACTERS: NarrativeCharacter[] = [
  {
    id: ADA_MERCER_ID,
    sagaId: 'vulture-gang',
    name: 'Sheriff Ada Mercer',
    portrait: '★',
    media: {
      portraitImageKey: 'dust-and-iron.character.ada-mercer-neutral',
      portraitExpressions: {
        neutral: 'dust-and-iron.character.ada-mercer-neutral',
        approving: 'dust-and-iron.character.ada-mercer-approving',
        worried: 'dust-and-iron.character.ada-mercer-worried',
      },
    },
    role: 'Town Sheriff',
    personality:
      'Steady, protective, and iron-willed — slow to trust, impossible to shake once she does.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'Deputy. Report in, keep it brief — Dustfall doesn’t reward speeches.',
        'You showed up. That counts for more than you think out here.',
        'Eyes up, shoulders back. The town reads your posture before your badge.',
        'I’ve seen deputies crack when the wind turns cold. You haven’t yet.',
        'You handle your work clean. I notice — even when I don’t say it.',
        'I trust your rhythm now. Don’t make me regret lending you the badge.',
        'Ride close tonight. If Crow’s boys move, I want you within earshot.',
      ],
      chapterIntro: [
        'They test us because they think discipline breaks first. Prove them wrong.',
        'Every task you finish is a barricade the vultures never get to cross.',
        'Order is fragile out here. Hold the line one chore at a time.',
        'The town exhales when you show up on schedule. Keep giving them that.',
        'I’ve stopped checking your work twice. That’s respect, deputy — don’t waste it.',
        'Crow wants us tired. Stay sharp. I’ll cover your blind side.',
        'If this chapter breaks wrong, people get hurt who can’t defend themselves. Ride hard.',
      ],
      questComplete: [
        'Done. That’s the baseline — not the finish line.',
        'Clean hand. Keep that pace and the gang starts watching their backs.',
        'You held the line. Dustfall felt it, even if nobody cheered.',
        'Good work, deputy. You’re becoming someone this town can lean on.',
        'I’d put you on the hard routes now. That’s trust — earn it again tomorrow.',
        'You didn’t flinch. That matters more than a clean saloon floor.',
        'Stay close to the station tonight. I don’t say that to everyone.',
        'If Crow comes for us, I want you at my shoulder. You’ve earned that post.',
      ],
      questMissed: [
        'I won’t dress it up — hesitation costs us streets.',
        'The gang smells delay. Shake it off and ride back in.',
        'Order is fragile. One missed duty and the whole town feels it.',
        'I’m not angry. I’m worried. There’s a difference out here.',
        'Get back in the saddle. People are counting on you whether they say it or not.',
      ],
    },
  },
  {
    id: ELIAS_CROW_ID,
    sagaId: 'vulture-gang',
    name: 'Elias Crow',
    portrait: '🦅',
    media: {
      portraitImageKey: 'dust-and-iron.character.elias-crow-neutral',
      portraitExpressions: {
        neutral: 'dust-and-iron.character.elias-crow-neutral',
        taunting: 'dust-and-iron.character.elias-crow-taunting',
        angry: 'dust-and-iron.character.elias-crow-angry',
      },
    },
    role: 'Black Vulture Leader',
    personality:
      'Charismatic and morally gray — he believes fear is the only law a forgotten frontier respects.',
    isVillain: true,
    affinityLabel: 'Rivalry',
    lines: {
      greeting: [
        'Deputy. Still polishing a dying town? How noble. How temporary.',
        'Dustfall breathes on borrowed time. I’m merely collecting the interest.',
        'You look tired. Good. Tired towns hire men like me eventually.',
      ],
      chapterIntro: [
        'Another dawn, another chance for your little order to crack.',
        'Your sheriff sells discipline like it’s armor. I sell the truth — order is fragile.',
        'I don’t hate Dustfall. I hate watching it pretend one good week means salvation.',
        'Keep your chores. I’ll keep my patience. One of us is playing the long game.',
      ],
      questComplete: [
        'You kept the clock wound. Shame you’re winding it for a town that won’t pay you back.',
      ],
      questMissed: [
        'Missed again? The town remembers who stayed inside when the bell rang.',
        'While you stall, my boys paint another warning on your walls.',
        'Soft hands, soft town. Keep it up — we’ll finish what your law started.',
        'You call that a bounty? I call that proof my argument is winning.',
        'Your sheriff can’t be everywhere. That’s not cruelty — that’s arithmetic.',
        'Every empty chore is a sermon I didn’t have to preach.',
        'I lost a brother to men who looked away. I won’t look away from Dustfall.',
      ],
    },
  },
  {
    id: BRIGGS_ID,
    sagaId: 'vulture-gang',
    name: 'Station Master Briggs',
    portrait: '🚂',
    media: {
      portraitImageKey: 'dust-and-iron.character.station-master-briggs-neutral',
      portraitExpressions: {
        neutral: 'dust-and-iron.character.station-master-briggs-neutral',
        approving: 'dust-and-iron.character.station-master-briggs-approving',
        concerned: 'dust-and-iron.character.station-master-briggs-concerned',
      },
    },
    role: 'Rail Station Master',
    personality: 'Practical, dry-humored, loyal to the working folk.',
    affinityLabel: 'Respect',
    lines: {
      greeting: [
        'Trains run on time when people do. Help me keep both alive.',
        'Supplies don’t move themselves, deputy. Neither does courage.',
        'Wind’s picking up — smells like trouble and overdue freight.',
      ],
      chapterIntro: [
        'Rails are the town’s veins. Clog one route and everything chokes.',
        'Fix what’s in front of you. Dustfall survives on small victories.',
        'Order is fragile on the platform too. One missed car, one hungry week.',
        'You hear that whistle? That’s a town still betting on tomorrow.',
      ],
      questComplete: [
        'There — that’s one less crisis on my platform.',
        'You handled that cleaner than most freight schedules I’ve seen.',
        'Briggs exhales. For a second, the station feels safe again.',
        'Keep that pace and the rails stay ours — for now.',
      ],
      questMissed: [
        'Delayed errands stack like bad cargo. Clear the dock soon.',
        'I’ve seen towns fall from neglected chores. Don’t add Dustfall to the list.',
        'The line goes quiet when people quit. I hate quiet.',
      ],
    },
  },
];
