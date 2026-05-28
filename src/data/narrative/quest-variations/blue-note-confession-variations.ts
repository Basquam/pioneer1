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

export const BLUE_NOTE_CONFESSION_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('blue-note-confession', 'cleaning', 'calm', 'Clear the Booth Table — {Task}', '{Article} {task} clears the booth before {villain} {stakes}. Ash hides witness notes in cluttered corners.', 'calm', ['cleaning', 'preparation']),
    v('blue-note-confession', 'cleaning', 'normal', 'Prepare the Back Booth — {Task}', '{Article} {task} keeps your case notes legible while {location} hums with saxophone.', 'normal', ['cleaning', 'preparation']),
    v('blue-note-confession', 'cleaning', 'urgent', 'Scrub Before the House Closes — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every smear on the table is another verse Noir rewrites.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('blue-note-confession', 'fitness', 'calm', 'Night Shift Warm-Up — {Task}', '{Article} {task} keeps your legs honest before {villain} {stakes}. A sluggish detective broadcasts to every bouncer.', 'calm', ['training']),
    v('blue-note-confession', 'fitness', 'normal', 'Train for the Alley Exit — {Task}', '{Article} {task} builds the stamina {location} needs when everyone tells the truth differently.', 'normal', ['training', 'preparation']),
    v('blue-note-confession', 'fitness', 'urgent', 'Sprint Before Last Call — {Task}', '{Article} {task} must land before {villain} {stakes}. Fixer tail coats don\'t wait for hesitation.', 'urgent', ['training']),
  ],
  study: [
    v('blue-note-confession', 'study', 'calm', 'Decode the Setlist — {Task}', '{Article} {task} turns Noir patterns into leads before {villain} {stakes}. Knowledge is your subpoena key.', 'calm', ['investigation']),
    v('blue-note-confession', 'study', 'normal', 'Cross-Reference the Confession — {Task}', '{Article} {task} closes blind spots across the Blue Note\'s sealed verses.', 'normal', ['investigation', 'preparation']),
    v('blue-note-confession', 'study', 'urgent', 'Crack Noir\'s Encore Code — {Task}', '{Article} {task} must resolve before {villain} {stakes}. The setlist is already being rewritten.', 'urgent', ['investigation']),
  ],
  work: [
    v('blue-note-confession', 'work', 'calm', 'Fortify the Case Ledger — {Task}', '{Article} {task} keeps testimony honest before {villain} {stakes}. The Red Room decides who gets heard.', 'calm', ['preparation']),
    v('blue-note-confession', 'work', 'normal', 'Execute the Confession Briefing — {Task}', '{Article} {task} is discipline filed in {location}\'s first after-hours lead.', 'normal', ['preparation']),
    v('blue-note-confession', 'work', 'urgent', 'Hold Case Integrity Under the Spotlight — {Task}', '{Article} {task} must finish before {villain} {stakes}. One sloppy lead and the house silences the witness.', 'urgent', ['preparation']),
  ],
  health: [
    v('blue-note-confession', 'health', 'calm', 'Recovery at the Dressing Room — {Task}', '{Article} {task} keeps you sharp before {villain} {stakes}. An exhausted detective is easy to discredit between sets.', 'calm', ['recovery']),
    v('blue-note-confession', 'health', 'normal', 'Restore Before the Next Set — {Task}', '{Article} {task} steadies the focus {location} needs when smoke still hangs low.', 'normal', ['recovery', 'preparation']),
    v('blue-note-confession', 'health', 'urgent', 'Recover Before the Red Room Locks — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every testimony.', 'urgent', ['recovery']),
  ],
  social: [
    v('blue-note-confession', 'social', 'calm', 'Ping the Band Network — {Task}', '{Article} {task} files hope before {villain} {stakes}. Fear spreads through green rooms.', 'calm', ['outreach']),
    v('blue-note-confession', 'social', 'normal', 'Signal a Trusted Contact — {Task}', '{Article} {task} reminds {location} that someone still answers after midnight.', 'normal', ['outreach', 'preparation']),
    v('blue-note-confession', 'social', 'urgent', 'Warn the Network Before Redaction — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is a Red Room win.', 'urgent', ['outreach']),
  ],
  creative: [
    v('blue-note-confession', 'creative', 'calm', 'Draft a Confession Summary — {Task}', '{Article} {task} shapes the detectives who follow your trail before {villain} {stakes}.', 'calm', ['craft']),
    v('blue-note-confession', 'creative', 'normal', 'Craft a Blue Note Broadside — {Task}', '{Article} {task} turns resolve into something {location} can read between the rain.', 'normal', ['craft', 'preparation']),
    v('blue-note-confession', 'creative', 'urgent', 'Publish Before the Ledger Burns — {Task}', '{Article} {task} must land before {villain} {stakes}. Words are the last uncensored verse.', 'urgent', ['craft']),
  ],
  errand: [
    v('blue-note-confession', 'errand', 'calm', 'Midnight Evidence Run — {Task}', '{Article} {task} keeps sealed envelopes stocked before {villain} {stakes}.', 'calm', ['delivery']),
    v('blue-note-confession', 'errand', 'normal', 'Run the Club Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from losing the confession trail.', 'normal', ['delivery', 'preparation']),
    v('blue-note-confession', 'errand', 'urgent', 'Race the City Before Lockdown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds Noir\'s blackmail ledger.', 'urgent', ['delivery']),
  ],
};
