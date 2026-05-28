import type { NarrativeCharacter } from '@/types/narrative';

export const EVELYN_CROSS_ID = 'evelyn-cross';
export const MARCUS_VALE_ID = 'marcus-vale';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const HOLLOW_SYNDICATE_THEME = 'Power hides in plain sight.';

export const HOLLOW_SYNDICATE_CHARACTERS: NarrativeCharacter[] = [
  {
    id: EVELYN_CROSS_ID,
    sagaId: 'hollow-syndicate',
    name: 'Evelyn Cross',
    portrait: '◆',
    role: 'Main Ally · Former Prosecutor',
    personality:
      'Sharp, guarded, and morally tired — she left the badge when justice became a filing system and now trusts evidence more than institutions.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'You showed up dry. In Grayhaven, that already puts you ahead of half the city.',
        'Case file’s open. Keep your leads clean — Vale’s people read hesitation like a confession.',
        'I don’t hand out praise. I hand out facts. Your Case Integrity is holding.',
        'Detective Standing rises when investigators finish what they start.',
        'You’re learning to read the city. Vale prefers witnesses who don’t.',
        'I trust your rhythm now. That’s rare — and expensive if you waste it.',
        'Stay on my line tonight. If the Syndicate moves a witness, I want you one block away.',
      ],
      chapterIntro: [
        'New location, same conspiracy. Run your leads clean — power hides in plain sight when you stop looking.',
        'Every lead you close is a page Vale can’t redact from the city ledger.',
        'The Syndicate tests investigators because they think exhaustion buys silence. Prove them wrong.',
        'Case Integrity drops when detectives stall. Hold the line — one lead at a time.',
        'I’ve stopped triple-checking your instincts. That’s trust — don’t make me regret the file.',
        'Vale wants you tired and predictable. Stay sharp. I’ll keep the warrants warm.',
        'If this case breaks wrong, someone disappears with the truth. Work hard.',
      ],
      questComplete: [
        'Lead logged. That’s baseline — not the finish line.',
        'Clean entry in the file. The Precinct didn’t get a look at your signature.',
        'Lead closed. Your Case Integrity just bought us another night.',
        'Good work, investigator. You’re becoming someone Grayhaven can trust with the ugly files.',
        'I’d put you on witness protection detail now. That’s trust — earn it again tomorrow.',
        'You didn’t leave a trace Vale could spin. He hates that more than he hates me.',
        'Stay on secure channel tonight. I don’t say that to every investigator.',
        'If the Syndicate comes for your witness, I want you at my office. You’ve earned that post.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints in wet pavement.',
        'Syndicate watchers love delay. Shake it off and re-enter the case.',
        'Truth leaves a shadow when investigators go quiet. Get back on the line.',
        'I’m not angry. I’m reviewing the file. There’s a difference in Grayhaven.',
        'Re-sync and work. The Case Board is counting on you whether the city knows it or not.',
      ],
    },
  },
  {
    id: MARCUS_VALE_ID,
    sagaId: 'hollow-syndicate',
    name: 'Marcus Vale',
    portrait: '♦',
    role: 'Crime Broker · Syndicate Architect',
    personality:
      'Elegant, patient, and convinced that power hides in plain sight — he controls Grayhaven from behind legal fronts and polished charity galas.',
    isVillain: true,
    affinityLabel: 'Influence',
    lines: {
      greeting: [
        'Private investigator. Still turning chores into leads? How quaint. How temporary.',
        'Grayhaven breathes on my paperwork. I’m merely collecting what you refuse to surrender.',
        'You look tired. Good. Tired investigators accept settlements more gracefully.',
      ],
      chapterIntro: [
        'Another night, another chance for your little case file to crack under observation.',
        'Your ally sells evidence like it’s armor. I sell the truth — power hides in plain sight.',
        'I don’t hate detectives. I hate watching them pretend one clean lead means freedom.',
        'Keep your leads. I’ll keep my patience. One of us is playing the long ledger.',
      ],
      questComplete: [
        'You kept the case alive. Shame you’re sustaining an investigation the Syndicate already mapped.',
      ],
      questMissed: [
        'Missed again? The city remembers who went dark when the witness needed protection.',
        'While you stall, my lawyers paint another warning across your Detective Standing.',
        'Soft habits, soft investigator. Keep it up — we’ll finish what your fear started.',
        'You call that a lead? I call that proof my argument is winning.',
        'Evelyn can’t file away everything. That’s not cruelty — that’s architecture.',
        'Every empty lead is a sermon I didn’t have to preach.',
        'I lost a witness to detectives who looked away. I won’t look away from you.',
      ],
    },
  },
];
