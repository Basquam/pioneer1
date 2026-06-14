import {
  JUNO_VALE_ID,
  RAZOR_JACKAL_ID,
} from '@/data/narrative/neon-delivery-characters';
import { FIRST_ROUTE_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/first-route-variations';
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

const NEON_DELIVERY_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'first-route',
    order: 1,
    title: 'First Route',
    territoryName: 'Dispatch Alley',
    media: { sceneImageKey: 'neuronet.chapter.neon-delivery.01-first-route' },
    mapPosition: { x: 16, y: 70 },
    summary:
      'Your first manifest clears at Dispatch Alley — proof that everyone is carrying something before you’ve even clipped the package seal.',
    dramaticPurpose: 'Introduce the Courier Rider fantasy and Jackal’s hijack threat.',
    introDialogue:
      'Juno Vale: Rider, we’ve got a first route through Dispatch Alley. Jackal’s crawlers are sniffing the manifest. Run your operations clean before the syndicate learns what you’re carrying.',
    introScene: [
      {
        characterId: JUNO_VALE_ID,
        line: 'Dispatch Alley just lit up on my board — fresh manifest, syndicate tags everywhere. First sector, no heroics. Just operations. Keep your neural signature off Jackal’s watchlist.',
        badge: 'SECTOR I',
      },
      {
        characterId: RAZOR_JACKAL_ID,
        line: 'Pretty little rider. Shame if discipline ran out before the sector stabilized. Everyone is carrying something, courier — I’m merely pointing at the cracks in your first drop.',
        badge: 'SYNDICATE',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'Ignore his street talk. Signal Integrity is fragile out here. Every operation you finish is a firewall between your cargo and his hijackers.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Juno Vale: First route cleared. You answered Jackal’s probe with clean runs and steady Signal Integrity. But look east — Rainline Overpass flashed at midnight. They weren’t bluffing. The next sector belongs to whoever routes without a trace.',
    failureDialogue:
      'Juno Vale: Syndicate sensors caught hesitation. Secrets spill when riders stall — re-sync and run before the grid locks your sector.',
    questTemplates: [
      template('first-route', 'cleaning', 'Purge Dispatch Cache', 'Clean kitchen and counters', 'Cluttered nodes broadcast sloppy habits to every crawler.', 110, 8, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.cleaning),
      template('first-route', 'fitness', 'Neural Warm-Up Drill', 'Do a quick bodyweight routine', 'A sluggish rider broadcasts location to every hijacker.', 120, 10, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.fitness),
      template('first-route', 'study', 'Decode the Route Signature', 'Study session with focused notes', 'Jackal writes in patterns. Knowledge is your encryption key.', 125, 9, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.study),
      template('first-route', 'work', 'Fortify the Manifest Ledger', 'Complete one deep work block', 'The rainline decides who gets routed and who gets robbed.', 120, 9, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.work),
      template('first-route', 'health', 'Recovery at the Safehouse', 'Hydrate, meds, and a short recovery break', 'A fragmented rider is easy to hijack.', 100, 7, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.health),
      template('first-route', 'social', 'Ping the Courier Network', 'Send one meaningful check-in message', 'Fear spreads through open channels unless someone encrypts hope.', 105, 7, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.social),
      template('first-route', 'creative', 'Draft a Route Manifest', 'Create a short design or writing piece', 'Your words shape the riders who follow your trail.', 115, 8, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.creative),
      template('first-route', 'errand', 'Midnight Supply Run', 'Complete one pending errand', 'Spoof chips and rain seals vanish fast under siege.', 110, 8, JUNO_VALE_ID, FIRST_ROUTE_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [
      {
        id: 'first-route-cleared-badge',
        type: 'badge',
        name: 'First Route Cleared',
        media: { rewardImageKey: 'neuronet.reward.first-route-cleared-badge' },
      },
    ],
  },
  {
    id: 'rainline-package',
    order: 2,
    title: 'Rainline Package',
    territoryName: 'Rainline Overpass',
    media: { sceneImageKey: 'neuronet.chapter.neon-delivery.02-rainline-package' },
    mapPosition: { x: 30, y: 52 },
    summary:
      'A high-risk package crosses Rainline Overpass — Jackal’s gang watches every drop that moves without a sealed manifest.',
    dramaticPurpose: 'Escalate urgency and push consistency under street surveillance pressure.',
    introDialogue:
      'Juno Vale: Rainline Overpass is hot. Syndicate drones at both ends. We drop before dawn — together, clean, no secrets left on the asphalt.',
    introScene: [
      {
        characterId: JUNO_VALE_ID,
        line: 'Rainline Overpass just went dark on the official grid — perfect for a drop, lethal if you hesitate. Move fast, move together. You’ve kept Signal Integrity so far.',
        badge: 'SECTOR II',
      },
      {
        characterId: RAZOR_JACKAL_ID,
        line: 'Did you hear that silence on the overpass? That’s the sound of a secret slipping. I didn’t start the hijack — I just stopped pretending the sector was secure.',
        badge: 'SYNDICATE',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'No panic. We route on my clock, not his. Network Standing rises when riders don’t flinch at rainline pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Juno Vale: Package confirmed. You held the rainline when it counted — I won’t forget that traceless run. But Jackal’s crew was seen at Gridlock Junction. They hijacked a courier once; they’ll try again.',
    failureDialogue:
      'Juno Vale: We lost ground on the overpass. Reclaim your route before night cycle — the district couriers are watching.',
    questTemplates: [
      template('rainline-package', 'cleaning', 'Scrub the Drop Node', 'Deep clean one neglected area', 'Static in the rain, panic in the manifest queue.', 120, 9, JUNO_VALE_ID),
      template('rainline-package', 'fitness', 'Outrun the Hijackers', 'Cardio sprint or brisk walk session', 'Syndicate drones flee fast; your legs decide the chase.', 130, 10, JUNO_VALE_ID),
      template('rainline-package', 'study', 'Map the Overpass Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, JUNO_VALE_ID),
      template('rainline-package', 'work', 'Rainline Dispatch', 'Complete one important work item', 'Delay is a ping Jackal reads like a confession.', 125, 10, JUNO_VALE_ID),
      template('rainline-package', 'health', 'Overpass Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear routing decisions.', 105, 8, JUNO_VALE_ID),
      template('rainline-package', 'social', 'Warn the District Couriers', 'Reach out to someone who needs support', 'Encrypted warnings save secrets before hijacks land.', 110, 8, JUNO_VALE_ID),
      template('rainline-package', 'creative', 'Rainline Anthem', 'Create a short audio/text/art piece', 'Hope encrypts better than fear.', 115, 8, JUNO_VALE_ID),
      template('rainline-package', 'errand', 'Overpass Pickup', 'Finish one practical chore outside', 'Memory shards arrive under active scan.', 120, 9, JUNO_VALE_ID),
    ],
    chapterRewards: [
      {
        id: 'rainline-courier-title',
        type: 'title',
        name: 'Rainline Courier',
        media: { rewardImageKey: 'neuronet.reward.rainline-courier-title' },
      },
    ],
  },
  {
    id: 'stolen-coordinates',
    order: 3,
    title: 'Stolen Coordinates',
    territoryName: 'Gridlock Junction',
    media: { sceneImageKey: 'neuronet.chapter.neon-delivery.03-stolen-coordinates' },
    mapPosition: { x: 48, y: 36 },
    summary:
      'Stolen coordinates surface at Gridlock Junction — everyone is carrying something when syndicate control finds an open route.',
    dramaticPurpose: 'Shift from reaction to strategic route defense across the neon grid.',
    introDialogue:
      'Juno Vale: They planted a mirror-manifest at the junction. We extract while Jackal watches — and we don’t blink when he edits the feed.',
    introScene: [
      {
        characterId: JUNO_VALE_ID,
        line: 'Gridlock Junction is crawling with syndicate hijackers. This isn’t random — they’re testing who breaks first. I trust you to hold the extraction route.',
        badge: 'SECTOR III',
      },
      {
        characterId: RAZOR_JACKAL_ID,
        line: 'Extract all you want. Every delay teaches the Neon Spire who really keeps the routes wound. I’m not cruel — I’m honest. Everyone is carrying something.',
        badge: 'SYNDICATE',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'Coordinates are unstable, grid’s noisy. I can keep your spoof alive if you keep your operations moving.',
        badge: 'EXTRACTION',
      },
    ],
    successDialogue:
      'Juno Vale: Junction secured. They expected panic, found a rider who leaves no mirror. But listen: Syndicate Cut went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Juno Vale: Extraction stalled means Signal Integrity stalled. Fix this fast — I’ll cover your spoof if you cover the junction.',
    questTemplates: [
      template('stolen-coordinates', 'cleaning', 'Clear the Junction Node', 'Declutter one messy zone', 'Debris hides coordinate fragments and bad routing luck.', 130, 10, JUNO_VALE_ID),
      template('stolen-coordinates', 'fitness', 'Junction Strength Drill', 'Strength routine', 'You extract with muscle and neural grit.', 140, 11, JUNO_VALE_ID),
      template('stolen-coordinates', 'study', 'Blueprint the Extraction', 'Study or planning session', 'A steady mind reads coordinate patterns true.', 135, 10, JUNO_VALE_ID),
      template('stolen-coordinates', 'work', 'Courier Route Papers', 'Finish one admin or work item', 'Routes fail when manifests fail.', 130, 10, JUNO_VALE_ID),
      template('stolen-coordinates', 'health', 'Safehouse Recovery', 'Meal + rest hygiene block', 'Hungry riders miss hijack signatures.', 110, 8, JUNO_VALE_ID),
      template('stolen-coordinates', 'social', 'Coordinate the Courier Cell', 'Coordinate one shared errand', 'No package moves alone through Jackal’s grid.', 115, 9, JUNO_VALE_ID),
      template('stolen-coordinates', 'creative', 'Paint the Neon Crest', 'Create/update something expressive', 'Symbols remind riders what they protect.', 120, 9, JUNO_VALE_ID),
      template('stolen-coordinates', 'errand', 'Find Decryption Keys', 'Complete a practical pickup errand', 'The right key at the right cycle saves the coordinates.', 125, 10, JUNO_VALE_ID),
    ],
    chapterRewards: [
      {
        id: 'neon-rider-patch-cosmetic',
        type: 'cosmetic',
        name: 'Neon Rider Patch',
        media: { rewardImageKey: 'neuronet.reward.neon-rider-patch-cosmetic' },
      },
    ],
  },
  {
    id: 'jackal-run',
    order: 4,
    title: 'Jackal Run',
    territoryName: 'Syndicate Cut',
    media: { sceneImageKey: 'neuronet.chapter.neon-delivery.04-jackal-run' },
    mapPosition: { x: 66, y: 22 },
    summary:
      'Jackal’s crew locks down Syndicate Cut — everyone is carrying something when exhaustion finds a rider alone in the neon rain.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Juno Vale: Cut lockdown. Keep your nerve. Jackal hunts fear in the dark mesh — I’ll be on the relay if you need a spoof.',
    introScene: [
      {
        characterId: RAZOR_JACKAL_ID,
        line: 'Grid’s up, rider. Perfect light to see your operations go unfinished — and your little route fray at the edges.',
        badge: 'SECTOR IV',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'They hit at night cycle because they think exhaustion breaks couriers. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'Last clean route out leaves at midnight. If we slip now, the whole sector goes quiet — and quiet riders get hijacked cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Juno Vale: We held Syndicate Cut in the dark mesh. Jackal’s rattled — and so am I, if I’m honest. His final ambush activates at dawn. One clean day decides whether your cargo stays yours. Rest if you can. I’ll ping you at first signal.',
    failureDialogue:
      'Juno Vale: Night cycle took its toll. We stand again at first signal — and I’ll be on the relay with you.',
    questTemplates: [
      template('jackal-run', 'cleaning', 'Cut Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps hijack panic out.', 140, 11, JUNO_VALE_ID),
      template('jackal-run', 'fitness', 'Midnight Cut Patrol', 'Evening movement session', 'If your body quits, the spoof breaks.', 145, 12, JUNO_VALE_ID),
      template('jackal-run', 'study', 'Surveillance Pattern Notes', 'Deep focus study block', 'Jackal’s pattern repeats for those who look closely.', 140, 11, JUNO_VALE_ID),
      template('jackal-run', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite syndicate hijackers.', 140, 11, JUNO_VALE_ID),
      template('jackal-run', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky neural hands.', 120, 9, JUNO_VALE_ID),
      template('jackal-run', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels packet to packet.', 120, 9, JUNO_VALE_ID),
      template('jackal-run', 'creative', 'Neon Flare Design', 'Creative micro-session', 'In darkness, even small signals matter.', 125, 9, JUNO_VALE_ID),
      template('jackal-run', 'errand', 'Cut Supply Check', 'Complete a practical checklist errand', 'One missing spoof chip can end the night.', 130, 10, JUNO_VALE_ID),
    ],
    chapterRewards: [
      {
        id: 'jackal-survivor-badge',
        type: 'badge',
        name: 'Jackal Survivor',
        media: { rewardImageKey: 'neuronet.reward.jackal-survivor-badge' },
      },
    ],
  },
  {
    id: 'final-delivery',
    order: 5,
    title: 'Final Delivery',
    territoryName: 'Spire Drop Point',
    media: { sceneImageKey: 'neuronet.chapter.neon-delivery.05-final-delivery' },
    mapPosition: { x: 86, y: 8 },
    summary:
      'Razor Jackal’s final ambush goes live at Spire Drop Point — everyone is carrying something, and this is the price of a free route through the Neon Spire.',
    dramaticPurpose: 'Resolve the saga with cargo secured or syndicate control.',
    introDialogue:
      'Juno Vale: Jackal’s ambush opens at dawn. He wants your manifest profile. We run the rainline and keep your secrets yours — because every package we survived cost Signal Integrity, and the Spire never stops watching.',
    introScene: [
      {
        characterId: JUNO_VALE_ID,
        line: 'This is the node that feeds half the courier grid. Win here and your route stays yours. Lose, and the Neon Spire trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: RAZOR_JACKAL_ID,
        line: 'The ambush was always mine, rider. Neon Delivery broke your nerve; I bought the rebuild. Everyone is carrying something — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: JUNO_VALE_ID,
        line: 'Last operation of the saga. Move like the grid depends on you — because it does, and because I didn’t trust you with this route so Jackal could take what you’re carrying.',
        badge: 'LAST RUN',
      },
    ],
    successDialogue:
      'Juno Vale: Final delivery confirmed. Jackal can watch our riders from his syndicate cut — but he doesn’t own your secrets. Signal Integrity cost us plenty. It was worth every package. The Neon Spire grid holds — for now. You earned the title they’ll whisper on every rainline.',
    failureDialogue:
      'Juno Vale: We lost the drop point today. The war for your route isn’t over — and the manifest still reflects.',
    questTemplates: [
      template('final-delivery', 'cleaning', 'Purge the Drop Floor', 'Complete full cleaning sweep', 'The grid watches this node at dawn.', 150, 12, JUNO_VALE_ID),
      template('final-delivery', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Ambushes catch riders who slow at the finish.', 155, 12, JUNO_VALE_ID),
      template('final-delivery', 'study', 'Route Countermeasures', 'Focused study and recap', 'Know the protocol that keeps your cargo yours.', 150, 12, JUNO_VALE_ID),
      template('final-delivery', 'work', 'Final Manifest Audit', 'Complete one priority work item', 'One clean audit proves the route is yours.', 155, 12, JUNO_VALE_ID),
      template('final-delivery', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the grid.', 130, 10, JUNO_VALE_ID),
      template('final-delivery', 'social', 'Rally the Courier Network', 'Reach out to your network', 'Collective signal beats a lone hijack.', 135, 11, JUNO_VALE_ID),
      template('final-delivery', 'creative', 'Identity Seal Design', 'Creative micro-session', 'Art outlasts edits — if you finish it.', 140, 11, JUNO_VALE_ID),
      template('final-delivery', 'errand', 'Deliver the Final Package', 'Finish critical practical errand', 'The seal reaches the drop point or Jackal wins by default.', 140, 11, JUNO_VALE_ID),
    ],
    chapterRewards: [
      {
        id: 'final-runner-title',
        type: 'title',
        name: 'Final Runner',
        media: { rewardImageKey: 'neuronet.reward.final-runner-title' },
      },
    ],
  },
];

export const NEON_DELIVERY_CHAPTERS = enrichSagaChapters(NEON_DELIVERY_CHAPTERS_RAW, {
  ...NEURONET_VARIATION_PROFILE,
  villainName: 'Razor Jackal',
});
