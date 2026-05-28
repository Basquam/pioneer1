import {
  MARA_BELL_ID,
  VICTOR_CRANE_ID,
} from '@/data/narrative/honest-businessman-characters';
import { OPEN_FOR_BUSINESS_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/open-for-business-variations';
import {
  enrichSagaChapters,
  WILD_WEST_VARIATION_PROFILE,
} from '@/lib/quest-variation-builders';
import type { Chapter, QuestTemplate, QuestTemplateVariation } from '@/types/narrative';

const categories = [
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
] as const;

function template(
  chapterId: string,
  category: (typeof categories)[number],
  title: string,
  objective: string,
  hook: string,
  xpReward: number,
  reputationImpact: number,
  reactionCharacterId: string,
  variations?: QuestTemplateVariation[],
): QuestTemplate {
  return {
    id: `${chapterId}-${category}`,
    category,
    title,
    objective,
    dramaticHook: hook,
    xpReward,
    reputationImpact,
    reactionCharacterId,
    variations,
  };
}

const HONEST_BUSINESSMAN_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'open-for-business',
    order: 1,
    title: 'Open for Business',
    territoryName: 'Main Street Front',
    mapPosition: { x: 18, y: 74 },
    summary:
      'Your first honest storefront on Dustfall’s Main Street — honesty is expensive before the first coin even rings.',
    dramaticPurpose: 'Establish the shop fantasy and introduce Crane’s predatory charm.',
    introDialogue:
      'Mara Bell: Keys are yours, shelves are bare, and Victor Crane already sent flowers he’ll charge back at interest. Open clean — the town is watching.',
    introScene: [
      {
        characterId: MARA_BELL_ID,
        line: 'Keys are on the counter. Shelves are empty, ledger is fresh, and Crane’s “welcome basket” arrived with a lien attached. Open honest — Dustfall notices who prices fair.',
        badge: 'CHAPTER I',
      },
      {
        characterId: VICTOR_CRANE_ID,
        line: 'Congratulations on your debut, shopkeeper. Honesty is expensive — fortunately I offer credit for those too virtuous to survive it.',
        badge: 'VILLAIN',
      },
      {
        characterId: MARA_BELL_ID,
        line: 'Ignore the silk cuffs. Stock the front, sweep the floor, and ring the first sale before sundown. One honest day beats a month of Crane’s “discounts.”',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Mara Bell: First honest sale on the books — and the town felt it. Crane’s clerk was watching from across the street. Tomorrow he’ll count your receipts. Make them worth counting.',
    failureDialogue:
      'Mara Bell: The shutters stayed closed too long. Crane’s already telling merchants you won’t last the week. Open tomorrow like your name depends on it.',
    questTemplates: [
      template('open-for-business', 'cleaning', 'Sweep the Shop Floor', 'Clean kitchen and counters', 'Dust on the boards looks like neglect to passing buyers.', 110, 8, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.cleaning),
      template('open-for-business', 'fitness', 'Stockroom Stamina', 'Do a quick bodyweight routine', 'Heavy crates don’t wait for a second wind.', 115, 9, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.fitness),
      template('open-for-business', 'study', 'Read the Trade Ordinance', 'Study session with focused notes', 'Crane’s edge hides in clauses you haven’t read yet.', 120, 9, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.study),
      template('open-for-business', 'work', 'Price the Opening Inventory', 'Complete one deep work block', 'Fair margins today prevent panic discounts tomorrow.', 120, 9, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.work),
      template('open-for-business', 'health', 'Merchant’s Rest', 'Hydrate, meds, and a short recovery break', 'A dizzy shopkeeper mislabels every shelf.', 100, 7, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.health),
      template('open-for-business', 'social', 'Word on Main Street', 'Send one meaningful check-in message', 'Trust spreads by mouth before it spreads by ledger.', 105, 7, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.social),
      template('open-for-business', 'creative', 'Hand-Painted Open Sign', 'Create a short design or writing piece', 'Your sign is the first promise the town reads.', 115, 8, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.creative),
      template('open-for-business', 'errand', 'Fetch Opening Stock', 'Complete one pending errand', 'Empty shelves invite Crane’s “rescue” shipment.', 110, 8, MARA_BELL_ID, OPEN_FOR_BUSINESS_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [{ id: 'open-for-business-badge', type: 'badge', name: 'First Honest Sale' }],
  },
  {
    id: 'ledger-of-dust',
    order: 2,
    title: 'Ledger of Dust',
    territoryName: 'Counting House',
    mapPosition: { x: 34, y: 58 },
    summary:
      'Mara teaches you to read every line — because honesty is expensive when the ink hides someone else’s debt.',
    dramaticPurpose: 'Deepen the bookkeeping fantasy and expose Crane’s ledger tricks.',
    introDialogue:
      'Mara Bell: Crane’s clerks “misplaced” three entries last month. We reconcile before he owns the narrative — and the shop.',
    introScene: [
      {
        characterId: MARA_BELL_ID,
        line: 'Counting House time. Every coin that crossed your counter last week — I want it accounted for before Crane’s auditors invent a shortage.',
        badge: 'CHAPTER II',
      },
      {
        characterId: VICTOR_CRANE_ID,
        line: 'How charming — a saloon accountant playing saint. Numbers bend, shopkeeper. I merely employ men who know which direction.',
        badge: 'VILLAIN',
      },
      {
        characterId: MARA_BELL_ID,
        line: 'He forges patience, not ink — yet. Reconcile the ledger, flag the gaps, and don’t sign anything with his seal on it.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Mara Bell: Ledger balanced — and Crane’s phantom fees exposed. He’ll push harder now that we can read his handwriting. Debt collectors ride at dawn.',
    failureDialogue:
      'Mara Bell: Three lines still don’t match. Crane’s lawyer already asked about them. Fix the books before the questions become warrants.',
    questTemplates: [
      template('ledger-of-dust', 'cleaning', 'Clear the Counting Desk', 'Deep clean one neglected area', 'Clutter hides duplicate charges and missing stamps.', 120, 9, MARA_BELL_ID),
      template('ledger-of-dust', 'fitness', 'Ledger Carry Drill', 'Cardio sprint or brisk walk session', 'Auditors arrive early — be ready when they do.', 125, 10, MARA_BELL_ID),
      template('ledger-of-dust', 'study', 'Reconcile the Accounts', 'Focused study block', 'One matched column closes Crane’s favorite loophole.', 130, 10, MARA_BELL_ID),
      template('ledger-of-dust', 'work', 'Post Weekly Entries', 'Complete one important work item', 'Late entries look like guilt to a town that gossips.', 125, 10, MARA_BELL_ID),
      template('ledger-of-dust', 'health', 'Eye Strain Reset', 'Breathing routine and water reset', 'Tired eyes miss the fee buried on line forty.', 105, 8, MARA_BELL_ID),
      template('ledger-of-dust', 'social', 'Confirm Supplier Receipts', 'Coordinate one shared errand', 'Witnesses turn whispers into evidence.', 110, 8, MARA_BELL_ID),
      template('ledger-of-dust', 'creative', 'Ledger Margin Notes', 'Capture progress creatively', 'Your annotations become armor in the next dispute.', 115, 9, MARA_BELL_ID),
      template('ledger-of-dust', 'errand', 'Fetch the Notary Stamp', 'Finish one practical chore outside', 'No stamp, no proof — Crane loves unmarked paper.', 115, 8, MARA_BELL_ID),
    ],
    chapterRewards: [{ id: 'ledger-of-dust-title', type: 'title', name: 'Ledger Keeper' }],
  },
  {
    id: 'debt-at-the-door',
    order: 3,
    title: 'Debt at the Door',
    territoryName: 'Pawn Row',
    mapPosition: { x: 50, y: 42 },
    summary:
      'Crane’s collectors knock with contracts forged in friendly ink — honesty is expensive when the town owes more than it earns.',
    dramaticPurpose: 'Raise stakes with debt pressure and corrupt officials.',
    introDialogue:
      'Mara Bell: Pawn Row reeks of desperation. Crane bought half the notes on this block. We pay what’s fair and fight what’s forged.',
    introScene: [
      {
        characterId: VICTOR_CRANE_ID,
        line: 'Debt is simply honesty billed later, shopkeeper. Your neighbors signed willingly — I merely own the pen they borrowed.',
        badge: 'CHAPTER III',
      },
      {
        characterId: MARA_BELL_ID,
        line: 'Collectors hit Pawn Row at sunrise. Crane marked up three shopkeepers who trusted his “bridge loans.” We document, we don’t fold.',
        badge: 'ORDERS',
      },
      {
        characterId: VICTOR_CRANE_ID,
        line: 'Refuse my terms and the railway stops delivering to your block. Progress always costs something — I collect on both ledgers.',
        badge: 'TAUNT',
      },
    ],
    successDialogue:
      'Mara Bell: Two forged clauses voided and one family kept their storefront. Crane’s smile tightened — price war’s coming to Main Street.',
    failureDialogue:
      'Mara Bell: We lost a shop on Pawn Row today. Crane chalked it up to “market forces.” Win the next round or Main Street belongs to him.',
    questTemplates: [
      template('debt-at-the-door', 'cleaning', 'Restore the Back Room', 'Night reset of your key area', 'Order in the shop mirrors order in the books.', 130, 10, MARA_BELL_ID),
      template('debt-at-the-door', 'fitness', 'Doorstep Endurance', 'High-effort workout', 'Collectors test your nerve before your credit.', 135, 10, MARA_BELL_ID),
      template('debt-at-the-door', 'study', 'Decode the Loan Contracts', 'Deep focus study block', 'Forged interest lives in the attachments.', 135, 11, MARA_BELL_ID),
      template('debt-at-the-door', 'work', 'File the Dispute Petition', 'Finish one hard work deliverable', 'One filed petition freezes a collector’s stride.', 140, 11, MARA_BELL_ID),
      template('debt-at-the-door', 'health', 'Calm Before Collectors', 'Sleep prep / mindfulness reset', 'Steady hands sign the papers that save a neighbor.', 115, 9, MARA_BELL_ID),
      template('debt-at-the-door', 'social', 'Rally Pawn Row Merchants', 'Meaningful social accountability step', 'Crane divides shops one whisper at a time.', 120, 9, MARA_BELL_ID),
      template('debt-at-the-door', 'creative', 'Debt Notice Broadside', 'Create a short design or writing piece', 'Truth on paper travels faster than Crane’s riders.', 125, 10, MARA_BELL_ID),
      template('debt-at-the-door', 'errand', 'Deliver the Notarized Reply', 'Complete a practical checklist errand', 'Miss the deadline and the contract defaults.', 120, 9, MARA_BELL_ID),
    ],
    chapterRewards: [{ id: 'debt-at-the-door-cosmetic', type: 'cosmetic', name: 'Dustfall Shop Apron' }],
  },
  {
    id: 'the-price-war',
    order: 4,
    title: 'The Price War',
    territoryName: 'Merchant Exchange',
    mapPosition: { x: 66, y: 26 },
    summary:
      'Crane undercuts every shelf you stock — honesty is expensive when virtue sells above his loss-leader lies.',
    dramaticPurpose: 'Escalate to open commercial warfare without breaking the player’s ethics.',
    introDialogue:
      'Mara Bell: Crane slashed prices below cost on half Main Street. He’s buying loyalty he intends to invoice later. Hold the line — fair, not cheap.',
    introScene: [
      {
        characterId: MARA_BELL_ID,
        line: 'Merchant Exchange is buzzing — Crane’s men posted new tariffs before dawn. Undercut us and the town eats cheap poison for a year.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: VICTOR_CRANE_ID,
        line: 'Price war, shopkeeper. I can bleed longer than your virtue can. Honesty is expensive — bankruptcy is complimentary.',
        badge: 'VILLAIN',
      },
      {
        characterId: MARA_BELL_ID,
        line: 'We don’t match his lies. We match his customers with truth. Move stock, keep margins honest, and let Mara count the cost.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Mara Bell: Exchange held. Three carriers came back to our counter when Crane’s “free” shipment arrived spoiled. One chapter left — Crane saves his cruelest contract for last.',
    failureDialogue:
      'Mara Bell: We lost two regulars to his bait prices today. Tomorrow we win them back with proof — or Main Street forgets what fair looks like.',
    questTemplates: [
      template('the-price-war', 'cleaning', 'Polish the Display Window', 'Complete full cleaning sweep', 'Shoppers trust what they can see clearly.', 140, 11, MARA_BELL_ID),
      template('the-price-war', 'fitness', 'Exchange Floor Pace', 'Cardio sprint or brisk walk session', 'Crane’s runners move fast — so do we.', 145, 11, MARA_BELL_ID),
      template('the-price-war', 'study', 'Analyze Crane Tariffs', 'Focused study and recap', 'Know his loss leaders before they gut your stock.', 145, 11, MARA_BELL_ID),
      template('the-price-war', 'work', 'Honest Price Manifest', 'Complete one priority work item', 'Transparent margins beat hidden fees every time.', 150, 12, MARA_BELL_ID),
      template('the-price-war', 'health', 'Exchange Stamina', 'Health routine and recovery', 'Exhaustion signs bad deals.', 125, 10, MARA_BELL_ID),
      template('the-price-war', 'social', 'Merchant Loyalty Pact', 'Meaningful social accountability step', 'Allies at the Exchange share customers, not secrets.', 130, 10, MARA_BELL_ID),
      template('the-price-war', 'creative', 'Fair Price Broadside', 'Capture progress creatively', 'Your posted prices become the town’s benchmark.', 135, 10, MARA_BELL_ID),
      template('the-price-war', 'errand', 'Rush the Honest Shipment', 'Finish critical practical errand', 'Empty shelves lose wars Crane doesn’t have to fight.', 130, 10, MARA_BELL_ID),
    ],
    chapterRewards: [{ id: 'the-price-war-badge', type: 'badge', name: 'Price War Survivor' }],
  },
  {
    id: 'honest-coin',
    order: 5,
    title: 'Honest Coin',
    territoryName: 'Treasury Steps',
    mapPosition: { x: 82, y: 12 },
    summary:
      'Final contract at the Treasury Steps — honesty is expensive one last time, and Dustfall decides who owns Main Street.',
    dramaticPurpose: 'Resolve the saga with the shop’s reputation secured or Crane’s monopoly sealed.',
    introDialogue:
      'Mara Bell: Treasury Steps, high noon. Crane wants your deed in exchange for debts he invented. We show up with receipts, witnesses, and spines.',
    introScene: [
      {
        characterId: MARA_BELL_ID,
        line: 'This is the contract that swallows Main Street whole — or frees it. Crane brought officials, I brought every honest receipt we ever posted.',
        badge: 'FINALE',
      },
      {
        characterId: VICTOR_CRANE_ID,
        line: 'Sign, shopkeeper, and your virtue survives on my terms. Refuse, and honesty becomes the most expensive mistake Dustfall ever buried.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: MARA_BELL_ID,
        line: 'Last chapter of the ledger. Hold your price, hold your name, and let the town watch what honest coin actually buys.',
        badge: 'LAST SALE',
      },
    ],
    successDialogue:
      'Mara Bell: Honest coin wins. Crane’s contract shredded on the Treasury Steps and half Main Street saw it. Honesty is expensive — but Dustfall finally knows what it’s worth.',
    failureDialogue:
      'Mara Bell: Crane got his signature today. The shop still stands, but Main Street smells like his ink. We fight the next clause together.',
    questTemplates: [
      template('honest-coin', 'cleaning', 'Final Shop Inspection', 'Complete full cleaning sweep', 'The town meets your standards at the Treasury Steps.', 150, 12, MARA_BELL_ID),
      template('honest-coin', 'fitness', 'Final Merchant’s Drill', 'High-effort workout', 'Your body holds when the contract tries to break you.', 155, 12, MARA_BELL_ID),
      template('honest-coin', 'study', 'Treasury Contract Review', 'Focused study and recap', 'Know every clause before Crane reads them aloud.', 150, 12, MARA_BELL_ID),
      template('honest-coin', 'work', 'Final Audit Submission', 'Complete one priority work item', 'One clean audit proves the shop was always yours.', 155, 12, MARA_BELL_ID),
      template('honest-coin', 'health', 'Steady Hands at Noon', 'Health routine and recovery', 'Calm hands refuse predatory ink.', 130, 10, MARA_BELL_ID),
      template('honest-coin', 'social', 'Town Merchant Witnesses', 'Meaningful social accountability step', 'Nobody wins Main Street alone.', 130, 10, MARA_BELL_ID),
      template('honest-coin', 'creative', 'Honest Coin Chronicle', 'Capture progress creatively', 'Your story becomes the standard on every block.', 135, 10, MARA_BELL_ID),
      template('honest-coin', 'errand', 'Deliver the Treasury Seal', 'Finish critical practical errand', 'The seal reaches the Steps or Crane wins by default.', 140, 11, MARA_BELL_ID),
    ],
    chapterRewards: [{ id: 'honest-coin-title', type: 'title', name: 'Honest Businessman' }],
  },
];

export const HONEST_BUSINESSMAN_CHAPTERS = enrichSagaChapters(HONEST_BUSINESSMAN_CHAPTERS_RAW, {
  ...WILD_WEST_VARIATION_PROFILE,
  villainName: 'Victor Crane',
});
