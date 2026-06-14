import type { NarrativeCharacter } from '@/types/narrative';

export const LYRA_VOSS_ID = 'lyra-voss';
export const DIRECTOR_CAIN_ID = 'director-cain';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const GHOST_PROTOCOL_THEME = 'Memories can be edited.';

export const GHOST_PROTOCOL_CHARACTERS: NarrativeCharacter[] = [
  {
    id: LYRA_VOSS_ID,
    sagaId: 'ghost-protocol',
    name: 'Lyra Voss',
    portrait: '◈',
    media: {
      portraitImageKey: 'neuronet.character.lyra-voss-neutral',
      portraitExpressions: {
        neutral: 'neuronet.character.lyra-voss-neutral',
        approving: 'neuronet.character.lyra-voss-approving',
        worried: 'neuronet.character.lyra-voss-worried',
      },
    },
    role: 'Main Ally · Underground Hacker',
    personality:
      'Paranoid, razor-sharp, and fiercely loyal — she trusts code more than people, but she’ll burn a server farm for the right runner.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'Runner online. Keep your neural signature clean — Cain’s crawlers love sloppy habits.',
        'You showed up without tripping a Ministry ping. That’s already better than most couriers.',
        'Signal’s stable on your end. Don’t get comfortable — comfort is how edits stick.',
        'I’ve rerouted your packet twice today. You’re not invisible yet, but you’re learning.',
        'Your Network Standing is climbing. Cain hates runners who leave no trace.',
        'I trust your rhythm now. That’s rare — and expensive if you waste it.',
        'Stay on my channel tonight. If Cain mirrors your memory, I want you one hop away.',
      ],
      chapterIntro: [
        'New sector, new surveillance grid. Run your operations clean — memories can be edited if you slip.',
        'Every operation you finish is a firewall between your mind and Cain’s mirror.',
        'The Ministry tests couriers because they think fear edits faster than code. Prove them wrong.',
        'Signal Integrity drops when runners stall. Hold the line — one operation at a time.',
        'I’ve stopped triple-checking your routes. That’s trust, runner — don’t make me regret the bandwidth.',
        'Cain wants you tired and predictable. Stay sharp. I’ll spoof your trail.',
        'If this sector breaks wrong, someone loses a memory they can’t get back. Run hard.',
      ],
      questComplete: [
        'Packet delivered. That’s baseline — not the finish line.',
        'Clean handoff. Ministry crawlers didn’t flag your signature.',
        'Operation closed. Your Signal Integrity just bought us another hour.',
        'Good run, runner. You’re becoming someone the Ghost Runners can route through.',
        'I’d put you on blackline drops now. That’s trust — earn it again tomorrow.',
        'You didn’t leave a trace. Cain hates that more than he hates me.',
        'Stay on encrypted channel tonight. I don’t say that to every courier.',
        'If Cain comes for your memories, I want you at my node. You’ve earned that post.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints in neural sand.',
        'Ministry sensors love delay. Shake it off and re-enter the grid.',
        'Memories can be edited when runners go quiet. Get back on the line.',
        'I’m not angry. I’m scanning for mirrors. There’s a difference in the Spire.',
        'Re-sync and run. District nodes are counting on you whether they know it or not.',
      ],
    },
  },
  {
    id: DIRECTOR_CAIN_ID,
    sagaId: 'ghost-protocol',
    name: 'Director Cain',
    portrait: '⬡',
    media: {
      portraitImageKey: 'neuronet.character.director-cain-neutral',
      portraitExpressions: {
        neutral: 'neuronet.character.director-cain-neutral',
        taunting: 'neuronet.character.director-cain-taunting',
        angry: 'neuronet.character.director-cain-angry',
      },
    },
    role: 'Signal Ministry Director',
    personality:
      'Cold, methodical, and convinced that safety requires total visibility — he edits memories the way others edit spreadsheets.',
    isVillain: true,
    affinityLabel: 'Surveillance',
    lines: {
      greeting: [
        'Memory Runner. Still smuggling thoughts through my city? How quaint. How temporary.',
        'The Neon Spire breathes on monitored bandwidth. I’m merely collecting what you refuse to surrender.',
        'You look fragmented. Good. Fragmented minds accept edits more gracefully.',
      ],
      chapterIntro: [
        'Another cycle, another chance for your little identity to crack under observation.',
        'Your ally sells encryption like it’s armor. I sell the truth — memories can be edited.',
        'I don’t hate runners. I hate watching them pretend one clean route means freedom.',
        'Keep your operations. I’ll keep my patience. One of us is playing the long mirror.',
      ],
      questComplete: [
        'You kept the signal alive. Shame you’re sustaining a identity the Ministry already mapped.',
      ],
      questMissed: [
        'Missed again? The grid remembers who went dark when the sector needed stability.',
        'While you stall, my editors paint another warning across your neural profile.',
        'Soft habits, soft runner. Keep it up — we’ll finish what your fear started.',
        'You call that an operation? I call that proof my argument is winning.',
        'Lyra can’t spoof everything. That’s not cruelty — that’s architecture.',
        'Every empty operation is a sermon I didn’t have to preach.',
        'I lost a subject to runners who looked away. I won’t look away from you.',
      ],
    },
  },
];
