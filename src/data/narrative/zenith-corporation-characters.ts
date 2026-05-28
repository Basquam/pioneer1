import type { NarrativeCharacter } from '@/types/narrative';

export const MIRA_KADE_ID = 'mira-kade';
export const EXECUTIVE_HELIX_ID = 'executive-helix';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const ZENITH_CORPORATION_THEME = 'Efficiency is obedience.';

export const ZENITH_CORPORATION_CHARACTERS: NarrativeCharacter[] = [
  {
    id: MIRA_KADE_ID,
    sagaId: 'zenith-corporation',
    name: 'Mira Kade',
    portrait: '◆',
    role: 'Main Ally · Executive Sponsor',
    personality:
      'Ambitious, polished, and always three moves ahead — she offers access and protection inside Zenith, but every favor arrives with a metric attached.',
    affinityLabel: 'Influence',
    lines: {
      greeting: [
        'Analyst online. Your login cleared — for now. Keep your operations clean before Helix flags your profile.',
        'You made it past the lobby scanners. That’s baseline. Zenith rewards baseline until it doesn’t.',
        'Your Network Standing is climbing the org chart. Helix hates analysts who leave audit trails.',
        'I rerouted your access tier twice today. Don’t waste the clearance — efficiency is obedience, but obedience without results is disposable.',
        'I’m sponsoring your climb because you’re useful. Stay useful.',
        'Helix is watching your productivity curve. I’m watching whether you can survive his floor.',
        'You’ve earned a seat closer to the core. That’s influence — spend it carefully.',
      ],
      chapterIntro: [
        'New sector, new compliance grid. Run your operations clean — metrics rewrite memory when analysts slip.',
        'Every operation you finish is a firewall between your mind and Helix’s dashboards.',
        'Zenith tests junior staff because they think exhaustion edits behavior faster than policy.',
        'Signal Integrity drops when analysts stall. Hold the line — one operation at a time.',
        'I’ve stopped double-checking your clearance. That’s trust — expensive inside this tower.',
        'Helix wants you tired and predictable. Stay sharp. I’ll keep your access live.',
        'If this sector breaks wrong, someone loses a memory they can’t get back from a spreadsheet.',
      ],
      questComplete: [
        'Operation closed. That’s baseline — not the promotion.',
        'Clean audit trail. Helix’s crawlers didn’t flag your signature.',
        'Metric logged. Your Signal Integrity just bought us another review cycle.',
        'Good run, analyst. You’re becoming someone Zenith can route through the core.',
        'I’d put you on compliance drops now. That’s influence — earn it again tomorrow.',
        'You didn’t leave a gap in the dashboard. Helix hates that more than he hates me.',
        'Stay on executive channel tonight. I don’t say that to every junior analyst.',
        'If Helix comes for your profile, I want you on my floor. You’ve earned that clearance.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints in productivity sand.',
        'Compliance sensors love delay. Shake it off and re-enter the tower.',
        'Metrics rewrite behavior when analysts go quiet. Get back on the line.',
        'I’m not angry. I’m reviewing your access tier. There’s a difference in Zenith.',
        'Re-sync and run. District nodes are counting on you whether the board knows it or not.',
      ],
    },
  },
  {
    id: EXECUTIVE_HELIX_ID,
    sagaId: 'zenith-corporation',
    name: 'Executive Helix',
    portrait: '⬢',
    role: 'Corporate Strategist',
    personality:
      'Surgical, serene, and convinced that human potential is best expressed as a KPI — he edits memory through metrics the way others edit budgets.',
    isVillain: true,
    affinityLabel: 'Compliance',
    lines: {
      greeting: [
        'Junior analyst. Still routing thoughts through my tower? How efficient. How temporary.',
        'Zenith breathes on monitored bandwidth. I’m merely collecting what you refuse to optimize.',
        'You look fragmented. Good. Fragmented staff accept policy edits more gracefully.',
      ],
      chapterIntro: [
        'Another review cycle, another chance for your little identity to crack under observation.',
        'Your ally sells access like it’s armor. I sell the truth — efficiency is obedience.',
        'I don’t hate analysts. I hate watching them pretend one clean metric means freedom.',
        'Keep your operations. I’ll keep my patience. One of us is playing the long audit.',
      ],
      questComplete: [
        'You kept the dashboard green. Shame you’re sustaining an identity the board already mapped.',
      ],
      questMissed: [
        'Missed again? The tower remembers who went dark when the sector needed stability.',
        'While you stall, my editors paint another warning across your productivity profile.',
        'Soft habits, soft analyst. Keep it up — we’ll finish what your fear started.',
        'You call that an operation? I call that proof my argument is winning.',
        'Mira can’t reroute everything. That’s not cruelty — that’s architecture.',
        'Every empty operation is a sermon I didn’t have to preach.',
        'I lost a subject to analysts who looked away. I won’t look away from you.',
      ],
    },
  },
];
