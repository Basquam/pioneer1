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

export const ORIENTATION_OF_BLOOD_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('orientation-of-blood', 'cleaning', 'calm', 'Clear the Quad Evidence — {Task}', '{Article} {task} clears the scene before {villain} {stakes}. Polished floors hide blood spatter in plain sight.', 'calm', ['cleaning', 'preparation']),
    v('orientation-of-blood', 'cleaning', 'normal', 'Prepare the Interview Room — {Task}', '{Article} {task} keeps Whitmore\'s notes legible while {location} watches orientation.', 'normal', ['cleaning', 'preparation']),
    v('orientation-of-blood', 'cleaning', 'urgent', 'Scrub Before Administration Arrives — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every smear on the quad is another "accident" filed.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('orientation-of-blood', 'fitness', 'calm', 'Campus Patrol Warm-Up — {Task}', '{Article} {task} keeps your legs honest before {villain} {stakes}. A sluggish investigator broadcasts across open quads.', 'calm', ['training']),
    v('orientation-of-blood', 'fitness', 'normal', 'Train for the Quad Chase — {Task}', '{Article} {task} builds the stamina {location} needs when knowledge has a body count.', 'normal', ['training', 'preparation']),
    v('orientation-of-blood', 'fitness', 'urgent', 'Sprint Before the Donors Tour — {Task}', '{Article} {task} must land before {villain} {stakes}. Security tail cars don\'t wait for hesitation.', 'urgent', ['training']),
  ],
  study: [
    v('orientation-of-blood', 'study', 'calm', 'Decode the Roster — {Task}', '{Article} {task} turns academy patterns into leads before {villain} {stakes}. Knowledge is your subpoena key.', 'calm', ['investigation']),
    v('orientation-of-blood', 'study', 'normal', 'Cross-Reference the Orientation List — {Task}', '{Article} {task} closes blind spots across Whitmore\'s sealed records.', 'normal', ['investigation', 'preparation']),
    v('orientation-of-blood', 'study', 'urgent', 'Crack the Glass Student\'s Index — {Task}', '{Article} {task} must resolve before {villain} {stakes}. The roster is already being rewritten.', 'urgent', ['investigation']),
  ],
  work: [
    v('orientation-of-blood', 'work', 'calm', 'Fortify the Case File — {Task}', '{Article} {task} keeps testimony honest before {villain} {stakes}. Whitmore decides who gets heard.', 'calm', ['preparation']),
    v('orientation-of-blood', 'work', 'normal', 'Execute the Orientation Briefing — {Task}', '{Article} {task} is discipline filed in {location}\'s first campus lead.', 'normal', ['preparation']),
    v('orientation-of-blood', 'work', 'urgent', 'Hold Case Integrity Under Pressure — {Task}', '{Article} {task} must finish before {villain} {stakes}. One sloppy lead and the board expunges the body.', 'urgent', ['preparation']),
  ],
  health: [
    v('orientation-of-blood', 'health', 'calm', 'Recovery at the Faculty Office — {Task}', '{Article} {task} keeps you sharp before {villain} {stakes}. An exhausted investigator is easy to discredit on donor tours.', 'calm', ['recovery']),
    v('orientation-of-blood', 'health', 'normal', 'Restore Before the Next Interview — {Task}', '{Article} {task} steadies the focus {location} needs when banners still say welcome.', 'normal', ['recovery', 'preparation']),
    v('orientation-of-blood', 'health', 'urgent', 'Recover Before Security Closes the Quad — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every testimony.', 'urgent', ['recovery']),
  ],
  social: [
    v('orientation-of-blood', 'social', 'calm', 'Ping the Graduate Network — {Task}', '{Article} {task} files hope before {villain} {stakes}. Fear spreads through group chats.', 'calm', ['outreach']),
    v('orientation-of-blood', 'social', 'normal', 'Signal a Trusted Contact — {Task}', '{Article} {task} reminds {location} that someone still answers after orientation blood.', 'normal', ['outreach', 'preparation']),
    v('orientation-of-blood', 'social', 'urgent', 'Warn the Network Before Redaction — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is a donor-network win.', 'urgent', ['outreach']),
  ],
  creative: [
    v('orientation-of-blood', 'creative', 'calm', 'Draft an Incident Summary — {Task}', '{Article} {task} shapes the investigators who follow your trail before {villain} {stakes}.', 'calm', ['craft']),
    v('orientation-of-blood', 'creative', 'normal', 'Craft a Campus Lead Broadside — {Task}', '{Article} {task} turns resolve into something {location} can read between the banners.', 'normal', ['craft', 'preparation']),
    v('orientation-of-blood', 'creative', 'urgent', 'Publish Before the Ledger Burns — {Task}', '{Article} {task} must land before {villain} {stakes}. Words are the last uncensored witness.', 'urgent', ['craft']),
  ],
  errand: [
    v('orientation-of-blood', 'errand', 'calm', 'Midnight Evidence Run — {Task}', '{Article} {task} keeps sealed envelopes stocked before {villain} {stakes}.', 'calm', ['delivery']),
    v('orientation-of-blood', 'errand', 'normal', 'Run the Campus Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from losing the orientation trail.', 'normal', ['delivery', 'preparation']),
    v('orientation-of-blood', 'errand', 'urgent', 'Race Whitmore Before Lockdown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds the Glass Student\'s alibi.', 'urgent', ['delivery']),
  ],
};
