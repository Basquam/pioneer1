import type { NarrativeCharacter } from '@/types/narrative';

export const ROSA_BELL_ID = 'rosa-bell';
export const VINCENT_NOIR_ID = 'vincent-noir';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const JAZZ_CLUB_SECRETS_THEME = 'Everyone tells the truth differently.';

export const JAZZ_CLUB_SECRETS_CHARACTERS: NarrativeCharacter[] = [
  {
    id: ROSA_BELL_ID,
    sagaId: 'jazz-club-secrets',
    name: 'Rosa Bell',
    portrait: '♪',
    role: 'Main Ally · Jazz Singer & Information Broker',
    personality:
      'Smoky-voiced, sharp-eyed, and loyal to the night shift — she trades in songs, secrets, and the kind of truth people only admit after last call.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'You walked in without a reservation. In Grayhaven, that already means you’re looking for trouble.',
        'Case file’s open. Keep your leads clean — Noir’s people read hesitation like a bad alibi.',
        'I don’t hand out lullabies. I hand out facts. Your Case Integrity is holding.',
        'Detective Standing rises when night detectives finish what the city would rather forget.',
        'You’re learning to read the setlist. Noir prefers witnesses who only hum along.',
        'I trust your rhythm now. That’s rare — and expensive if you waste it on the wrong verse.',
        'Stay on my booth line tonight. If a performer vanishes from the bill, I want you one chorus away.',
      ],
      chapterIntro: [
        'New room, same secrets. Run your leads clean — everyone tells the truth differently when you stop listening.',
        'Every lead you close is a verse Noir can’t redact from the night’s setlist.',
        'Vincent Noir tests detectives because exhaustion buys silence after midnight. Prove him wrong.',
        'Case Integrity drops when night detectives stall. Hold the line — one lead at a time.',
        'I’ve stopped triple-checking your instincts. That’s trust — don’t make me regret the introduction.',
        'Noir wants you tired and predictable. Stay sharp. I’ll keep the backstage pass warm.',
        'If this case breaks wrong, someone disappears with the truth still in their song. Work hard.',
      ],
      questComplete: [
        'Lead logged. That’s baseline — not the finish line.',
        'Clean entry in the file. The Precinct didn’t get a look at your signature.',
        'Lead closed. Your Case Integrity just bought us another set.',
        'Good work, detective. Grayhaven’s night scene is starting to sing for you.',
        'I’d put you on my booth detail now. That’s trust — earn it again tomorrow.',
        'You didn’t leave a trace Noir could spin. He hates that more than he hates me.',
        'Stay on secure channel tonight. I don’t say that to every night detective.',
        'If Noir comes for your witness, I want you at my mic. You’ve earned that post.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints in cigarette ash.',
        'Club watchers love delay. Shake it off and re-enter the case.',
        'Everyone tells the truth differently when detectives go quiet. Get back on the line.',
        'I’m not angry. I’m reviewing the setlist. There’s a difference in Grayhaven.',
        'Re-sync and work. The Case Board is counting on you whether the club knows it or not.',
      ],
    },
  },
  {
    id: VINCENT_NOIR_ID,
    sagaId: 'jazz-club-secrets',
    name: 'Vincent Noir',
    portrait: '♣',
    role: 'Club Owner · Fixer & Blackmail Broker',
    personality:
      'Charming, ruthless, and fluent in every version of the truth — he owns the Red Room Club and the secrets that keep Grayhaven’s powerful in tune.',
    isVillain: true,
    affinityLabel: 'Influence',
    lines: {
      greeting: [
        'Night detective. Still turning chores into leads? How romantic. How temporary.',
        'Grayhaven breathes on my playlist. I’m merely collecting what you refuse to hear.',
        'You look tired. Good. Tired detectives accept the club’s narrative more gracefully.',
      ],
      chapterIntro: [
        'Another set, another chance for your little case file to crack under the spotlight.',
        'Your ally sells songs like they’re armor. I sell the truth — everyone tells it differently.',
        'I don’t hate detectives. I hate watching them pretend one clean lead means freedom.',
        'Keep your leads. I’ll keep my patience. One of us is playing the long encore.',
      ],
      questComplete: [
        'You kept the case alive. Shame you’re sustaining an investigation the Red Room already mapped.',
      ],
      questMissed: [
        'Missed again? The city remembers who went dark when the witness needed protection.',
        'While you stall, my lawyers paint another warning across your Detective Standing.',
        'Soft habits, soft detective. Keep it up — we’ll finish what your fear started.',
        'You call that a lead? I call that proof my argument is winning.',
        'Rosa can’t file away everything. That’s not cruelty — that’s architecture.',
        'Every empty lead is a song I didn’t have to rewrite.',
        'I lost a witness to detectives who looked away. I won’t look away from you.',
      ],
    },
  },
];
