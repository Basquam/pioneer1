import {
  PROFESSOR_LENA_WARD_ID,
  THE_GLASS_STUDENT_ID,
} from '@/data/narrative/campus-murders-characters';
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

export const CAMPUS_MURDERS_CHAPTERS: Chapter[] = [
  {
    id: 'orientation-of-blood',
    order: 1,
    title: 'Orientation of Blood',
    territoryName: 'Whitmore Academy · Main Quad',
    mapPosition: { x: 14, y: 78 },
    summary:
      'A freshman orientation ends in blood on the quad — proof that knowledge has a body count and every donor smiles over a motive.',
    dramaticPurpose: 'Introduce the Visiting Investigator fantasy and the Glass Student threat.',
    introDialogue:
      'Professor Lena Ward: Investigator, we’ve got a body on the Main Quad during orientation. Administration already called it an accident. Run your leads clean before Whitmore buries what you saw.',
    introScene: [
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Whitmore’s quad just became a crime scene wrapped in welcome banners. First day, no heroics. Just leads. Keep your case notes off the donor network.',
        badge: 'CASE I',
      },
      {
        characterId: THE_GLASS_STUDENT_ID,
        line: 'Pretty visiting investigator. Shame if discipline ran out before orientation ended. Knowledge has a body count — I’m merely pointing at the blood.',
        badge: 'REFLECTION',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Ignore the polished speeches. Case Integrity is fragile on campus. Every lead you finish is a motive the board can’t spin into philanthropy.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Professor Lena Ward: Orientation lead secured. You answered the academy’s pressure with clean work and steady Case Integrity. But the library lights stayed on after midnight — they weren’t studying. The next location belongs to whoever reads without blinking.',
    failureDialogue:
      'Professor Lena Ward: Campus security caught hesitation. Knowledge has a body count when investigators stall — re-sync and work before Whitmore locks your case.',
    questTemplates: [
      template('orientation-of-blood', 'cleaning', 'Clear the Quad Evidence', 'Clean kitchen and counters', 'Polished floors hide blood spatter in plain sight.', 110, 8, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'fitness', 'Campus Patrol Warm-Up', 'Do a quick bodyweight routine', 'A sluggish investigator broadcasts location across open quads.', 120, 10, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'study', 'Decode the Roster', 'Study session with focused notes', 'The Glass Student writes in patterns. Knowledge is your subpoena key.', 125, 9, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'work', 'Fortify the Case File', 'Complete one deep work block', 'Whitmore decides who gets heard and who gets expunged.', 120, 9, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'health', 'Recovery at the Faculty Office', 'Hydrate, meds, and a short recovery break', 'An exhausted investigator is easy to discredit on donor tours.', 100, 7, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'social', 'Ping the Graduate Network', 'Send one meaningful check-in message', 'Fear spreads through group chats unless someone files hope.', 105, 7, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'creative', 'Draft an Incident Summary', 'Create a short design or writing piece', 'Your words shape the investigators who follow your trail.', 115, 8, PROFESSOR_LENA_WARD_ID),
      template('orientation-of-blood', 'errand', 'Midnight Evidence Run', 'Complete one pending errand', 'Sealed envelopes vanish fast when administration panics.', 110, 8, PROFESSOR_LENA_WARD_ID),
    ],
    chapterRewards: [{ id: 'first-campus-lead-badge', type: 'badge', name: 'First Campus Lead' }],
  },
  {
    id: 'library-after-midnight',
    order: 2,
    title: 'Library After Midnight',
    territoryName: 'Whitmore Library · Archive Wing',
    mapPosition: { x: 32, y: 58 },
    summary:
      'A reflective clue surfaces in the archive wing — the Glass Student watches every investigator who reads after hours.',
    dramaticPurpose: 'Escalate urgency and push consistency under campus surveillance.',
    introDialogue:
      'Professor Lena Ward: The archive wing is lit at midnight. Security says it’s maintenance. We read before dawn — together, clean, no reflections left behind.',
    introScene: [
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Whitmore Library just went quiet on the official log — perfect for evidence, lethal if you hesitate. Move fast, move together. You’ve kept Case Integrity so far.',
        badge: 'CASE II',
      },
      {
        characterId: THE_GLASS_STUDENT_ID,
        line: 'Did you hear the stacks breathe after midnight? That’s the sound of testimony slipping. I didn’t start the silence — I just stopped pretending the archive was safe.',
        badge: 'REFLECTION',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'No panic. We work on my access card, not theirs. Detective Standing rises when investigators don’t flinch at library pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Professor Lena Ward: Archive lead secured. You held the stacks when it counted — I won’t forget that traceless night. But the Criminology lecture hall was sealed at dawn. They locked a witness inside once; they’ll try again.',
    failureDialogue:
      'Professor Lena Ward: We lost ground in the archive. Reclaim your case before morning bell — Whitmore is watching.',
    questTemplates: [
      template('library-after-midnight', 'cleaning', 'Scrub the Reading Room', 'Deep clean one neglected area', 'Dust and panic in the after-hours queue.', 120, 9, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'fitness', 'Outrun the Night Patrol', 'Cardio sprint or brisk walk session', 'Campus security flees fast; your legs decide the chase.', 130, 10, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'study', 'Map the Archive Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'work', 'Midnight Dispatch', 'Complete one important work item', 'Delay is a receipt the Glass Student reads like a confession.', 125, 10, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'health', 'Archive Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear investigative decisions.', 105, 8, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'social', 'Warn the Research Assistants', 'Reach out to someone who needs support', 'Encrypted warnings save witnesses before donors land.', 110, 8, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'creative', 'Midnight Marginalia', 'Create a short audio/text/art piece', 'Hope files better than fear in Whitmore’s stacks.', 115, 8, PROFESSOR_LENA_WARD_ID),
      template('library-after-midnight', 'errand', 'Archive Pickup', 'Finish one practical chore outside', 'Reflective clues arrive under active surveillance.', 120, 9, PROFESSOR_LENA_WARD_ID),
    ],
    chapterRewards: [{ id: 'midnight-researcher-title', type: 'title', name: 'Midnight Researcher' }],
  },
  {
    id: 'the-locked-lecture-hall',
    order: 3,
    title: 'The Locked Lecture Hall',
    territoryName: 'Criminology Lecture Hall',
    mapPosition: { x: 50, y: 40 },
    summary:
      'A witness trapped in the sealed lecture hall — knowledge has a body count when donors control who gets to testify.',
    dramaticPurpose: 'Shift from reaction to strategic case building.',
    introDialogue:
      'Professor Lena Ward: They locked the Criminology hall with a witness inside. We extract while the Glass Student watches — and we don’t blink when administration edits the incident report.',
    introScene: [
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'The lecture hall is crawling with board liaisons. This isn’t random — they’re testing who breaks first. I trust you to hold the extraction route.',
        badge: 'CASE III',
      },
      {
        characterId: THE_GLASS_STUDENT_ID,
        line: 'Extract all you want. Every delay teaches Whitmore who really keeps the witnesses quiet. I’m not cruel — I’m honest.',
        badge: 'REFLECTION',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Witness list is unstable, security’s noisy. I can keep your file alive if you keep your leads moving.',
        badge: 'EXTRACTION',
      },
    ],
    successDialogue:
      'Professor Lena Ward: Witness secured. They expected panic, found an investigator who leaves no gap. But listen: the Donor’s Gala went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Professor Lena Ward: Extraction stalled means Case Integrity stalled. Fix this fast — I’ll cover your subpoena if you cover the hall.',
    questTemplates: [
      template('the-locked-lecture-hall', 'cleaning', 'Clear the Lecture Podium', 'Declutter one messy zone', 'Debris hides reflective clues and bad investigative luck.', 130, 10, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'fitness', 'Hall Breach Drill', 'Strength routine', 'You extract testimony with muscle and moral grit.', 140, 11, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'study', 'Blueprint the Extraction', 'Study or planning session', 'A steady mind reads killer patterns true.', 135, 10, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'work', 'Case Route Papers', 'Finish one admin or work item', 'Cases fail when manifests fail.', 130, 10, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'health', 'Faculty Office Recovery', 'Meal + rest hygiene block', 'Hungry investigators miss Glass Student signatures.', 110, 8, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'social', 'Coordinate the TA Cell', 'Coordinate one shared errand', 'No witness moves alone through Whitmore’s halls.', 115, 9, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'creative', 'Paint the Case Crest', 'Create/update something expressive', 'Symbols remind investigators what they protect.', 120, 9, PROFESSOR_LENA_WARD_ID),
      template('the-locked-lecture-hall', 'errand', 'Find the Master Keys', 'Complete a practical pickup errand', 'The right key at the right hour saves the witness.', 125, 10, PROFESSOR_LENA_WARD_ID),
    ],
    chapterRewards: [{ id: 'evidence-notebook-cosmetic', type: 'cosmetic', name: 'Evidence Notebook' }],
  },
  {
    id: 'donors-gala',
    order: 4,
    title: "Donor's Gala",
    territoryName: 'Whitmore Donor Pavilion',
    mapPosition: { x: 68, y: 28 },
    summary:
      'The academy locks down the Donor’s Gala — every truth leaves a shadow when exhaustion finds an investigator alone among champagne and lies.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Professor Lena Ward: Gala lockdown. Keep your nerve. The Glass Student hunts fear in crystal and candlelight — I’ll be on the line if you need a faculty escort.',
    introScene: [
      {
        characterId: THE_GLASS_STUDENT_ID,
        line: 'Champagne is up, investigator. Perfect light to see your leads go unfinished — and your little case file fray at the edges.',
        badge: 'CASE IV',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'They hit at night because they think exhaustion breaks detectives. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Last clean exit out leaves at midnight. If we slip now, the whole pavilion goes quiet — and quiet investigators get bought cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Professor Lena Ward: We held the Gala in the red light of donor smiles. The Glass Student is rattled — and so am I, if I’m honest. The thesis defense activates at dawn. One clean day decides whether the killer stays anonymous. Rest if you can. I’ll call you at first light.',
    failureDialogue:
      'Professor Lena Ward: Night cycle took its toll. We stand again at first light — and I’ll be on the line with you.',
    questTemplates: [
      template('donors-gala', 'cleaning', 'Gala Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps panic out of the file.', 140, 11, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'fitness', 'Midnight Pavilion Patrol', 'Evening movement session', 'If your body quits, the case breaks.', 145, 12, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'study', 'Donor Pattern Notes', 'Deep focus study block', 'The Glass Student’s pattern repeats for those who look closely.', 140, 11, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite board lawyers.', 140, 11, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky investigative hands.', 120, 9, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels witness to witness.', 120, 9, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'creative', 'Gala Sketch Design', 'Creative micro-session', 'In darkness, even small leads matter.', 125, 9, PROFESSOR_LENA_WARD_ID),
      template('donors-gala', 'errand', 'Pavilion Supply Check', 'Complete a practical checklist errand', 'One missing subpoena can end the night.', 130, 10, PROFESSOR_LENA_WARD_ID),
    ],
    chapterRewards: [{ id: 'gala-witness-badge', type: 'badge', name: 'Gala Witness' }],
  },
  {
    id: 'the-glass-thesis',
    order: 5,
    title: 'The Glass Thesis',
    territoryName: 'Graduate Research Lab',
    mapPosition: { x: 82, y: 14 },
    summary:
      'The Glass Student’s final thesis goes live — knowledge has a body count, and this is the price of truth at Whitmore Academy.',
    dramaticPurpose: 'Resolve the saga with the killer exposed or the academy burying the case.',
    introDialogue:
      'Professor Lena Ward: The thesis defense opens at dawn. The Glass Student wants your case closed. We work the lab and keep the truth yours — because every lead we logged cost Case Integrity, and Jazz Club Secrets is already circling downtown.',
    introScene: [
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'This is the lab that feeds half the academy’s secrets. Win here and the killer stays exposed. Lose, and Whitmore trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: THE_GLASS_STUDENT_ID,
        line: 'The Thesis was always mine, investigator. Campus Murders broke your nerve; I bought the rebuild. Knowledge has a body count — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: PROFESSOR_LENA_WARD_ID,
        line: 'Last lead of the saga. Move like the campus depends on you — because it does, and because I didn’t trust you with this file so the board could bury it.',
        badge: 'LAST LEAD',
      },
    ],
    successDialogue:
      'Professor Lena Ward: Thesis shattered. The Glass Student can watch from the alumni network — but they don’t own the truth. Case Integrity cost us plenty. It was worth every page. Rosa Bell pinged from the Red Room Club — a night detective’s file just landed on my desk. When you’re ready, the jazz scene is waiting.',
    failureDialogue:
      'Professor Lena Ward: We lost the lab today. The war for Whitmore isn’t over — and the reflection still shows.',
    questTemplates: [
      template('the-glass-thesis', 'cleaning', 'Purge the Lab Floor', 'Complete full cleaning sweep', 'The killer watches this room at dawn.', 150, 12, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Reflections catch investigators who slow at the finish.', 155, 12, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'study', 'Thesis Countermeasures', 'Focused study and recap', 'Know the protocol that keeps the truth yours.', 150, 12, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'work', 'Final Case Audit', 'Complete one priority work item', 'One clean audit proves the file is yours.', 155, 12, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the record.', 130, 10, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'social', 'Rally the Campus Network', 'Reach out to your network', 'Collective testimony beats a lone reflection.', 135, 11, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'creative', 'Truth Seal Design', 'Creative micro-session', 'Evidence outlasts redactions — if you finish it.', 140, 11, PROFESSOR_LENA_WARD_ID),
      template('the-glass-thesis', 'errand', 'Deliver the Case Seal', 'Finish critical practical errand', 'The seal reaches the lab or the killer wins by default.', 140, 11, PROFESSOR_LENA_WARD_ID),
    ],
    chapterRewards: [
      {
        id: 'jazz-club-secrets-story-unlock',
        type: 'storyUnlock',
        name: 'Jazz Club Secrets',
        unlockTargetId: 'jazz-club-secrets',
      },
    ],
  },
];
