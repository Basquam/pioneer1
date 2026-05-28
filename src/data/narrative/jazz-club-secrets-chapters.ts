import {
  ROSA_BELL_ID,
  VINCENT_NOIR_ID,
} from '@/data/narrative/jazz-club-secrets-characters';
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

export const JAZZ_CLUB_SECRETS_CHAPTERS: Chapter[] = [
  {
    id: 'blue-note-confession',
    order: 1,
    title: 'Blue Note Confession',
    territoryName: 'Blue Note Lounge',
    mapPosition: { x: 14, y: 78 },
    summary:
      'A whispered confession at the Blue Note Lounge — proof that everyone tells the truth differently and every song is an alibi.',
    dramaticPurpose: 'Introduce the Night Detective fantasy and Vincent Noir’s blackmail network.',
    introDialogue:
      'Rosa Bell: Detective, we’ve got a confession at the Blue Note — half sung, half sobbed. Noir’s fixers already called it a drunk act. Run your leads clean before the Red Room buries what you heard.',
    introScene: [
      {
        characterId: ROSA_BELL_ID,
        line: 'Blue Note just lit up on my setlist — witness tags on every verse. First set, no heroics. Just leads. Keep your case notes off the house microphone.',
        badge: 'CASE I',
      },
      {
        characterId: VINCENT_NOIR_ID,
        line: 'Pretty night detective. Shame if discipline ran out before the confession ended. Everyone tells the truth differently — I’m merely pointing at the melody.',
        badge: 'RED ROOM',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'Ignore his encore talk. Case Integrity is fragile after midnight. Every lead you finish is a verse Noir can’t rewrite.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Rosa Bell: Confession secured. You answered Noir’s pressure with clean leads and steady Case Integrity. But smoke rolled heavy behind the stage at closing — they weren’t venting the fog machine. The next room belongs to whoever listens without blinking.',
    failureDialogue:
      'Rosa Bell: Club watchers caught hesitation. Everyone tells the truth differently when detectives stall — re-sync and work before the Blue Note locks your case.',
    questTemplates: [
      template('blue-note-confession', 'cleaning', 'Clear the Booth Table', 'Clean kitchen and counters', 'Ash hides witness notes in cluttered booths.', 110, 8, ROSA_BELL_ID),
      template('blue-note-confession', 'fitness', 'Night Shift Warm-Up', 'Do a quick bodyweight routine', 'A sluggish detective broadcasts location to every bouncer.', 120, 10, ROSA_BELL_ID),
      template('blue-note-confession', 'study', 'Decode the Setlist', 'Study session with focused notes', 'Noir writes in patterns. Knowledge is your subpoena key.', 125, 9, ROSA_BELL_ID),
      template('blue-note-confession', 'work', 'Fortify the Case Ledger', 'Complete one deep work block', 'The Red Room decides who gets heard and who gets silenced.', 120, 9, ROSA_BELL_ID),
      template('blue-note-confession', 'health', 'Recovery at the Dressing Room', 'Hydrate, meds, and a short recovery break', 'An exhausted detective is easy to discredit between sets.', 100, 7, ROSA_BELL_ID),
      template('blue-note-confession', 'social', 'Ping the Band Network', 'Send one meaningful check-in message', 'Fear spreads through green rooms unless someone files hope.', 105, 7, ROSA_BELL_ID),
      template('blue-note-confession', 'creative', 'Draft a Confession Summary', 'Create a short design or writing piece', 'Your words shape the detectives who follow your trail.', 115, 8, ROSA_BELL_ID),
      template('blue-note-confession', 'errand', 'Midnight Evidence Run', 'Complete one pending errand', 'Sealed envelopes vanish fast when the house panics.', 110, 8, ROSA_BELL_ID),
    ],
    chapterRewards: [{ id: 'first-blue-note-badge', type: 'badge', name: 'First Blue Note' }],
  },
  {
    id: 'smoke-behind-the-stage',
    order: 2,
    title: 'Smoke Behind the Stage',
    territoryName: 'Red Room Backstage',
    mapPosition: { x: 32, y: 58 },
    summary:
      'A witness sighting in the smoke-choked backstage — Vincent Noir watches every detective who moves without a house pass.',
    dramaticPurpose: 'Escalate urgency and push consistency under club surveillance.',
    introDialogue:
      'Rosa Bell: Backstage is soaked in smoke and rumors. Noir’s watchers at both exits. We interview before last call — together, clean, no alibis left behind.',
    introScene: [
      {
        characterId: ROSA_BELL_ID,
        line: 'Backstage just went quiet on the official bill — perfect for a witness, lethal if you hesitate. Move fast, move together. You’ve kept Case Integrity so far.',
        badge: 'CASE II',
      },
      {
        characterId: VINCENT_NOIR_ID,
        line: 'Did you hear that cough behind the curtain? That’s the sound of testimony slipping. I didn’t start the smoke — I just stopped pretending the alley was safe.',
        badge: 'RED ROOM',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'No panic. We work on my clock, not his. Detective Standing rises when detectives don’t flinch at backstage pressure.',
        badge: 'ORDERS',
      },
    ],
    successDialogue:
      'Rosa Bell: Witness secured. You held backstage when it counted — I won’t forget that traceless set. But a trumpet case went missing from Horn Row at dawn. They silenced a player once; they’ll try again.',
    failureDialogue:
      'Rosa Bell: We lost ground backstage. Reclaim your case before the house lights — Grayhaven is watching.',
    questTemplates: [
      template('smoke-behind-the-stage', 'cleaning', 'Scrub the Green Room', 'Deep clean one neglected area', 'Cigarette smoke and panic in the witness queue.', 120, 9, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'fitness', 'Outrun the Bouncers', 'Cardio sprint or brisk walk session', 'Club tail cars flee fast; your legs decide the chase.', 130, 10, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'study', 'Map the Backstage Routes', 'Focused study block', 'Every page read closes a surveillance blind spot.', 130, 10, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'work', 'Backstage Dispatch', 'Complete one important work item', 'Delay is a receipt Noir reads like a confession.', 125, 10, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'health', 'Alley Recovery Protocol', 'Breathing routine and water reset', 'Clear lungs, clear investigative decisions.', 105, 8, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'social', 'Warn the Session Musicians', 'Reach out to someone who needs support', 'Encrypted warnings save witnesses before lawyers land.', 110, 8, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'creative', 'Backstage Blues', 'Create a short audio/text/art piece', 'Hope files better than fear in Grayhaven’s alleys.', 115, 8, ROSA_BELL_ID),
      template('smoke-behind-the-stage', 'errand', 'Alley Pickup', 'Finish one practical chore outside', 'Witness statements arrive under active surveillance.', 120, 9, ROSA_BELL_ID),
    ],
    chapterRewards: [{ id: 'backstage-listener-title', type: 'title', name: 'Backstage Listener' }],
  },
  {
    id: 'the-trumpet-case',
    order: 3,
    title: 'The Trumpet Case',
    territoryName: 'Horn Row · Dressing Alley',
    mapPosition: { x: 50, y: 40 },
    summary:
      'A missing trumpet case holds evidence — everyone tells the truth differently when blackmail buys silence from the bandstand.',
    dramaticPurpose: 'Shift from reaction to strategic case building.',
    introDialogue:
      'Rosa Bell: They moved the trumpet case from Horn Row. We locate while Noir watches — and we don’t blink when he edits the police report.',
    introScene: [
      {
        characterId: ROSA_BELL_ID,
        line: 'Horn Row is crawling with Noir’s fixers. This isn’t random — they’re testing who breaks first. I trust you to hold the search route.',
        badge: 'CASE III',
      },
      {
        characterId: VINCENT_NOIR_ID,
        line: 'Find all you want. Every delay teaches Grayhaven who really keeps the musicians quiet. I’m not cruel — I’m honest.',
        badge: 'RED ROOM',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'Witness list is unstable, the house is noisy. I can keep your file alive if you keep your leads moving.',
        badge: 'SEARCH',
      },
    ],
    successDialogue:
      'Rosa Bell: Case located. They expected panic, found a detective who leaves no gap. But listen: Noir’s private office went dark after midnight. The next test won’t wait for a clean reboot.',
    failureDialogue:
      'Rosa Bell: Search stalled means Case Integrity stalled. Fix this fast — I’ll cover your subpoena if you cover Horn Row.',
    questTemplates: [
      template('the-trumpet-case', 'cleaning', 'Clear the Dressing Room', 'Declutter one messy zone', 'Debris hides case notes and bad investigative luck.', 130, 10, ROSA_BELL_ID),
      template('the-trumpet-case', 'fitness', 'Search Strength Drill', 'Strength routine', 'You extract testimony with muscle and moral grit.', 140, 11, ROSA_BELL_ID),
      template('the-trumpet-case', 'study', 'Blueprint the Search', 'Study or planning session', 'A steady mind reads Noir’s patterns true.', 135, 10, ROSA_BELL_ID),
      template('the-trumpet-case', 'work', 'Case Route Papers', 'Finish one admin or work item', 'Cases fail when manifests fail.', 130, 10, ROSA_BELL_ID),
      template('the-trumpet-case', 'health', 'Booth Recovery', 'Meal + rest hygiene block', 'Hungry detectives miss Noir’s signatures.', 110, 8, ROSA_BELL_ID),
      template('the-trumpet-case', 'social', 'Coordinate the Band Cell', 'Coordinate one shared errand', 'No witness moves alone through Noir’s club.', 115, 9, ROSA_BELL_ID),
      template('the-trumpet-case', 'creative', 'Paint the Case Crest', 'Create/update something expressive', 'Symbols remind detectives what they protect.', 120, 9, ROSA_BELL_ID),
      template('the-trumpet-case', 'errand', 'Find the Subpoena Keys', 'Complete a practical pickup errand', 'The right key at the right hour saves the case.', 125, 10, ROSA_BELL_ID),
    ],
    chapterRewards: [{ id: 'red-room-matchbook-cosmetic', type: 'cosmetic', name: 'Red Room Matchbook' }],
  },
  {
    id: 'midnight-blackmail',
    order: 4,
    title: 'Midnight Blackmail',
    territoryName: "Noir's Private Office",
    mapPosition: { x: 68, y: 28 },
    summary:
      'Vincent Noir locks down his private office — every truth leaves a shadow when exhaustion finds a detective alone with the blackmail vault.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Rosa Bell: Office lockdown. Keep your nerve. Noir hunts fear in velvet and red light — I’ll be on the line if you need a backstage escort.',
    introScene: [
      {
        characterId: VINCENT_NOIR_ID,
        line: 'Files are open, detective. Perfect light to see your leads go unfinished — and your little case file fray at the edges.',
        badge: 'CASE IV',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'They hit at night because they think exhaustion breaks detectives. It won’t break us. Stay on my channel — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'Last clean exit out leaves at midnight. If we slip now, the whole office goes quiet — and quiet detectives get bought cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Rosa Bell: We held the office in the red light of blackmail. Noir’s rattled — and so am I, if I’m honest. The Red Room stage activates at dawn. One clean day decides whether the city’s secrets stay buried. Rest if you can. I’ll call you at first light.',
    failureDialogue:
      'Rosa Bell: Night cycle took its toll. We stand again at first light — and I’ll be on the line with you.',
    questTemplates: [
      template('midnight-blackmail', 'cleaning', 'Office Sweep Protocol', 'Night reset of your key area', 'Order in darkness keeps panic out of the file.', 140, 11, ROSA_BELL_ID),
      template('midnight-blackmail', 'fitness', 'Midnight Office Patrol', 'Evening movement session', 'If your body quits, the case breaks.', 145, 12, ROSA_BELL_ID),
      template('midnight-blackmail', 'study', 'Blackmail Pattern Notes', 'Deep focus study block', 'Noir’s pattern repeats for those who look closely.', 140, 11, ROSA_BELL_ID),
      template('midnight-blackmail', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite club lawyers.', 140, 11, ROSA_BELL_ID),
      template('midnight-blackmail', 'health', 'Nerve Steady Protocol', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky investigative hands.', 120, 9, ROSA_BELL_ID),
      template('midnight-blackmail', 'social', 'Encrypted Briefing', 'Support one teammate/friend', 'Courage travels witness to witness.', 120, 9, ROSA_BELL_ID),
      template('midnight-blackmail', 'creative', 'Case Flare Design', 'Creative micro-session', 'In darkness, even small leads matter.', 125, 9, ROSA_BELL_ID),
      template('midnight-blackmail', 'errand', 'Office Supply Check', 'Complete a practical checklist errand', 'One missing subpoena can end the night.', 130, 10, ROSA_BELL_ID),
    ],
    chapterRewards: [{ id: 'blackmail-breaker-badge', type: 'badge', name: 'Blackmail Breaker' }],
  },
  {
    id: 'last-song-at-red-room',
    order: 5,
    title: 'Last Song at Red Room',
    territoryName: 'Red Room Club · Main Stage',
    mapPosition: { x: 82, y: 14 },
    summary:
      'Vincent Noir’s final set goes live — everyone tells the truth differently, and this is the price of a free city in Grayhaven’s jazz district.',
    dramaticPurpose: 'Resolve the saga with the blackmail network exposed or buried.',
    introDialogue:
      'Rosa Bell: The last song opens at dawn. Noir wants your case closed. We work the stage and keep the truth yours — because every lead we logged cost Case Integrity, and Grayhaven is listening.',
    introScene: [
      {
        characterId: ROSA_BELL_ID,
        line: 'This is the stage that feeds half the city’s secrets. Win here and the blackmail stays exposed. Lose, and Grayhaven trades one cage for another.',
        badge: 'FINALE',
      },
      {
        characterId: VINCENT_NOIR_ID,
        line: 'The last song was always mine, detective. Jazz Club Secrets broke your nerve; I bought the rebuild. Everyone tells the truth differently — today, you pay in full.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: ROSA_BELL_ID,
        line: 'Last lead of the saga. Move like the city depends on you — because it does, and because I didn’t trust you with this file so Noir could bury it.',
        badge: 'LAST LEAD',
      },
    ],
    successDialogue:
      'Rosa Bell: Encore denied. Noir can watch from his velvet booth — but he doesn’t own the truth. Case Integrity cost us plenty. It was worth every verse. You earned the name they’ll whisper after last call: Night Detective.',
    failureDialogue:
      'Rosa Bell: We lost the stage today. The war for Grayhaven’s night scene isn’t over — and the setlist still lies.',
    questTemplates: [
      template('last-song-at-red-room', 'cleaning', 'Purge the Stage Floor', 'Complete full cleaning sweep', 'Noir watches this room at dawn.', 150, 12, ROSA_BELL_ID),
      template('last-song-at-red-room', 'fitness', 'Final Sprint Protocol', 'High-intensity movement session', 'Lawyers catch detectives who slow at the finish.', 155, 12, ROSA_BELL_ID),
      template('last-song-at-red-room', 'study', 'Blackmail Countermeasures', 'Focused study and recap', 'Know the protocol that keeps the truth yours.', 150, 12, ROSA_BELL_ID),
      template('last-song-at-red-room', 'work', 'Final Case Audit', 'Complete one priority work item', 'One clean audit proves the file is yours.', 155, 12, ROSA_BELL_ID),
      template('last-song-at-red-room', 'health', 'Dawn Stamina Protocol', 'Health routine and recovery', 'Steady nerves sign freedom into the record.', 130, 10, ROSA_BELL_ID),
      template('last-song-at-red-room', 'social', 'Rally the Night Network', 'Reach out to your network', 'Collective testimony beats a lone alibi.', 135, 11, ROSA_BELL_ID),
      template('last-song-at-red-room', 'creative', 'Truth Seal Design', 'Creative micro-session', 'Evidence outlasts redactions — if you finish it.', 140, 11, ROSA_BELL_ID),
      template('last-song-at-red-room', 'errand', 'Deliver the Case Seal', 'Finish critical practical errand', 'The seal reaches the stage or Noir wins by default.', 140, 11, ROSA_BELL_ID),
    ],
    chapterRewards: [{ id: 'night-detective-title', type: 'title', name: 'Night Detective' }],
  },
];
