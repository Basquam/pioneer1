import type { NarrativeCharacter } from '@/types/narrative';

export const MARA_BELL_ID = 'mara-bell';
export const VICTOR_CRANE_ID = 'victor-crane';

/** Recurring saga theme — woven through chapter copy and dialogue. */
export const HONEST_BUSINESSMAN_THEME = 'Honesty is expensive.';

export const HONEST_BUSINESSMAN_CHARACTERS: NarrativeCharacter[] = [
  {
    id: MARA_BELL_ID,
    sagaId: 'honest-businessman',
    name: 'Mara Bell',
    portrait: '📒',
    role: 'Main Ally · Bookkeeper',
    personality:
      'Sharp, dry-witted, and loyal to the ledger — she left the saloon books because numbers don’t lie when you read them right.',
    affinityLabel: 'Trust',
    lines: {
      greeting: [
        'Morning. The shop opens whether you feel ready or not — so do the books.',
        'You showed up. That’s more than half the merchants on Main Street manage.',
        'I counted the drawer twice. Once for truth, once for peace of mind.',
        'Crane smiles at every handshake. I read what’s written underneath.',
        'Your receipts are cleaner than your windows. Fix the windows.',
        'I trust your numbers now. Don’t make me regret teaching you to read them.',
        'Honesty is expensive — but bankruptcy costs more. Keep choosing right.',
      ],
      chapterIntro: [
        'New chapter, new invoices. Crane’s already circling — stay honest and stay fast.',
        'Every sale you ring in is a vote for a fair Dustfall. He hates fair.',
        'The ledger doesn’t care about charm. Neither do I. Work the page.',
        'Crane buys silence with discounts. We sell trust on credit nobody else offers.',
        'This chapter will test your margins and your spine. I’ll watch both.',
        'Gangs, officials, monopolies — they all want a piece. Guard the register.',
        'If we lose this stretch of Main Street, the town eats price-gouging for years.',
      ],
      questComplete: [
        'Posted. That’s one honest line in a town full of shortcuts.',
        'Clean entry. Crane’s men can’t forge what you actually did.',
        'Good. The books balance and the shop still has its name.',
        'You paid the cost upfront. That’s the only way trust compounds.',
        'I’d stake my reputation on your receipts now. High praise — I don’t spend it.',
        'Victor noticed. Good. Let him choke on your consistency.',
        'Stay after close tonight. I want to walk the ledger with you.',
      ],
      questMissed: [
        'A blank day in the ledger is an invitation to Crane’s contracts.',
        'Honesty is expensive — but skipping work is a luxury we can’t afford.',
        'The shop door stays open. Your habits should too.',
        'I’m not angry. I’m recalculating. Get back on the books.',
        'Crane’s clerks never take days off. Neither can we.',
      ],
    },
  },
  {
    id: VICTOR_CRANE_ID,
    sagaId: 'honest-businessman',
    name: 'Victor Crane',
    portrait: '💼',
    media: {
      portraitImageKey: 'dust-and-iron.character.victor-crane-neutral',
      portraitExpressions: {
        neutral: 'dust-and-iron.character.victor-crane-neutral',
        taunting: 'dust-and-iron.character.victor-crane-smirk',
      },
    },
    role: 'Corrupt Merchant Prince',
    personality:
      'Polished, patient, and cruel in fine print — he treats Dustfall as a portfolio and honesty as a negotiating weakness.',
    isVillain: true,
    affinityLabel: 'Suspicion',
    lines: {
      greeting: [
        'Ah — the idealist on Main Street. How quaint. How costly.',
        'Honesty is expensive, shopkeeper. I merely charge less for the alternative.',
        'Your little store amuses me. Until the debt matures.',
        'Mara Bell counts pennies. I count leverage. Guess which scales.',
      ],
      chapterIntro: [
        'Another week, another chance for virtue to bankrupt you.',
        'I don’t break shops, my dear rival. I buy the silence around them.',
        'Every contract you refuse becomes one I draft for your neighbors.',
        'The railway ships my goods. The gang fears my collectors. What do you have?',
        'Price wars aren’t about profit — they’re about who blinks first.',
      ],
      questComplete: [
        'Efficient. Pity integrity still leaves you undercapitalized.',
        'You work hard. I work the system. We’ll see which pays better.',
      ],
      questMissed: [
        'Closed ledger, open opportunity — for me.',
        'While you stall, interest compounds in my favor.',
        'Honesty is expensive. Default is free — until I collect.',
        'Your customers notice empty shelves before they notice virtue.',
        'The Price War ends when you can’t afford the next sunrise.',
      ],
    },
  },
];
