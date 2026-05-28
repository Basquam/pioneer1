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

export const FIRST_LOGIN_QUEST_VARIATIONS: Partial<
  Record<TaskCategory, QuestTemplateVariation[]>
> = {
  cleaning: [
    v('first-login', 'cleaning', 'calm', 'Purge Lobby Cache — {Task}', '{Article} {task} scrubs cluttered nodes before {villain} {stakes}. Sloppy habits broadcast to every crawler.', 'calm', ['cleaning', 'preparation']),
    v('first-login', 'cleaning', 'normal', 'Sanitize the Terminal — {Task}', '{Article} {task} keeps your clearance profile clean across {location}.', 'normal', ['cleaning', 'preparation']),
    v('first-login', 'cleaning', 'urgent', 'Scrub Before Compliance Scans — {Task}', '{Article} {task} must finish before {villain} {stakes}. Static in the queue is a Zenith invitation.', 'urgent', ['cleaning']),
  ],
  fitness: [
    v('first-login', 'fitness', 'calm', 'Neural Warm-Up Drill — {Task}', '{Article} {task} keeps your reflexes sharp before {villain} {stakes}. A sluggish analyst broadcasts to every dashboard.', 'calm', ['training']),
    v('first-login', 'fitness', 'normal', 'Train for the Lobby Sprint — {Task}', '{Article} {task} builds the pace {location} needs when metrics already watch.', 'normal', ['training', 'preparation']),
    v('first-login', 'fitness', 'urgent', 'Outrun the Onboarding Scan — {Task}', '{Article} {task} must land before {villain} {stakes}. Compliance drones don\'t wait for hesitation.', 'urgent', ['training']),
  ],
  study: [
    v('first-login', 'study', 'calm', 'Decode the Login Signature — {Task}', '{Article} {task} turns Helix patterns into keys before {villain} {stakes}. Knowledge is your encryption.', 'calm', ['investigation']),
    v('first-login', 'study', 'normal', 'Map the Access Anomaly — {Task}', '{Article} {task} closes audit blind spots across {location}.', 'normal', ['investigation', 'preparation']),
    v('first-login', 'study', 'urgent', 'Crack Helix\'s Onboarding Code — {Task}', '{Article} {task} must resolve before {villain} {stakes}. The login signature is already propagating.', 'urgent', ['investigation']),
  ],
  work: [
    v('first-login', 'work', 'calm', 'Fortify the Access Ledger — {Task}', '{Article} {task} keeps clearance routes honest before {villain} {stakes}. The tower decides who gets routed.', 'calm', ['preparation']),
    v('first-login', 'work', 'normal', 'Execute a Clean Operation — {Task}', '{Article} {task} is discipline encoded in {location}\'s compliance grid.', 'normal', ['preparation']),
    v('first-login', 'work', 'urgent', 'Hold Signal Integrity Under Review — {Task}', '{Article} {task} must finish before {villain} {stakes}. One sloppy block and Zenith edits your profile.', 'urgent', ['preparation']),
  ],
  health: [
    v('first-login', 'health', 'calm', 'Recovery at the Safehouse — {Task}', '{Article} {task} keeps your mind intact before {villain} {stakes}. A fragmented analyst is easy to mirror.', 'calm', ['recovery']),
    v('first-login', 'health', 'normal', 'Re-sync Before the Next Sector — {Task}', '{Article} {task} restores the focus {location} needs when the tower turns hostile.', 'normal', ['recovery', 'preparation']),
    v('first-login', 'health', 'urgent', 'Recover Before Helix Locks In — {Task}', '{Article} {task} cannot wait — {villain} {stakes} and fatigue shows in every audit gap.', 'urgent', ['recovery']),
  ],
  social: [
    v('first-login', 'social', 'calm', 'Ping the Analyst Network — {Task}', '{Article} {task} encrypts hope before {villain} {stakes}. Fear spreads through open channels.', 'calm', ['outreach']),
    v('first-login', 'social', 'normal', 'Signal the Lobby Crew — {Task}', '{Article} {task} reminds {location} that analysts still answer each other.', 'normal', ['outreach', 'preparation']),
    v('first-login', 'social', 'urgent', 'Warn the Network Before Blackout — {Task}', '{Article} {task} must send before {villain} {stakes}. Silence is a Zenith win.', 'urgent', ['outreach']),
  ],
  creative: [
    v('first-login', 'creative', 'calm', 'Draft an Access Manifest — {Task}', '{Article} {task} shapes the analysts who follow your route before {villain} {stakes}.', 'calm', ['craft']),
    v('first-login', 'creative', 'normal', 'Craft a Compliance Broadside — {Task}', '{Article} {task} turns resolve into something {location} can route without a trace.', 'normal', ['craft', 'preparation']),
    v('first-login', 'creative', 'urgent', 'Publish Before the Mirror Edits — {Task}', '{Article} {task} must land before {villain} {stakes}. Words are the last uncorrupted packet.', 'urgent', ['craft']),
  ],
  errand: [
    v('first-login', 'errand', 'calm', 'Midnight Supply Run — {Task}', '{Article} {task} keeps clearance chips stocked before {villain} {stakes}.', 'calm', ['delivery']),
    v('first-login', 'errand', 'normal', 'Run the Lobby Errand — {Task}', '{Article} {task} is the small chore that keeps {location} from stalling under review.', 'normal', ['delivery', 'preparation']),
    v('first-login', 'errand', 'urgent', 'Race the Tower Before Lockdown — {Task}', '{Article} {task} must finish before {villain} {stakes}. Every delay feeds Helix\'s metrics.', 'urgent', ['delivery']),
  ],
};
