import { BRIGGS_ID } from '@/data/narrative/vulture-gang-characters';
import { SILAS_VANE_ID } from '@/data/narrative/iron-railway-characters';
import type { Chapter, QuestTemplate } from '@/types/narrative';

type IronCategory = 'cleaning' | 'work' | 'study' | 'errand' | 'health';

function template(
  chapterId: string,
  category: IronCategory,
  title: string,
  objective: string,
  hook: string,
  xpReward: number,
  reputationImpact: number,
  reactionCharacterId: string,
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
  };
}

export const IRON_RAILWAY_CHAPTERS: Chapter[] = [
  {
    id: 'first-shipment',
    order: 1,
    title: 'First Shipment',
    territoryName: 'Railyard Gate',
    mapPosition: { x: 14, y: 80 },
    summary: 'Your first freight run must leave on time or Vane claims the whole line.',
    dramaticPurpose: 'Establish the logistics fantasy and corporate threat.',
    introDialogue: 'Station Master Briggs: First shipment’s on the platform. Move it clean, move it fast — Vane’s already counting our failures.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Junior manager — manifest’s live, crew’s waiting. This run sets the tone for every route after it.',
        badge: 'CHAPTER I',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'How charming. A debut shipment. Do try not to embarrass the frontier.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Ignore the silk hat. Keep the platform clear and the cars coupled.',
        badge: 'ORDERS',
      },
    ],
    successDialogue: 'Station Master Briggs: First shipment cleared. The line stays ours — for now.',
    failureDialogue: 'Station Master Briggs: Vane’s men are smiling. Fix the backlog before the next bell.',
    questTemplates: [
      template('first-shipment', 'cleaning', 'Sweep the Loading Dock', 'Clean kitchen and counters', 'Spilled grain hides sabotage under the planks.', 115, 8, BRIGGS_ID),
      template('first-shipment', 'work', 'Sign the Manifest', 'Complete one deep work block', 'One unsigned page stops a whole train.', 120, 9, BRIGGS_ID),
      template('first-shipment', 'study', 'Read the Route Ledger', 'Study session with focused notes', 'Vane’s fees hide in the footnotes.', 125, 9, BRIGGS_ID),
      template('first-shipment', 'errand', 'Fetch the Seal Stamp', 'Complete one pending errand', 'No stamp, no shipment — simple as steel.', 110, 8, BRIGGS_ID),
      template('first-shipment', 'health', 'Platform Break', 'Hydrate, meds, and a short recovery break', 'Exhausted crews drop cargo.', 100, 7, BRIGGS_ID),
    ],
    chapterReward: { id: 'first-shipment-badge', type: 'badge', name: 'First Shipment Cleared' },
  },
  {
    id: 'delayed-cargo',
    order: 2,
    title: 'Delayed Cargo',
    territoryName: 'Cargo Hold Six',
    mapPosition: { x: 32, y: 62 },
    summary: 'Vane slows the line with red tape while Dustfall waits on critical freight.',
    dramaticPurpose: 'Raise stakes with deliberate corporate delay.',
    introDialogue: 'Station Master Briggs: Cargo’s sitting in Hold Six. Vane filed three inspections overnight. We move anyway.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Hold Six is backed up — medicine, timber, grain. Vane wants us to choke on paperwork.',
        badge: 'CHAPTER II',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'Safety regulations, manager. Wouldn’t want an *accident* on your precious line.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Cut the delay where you can. Real towns don’t eat inspections.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue: 'Station Master Briggs: Cargo rolling again. Vane lost this round on the clock.',
    failureDialogue: 'Station Master Briggs: Hold Six is still locked. People downline are going hungry.',
    questTemplates: [
      template('delayed-cargo', 'cleaning', 'Clear Hold Six', 'Deep clean one neglected area', 'Clutter slows every handoff between cars.', 120, 9, BRIGGS_ID),
      template('delayed-cargo', 'work', 'Override the Delay Order', 'Ship one important work task', 'One cleared form unlocks a dozen crates.', 125, 10, BRIGGS_ID),
      template('delayed-cargo', 'study', 'Decode Inspection Codes', 'Focused study block', 'Their codes repeat — learn the pattern, beat the stall.', 130, 10, BRIGGS_ID),
      template('delayed-cargo', 'errand', 'Run the Release Slip', 'Finish one practical chore outside', 'The slip is in town. The train is here. Close the gap.', 115, 8, BRIGGS_ID),
      template('delayed-cargo', 'health', 'Night Shift Recovery', 'Breathing routine and water reset', 'Tired crews sign bad manifests.', 105, 8, BRIGGS_ID),
    ],
    chapterReward: { id: 'delayed-cargo-title', type: 'title', name: 'Cargo Clerk' },
  },
  {
    id: 'broken-tracks',
    order: 3,
    title: 'Broken Tracks',
    territoryName: 'Broken Tracks Pass',
    mapPosition: { x: 50, y: 44 },
    summary: 'Sabotage on the main line threatens to sever Dustfall from the frontier.',
    dramaticPurpose: 'Shift from paperwork to physical infrastructure crisis.',
    introDialogue: 'Station Master Briggs: Rails are cracked at the pass. Vane denies sabotage. We repair and run.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Three rail ties split clean through. That’s not weather — that’s invoice by vandalism.',
        badge: 'CHAPTER III',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'Maintenance costs money, manager. Perhaps you should lease from someone competent.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Get crews what they need. A closed pass strangles every town on the line.',
        badge: 'ORDERS',
      },
    ],
    successDialogue: 'Station Master Briggs: Tracks hold. First engine through the pass blew its whistle for us.',
    failureDialogue: 'Station Master Briggs: The pass is still closed. Downline stations are rationing.',
    questTemplates: [
      template('broken-tracks', 'cleaning', 'Clear the Ballast Pit', 'Declutter one messy zone', 'Loose stone hides snapped spikes.', 130, 10, BRIGGS_ID),
      template('broken-tracks', 'work', 'Repair Schedule Dispatch', 'Complete one admin/work task', 'Crews move on orders, not hope.', 130, 10, BRIGGS_ID),
      template('broken-tracks', 'study', 'Survey the Damage Map', 'Study or planning session', 'Measure twice, repair once, run forever.', 135, 10, BRIGGS_ID),
      template('broken-tracks', 'errand', 'Fetch Rail Spikes', 'Complete a practical pickup errand', 'The forge is ten miles. The train is today.', 120, 9, BRIGGS_ID),
      template('broken-tracks', 'health', 'Crew Meal Rotation', 'Meal + rest hygiene block', 'Hungry track hands miss a cracked tie.', 110, 8, BRIGGS_ID),
    ],
    chapterReward: { id: 'broken-tracks-cosmetic', type: 'cosmetic', name: 'Brass Switch Key' },
  },
  {
    id: 'freight-war',
    order: 4,
    title: 'Freight War',
    territoryName: 'Freight War Junction',
    mapPosition: { x: 68, y: 26 },
    summary: 'Vane undercuts your routes while rival contracts poach your carriers.',
    dramaticPurpose: 'Escalate to open economic warfare on the network.',
    introDialogue: 'Station Master Briggs: Freight war’s on. Vane slashed rates to starve us. Hold the junction or lose the map.',
    introScene: [
      {
        characterId: SILAS_VANE_ID,
        line: 'Competition is healthy, manager. I simply compete with lawyers and locked sidings.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: BRIGGS_ID,
        line: 'He’s poaching every carrier we trained. Fight with reliability — it’s the one thing he can’t fake.',
        badge: 'STAND FAST',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Junction’s the heart. Keep the switches clean and the schedules honest.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue: 'Station Master Briggs: Junction held. Shippers are coming back to our timetable.',
    failureDialogue: 'Station Master Briggs: We lost two contracts today. Win tomorrow or the line goes dark.',
    questTemplates: [
      template('freight-war', 'cleaning', 'Polish the Junction Switches', 'Night reset of your key area', 'Grime jams a switch — one jam loses a war.', 140, 11, BRIGGS_ID),
      template('freight-war', 'work', 'Counter-Offer Ledger', 'Finish one hard work deliverable', 'Numbers win freight wars as surely as gunfire.', 140, 11, BRIGGS_ID),
      template('freight-war', 'study', 'Analyze Vane Tariffs', 'Deep focus study block', 'Know his rates before he changes them again.', 145, 11, BRIGGS_ID),
      template('freight-war', 'errand', 'Deliver the Loyalty Contracts', 'Complete a practical checklist errand', 'Ink on paper keeps carriers on our side.', 125, 10, BRIGGS_ID),
      template('freight-war', 'health', 'Switchyard Stamina', 'Sleep prep / mindfulness reset', 'Clear head, clean routing.', 120, 9, BRIGGS_ID),
    ],
    chapterReward: { id: 'freight-war-badge', type: 'badge', name: 'Junction Defender' },
  },
  {
    id: 'golden-route',
    order: 5,
    title: 'The Golden Route',
    territoryName: 'Golden Route Terminal',
    mapPosition: { x: 86, y: 8 },
    summary: 'Control of the Golden Route decides whether Dustfall keeps its lifeline.',
    dramaticPurpose: 'Resolve the saga with the network secured or corporate rule.',
    introDialogue: 'Station Master Briggs: Golden Route opens at noon. Vane wants the deed. We run the line and keep it public.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'This is the terminal that feeds half the territory. Win here and the network stands free.',
        badge: 'FINALE',
      },
      {
        characterId: SILAS_VANE_ID,
        line: 'The Golden Route was always mine, manager. You merely delayed the acquisition.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Last manifest of the saga. Move like the line depends on you — because it does.',
        badge: 'LAST RUN',
      },
    ],
    successDialogue: 'Station Master Briggs: Golden Route secured. Vane can watch our trains from his boardroom window.',
    failureDialogue: 'Station Master Briggs: We lost the terminal today. The war for the rails isn’t over.',
    questTemplates: [
      template('golden-route', 'cleaning', 'Shine the Terminal Floor', 'Complete full cleaning sweep', 'The world watches this platform at noon.', 150, 12, BRIGGS_ID),
      template('golden-route', 'work', 'Final Network Audit', 'Ship priority work mission', 'One clean audit proves the line is ours.', 155, 12, BRIGGS_ID),
      template('golden-route', 'study', 'Golden Route Charter', 'Focused study and recap', 'Know the law that keeps the route public.', 150, 12, BRIGGS_ID),
      template('golden-route', 'errand', 'Deliver the Route Seal', 'Finish critical practical errand', 'The seal reaches the terminal or Vane wins by default.', 140, 11, BRIGGS_ID),
      template('golden-route', 'health', 'Noon Stamina Protocol', 'Health routine and recovery', 'Steady hands sign freedom into law.', 130, 10, BRIGGS_ID),
    ],
    chapterReward: {
      id: 'golden-route-title',
      type: 'title',
      name: 'Golden Route Master',
    },
  },
];
