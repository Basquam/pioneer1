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

export const FIRST_ROUTE_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('first-route', 'cleaning', 'calm', 'Purge Dispatch Cache — {Task}', '{Article} {task} scrubs cluttered nodes before {villain} {stakes}. Sloppy habits broadcast to every hijacker.', 'calm', ['cleaning', 'preparation']),
    v('first-route', 'cleaning', 'normal', 'Sanitize the Drop Point — {Task}', '{Article} {task} keeps your rider signature clean across {location}.', 'normal', ['cleaning', 'preparation']),
    v('first-route', 'cleaning', 'urgent', 'Scrub Before the Syndicate Scans — {Task}', '{Article} {task} must finish before {villain} {stakes}. Static in the alley is a Jackal invitation.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('first-route', 'fitness', 'calm', 'Neural Warm-Up Drill — {Task}', '{Article} {task} keeps your reflexes sharp before {villain} {stakes}. A sluggish rider broadcasts to every crawler.', 'calm', ['training']),
    v('first-route', 'fitness', 'normal', 'Train for the Rainline Sprint — {Task}', '{Article} {task} builds the pace {location} needs when everyone is carrying something.', 'normal', ['training', 'preparation']),
    v('first-route', 'fitness', 'urgent', 'Outrun the Hijack Crew — {Task}', '{Article} {task} must land before {villain} {stakes}. Syndicate tail bikes don\'t wait for hesitation.', 'urgent', ['training']),
  ],
  study: [
    v('first-route', 'study', 'calm', 'Decode the Route Signature — {Task}', '{Article} {task} turns Jackal patterns into keys before {villain} {stakes}. Knowledge is your encryption.', 'calm', ['investigation']),
    v('first-route', 'study', 'normal', 'Map the Manifest Anomaly — {Task}', '{Article} {task} closes hijack blind spots across {location}.', 'normal', ['investigation', 'preparation']),
    v('first-route', 'study', 'urgent', 'Crack the First Drop Code — {Task}', '{Article} {task} must resolve before {villain} {stakes}. The route signature is already propagating.', 'urgent', ['investigation']),
  ],
  work: [
    v('first-route', 'work', 'calm', 'Fortify the Manifest Ledger — {Task}', '{Article} {task} keeps rainline routes honest before {villain} {stakes}. The grid decides who gets routed.', 'calm', ['preparation']),
    v('first-route', 'work', 'normal', 'Execute a Clean Drop — {Task}', '{Article} {task} is discipline clipped to a package across {location}.', 'normal', ['preparation']),
    v('first-route', 'work', 'urgent', 'Hold Signal Integrity Under Hijack — {Task}', '{Article} {task} must finish before {villain} {stakes}. One sloppy seal and the syndicate learns your cargo.', 'urgent', ['preparation']),
  ],
  health: [
    v('first-route', 'health', 'calm', 'Recovery at the Safehouse — {Task}', '{Article} {task} keeps your mind intact before {villain} {stakes}. A fragmented rider is easy to hijack.', 'calm', ['recovery']),
    v('first-route', 'health', 'normal', 'Re-sync Before the Next Sector — {Task}', '{Article} {task} restores the focus {location} needs when the rainline turns hostile.', 'normal', ['recovery', 'preparation']),
    v('first-route', 'health', 'urgent', 'Recover Before Jackal Locks In — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every dropped package.', 'urgent', ['recovery']),
  ],
  social: [
    v('first-route', 'social', 'calm', 'Ping the Courier Network — {Task}', '{Article} {task} encrypts hope before {villain} {stakes}. Fear spreads through open channels.', 'calm', ['outreach']),
    v('first-route', 'social', 'normal', 'Signal the Dispatch Crew — {Task}', '{Article} {task} reminds {location} that riders still answer each other.', 'normal', ['outreach', 'preparation']),
    v('first-route', 'social', 'urgent', 'Warn the Network Before Blackout — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is a syndicate win.', 'urgent', ['outreach']),
  ],
  creative: [
    v('first-route', 'creative', 'calm', 'Draft a Route Manifest — {Task}', '{Article} {task} shapes the riders who follow your trail before {villain} {stakes}.', 'calm', ['craft']),
    v('first-route', 'creative', 'normal', 'Craft a Rainline Broadside — {Task}', '{Article} {task} turns resolve into something {location} can route without a trace.', 'normal', ['craft', 'preparation']),
    v('first-route', 'creative', 'urgent', 'Publish Before the Mirror Edits — {Task}', '{Article} {task} must land before {villain} {stakes}. Words are the last uncorrupted manifest.', 'urgent', ['craft']),
  ],
  errand: [
    v('first-route', 'errand', 'calm', 'Midnight Supply Run — {Task}', '{Article} {task} keeps spoof chips and rain seals stocked before {villain} {stakes}.', 'calm', ['delivery']),
    v('first-route', 'errand', 'normal', 'Run the Dispatch Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from stalling on the first route.', 'normal', ['delivery', 'preparation']),
    v('first-route', 'errand', 'urgent', 'Race the Alley Before Lockdown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds Jackal\'s hijack ledger.', 'urgent', ['delivery']),
  ],
};
