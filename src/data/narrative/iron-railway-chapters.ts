import { BRIGGS_ID } from '@/data/narrative/vulture-gang-characters';
import { SILAS_VANE_ID } from '@/data/narrative/iron-railway-characters';
import { FIRST_SHIPMENT_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/first-shipment-variations';
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

const IRON_RAILWAY_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'first-shipment',
    order: 1,
    title: 'First Shipment',
    territoryName: 'Railyard Gate',
    media: { sceneImageKey: 'dust-and-iron.chapter.iron-railway.01-railyard-gate' },
    mapPosition: { x: 14, y: 80 },
    summary:
      'Your first freight run after High Noon — progress always costs something, and Vane already sent the invoice.',
    dramaticPurpose: 'Establish the logistics fantasy and corporate threat.',
    introDialogue:
      'Station Master Briggs: You rode High Noon and kept Dustfall breathing. Now the bill arrives — first shipment’s on the platform, and Vane’s already counting our failures.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Junior manager — Mercer vouched for you, and High Noon bought us time. Manifest’s live, crew’s waiting. Progress always costs something — pay in sweat before Vane collects in deeds.',
        badge: 'CHAPTER I',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'How charming. A debut shipment from the hero of High Noon. Do try not to embarrass the frontier — my shareholders hate wasted theater.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Ignore the silk hat. Keep the platform clear and the cars coupled. The town eats because we move on time.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Station Master Briggs: First shipment cleared. The line stays ours — for now. But Vane filed a hold on Cargo Six overnight. He doesn’t want us fast — he wants us tired.',
    failureDialogue:
      'Station Master Briggs: Vane’s men are smiling. Fix the backlog before the next bell — hunger downline doesn’t negotiate.',
    questTemplates: [
      template('first-shipment', 'cleaning', 'Sweep the Loading Dock', 'Clean kitchen and counters', 'Spilled grain hides sabotage under the planks.', 115, 8, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.cleaning),
      template('first-shipment', 'fitness', 'Platform Strength Drill', 'Do a quick bodyweight routine', 'A sluggish crew drops cargo before the bell.', 120, 10, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.fitness),
      template('first-shipment', 'work', 'Sign the Manifest', 'Complete one deep work block', 'One unsigned page stops a whole train.', 120, 9, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.work),
      template('first-shipment', 'study', 'Read the Route Ledger', 'Study session with focused notes', 'Vane’s fees hide in the footnotes.', 125, 9, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.study),
      template('first-shipment', 'health', 'Platform Break', 'Hydrate, meds, and a short recovery break', 'Exhausted crews drop cargo.', 100, 7, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.health),
      template('first-shipment', 'social', 'Brief the Yard Crew', 'Send one meaningful check-in message', 'Fear spreads when nobody confirms the run.', 105, 7, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.social),
      template('first-shipment', 'creative', 'Sketch the Route Map', 'Create a short design or writing piece', 'Your map keeps the next crew from guessing.', 115, 8, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.creative),
      template('first-shipment', 'errand', 'Fetch the Seal Stamp', 'Complete one pending errand', 'No stamp, no shipment — simple as steel.', 110, 8, BRIGGS_ID, FIRST_SHIPMENT_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [{ id: 'first-shipment-badge', type: 'badge', name: 'First Shipment Cleared', media: { rewardImageKey: 'dust-and-iron.reward.iron-railway.railyard-access-pass' } }],
  },
  {
    id: 'delayed-cargo',
    order: 2,
    title: 'Delayed Cargo',
    territoryName: 'Cargo Hold Six',
    media: { sceneImageKey: 'dust-and-iron.chapter.iron-railway.02-cargo-hold-six' },
    mapPosition: { x: 32, y: 62 },
    summary:
      'Vane slows the line with red tape — proof that progress always costs something when power owns the clock.',
    dramaticPurpose: 'Raise stakes with deliberate corporate delay.',
    introDialogue:
      'Station Master Briggs: Cargo’s sitting in Hold Six. Vane filed three inspections overnight. We move anyway — towns don’t eat paperwork.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Hold Six is backed up — medicine, timber, grain. Vane wants us to choke on regulations while Dustfall counts the hours.',
        badge: 'CHAPTER II',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'Safety regulations, manager. Wouldn’t want an *accident* on your precious line. Progress always costs something — I merely itemize the price.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Cut the delay where you can. Real towns don’t eat inspections — they eat what we ship.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Station Master Briggs: Cargo rolling again. Vane lost this round on the clock. But listen — three rail ties split clean through at the pass. That’s not weather. That’s invoice by vandalism.',
    failureDialogue:
      'Station Master Briggs: Hold Six is still locked. People downline are going hungry — and Vane’s lawyers are already drafting the blame.',
    questTemplates: [
      template('delayed-cargo', 'cleaning', 'Clear Hold Six', 'Deep clean one neglected area', 'Clutter slows every handoff between cars.', 120, 9, BRIGGS_ID),
      template('delayed-cargo', 'fitness', 'Outrun the Inspection Clock', 'Cardio sprint or brisk walk session', 'Delays win when crews move slow.', 130, 10, BRIGGS_ID),
      template('delayed-cargo', 'work', 'Override the Delay Order', 'Complete one important work item', 'One cleared form unlocks a dozen crates.', 125, 10, BRIGGS_ID),
      template('delayed-cargo', 'study', 'Decode Inspection Codes', 'Focused study block', 'Their codes repeat — learn the pattern, beat the stall.', 130, 10, BRIGGS_ID),
      template('delayed-cargo', 'health', 'Night Shift Recovery', 'Breathing routine and water reset', 'Tired crews sign bad manifests.', 105, 8, BRIGGS_ID),
      template('delayed-cargo', 'social', 'Warn Downline Stations', 'Reach out to someone who needs support', 'A telegram of hope beats Vane’s stall tactics.', 110, 8, BRIGGS_ID),
      template('delayed-cargo', 'creative', 'Hold Six Manifest Anthem', 'Create a short audio/text/art piece', 'Morale moves cargo when lawyers stall.', 115, 8, BRIGGS_ID),
      template('delayed-cargo', 'errand', 'Run the Release Slip', 'Finish one practical chore outside', 'The slip is in town. The train is here. Close the gap.', 115, 8, BRIGGS_ID),
    ],
    chapterRewards: [{ id: 'delayed-cargo-title', type: 'title', name: 'Cargo Clerk', media: { rewardImageKey: 'dust-and-iron.reward.iron-railway.cargo-ledger-seal' } }],
  },
  {
    id: 'broken-tracks',
    order: 3,
    title: 'Broken Tracks',
    territoryName: 'Broken Tracks Pass',
    media: { sceneImageKey: 'dust-and-iron.chapter.iron-railway.03-broken-tracks-pass' },
    mapPosition: { x: 50, y: 44 },
    summary:
      'Sabotage on the main line — progress always costs something when steel snaps and towns go silent.',
    dramaticPurpose: 'Shift from paperwork to physical infrastructure crisis.',
    introDialogue:
      'Station Master Briggs: Rails are cracked at the pass. Vane denies sabotage. We repair and run — because closed tracks starve every town on the map.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Three rail ties split clean through. That’s not weather — that’s Vane teaching us the price of independence.',
        badge: 'CHAPTER III',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'Maintenance costs money, manager. Perhaps you should lease from someone competent — progress always costs something, and you’re over budget.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Get crews what they need. A closed pass strangles every settlement that trusted us after High Noon.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Station Master Briggs: Tracks hold. First engine through the pass blew its whistle for us. But Vane slashed rates at the junction — freight war’s coming, and he fights with contracts, not wrenches.',
    failureDialogue:
      'Station Master Briggs: The pass is still closed. Downline stations are rationing — and Vane’s men are handing out leases.',
    questTemplates: [
      template('broken-tracks', 'cleaning', 'Clear the Ballast Pit', 'Declutter one messy zone', 'Loose stone hides snapped spikes.', 130, 10, BRIGGS_ID),
      template('broken-tracks', 'fitness', 'Track Repair Drill', 'Strength routine', 'Steel bends for crews that show up strong.', 140, 11, BRIGGS_ID),
      template('broken-tracks', 'work', 'Repair Schedule Dispatch', 'Finish one admin or work item', 'Crews move on orders, not hope.', 130, 10, BRIGGS_ID),
      template('broken-tracks', 'study', 'Survey the Damage Map', 'Study or planning session', 'Measure twice, repair once, run forever.', 135, 10, BRIGGS_ID),
      template('broken-tracks', 'health', 'Crew Meal Rotation', 'Meal + rest hygiene block', 'Hungry track hands miss a cracked tie.', 110, 8, BRIGGS_ID),
      template('broken-tracks', 'social', 'Coordinate the Repair Crew', 'Coordinate one shared errand', 'No tie gets replaced alone on this pass.', 115, 9, BRIGGS_ID),
      template('broken-tracks', 'creative', 'Paint the Line Crest', 'Create/update something expressive', 'Symbols remind crews what the pass protects.', 120, 9, BRIGGS_ID),
      template('broken-tracks', 'errand', 'Fetch Rail Spikes', 'Complete a practical pickup errand', 'The forge is ten miles. The train is today.', 120, 9, BRIGGS_ID),
    ],
    chapterRewards: [{ id: 'broken-tracks-cosmetic', type: 'cosmetic', name: 'Brass Switch Key', media: { rewardImageKey: 'dust-and-iron.reward.iron-railway.track-repair-kit' } }],
  },
  {
    id: 'freight-war',
    order: 4,
    title: 'Freight War',
    territoryName: 'Freight War Junction',
    media: { sceneImageKey: 'dust-and-iron.chapter.iron-railway.04-freight-war-junction' },
    mapPosition: { x: 68, y: 26 },
    summary:
      'Open economic warfare on the network — progress always costs something when rivals undercut your lifeline.',
    dramaticPurpose: 'Escalate to open economic warfare on the network.',
    introDialogue:
      'Station Master Briggs: Freight war’s on. Vane slashed rates to starve us. Hold the junction or lose the map — and every town we promised to feed.',
    introScene: [
      {
        characterId: SILAS_VANE_ID,
        line: 'Competition is healthy, manager. I simply compete with lawyers and locked sidings. You wanted a modern frontier — here is the tariff.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: BRIGGS_ID,
        line: 'He’s poaching every carrier we trained. Fight with reliability — it’s the one thing he can’t fake on a ledger.',
        badge: 'STAND FAST',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Junction’s the heart. Keep the switches clean and the schedules honest. Golden Route opens at noon — win there or Vane owns the territory.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Station Master Briggs: Junction held. Shippers are coming back to our timetable. One more run, manager — Golden Route terminal at noon. Vane wants the deed. We run the line and keep it public.',
    failureDialogue:
      'Station Master Briggs: We lost two contracts today. Win tomorrow or the line goes dark — and Dustfall eats last.',
    questTemplates: [
      template('freight-war', 'cleaning', 'Polish the Junction Switches', 'Night reset of your key area', 'Grime jams a switch — one jam loses a war.', 140, 11, BRIGGS_ID),
      template('freight-war', 'fitness', 'Junction Patrol Sprint', 'Evening movement session', 'If your body quits, the contract goes to Vane.', 145, 12, BRIGGS_ID),
      template('freight-war', 'work', 'Counter-Offer Ledger', 'Finish one hard work deliverable', 'Numbers win freight wars as surely as gunfire.', 140, 11, BRIGGS_ID),
      template('freight-war', 'study', 'Analyze Vane Tariffs', 'Deep focus study block', 'Know his rates before he changes them again.', 145, 11, BRIGGS_ID),
      template('freight-war', 'health', 'Switchyard Stamina', 'Sleep prep / mindfulness reset', 'Clear head, clean routing.', 120, 9, BRIGGS_ID),
      template('freight-war', 'social', 'Rally Loyal Carriers', 'Support one teammate/friend', 'Courage travels contract to contract.', 120, 9, BRIGGS_ID),
      template('freight-war', 'creative', 'Junction War Poster', 'Creative micro-session', 'In darkness, even small symbols hold the line.', 125, 9, BRIGGS_ID),
      template('freight-war', 'errand', 'Deliver the Loyalty Contracts', 'Complete a practical checklist errand', 'Ink on paper keeps carriers on our side.', 125, 10, BRIGGS_ID),
    ],
    chapterRewards: [{ id: 'freight-war-badge', type: 'badge', name: 'Junction Defender', media: { rewardImageKey: 'dust-and-iron.reward.iron-railway.route-marshal-badge' } }],
  },
  {
    id: 'golden-route',
    order: 5,
    title: 'The Golden Route',
    territoryName: 'Golden Route Terminal',
    media: { sceneImageKey: 'dust-and-iron.chapter.iron-railway.05-golden-route-terminal' },
    mapPosition: { x: 86, y: 8 },
    summary:
      'Control of the Golden Route — progress always costs something, and this is the price of a free frontier.',
    dramaticPurpose: 'Resolve the saga with the network secured or corporate rule.',
    introDialogue:
      'Station Master Briggs: Golden Route opens at noon. Vane wants the deed. We run the line and keep it public — because every mile we built cost blood, sweat, and High Noon.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'This is the terminal that feeds half the territory. Win here and the network stands free. Lose, and Dustfall trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'The Golden Route was always mine, manager. Crow broke your nerve; I bought the rebuild. Progress always costs something — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Last manifest of the saga. Move like the line depends on you — because it does, and because Mercer didn’t trust you with High Noon so Vane could take the rails.',
        badge: 'LAST RUN',
      },
    ],
    successDialogue:
      'Station Master Briggs: Golden Route secured. Vane can watch our trains from his boardroom window — but he doesn’t own the timetable. Progress cost us plenty. It was worth every mile. Mara Bell telegraphed from Main Street — Victor Crane’s circling the shop fronts. When you’re ready, honesty’s waiting.',
    failureDialogue:
      'Station Master Briggs: We lost the terminal today. The war for the rails isn’t over — and the bill still comes due.',
    questTemplates: [
      template('golden-route', 'cleaning', 'Shine the Terminal Floor', 'Complete full cleaning sweep', 'The world watches this platform at noon.', 150, 12, BRIGGS_ID),
      template('golden-route', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Vane catches managers who slow at the finish.', 155, 12, BRIGGS_ID),
      template('golden-route', 'work', 'Final Network Audit', 'Complete one priority work item', 'One clean audit proves the line is ours.', 155, 12, BRIGGS_ID),
      template('golden-route', 'study', 'Golden Route Charter', 'Focused study and recap', 'Know the law that keeps the route public.', 150, 12, BRIGGS_ID),
      template('golden-route', 'health', 'Noon Stamina Protocol', 'Health routine and recovery', 'Steady hands sign freedom into law.', 130, 10, BRIGGS_ID),
      template('golden-route', 'social', 'Rally the Line Workers', 'Reach out to your network', 'Collective resolve beats a lone deed.', 135, 11, BRIGGS_ID),
      template('golden-route', 'creative', 'Route Freedom Seal', 'Creative micro-session', 'Art outlasts leases — if you finish it.', 140, 11, BRIGGS_ID),
      template('golden-route', 'errand', 'Deliver the Route Seal', 'Finish critical practical errand', 'The seal reaches the terminal or Vane wins by default.', 140, 11, BRIGGS_ID),
    ],
    chapterRewards: [
      { id: 'golden-route-title', type: 'title', name: 'Golden Route Master', media: { rewardImageKey: 'dust-and-iron.reward.iron-railway.golden-route-charter' } },
      {
        id: 'honest-businessman-story-unlock',
        type: 'storyUnlock',
        name: 'Honest Businessman',
        unlockTargetId: 'honest-businessman',
        media: { rewardImageKey: 'dust-and-iron.reward.honest-businessman.silver-contract' },
      },
    ],
  },
];

export const IRON_RAILWAY_CHAPTERS = enrichSagaChapters(IRON_RAILWAY_CHAPTERS_RAW, {
  ...WILD_WEST_VARIATION_PROFILE,
  villainName: 'Silas Vane',
});
