import type { NarrativeCharacter } from '@/types/narrative';

export const JUNO_VALE_ID = 'juno-vale';
export const RAZOR_JACKAL_ID = 'razor-jackal';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const NEON_DELIVERY_THEME = 'Everyone is carrying something.';

export const NEON_DELIVERY_CHARACTERS: NarrativeCharacter[] = [
  {
    id: JUNO_VALE_ID,
    sagaId: 'neon-delivery',
    name: 'Juno Vale',
    portrait: '▣',
    role: 'Main Ally · Route Dispatcher',
    personality:
      'Street-smart, fast-talking, and impossible to pin down — she knows every shortcut, every lie, and every package that should never have left the safehouse.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'Rider online. First drop’s waiting — keep your operations clean before Jackal tags your route.',
        'You showed up without tripping a syndicate ping. That’s already better than most couriers.',
        'Signal’s stable on your end. Don’t get comfortable — comfort is how secrets leak.',
        'I’ve rerouted your manifest twice today. You’re not invisible yet, but you’re learning the rainlines.',
        'Your Network Standing is climbing. Jackal hates riders who leave no trace.',
        'I trust your rhythm now. That’s rare — and expensive if you waste it on a bad shortcut.',
        'Stay on my channel tonight. If Jackal mirrors a package, I want you one hop away.',
      ],
      chapterIntro: [
        'New sector, new route grid. Run your operations clean — everyone is carrying something, and most of it isn’t on the manifest.',
        'Every operation you finish is a firewall between your cargo and Jackal’s hijackers.',
        'The syndicate tests couriers because they think fear edits faster than rain. Prove them wrong.',
        'Signal Integrity drops when riders stall. Hold the line — one operation at a time.',
        'I’ve stopped triple-checking your coordinates. That’s trust, rider — don’t make me regret the bandwidth.',
        'Jackal wants you tired and predictable. Stay sharp. I’ll spoof your trail through the neon.',
        'If this sector breaks wrong, someone loses a secret they can’t get back from a stolen package.',
      ],
      questComplete: [
        'Package delivered. That’s baseline — not the finish line.',
        'Clean handoff. Syndicate crawlers didn’t flag your signature.',
        'Operation closed. Your Signal Integrity just bought us another rain cycle.',
        'Good run, rider. You’re becoming someone the district nodes can route through.',
        'I’d put you on rainline drops now. That’s trust — earn it again tomorrow.',
        'You didn’t leave a trace. Jackal hates that more than he hates me.',
        'Stay on encrypted channel tonight. I don’t say that to every courier.',
        'If Jackal comes for your cargo, I want you at my dispatch node. You’ve earned that post.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints in neon rain.',
        'Syndicate sensors love delay. Shake it off and re-enter the grid.',
        'Secrets spill when riders go quiet. Get back on the line.',
        'I’m not angry. I’m scanning for hijackers. There’s a difference in the Spire.',
        'Re-sync and run. District nodes are counting on you whether they know it or not.',
      ],
    },
  },
  {
    id: RAZOR_JACKAL_ID,
    sagaId: 'neon-delivery',
    name: 'Razor Jackal',
    portrait: '✦',
    role: 'Courier Gang Leader',
    personality:
      'Violent, predatory, and convinced that every route belongs to whoever takes it — he hijacks deliveries and sells the memories sealed inside like contraband.',
    isVillain: true,
    affinityLabel: 'Threat',
    lines: {
      greeting: [
        'Courier rider. Still hauling secrets through my streets? How brave. How breakable.',
        'The Neon Spire runs on stolen bandwidth. I’m merely collecting what you refuse to surrender.',
        'You look tired. Good. Tired riders drop packages where I can pick them up.',
      ],
      chapterIntro: [
        'Another rain cycle, another chance for your little route to crack under my crew.',
        'Your dispatcher sells shortcuts like they’re armor. I sell the truth — everyone is carrying something.',
        'I don’t hate riders. I hate watching them pretend one clean drop means freedom.',
        'Keep your operations. I’ll keep my patience. One of us is playing the long hijack.',
      ],
      questComplete: [
        'You kept the package moving. Shame you’re sustaining a route my gang already mapped.',
      ],
      questMissed: [
        'Missed again? The grid remembers who went dark when the sector needed a delivery.',
        'While you stall, my crew paints another warning across your courier profile.',
        'Soft habits, soft rider. Keep it up — we’ll finish what your fear started.',
        'You call that an operation? I call that proof my argument is winning.',
        'Juno can’t spoof everything. That’s not cruelty — that’s street architecture.',
        'Every empty operation is a sermon I didn’t have to preach.',
        'I lost a route to riders who looked away. I won’t look away from you.',
      ],
    },
  },
];
