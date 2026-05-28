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

export const FIRST_SHIPMENT_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('first-shipment', 'cleaning', 'calm', 'Sweep the Loading Dock — {Task}', '{Article} {task} clears the platform before {villain} {stakes}. Spilled grain hides sabotage under the planks.', 'calm', ['cleaning', 'preparation']),
    v('first-shipment', 'cleaning', 'normal', 'Prepare the {Setting} — {Task}', '{Article} {task} keeps the railyard honest while {location} waits on the first bell.', 'normal', ['cleaning', 'preparation']),
    v('first-shipment', 'cleaning', 'urgent', 'Scrub Before the Bell — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every smear on the dock is another hold on Cargo Six.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('first-shipment', 'fitness', 'calm', 'Platform Strength Drill — {Task}', '{Article} {task} keeps your back straight before {villain} {stakes}. A sluggish crew drops cargo before the bell.', 'calm', ['training']),
    v('first-shipment', 'fitness', 'normal', 'Train for the Yard Shift — {Task}', '{Article} {task} builds the stamina {location} needs when progress always costs something.', 'normal', ['training', 'preparation']),
    v('first-shipment', 'fitness', 'urgent', 'Lift Before Vane Files the Hold — {Task}', '{Article} {task} is your answer to {villain} {stakes}. Heavy crates don\'t wait for a second wind.', 'urgent', ['training']),
  ],
  study: [
    v('first-shipment', 'study', 'calm', 'Read the Route Ledger — {Task}', '{Article} {task} turns footnotes into freight routes before {villain} {stakes}. Vane\'s fees hide in the margins.', 'calm', ['investigation']),
    v('first-shipment', 'study', 'normal', 'Decode the Manifest Codes — {Task}', '{Article} {task} maps how {villain} prices delay into {location}.', 'normal', ['investigation', 'preparation']),
    v('first-shipment', 'study', 'urgent', 'Crack the Tariff Schedule — {Task}', '{Article} {task} must land before {villain} {stakes}. One unread clause stops a whole train.', 'urgent', ['investigation']),
  ],
  work: [
    v('first-shipment', 'work', 'calm', 'Sign the Manifest — {Task}', '{Article} {task} keeps the line moving before {villain} {stakes}. One unsigned page stops a whole train.', 'calm', ['preparation']),
    v('first-shipment', 'work', 'normal', 'Execute the First Shipment — {Task}', '{Article} {task} is discipline stamped in steel across {location}.', 'normal', ['preparation']),
    v('first-shipment', 'work', 'urgent', 'Clear the Platform Before Sundown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Hunger downline doesn\'t negotiate.', 'urgent', ['preparation']),
  ],
  health: [
    v('first-shipment', 'health', 'calm', 'Platform Break — {Task}', '{Article} {task} keeps you upright before {villain} {stakes}. Exhausted crews drop cargo.', 'calm', ['recovery']),
    v('first-shipment', 'health', 'normal', 'Restore Before the Next Coupling — {Task}', '{Article} {task} steadies the hands {location} trusts on the line.', 'normal', ['recovery', 'preparation']),
    v('first-shipment', 'health', 'urgent', 'Recover Before the Hold Lands — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every dropped crate.', 'urgent', ['recovery']),
  ],
  social: [
    v('first-shipment', 'social', 'calm', 'Brief the Yard Crew — {Task}', '{Article} {task} steadies voices before {villain} {stakes}. Fear spreads when nobody confirms the run.', 'calm', ['outreach']),
    v('first-shipment', 'social', 'normal', 'Signal the Switch Team — {Task}', '{Article} {task} reminds {location} that the line still answers a whistle.', 'normal', ['outreach', 'preparation']),
    v('first-shipment', 'social', 'urgent', 'Rally Before the Bell — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is permission for another delay.', 'urgent', ['outreach']),
  ],
  creative: [
    v('first-shipment', 'creative', 'calm', 'Sketch the Route Map — {Task}', '{Article} {task} shapes the crew who follow your run before {villain} {stakes}.', 'calm', ['craft']),
    v('first-shipment', 'creative', 'normal', 'Draft a Yard Broadside — {Task}', '{Article} {task} turns resolve into something {location} can read from the platform.', 'normal', ['craft', 'preparation']),
    v('first-shipment', 'creative', 'urgent', 'Ink the Manifest Warning — {Task}', '{Article} {task} must publish before {villain} {stakes}. Courage needs a map tonight.', 'urgent', ['craft']),
  ],
  errand: [
    v('first-shipment', 'errand', 'calm', 'Fetch the Seal Stamp — {Task}', '{Article} {task} keeps the paperwork honest before {villain} {stakes}. No stamp, no shipment.', 'calm', ['delivery']),
    v('first-shipment', 'errand', 'normal', 'Run the Platform Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from stalling on the first run.', 'normal', ['delivery', 'preparation']),
    v('first-shipment', 'errand', 'urgent', 'Race the Freight Before Hold — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds Vane\'s ledger.', 'urgent', ['delivery']),
  ],
};
