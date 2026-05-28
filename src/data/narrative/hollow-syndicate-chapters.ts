import {
  EVELYN_CROSS_ID,
  MARCUS_VALE_ID,
} from '@/data/narrative/hollow-syndicate-characters';
import type { Chapter, QuestTemplate } from '@/types/narrative';

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

export const HOLLOW_SYNDICATE_CHAPTERS: Chapter[] = [
  {
    id: 'cold-file',
    order: 1,
    title: 'Cold File',
    territoryName: 'Grayhaven Records Archive',
    mapPosition: { x: 14, y: 78 },
    summary:
      'A sealed case file surfaces in the city archive — proof that power hides in plain sight and every truth leaves a shadow.',
    dramaticPurpose: 'Introduce the Private Investigator fantasy and the Syndicate conspiracy threat.',
    introDialogue:
      'Evelyn Cross: Investigator, we’ve got a cold file at the Records Archive. Vale’s lawyers already stamped it confidential. Run your leads clean before the Hollow Syndicate redacts what you remember.',
    introScene: [
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Grayhaven Records just flagged a sealed file — Syndicate tags on every page. First night, no heroics. Just leads. Keep your case notes clean.',
        badge: 'CASE I',
      },
      {
        characterId: MARCUS_VALE_ID,
        line: 'Pretty little investigator. Shame if discipline ran out before the archive closed. Power hides in plain sight — I’m merely pointing at the locks.',
        badge: 'SYNDICATE',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Ignore his ledger talk. Case Integrity is fragile out here. Every lead you finish is a page Vale can’t burn.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Evelyn Cross: File opened. You answered Vale’s pressure with clean leads and steady Case Integrity. But look east — rain hammered 7th Street at midnight. They weren’t bluffing. The next location belongs to whoever works without a trace.',
    failureDialogue:
      'Evelyn Cross: Syndicate watchers caught hesitation. Every truth leaves a shadow when investigators stall — re-sync and work before the archive locks your case.',
    questTemplates: [
      template('cold-file', 'cleaning', 'Purge the Archive Desk', 'Clean kitchen and counters', 'Dust hides redacted pages in cluttered offices.', 110, 8, EVELYN_CROSS_ID),
      template('cold-file', 'fitness', 'Night Shift Warm-Up', 'Do a quick bodyweight routine', 'A sluggish investigator broadcasts location to every watcher.', 120, 10, EVELYN_CROSS_ID),
      template('cold-file', 'study', 'Decode the File Index', 'Study session with focused notes', 'Vale writes in patterns. Knowledge is your subpoena key.', 125, 9, EVELYN_CROSS_ID),
      template('cold-file', 'work', 'Fortify the Case Ledger', 'Complete one deep work block', 'The Syndicate decides who gets heard and who gets erased.', 120, 9, EVELYN_CROSS_ID),
      template('cold-file', 'health', 'Recovery at the Office', 'Hydrate, meds, and a short recovery break', 'An exhausted investigator is easy to discredit.', 100, 7, EVELYN_CROSS_ID),
      template('cold-file', 'social', 'Ping the Witness Network', 'Send one meaningful check-in message', 'Fear spreads through open channels unless someone files hope.', 105, 7, EVELYN_CROSS_ID),
      template('cold-file', 'creative', 'Draft a Case Summary', 'Create a short design or writing piece', 'Your words shape the investigators who follow your trail.', 115, 8, EVELYN_CROSS_ID),
      template('cold-file', 'errand', 'Midnight Evidence Run', 'Complete one pending errand', 'Sealed envelopes and tape vanish fast under siege.', 110, 8, EVELYN_CROSS_ID),
    ],
    chapterRewards: [{ id: 'cold-file-opened-badge', type: 'badge', name: 'Cold File Opened' }],
  },
  {
    id: 'rain-on-7th-street',
    order: 2,
    title: 'Rain on 7th Street',
    territoryName: '7th Street Alley',
    mapPosition: { x: 32, y: 58 },
    summary:
      'A witness sighting in the rain-slick alley — Vale’s Syndicate watches every investigator who moves without a badge.',
    dramaticPurpose: 'Escalate urgency and push consistency under surveillance pressure.',
    introDialogue:
      'Evelyn Cross: 7th Street is soaked and hot. Syndicate watchers at both ends. We interview before dawn — together, clean, no shadows left behind.',
    introScene: [
      {
        characterId: EVELYN_CROSS_ID,
        line: '7th Street just went quiet on the official blotter — perfect for a witness, lethal if you hesitate. Move fast, move together. You’ve kept Case Integrity so far.',
        badge: 'CASE II',
      },
      {
        characterId: MARCUS_VALE_ID,
        line: 'Did you hear that rain on the pavement? That’s the sound of testimony slipping. I didn’t start the storm — I just stopped pretending the alley was safe.',
        badge: 'SYNDICATE',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'No panic. We work on my clock, not his. Detective Standing rises when investigators don’t flinch at rainline pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Evelyn Cross: Witness secured. You held 7th Street when it counted — I won’t forget that traceless night. But Vale’s fixers were seen near Whitmore Heights. They silenced a clerk once; they’ll try again.',
    failureDialogue:
      'Evelyn Cross: We lost ground in the alley. Reclaim your case before last call — Grayhaven is watching.',
    questTemplates: [
      template('rain-on-7th-street', 'cleaning', 'Scrub the Interview Room', 'Deep clean one neglected area', 'Cigarette smoke and panic in the witness queue.', 120, 9, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'fitness', 'Outrun the Watchers', 'Cardio sprint or brisk walk session', 'Syndicate tail cars flee fast; your legs decide the chase.', 130, 10, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'study', 'Map the Alley Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'work', 'Rainline Dispatch', 'Complete one important work item', 'Delay is a receipt Vale reads like a confession.', 125, 10, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'health', 'Alley Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear investigative decisions.', 105, 8, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'social', 'Warn the Block Contacts', 'Reach out to someone who needs support', 'Encrypted warnings save witnesses before lawyers land.', 110, 8, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'creative', 'Rain Street Blues', 'Create a short audio/text/art piece', 'Hope files better than fear in Grayhaven.', 115, 8, EVELYN_CROSS_ID),
      template('rain-on-7th-street', 'errand', 'Alley Pickup', 'Finish one practical chore outside', 'Witness statements arrive under active surveillance.', 120, 9, EVELYN_CROSS_ID),
    ],
    chapterRewards: [{ id: 'rain-street-investigator-title', type: 'title', name: 'Rain Street Investigator' }],
  },
  {
    id: 'the-missing-witness',
    order: 3,
    title: 'The Missing Witness',
    territoryName: 'Whitmore Heights',
    mapPosition: { x: 50, y: 40 },
    summary:
      'A key witness vanishes from Whitmore Heights — power hides in plain sight when corporate charity fronts buy silence.',
    dramaticPurpose: 'Shift from reaction to strategic case building.',
    introDialogue:
      'Evelyn Cross: They moved a witness from the Heights. We locate while Vale watches — and we don’t blink when he edits the police report.',
    introScene: [
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Whitmore Heights is crawling with Syndicate fixers. This isn’t random — they’re testing who breaks first. I trust you to hold the search route.',
        badge: 'CASE III',
      },
      {
        characterId: MARCUS_VALE_ID,
        line: 'Find all you want. Every delay teaches Grayhaven who really keeps the witnesses quiet. I’m not cruel — I’m honest.',
        badge: 'SYNDICATE',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Witness list is unstable, precinct’s noisy. I can keep your file alive if you keep your leads moving.',
        badge: 'SEARCH',
      },
    ],
    successDialogue:
      'Evelyn Cross: Witness located. They expected panic, found an investigator who leaves no gap. But listen: Ledger District went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Evelyn Cross: Search stalled means Case Integrity stalled. Fix this fast — I’ll cover your subpoena if you cover the Heights.',
    questTemplates: [
      template('the-missing-witness', 'cleaning', 'Clear the Safe House', 'Declutter one messy zone', 'Debris hides witness notes and bad investigative luck.', 130, 10, EVELYN_CROSS_ID),
      template('the-missing-witness', 'fitness', 'Search Strength Drill', 'Strength routine', 'You extract testimony with muscle and moral grit.', 140, 11, EVELYN_CROSS_ID),
      template('the-missing-witness', 'study', 'Blueprint the Search', 'Study or planning session', 'A steady mind reads witness patterns true.', 135, 10, EVELYN_CROSS_ID),
      template('the-missing-witness', 'work', 'Case Route Papers', 'Finish one admin or work item', 'Cases fail when manifests fail.', 130, 10, EVELYN_CROSS_ID),
      template('the-missing-witness', 'health', 'Office Recovery', 'Meal + rest hygiene block', 'Hungry investigators miss Syndicate signatures.', 110, 8, EVELYN_CROSS_ID),
      template('the-missing-witness', 'social', 'Coordinate the Contact Cell', 'Coordinate one shared errand', 'No witness moves alone through Vale’s city.', 115, 9, EVELYN_CROSS_ID),
      template('the-missing-witness', 'creative', 'Paint the Case Crest', 'Create/update something expressive', 'Symbols remind investigators what they protect.', 120, 9, EVELYN_CROSS_ID),
      template('the-missing-witness', 'errand', 'Find the Subpoena Keys', 'Complete a practical pickup errand', 'The right key at the right hour saves the witness.', 125, 10, EVELYN_CROSS_ID),
    ],
    chapterRewards: [{ id: 'case-worn-trenchcoat-cosmetic', type: 'cosmetic', name: 'Case-Worn Trenchcoat' }],
  },
  {
    id: 'red-ledger',
    order: 4,
    title: 'Red Ledger',
    territoryName: 'Ledger District',
    mapPosition: { x: 68, y: 28 },
    summary:
      'The Syndicate locks down the Ledger District — every truth leaves a shadow when exhaustion finds an investigator alone in the red-lit books.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Evelyn Cross: District lockdown. Keep your nerve. Vale hunts fear in the red ledger — I’ll be on the line if you need a warrant.',
    introScene: [
      {
        characterId: MARCUS_VALE_ID,
        line: 'Books are open, investigator. Perfect light to see your leads go unfinished — and your little case file fray at the edges.',
        badge: 'CASE IV',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'They hit at night because they think exhaustion breaks detectives. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Last clean exit out leaves at midnight. If we slip now, the whole district goes quiet — and quiet investigators get bought cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Evelyn Cross: We held the Ledger District in the red light. Vale’s rattled — and so am I, if I’m honest. The Hollow Room activates at dawn. One clean day decides whether the conspiracy stays buried. Rest if you can. I’ll call you at first light.',
    failureDialogue:
      'Evelyn Cross: Night cycle took its toll. We stand again at first light — and I’ll be on the line with you.',
    questTemplates: [
      template('red-ledger', 'cleaning', 'Ledger Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps panic out of the file.', 140, 11, EVELYN_CROSS_ID),
      template('red-ledger', 'fitness', 'Midnight District Patrol', 'Evening movement session', 'If your body quits, the case breaks.', 145, 12, EVELYN_CROSS_ID),
      template('red-ledger', 'study', 'Syndicate Pattern Notes', 'Deep focus study block', 'Vale’s pattern repeats for those who look closely.', 140, 11, EVELYN_CROSS_ID),
      template('red-ledger', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite Syndicate lawyers.', 140, 11, EVELYN_CROSS_ID),
      template('red-ledger', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky investigative hands.', 120, 9, EVELYN_CROSS_ID),
      template('red-ledger', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels witness to witness.', 120, 9, EVELYN_CROSS_ID),
      template('red-ledger', 'creative', 'Case Flare Design', 'Creative micro-session', 'In darkness, even small leads matter.', 125, 9, EVELYN_CROSS_ID),
      template('red-ledger', 'errand', 'District Supply Check', 'Complete a practical checklist errand', 'One missing subpoena can end the night.', 130, 10, EVELYN_CROSS_ID),
    ],
    chapterRewards: [{ id: 'ledger-breaker-badge', type: 'badge', name: 'Ledger Breaker' }],
  },
  {
    id: 'the-hollow-room',
    order: 5,
    title: 'The Hollow Room',
    territoryName: 'The Hollow Room',
    mapPosition: { x: 82, y: 14 },
    summary:
      'Marcus Vale’s syndicate boardroom goes live — power hides in plain sight, and this is the price of a free city in Grayhaven.',
    dramaticPurpose: 'Resolve the saga with the conspiracy exposed or buried.',
    introDialogue:
      'Evelyn Cross: The Hollow Room opens at dawn. Vale wants your case closed. We work the boardroom and keep the truth yours — because every lead we logged cost Case Integrity, and Campus Murders is already circling.',
    introScene: [
      {
        characterId: EVELYN_CROSS_ID,
        line: 'This is the room that feeds half the city’s corruption. Win here and the conspiracy stays exposed. Lose, and Grayhaven trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: MARCUS_VALE_ID,
        line: 'The Room was always mine, investigator. Hollow Syndicate broke your nerve; I bought the rebuild. Power hides in plain sight — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: EVELYN_CROSS_ID,
        line: 'Last lead of the saga. Move like the city depends on you — because it does, and because I didn’t trust you with this file so Vale could bury it.',
        badge: 'LAST LEAD',
      },
    ],
    successDialogue:
      'Evelyn Cross: Room breached. Vale can watch our investigators from his charity galas — but he doesn’t own the truth. Case Integrity cost us plenty. It was worth every page. Whitmore Academy pinged from the east side — a visiting investigator’s file just landed on my desk. When you’re ready, the campus is waiting.',
    failureDialogue:
      'Evelyn Cross: We lost the boardroom today. The war for Grayhaven isn’t over — and the ledger still reflects.',
    questTemplates: [
      template('the-hollow-room', 'cleaning', 'Purge the Boardroom Floor', 'Complete full cleaning sweep', 'The Syndicate watches this room at dawn.', 150, 12, EVELYN_CROSS_ID),
      template('the-hollow-room', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Lawyers catch investigators who slow at the finish.', 155, 12, EVELYN_CROSS_ID),
      template('the-hollow-room', 'study', 'Conspiracy Countermeasures', 'Focused study and recap', 'Know the protocol that keeps the truth yours.', 150, 12, EVELYN_CROSS_ID),
      template('the-hollow-room', 'work', 'Final Case Audit', 'Complete one priority work item', 'One clean audit proves the file is yours.', 155, 12, EVELYN_CROSS_ID),
      template('the-hollow-room', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the record.', 130, 10, EVELYN_CROSS_ID),
      template('the-hollow-room', 'social', 'Rally the Contact Network', 'Reach out to your network', 'Collective testimony beats a lone ledger.', 135, 11, EVELYN_CROSS_ID),
      template('the-hollow-room', 'creative', 'Truth Seal Design', 'Creative micro-session', 'Evidence outlasts redactions — if you finish it.', 140, 11, EVELYN_CROSS_ID),
      template('the-hollow-room', 'errand', 'Deliver the Case Seal', 'Finish critical practical errand', 'The seal reaches the room or Vale wins by default.', 140, 11, EVELYN_CROSS_ID),
    ],
    chapterRewards: [
      {
        id: 'campus-murders-story-unlock',
        type: 'storyUnlock',
        name: 'Campus Murders',
        unlockTargetId: 'campus-murders',
      },
    ],
  },
];
