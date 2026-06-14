import {
  DIRECTOR_CAIN_ID,
  LYRA_VOSS_ID,
} from '@/data/narrative/ghost-protocol-characters';
import { SIGNAL_LEAK_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/signal-leak-variations';
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

const GHOST_PROTOCOL_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'signal-leak',
    order: 1,
    title: 'Signal Leak',
    territoryName: 'Relay District',
    media: { sceneImageKey: 'neuronet.chapter.ghost-protocol.01-signal-leak' },
    mapPosition: { x: 14, y: 78 },
    summary:
      'A corrupted packet bleeds through Relay District — proof that memories can be edited and identities are never truly private.',
    dramaticPurpose: 'Introduce the Memory Runner fantasy and Ministry surveillance threat.',
    introDialogue:
      'Lyra Voss: Runner, we’ve got a signal leak at Relay District. Cain’s crawlers are sniffing the packet. Run your operations clean before the Ministry edits what you remember.',
    introScene: [
      {
        characterId: LYRA_VOSS_ID,
        line: 'Relay District just lit up on my scope — corrupted memory packet, Ministry tags everywhere. First drop, no heroics. Just operations. Keep your neural signature clean.',
        badge: 'CHAPTER I',
      },
      {
        characterId: DIRECTOR_CAIN_ID,
        line: 'Pretty little runner. Shame if discipline ran out before the sector stabilized. Memories can be edited, courier — I’m merely pointing at the cracks.',
        badge: 'MINISTRY',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'Ignore his mirror talk. Signal Integrity is fragile out here. Every operation you finish is a firewall between your mind and his editors.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Lyra Voss: Leak contained. You answered Cain’s probe with clean runs and steady Signal Integrity. But look east — Blackline Tunnel flashed at midnight. They weren’t bluffing. The next sector belongs to whoever routes without a trace.',
    failureDialogue:
      'Lyra Voss: Ministry sensors caught hesitation. Memories can be edited when runners stall — re-sync and run before the grid locks your sector.',
    questTemplates: [
      template('signal-leak', 'cleaning', 'Purge Relay Cache', 'Clean kitchen and counters', 'Corrupted packets hide in cluttered nodes.', 110, 8, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.cleaning),
      template('signal-leak', 'fitness', 'Neural Warm-Up Drill', 'Do a quick bodyweight routine', 'A sluggish runner broadcasts location to every crawler.', 120, 10, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.fitness),
      template('signal-leak', 'study', 'Decode the Leak Signature', 'Study session with focused notes', 'Cain writes in patterns. Knowledge is your encryption key.', 125, 9, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.study),
      template('signal-leak', 'work', 'Fortify the Route Ledger', 'Complete one deep work block', 'The blackline decides who gets routed and who gets erased.', 120, 9, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.work),
      template('signal-leak', 'health', 'Recovery at the Safehouse', 'Hydrate, meds, and a short recovery break', 'A fragmented runner is easy to mirror.', 100, 7, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.health),
      template('signal-leak', 'social', 'Ping the Ghost Network', 'Send one meaningful check-in message', 'Fear spreads through open channels unless someone encrypts hope.', 105, 7, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.social),
      template('signal-leak', 'creative', 'Draft a Ghost Manifest', 'Create a short design or writing piece', 'Your words shape the runners who follow your route.', 115, 8, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.creative),
      template('signal-leak', 'errand', 'Midnight Supply Run', 'Complete one pending errand', 'Spoof chips and power cells vanish fast under siege.', 110, 8, LYRA_VOSS_ID, SIGNAL_LEAK_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [
      {
        id: 'signal-carrier-badge',
        type: 'badge',
        name: 'Signal Carrier',
        media: { rewardImageKey: 'neuronet.reward.signal-carrier-badge' },
      },
    ],
  },
  {
    id: 'blackline-drop',
    order: 2,
    title: 'Blackline Drop',
    territoryName: 'Blackline Tunnel',
    media: { sceneImageKey: 'neuronet.chapter.ghost-protocol.02-blackline-drop' },
    mapPosition: { x: 32, y: 58 },
    summary:
      'An illegal memory drop through Blackline Tunnel — Cain’s Ministry watches every packet that moves without a license.',
    dramaticPurpose: 'Escalate urgency and push consistency under surveillance pressure.',
    introDialogue:
      'Lyra Voss: Blackline Tunnel is hot. Ministry drones at both ends. We drop before dawn — together, clean, no mirrors left behind.',
    introScene: [
      {
        characterId: LYRA_VOSS_ID,
        line: 'Blackline Tunnel just went dark on the official grid — perfect for a drop, lethal if you hesitate. Move fast, move together. You’ve kept Signal Integrity so far.',
        badge: 'CHAPTER II',
      },
      {
        characterId: DIRECTOR_CAIN_ID,
        line: 'Did you hear that silence in the tunnel? That’s the sound of identity slipping. I didn’t start the leak — I just stopped pretending the sector was secure.',
        badge: 'MINISTRY',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'No panic. We route on my clock, not his. Network Standing rises when runners don’t flinch at blackline pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Lyra Voss: Drop confirmed. You held the blackline when it counted — I won’t forget that traceless run. But Cain’s editors were seen in Memory Shard Plaza. They mirrored a courier once; they’ll try again.',
    failureDialogue:
      'Lyra Voss: We lost ground in the tunnel. Reclaim your route before night cycle — the Ghost Runners are watching.',
    questTemplates: [
      template('blackline-drop', 'cleaning', 'Scrub the Drop Node', 'Deep clean one neglected area', 'Static in the air, panic in the packet queue.', 120, 9, LYRA_VOSS_ID),
      template('blackline-drop', 'fitness', 'Outrun the Crawlers', 'Cardio sprint or brisk walk session', 'Ministry drones flee fast; your legs decide the chase.', 130, 10, LYRA_VOSS_ID),
      template('blackline-drop', 'study', 'Map the Tunnel Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, LYRA_VOSS_ID),
      template('blackline-drop', 'work', 'Blackline Dispatch', 'Complete one important work item', 'Delay is a ping Cain reads like a confession.', 125, 10, LYRA_VOSS_ID),
      template('blackline-drop', 'health', 'Tunnel Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear routing decisions.', 105, 8, LYRA_VOSS_ID),
      template('blackline-drop', 'social', 'Warn the District Couriers', 'Reach out to someone who needs support', 'Encrypted warnings save identities before mirrors land.', 110, 8, LYRA_VOSS_ID),
      template('blackline-drop', 'creative', 'Blackline Anthem', 'Create a short audio/text/art piece', 'Hope encrypts better than fear.', 115, 8, LYRA_VOSS_ID),
      template('blackline-drop', 'errand', 'Tunnel Pickup', 'Finish one practical chore outside', 'Memory shards arrive under active scan.', 120, 9, LYRA_VOSS_ID),
    ],
    chapterRewards: [
      {
        id: 'blackline-runner-title',
        type: 'title',
        name: 'Blackline Runner',
        media: { rewardImageKey: 'neuronet.reward.blackline-runner-title' },
      },
    ],
  },
  {
    id: 'memory-shard',
    order: 3,
    title: 'Memory Shard',
    territoryName: 'Shard Plaza',
    media: { sceneImageKey: 'neuronet.chapter.ghost-protocol.03-memory-shard' },
    mapPosition: { x: 50, y: 40 },
    summary:
      'A dangerous memory shard surfaces in Shard Plaza — memories can be edited when corporate control finds an open mind.',
    dramaticPurpose: 'Shift from reaction to strategic identity defense.',
    introDialogue:
      'Lyra Voss: They planted a mirror-shard in the plaza. We extract while Cain watches — and we don’t blink when he edits the feed.',
    introScene: [
      {
        characterId: LYRA_VOSS_ID,
        line: 'Shard Plaza is crawling with Ministry editors. This isn’t random — they’re testing who breaks first. I trust you to hold the extraction route.',
        badge: 'CHAPTER III',
      },
      {
        characterId: DIRECTOR_CAIN_ID,
        line: 'Extract all you want. Every delay teaches the Neon Spire who really keeps the memories wound. I’m not cruel — I’m honest.',
        badge: 'MINISTRY',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'Shard’s unstable, grid’s noisy. I can keep your spoof alive if you keep your operations moving.',
        badge: 'EXTRACTION',
      },
    ],
    successDialogue:
      'Lyra Voss: Shard secured. They expected panic, found a runner who leaves no mirror. But listen: Ghost Sector went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Lyra Voss: Extraction stalled means Signal Integrity stalled. Fix this fast — I’ll cover your spoof if you cover the plaza.',
    questTemplates: [
      template('memory-shard', 'cleaning', 'Clear the Plaza Node', 'Declutter one messy zone', 'Debris hides shard fragments and bad routing luck.', 130, 10, LYRA_VOSS_ID),
      template('memory-shard', 'fitness', 'Shard Strength Drill', 'Strength routine', 'You extract with muscle and neural grit.', 140, 11, LYRA_VOSS_ID),
      template('memory-shard', 'study', 'Blueprint the Extraction', 'Study or planning session', 'A steady mind reads shard patterns true.', 135, 10, LYRA_VOSS_ID),
      template('memory-shard', 'work', 'Courier Route Papers', 'Finish one admin or work item', 'Routes fail when manifests fail.', 130, 10, LYRA_VOSS_ID),
      template('memory-shard', 'health', 'Safehouse Recovery', 'Meal + rest hygiene block', 'Hungry runners miss mirror signatures.', 110, 8, LYRA_VOSS_ID),
      template('memory-shard', 'social', 'Coordinate the Ghost Cell', 'Coordinate one shared errand', 'No shard moves alone through Cain’s grid.', 115, 9, LYRA_VOSS_ID),
      template('memory-shard', 'creative', 'Paint the Ghost Crest', 'Create/update something expressive', 'Symbols remind runners what they protect.', 120, 9, LYRA_VOSS_ID),
      template('memory-shard', 'errand', 'Find Decryption Keys', 'Complete a practical pickup errand', 'The right key at the right cycle saves the shard.', 125, 10, LYRA_VOSS_ID),
    ],
    chapterRewards: [
      {
        id: 'ghost-patch-cosmetic',
        type: 'cosmetic',
        name: 'Ghost Patch',
        media: { rewardImageKey: 'neuronet.reward.ghost-patch-cosmetic' },
      },
    ],
  },
  {
    id: 'ghost-sector',
    order: 4,
    title: 'Ghost Sector',
    territoryName: 'Ghost Sector',
    media: { sceneImageKey: 'neuronet.chapter.ghost-protocol.04-ghost-sector' },
    mapPosition: { x: 68, y: 28 },
    summary:
      'The Ministry locks down Ghost Sector — memories can be edited when exhaustion finds a runner alone in the dark grid.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Lyra Voss: Sector lockdown. Keep your nerve. Cain hunts fear in the dark mesh — I’ll be on the relay if you need a spoof.',
    introScene: [
      {
        characterId: DIRECTOR_CAIN_ID,
        line: 'Grid’s up, runner. Perfect light to see your operations go unfinished — and your little identity fray at the edges.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'They hit at night cycle because they think exhaustion breaks couriers. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'Last clean route out leaves at midnight. If we slip now, the whole sector goes quiet — and quiet runners get edited cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Lyra Voss: We held Ghost Sector in the dark mesh. Cain’s rattled — and so am I, if I’m honest. His Mirror activates at dawn. One clean day decides whether your identity stays yours. Rest if you can. I’ll ping you at first signal.',
    failureDialogue:
      'Lyra Voss: Night cycle took its toll. We stand again at first signal — and I’ll be on the relay with you.',
    questTemplates: [
      template('ghost-sector', 'cleaning', 'Sector Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps mirror panic out.', 140, 11, LYRA_VOSS_ID),
      template('ghost-sector', 'fitness', 'Midnight Sector Patrol', 'Evening movement session', 'If your body quits, the spoof breaks.', 145, 12, LYRA_VOSS_ID),
      template('ghost-sector', 'study', 'Surveillance Pattern Notes', 'Deep focus study block', 'Cain’s pattern repeats for those who look closely.', 140, 11, LYRA_VOSS_ID),
      template('ghost-sector', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite Ministry editors.', 140, 11, LYRA_VOSS_ID),
      template('ghost-sector', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky neural hands.', 120, 9, LYRA_VOSS_ID),
      template('ghost-sector', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels packet to packet.', 120, 9, LYRA_VOSS_ID),
      template('ghost-sector', 'creative', 'Ghost Flare Design', 'Creative micro-session', 'In darkness, even small signals matter.', 125, 9, LYRA_VOSS_ID),
      template('ghost-sector', 'errand', 'Sector Supply Check', 'Complete a practical checklist errand', 'One missing spoof chip can end the night.', 130, 10, LYRA_VOSS_ID),
    ],
    chapterRewards: [
      {
        id: 'sector-phantom-badge',
        type: 'badge',
        name: 'Sector Phantom',
        media: { rewardImageKey: 'neuronet.reward.sector-phantom-badge' },
      },
    ],
  },
  {
    id: 'cains-mirror',
    order: 5,
    title: "Cain's Mirror",
    territoryName: 'Ministry Core',
    media: { sceneImageKey: 'neuronet.chapter.ghost-protocol.05-cains-mirror' },
    mapPosition: { x: 82, y: 14 },
    summary:
      'Director Cain’s neural mirror goes live — memories can be edited, and this is the price of a free identity in the Neon Spire.',
    dramaticPurpose: 'Resolve the saga with identity secured or Ministry control.',
    introDialogue:
      'Lyra Voss: Cain’s Mirror opens at dawn. He wants your memory profile. We run the blackline and keep your identity yours — because every shard we smuggled cost Signal Integrity, and Zenith is already circling.',
    introScene: [
      {
        characterId: LYRA_VOSS_ID,
        line: 'This is the node that feeds half the surveillance grid. Win here and your identity stays yours. Lose, and the Neon Spire trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: DIRECTOR_CAIN_ID,
        line: 'The Mirror was always mine, runner. Ghost Protocol broke your nerve; I bought the rebuild. Memories can be edited — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: LYRA_VOSS_ID,
        line: 'Last operation of the saga. Move like the grid depends on you — because it does, and because I didn’t trust you with Ghost Protocol so Cain could take your mind.',
        badge: 'LAST RUN',
      },
    ],
    successDialogue:
      'Lyra Voss: Mirror shattered. Cain can watch our runners from his Ministry tower — but he doesn’t own your memories. Signal Integrity cost us plenty. It was worth every packet. Zenith Corporation pinged from the corporate tier — Executive Helix is circling the infrastructure nodes. When you’re ready, the climb is waiting.',
    failureDialogue:
      'Lyra Voss: We lost the core node today. The war for your identity isn’t over — and the mirror still reflects.',
    questTemplates: [
      template('cains-mirror', 'cleaning', 'Purge the Core Floor', 'Complete full cleaning sweep', 'The grid watches this node at dawn.', 150, 12, LYRA_VOSS_ID),
      template('cains-mirror', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Mirrors catch runners who slow at the finish.', 155, 12, LYRA_VOSS_ID),
      template('cains-mirror', 'study', 'Mirror Countermeasures', 'Focused study and recap', 'Know the protocol that keeps your memory yours.', 150, 12, LYRA_VOSS_ID),
      template('cains-mirror', 'work', 'Final Network Audit', 'Complete one priority work item', 'One clean audit proves the identity is yours.', 155, 12, LYRA_VOSS_ID),
      template('cains-mirror', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the grid.', 130, 10, LYRA_VOSS_ID),
      template('cains-mirror', 'social', 'Rally the Ghost Runners', 'Reach out to your network', 'Collective signal beats a lone mirror.', 135, 11, LYRA_VOSS_ID),
      template('cains-mirror', 'creative', 'Identity Seal Design', 'Creative micro-session', 'Art outlasts edits — if you finish it.', 140, 11, LYRA_VOSS_ID),
      template('cains-mirror', 'errand', 'Deliver the Protocol Seal', 'Finish critical practical errand', 'The seal reaches the core or Cain wins by default.', 140, 11, LYRA_VOSS_ID),
    ],
    chapterRewards: [
      {
        id: 'zenith-corporation-story-unlock',
        type: 'storyUnlock',
        name: 'Zenith Corporation',
        unlockTargetId: 'zenith-corporation',
        media: { rewardImageKey: 'neuronet.reward.zenith-corporation-story-unlock' },
      },
    ],
  },
];

export const GHOST_PROTOCOL_CHAPTERS = enrichSagaChapters(GHOST_PROTOCOL_CHAPTERS_RAW, {
  ...NEURONET_VARIATION_PROFILE,
  villainName: 'Director Cain',
});
