import type { NarrativeCharacter } from '@/types/narrative';

export const PROFESSOR_LENA_WARD_ID = 'professor-lena-ward';
export const THE_GLASS_STUDENT_ID = 'the-glass-student';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const CAMPUS_MURDERS_THEME = 'Knowledge has a body count.';

export const CAMPUS_MURDERS_CHARACTERS: NarrativeCharacter[] = [
  {
    id: PROFESSOR_LENA_WARD_ID,
    sagaId: 'campus-murders',
    name: 'Professor Lena Ward',
    portrait: '◇',
    role: 'Main Ally · Criminology Professor',
    personality:
      'Brilliant, composed, and dangerously informed — she teaches how killers think while guarding a secret that could ruin Whitmore Academy.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'You arrived without a donor badge. At Whitmore, that already makes you interesting.',
        'Case notes are open. Keep your leads precise — the Glass Student reads sloppy habits like confessions.',
        'I don’t offer comfort. I offer evidence. Your Case Integrity is holding.',
        'Detective Standing rises when investigators finish what the academy would rather forget.',
        'You’re learning to read these halls. The killer prefers witnesses who look away.',
        'I trust your instincts now. That’s rare — and costly if you waste it on ceremony.',
        'Stay on my office line tonight. If a student vanishes from the roster, I want you one corridor away.',
      ],
      chapterIntro: [
        'New location, same body count. Run your leads clean — knowledge has a body count when you stop questioning.',
        'Every lead you close is a motive Whitmore’s board can’t redact from the alumni newsletter.',
        'The Glass Student tests investigators because exhaustion buys silence on campus. Prove them wrong.',
        'Case Integrity drops when visiting detectives stall. Hold the line — one lead at a time.',
        'I’ve stopped double-checking your files. That’s trust — don’t make me regret the recommendation.',
        'The killer wants you tired and predictable. Stay sharp. I’ll keep the lecture hall keys.',
        'If this case breaks wrong, someone dies with the truth still in their notebook. Work hard.',
      ],
      questComplete: [
        'Lead logged. That’s baseline — not the finish line.',
        'Clean entry in the file. Administration didn’t get a look at your signature.',
        'Lead closed. Your Case Integrity just bought us another night on campus.',
        'Good work, investigator. Whitmore is starting to believe you can read what it hides.',
        'I’d put you on my research team now. That’s trust — earn it again tomorrow.',
        'You didn’t leave a trace the Glass Student could mirror. They hate that more than they hate me.',
        'Stay on secure channel tonight. I don’t say that to every visiting investigator.',
        'If the killer comes for your witness, I want you at my office. You’ve earned that post.',
      ],
      questMissed: [
        'Missed window — hesitation leaves fingerprints on polished floors.',
        'Campus watchers love delay. Shake it off and re-enter the case.',
        'Knowledge has a body count when investigators go quiet. Get back on the line.',
        'I’m not angry. I’m reviewing the syllabus. There’s a difference at Whitmore.',
        'Re-sync and work. The Case Board is counting on you whether the donors know it or not.',
      ],
    },
  },
  {
    id: THE_GLASS_STUDENT_ID,
    sagaId: 'campus-murders',
    name: 'The Glass Student',
    portrait: '▫',
    role: 'Anonymous Killer · Academy Phantom',
    personality:
      'Faceless, meticulous, and obsessed with reflection — they leave clues polished enough to admire and sharp enough to cut.',
    isVillain: true,
    affinityLabel: 'Surveillance',
    lines: {
      greeting: [
        'Visiting investigator. Still turning chores into leads? How academic. How temporary.',
        'Whitmore breathes on my reflections. I’m merely collecting what you refuse to see.',
        'You look tired. Good. Tired investigators accept the academy’s narrative more gracefully.',
      ],
      chapterIntro: [
        'Another term, another chance for your little case file to crack under observation.',
        'Your ally sells criminology like it’s armor. I sell the truth — knowledge has a body count.',
        'I don’t hate detectives. I hate watching them pretend one clean lead means safety.',
        'Keep your leads. I’ll keep my patience. One of us is playing the long thesis.',
      ],
      questComplete: [
        'You kept the case alive. Shame you’re sustaining an investigation the academy already mapped.',
      ],
      questMissed: [
        'Missed again? Whitmore remembers who went dark when the witness needed protection.',
        'While you stall, my reflections paint another warning across your Detective Standing.',
        'Soft habits, soft investigator. Keep it up — we’ll finish what your fear started.',
        'You call that a lead? I call that proof my argument is winning.',
        'Professor Ward can’t file away everything. That’s not cruelty — that’s architecture.',
        'Every empty lead is a lecture I didn’t have to deliver.',
        'I lost a subject to investigators who looked away. I won’t look away from you.',
      ],
    },
  },
];
