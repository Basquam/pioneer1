import {
  EXECUTIVE_HELIX_ID,
  MIRA_KADE_ID,
} from '@/data/narrative/zenith-corporation-characters';
import { FIRST_LOGIN_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/first-login-variations';
import {
  enrichSagaChapters,
  NEURONET_VARIATION_PROFILE,
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

const ZENITH_CORPORATION_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'first-login',
    order: 1,
    title: 'First Login',
    territoryName: 'Lobby Terminal',
    media: { sceneImageKey: 'neuronet.chapter.zenith-corporation.01-first-login' },
    mapPosition: { x: 18, y: 72 },
    summary:
      'Your first clearance badge pings at the Lobby Terminal — proof that productivity metrics already watch before you’ve typed a single line.',
    dramaticPurpose: 'Introduce the Junior Systems Analyst fantasy and Helix’s compliance threat.',
    introDialogue:
      'Mira Kade: Analyst, your first login just cleared at Lobby Terminal. Helix’s crawlers are sniffing your profile. Run your operations clean before Zenith edits what you remember.',
    introScene: [
      {
        characterId: MIRA_KADE_ID,
        line: 'Lobby Terminal just lit up on my dashboard — fresh clearance, compliance tags everywhere. First sector, no heroics. Just operations. Keep your neural signature off Helix’s watchlist.',
        badge: 'SECTOR I',
      },
      {
        characterId: EXECUTIVE_HELIX_ID,
        line: 'Pretty little analyst. Shame if discipline ran out before the sector stabilized. Efficiency is obedience, junior — I’m merely pointing at the cracks in your onboarding packet.',
        badge: 'ZENITH',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'Ignore his dashboard talk. Signal Integrity is fragile in this tower. Every operation you finish is a firewall between your mind and his metrics.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Mira Kade: Login secured. You answered Helix’s probe with clean runs and steady Signal Integrity. But look up — Analytics Deck flashed at midnight. They weren’t bluffing. The next sector belongs to whoever routes without a gap in the audit trail.',
    failureDialogue:
      'Mira Kade: Compliance sensors caught hesitation. Metrics rewrite memory when analysts stall — re-sync and run before the tower locks your sector.',
    questTemplates: [
      template('first-login', 'cleaning', 'Purge Lobby Cache', 'Clean kitchen and counters', 'Cluttered nodes broadcast sloppy habits to every crawler.', 110, 8, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.cleaning),
      template('first-login', 'fitness', 'Neural Warm-Up Drill', 'Do a quick bodyweight routine', 'A sluggish analyst broadcasts location to every dashboard.', 120, 10, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.fitness),
      template('first-login', 'study', 'Decode the Login Signature', 'Study session with focused notes', 'Helix writes in patterns. Knowledge is your encryption key.', 125, 9, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.study),
      template('first-login', 'work', 'Fortify the Access Ledger', 'Complete one deep work block', 'The tower decides who gets routed and who gets archived.', 120, 9, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.work),
      template('first-login', 'health', 'Recovery at the Safehouse', 'Hydrate, meds, and a short recovery break', 'A fragmented analyst is easy to mirror.', 100, 7, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.health),
      template('first-login', 'social', 'Ping the Analyst Network', 'Send one meaningful check-in message', 'Fear spreads through open channels unless someone encrypts hope.', 105, 7, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.social),
      template('first-login', 'creative', 'Draft an Access Manifest', 'Create a short design or writing piece', 'Your words shape the analysts who follow your route.', 115, 8, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.creative),
      template('first-login', 'errand', 'Midnight Supply Run', 'Complete one pending errand', 'Clearance chips and power cells vanish fast under review.', 110, 8, MIRA_KADE_ID, FIRST_LOGIN_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [
      {
        id: 'first-login-badge',
        type: 'badge',
        name: 'First Login',
        media: { rewardImageKey: 'neuronet.reward.first-login-badge' },
      },
    ],
  },
  {
    id: 'metrics-review',
    order: 2,
    title: 'Metrics Review',
    territoryName: 'Analytics Deck',
    media: { sceneImageKey: 'neuronet.chapter.zenith-corporation.02-metrics-review' },
    mapPosition: { x: 35, y: 55 },
    summary:
      'A quarterly metrics review on Analytics Deck — Helix’s board watches every packet that moves without a compliant score.',
    dramaticPurpose: 'Escalate urgency and push consistency under surveillance pressure.',
    introDialogue:
      'Mira Kade: Analytics Deck is hot. Compliance drones at both ends. We review before dawn — together, clean, no gaps left in the dashboard.',
    introScene: [
      {
        characterId: MIRA_KADE_ID,
        line: 'Analytics Deck just went dark on the unofficial grid — perfect for a review, lethal if you hesitate. Move fast, move together. You’ve kept Signal Integrity so far.',
        badge: 'SECTOR II',
      },
      {
        characterId: EXECUTIVE_HELIX_ID,
        line: 'Did you hear that silence in the deck? That’s the sound of identity slipping. I didn’t start the audit — I just stopped pretending the sector was secure.',
        badge: 'ZENITH',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'No panic. We route on my clock, not his. Network Standing rises when analysts don’t flinch at review pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Mira Kade: Review confirmed. You held the deck when it counted — I won’t forget that traceless run. But Helix’s editors were seen on Compliance Floor. They mirrored an analyst once; they’ll try again.',
    failureDialogue:
      'Mira Kade: We lost ground on the deck. Reclaim your route before night cycle — the tower staff are watching.',
    questTemplates: [
      template('metrics-review', 'cleaning', 'Scrub the Review Node', 'Deep clean one neglected area', 'Static in the air, panic in the metric queue.', 120, 9, MIRA_KADE_ID),
      template('metrics-review', 'fitness', 'Outrun the Crawlers', 'Cardio sprint or brisk walk session', 'Compliance drones flee fast; your legs decide the chase.', 130, 10, MIRA_KADE_ID),
      template('metrics-review', 'study', 'Map the Deck Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, MIRA_KADE_ID),
      template('metrics-review', 'work', 'Deck Dispatch', 'Complete one important work item', 'Delay is a ping Helix reads like a confession.', 125, 10, MIRA_KADE_ID),
      template('metrics-review', 'health', 'Deck Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear routing decisions.', 105, 8, MIRA_KADE_ID),
      template('metrics-review', 'social', 'Warn the Floor Analysts', 'Reach out to someone who needs support', 'Encrypted warnings save identities before mirrors land.', 110, 8, MIRA_KADE_ID),
      template('metrics-review', 'creative', 'Metrics Anthem', 'Create a short audio/text/art piece', 'Hope encrypts better than fear.', 115, 8, MIRA_KADE_ID),
      template('metrics-review', 'errand', 'Deck Pickup', 'Finish one practical chore outside', 'Review packets arrive under active scan.', 120, 9, MIRA_KADE_ID),
    ],
    chapterRewards: [
      {
        id: 'metric-analyst-title',
        type: 'title',
        name: 'Metric Analyst',
        media: { rewardImageKey: 'neuronet.reward.metric-analyst-title' },
      },
    ],
  },
  {
    id: 'compliance-floor',
    order: 3,
    title: 'Compliance Floor',
    territoryName: 'Compliance Floor',
    media: { sceneImageKey: 'neuronet.chapter.zenith-corporation.03-compliance-floor' },
    mapPosition: { x: 52, y: 38 },
    summary:
      'A dangerous compliance audit surfaces on Compliance Floor — metrics rewrite memory when corporate control finds an open mind.',
    dramaticPurpose: 'Shift from reaction to strategic identity defense inside the tower.',
    introDialogue:
      'Mira Kade: They planted a mirror-audit on the floor. We extract while Helix watches — and we don’t blink when he edits the feed.',
    introScene: [
      {
        characterId: MIRA_KADE_ID,
        line: 'Compliance Floor is crawling with Zenith editors. This isn’t random — they’re testing who breaks first. I trust you to hold the extraction route.',
        badge: 'SECTOR III',
      },
      {
        characterId: EXECUTIVE_HELIX_ID,
        line: 'Extract all you want. Every delay teaches the Neon Spire who really keeps the metrics wound. I’m not cruel — I’m honest. Efficiency is obedience.',
        badge: 'ZENITH',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'Audit’s unstable, grid’s noisy. I can keep your clearance alive if you keep your operations moving.',
        badge: 'EXTRACTION',
      },
    ],
    successDialogue:
      'Mira Kade: Floor secured. They expected panic, found an analyst who leaves no gap. But listen: Executive Lift went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Mira Kade: Extraction stalled means Signal Integrity stalled. Fix this fast — I’ll cover your access if you cover the floor.',
    questTemplates: [
      template('compliance-floor', 'cleaning', 'Clear the Floor Node', 'Declutter one messy zone', 'Debris hides audit fragments and bad routing luck.', 130, 10, MIRA_KADE_ID),
      template('compliance-floor', 'fitness', 'Floor Strength Drill', 'Strength routine', 'You extract with muscle and neural grit.', 140, 11, MIRA_KADE_ID),
      template('compliance-floor', 'study', 'Blueprint the Extraction', 'Study or planning session', 'A steady mind reads audit patterns true.', 135, 10, MIRA_KADE_ID),
      template('compliance-floor', 'work', 'Analyst Route Papers', 'Finish one admin or work item', 'Routes fail when manifests fail.', 130, 10, MIRA_KADE_ID),
      template('compliance-floor', 'health', 'Safehouse Recovery', 'Meal + rest hygiene block', 'Hungry analysts miss mirror signatures.', 110, 8, MIRA_KADE_ID),
      template('compliance-floor', 'social', 'Coordinate the Analyst Cell', 'Coordinate one shared errand', 'No audit moves alone through Helix’s grid.', 115, 9, MIRA_KADE_ID),
      template('compliance-floor', 'creative', 'Paint the Zenith Crest', 'Create/update something expressive', 'Symbols remind analysts what they protect.', 120, 9, MIRA_KADE_ID),
      template('compliance-floor', 'errand', 'Find Decryption Keys', 'Complete a practical pickup errand', 'The right key at the right cycle saves the floor.', 125, 10, MIRA_KADE_ID),
    ],
    chapterRewards: [
      {
        id: 'chrome-access-card-cosmetic',
        type: 'cosmetic',
        name: 'Chrome Access Card',
        media: { rewardImageKey: 'neuronet.reward.chrome-access-card-cosmetic' },
      },
    ],
  },
  {
    id: 'productivity-purge',
    order: 4,
    title: 'Productivity Purge',
    territoryName: 'Executive Lift',
    media: { sceneImageKey: 'neuronet.chapter.zenith-corporation.04-productivity-purge' },
    mapPosition: { x: 68, y: 24 },
    summary:
      'Zenith locks down Executive Lift for a productivity purge — metrics rewrite memory when exhaustion finds an analyst alone in the chrome corridors.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Mira Kade: Lift lockdown. Keep your nerve. Helix hunts fear in the dark mesh — I’ll be on the relay if you need a reroute.',
    introScene: [
      {
        characterId: EXECUTIVE_HELIX_ID,
        line: 'Grid’s up, analyst. Perfect light to see your operations go unfinished — and your little identity fray at the edges.',
        badge: 'SECTOR IV',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'They hit at night cycle because they think exhaustion breaks staff. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'Last clean route out leaves at midnight. If we slip now, the whole sector goes quiet — and quiet analysts get edited cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Mira Kade: We held Executive Lift in the dark mesh. Helix’s rattled — and so am I, if I’m honest. His Report activates at dawn. One clean day decides whether your identity stays yours. Rest if you can. I’ll ping you at first signal.',
    failureDialogue:
      'Mira Kade: Night cycle took its toll. We stand again at first signal — and I’ll be on the relay with you.',
    questTemplates: [
      template('productivity-purge', 'cleaning', 'Lift Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps mirror panic out.', 140, 11, MIRA_KADE_ID),
      template('productivity-purge', 'fitness', 'Midnight Lift Patrol', 'Evening movement session', 'If your body quits, the reroute breaks.', 145, 12, MIRA_KADE_ID),
      template('productivity-purge', 'study', 'Surveillance Pattern Notes', 'Deep focus study block', 'Helix’s pattern repeats for those who look closely.', 140, 11, MIRA_KADE_ID),
      template('productivity-purge', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite Zenith editors.', 140, 11, MIRA_KADE_ID),
      template('productivity-purge', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky neural hands.', 120, 9, MIRA_KADE_ID),
      template('productivity-purge', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels packet to packet.', 120, 9, MIRA_KADE_ID),
      template('productivity-purge', 'creative', 'Purge Flare Design', 'Creative micro-session', 'In darkness, even small signals matter.', 125, 9, MIRA_KADE_ID),
      template('productivity-purge', 'errand', 'Lift Supply Check', 'Complete a practical checklist errand', 'One missing clearance chip can end the night.', 130, 10, MIRA_KADE_ID),
    ],
    chapterRewards: [
      {
        id: 'compliance-breaker-badge',
        type: 'badge',
        name: 'Compliance Breaker',
        media: { rewardImageKey: 'neuronet.reward.compliance-breaker-badge' },
      },
    ],
  },
  {
    id: 'the-helix-report',
    order: 5,
    title: 'The Helix Report',
    territoryName: 'Helix Boardroom',
    media: { sceneImageKey: 'neuronet.chapter.zenith-corporation.05-the-helix-report' },
    mapPosition: { x: 84, y: 10 },
    summary:
      'Executive Helix’s final report goes live — efficiency is obedience, and this is the price of a free identity inside Zenith Corporation.',
    dramaticPurpose: 'Resolve the saga with identity secured or corporate control.',
    introDialogue:
      'Mira Kade: Helix’s Report opens at dawn. He wants your productivity profile. We run the core route and keep your identity yours — because every metric we survived cost Signal Integrity, and Neon Delivery is already circling the district nodes.',
    introScene: [
      {
        characterId: MIRA_KADE_ID,
        line: 'This is the node that feeds half the compliance grid. Win here and your identity stays yours. Lose, and the Neon Spire trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: EXECUTIVE_HELIX_ID,
        line: 'The Report was always mine, analyst. Zenith Corporation broke your nerve; I bought the rebuild. Efficiency is obedience — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: MIRA_KADE_ID,
        line: 'Last operation of the saga. Move like the grid depends on you — because it does, and because I didn’t sponsor you so Helix could take your mind.',
        badge: 'LAST RUN',
      },
    ],
    successDialogue:
      'Mira Kade: Report rejected. Helix can watch our analysts from his boardroom — but he doesn’t own your memories. Signal Integrity cost us plenty. It was worth every metric. Neon Delivery pinged from the street tier — Razor Jackal is circling the courier nodes. When you’re ready, the route is waiting.',
    failureDialogue:
      'Mira Kade: We lost the boardroom node today. The war for your identity isn’t over — and the report still reflects.',
    questTemplates: [
      template('the-helix-report', 'cleaning', 'Purge the Boardroom Floor', 'Complete full cleaning sweep', 'The grid watches this node at dawn.', 150, 12, MIRA_KADE_ID),
      template('the-helix-report', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Reports catch analysts who slow at the finish.', 155, 12, MIRA_KADE_ID),
      template('the-helix-report', 'study', 'Report Countermeasures', 'Focused study and recap', 'Know the protocol that keeps your memory yours.', 150, 12, MIRA_KADE_ID),
      template('the-helix-report', 'work', 'Final Network Audit', 'Complete one priority work item', 'One clean audit proves the identity is yours.', 155, 12, MIRA_KADE_ID),
      template('the-helix-report', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the grid.', 130, 10, MIRA_KADE_ID),
      template('the-helix-report', 'social', 'Rally the Analyst Network', 'Reach out to your network', 'Collective signal beats a lone mirror.', 135, 11, MIRA_KADE_ID),
      template('the-helix-report', 'creative', 'Identity Seal Design', 'Creative micro-session', 'Art outlasts edits — if you finish it.', 140, 11, MIRA_KADE_ID),
      template('the-helix-report', 'errand', 'Deliver the Protocol Seal', 'Finish critical practical errand', 'The seal reaches the core or Helix wins by default.', 140, 11, MIRA_KADE_ID),
    ],
    chapterRewards: [
      {
        id: 'neon-delivery-story-unlock',
        type: 'storyUnlock',
        name: 'Neon Delivery',
        unlockTargetId: 'neon-delivery',
        media: { rewardImageKey: 'neuronet.reward.neon-delivery-story-unlock' },
      },
    ],
  },
];

export const ZENITH_CORPORATION_CHAPTERS = enrichSagaChapters(ZENITH_CORPORATION_CHAPTERS_RAW, {
  ...NEURONET_VARIATION_PROFILE,
  villainName: 'Executive Helix',
});
