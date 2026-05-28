import type { QuestTemplateVariation, TaskCategory } from '@/types/narrative';

function v(
  chapterId: string,
  category: TaskCategory,
  suffix: string,
  titlePattern: string,
  descriptionPattern: string,
  intensity: QuestTemplateVariation['intensity'],
  tags: QuestTemplateVariation['tags'],
): QuestTemplateVariation {
  return {
    id: `${chapterId}-${category}-${suffix}`,
    narrativeTitlePattern: titlePattern,
    narrativeDescriptionPattern: descriptionPattern,
    intensity,
    tags,
  };
}

export const OPEN_FOR_BUSINESS_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('open-for-business', 'cleaning', 'calm', 'Sweep the Shop Floor — {Task}', '{Article} {task} clears the boards before {villain} {stakes}. Dust on the floor looks like neglect to passing buyers.', 'calm', ['cleaning', 'preparation']),
    v('open-for-business', 'cleaning', 'normal', 'Prepare the Storefront — {Task}', '{Article} {task} keeps Main Street honest while {location} watches your first day.', 'normal', ['cleaning', 'preparation']),
    v('open-for-business', 'cleaning', 'urgent', 'Scrub Before Opening Bell — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every smear on the counter invites Crane\'s "rescue" prices.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('open-for-business', 'fitness', 'calm', 'Stockroom Stamina — {Task}', '{Article} {task} keeps your back honest before {villain} {stakes}. Heavy crates don\'t wait for a second wind.', 'calm', ['training']),
    v('open-for-business', 'fitness', 'normal', 'Train for Merchant\'s Hours — {Task}', '{Article} {task} builds the stamina {location} needs when honesty is expensive.', 'normal', ['training', 'preparation']),
    v('open-for-business', 'fitness', 'urgent', 'Lift Before Crane Counts Receipts — {Task}', '{Article} {task} is your answer to {villain} {stakes}. Empty shelves invite predatory credit.', 'urgent', ['training']),
  ],
  study: [
    v('open-for-business', 'study', 'calm', 'Read the Trade Ordinance — {Task}', '{Article} {task} turns clauses into fair margins before {villain} {stakes}. Crane\'s edge hides in footnotes.', 'calm', ['investigation']),
    v('open-for-business', 'study', 'normal', 'Decode the Lien Language — {Task}', '{Article} {task} maps how {villain} prices virtue into {location}.', 'normal', ['investigation', 'preparation']),
    v('open-for-business', 'study', 'urgent', 'Crack the Welcome Basket Terms — {Task}', '{Article} {task} must land before {villain} {stakes}. One unread clause becomes tomorrow\'s interest.', 'urgent', ['investigation']),
  ],
  work: [
    v('open-for-business', 'work', 'calm', 'Price the Opening Inventory — {Task}', '{Article} {task} keeps the ledger honest before {villain} {stakes}. Fair margins today prevent panic discounts tomorrow.', 'calm', ['preparation']),
    v('open-for-business', 'work', 'normal', 'Execute the First Sale — {Task}', '{Article} {task} is discipline rung through a cash drawer on {location}\'s Main Street.', 'normal', ['preparation']),
    v('open-for-business', 'work', 'urgent', 'Open Before Sundown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Shutters closed too long become Crane\'s rumor mill.', 'urgent', ['preparation']),
  ],
  health: [
    v('open-for-business', 'health', 'calm', 'Merchant\'s Rest — {Task}', '{Article} {task} keeps you sharp before {villain} {stakes}. A dizzy shopkeeper mislabels every shelf.', 'calm', ['recovery']),
    v('open-for-business', 'health', 'normal', 'Restore Before the Next Customer — {Task}', '{Article} {task} steadies the focus {location} trusts behind the counter.', 'normal', ['recovery', 'preparation']),
    v('open-for-business', 'health', 'urgent', 'Recover Before Crane\'s Clerk Arrives — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every mispriced tin.', 'urgent', ['recovery']),
  ],
  social: [
    v('open-for-business', 'social', 'calm', 'Word on Main Street — {Task}', '{Article} {task} steadies trust before {villain} {stakes}. Honest news spreads by mouth before ledger.', 'calm', ['outreach']),
    v('open-for-business', 'social', 'normal', 'Signal the Merchant Circle — {Task}', '{Article} {task} reminds {location} that fair prices still have a champion.', 'normal', ['outreach', 'preparation']),
    v('open-for-business', 'social', 'urgent', 'Rally Before Crane\'s Flowers Wilt — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is permission for predatory charm.', 'urgent', ['outreach']),
  ],
  creative: [
    v('open-for-business', 'creative', 'calm', 'Hand-Painted Open Sign — {Task}', '{Article} {task} shapes the promise {location} reads before {villain} {stakes}.', 'calm', ['craft']),
    v('open-for-business', 'creative', 'normal', 'Craft a Shop Broadside — {Task}', '{Article} {task} turns resolve into something Main Street can see from the boardwalk.', 'normal', ['craft', 'preparation']),
    v('open-for-business', 'creative', 'urgent', 'Ink the Honest Price List — {Task}', '{Article} {task} must publish before {villain} {stakes}. Your sign is the first oath the town reads.', 'urgent', ['craft']),
  ],
  errand: [
    v('open-for-business', 'errand', 'calm', 'Fetch Opening Stock — {Task}', '{Article} {task} keeps the shelves honest before {villain} {stakes}. Empty shelves invite Crane\'s "rescue" shipment.', 'calm', ['delivery']),
    v('open-for-business', 'errand', 'normal', 'Run the Main Street Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from calling you closed on day one.', 'normal', ['delivery', 'preparation']),
    v('open-for-business', 'errand', 'urgent', 'Race Before the Lien Notice — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds Crane\'s credit ledger.', 'urgent', ['delivery']),
  ],
};
