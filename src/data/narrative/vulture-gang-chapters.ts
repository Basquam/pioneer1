import {
  ADA_MERCER_ID,
  BRIGGS_ID,
  ELIAS_CROW_ID,
} from '@/data/narrative/vulture-gang-characters';
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

export const VULTURE_GANG_CHAPTERS: Chapter[] = [
  {
    id: 'first-warning',
    order: 1,
    title: 'First Warning',
    summary: 'The Black Vulture Gang marks your town and tests your resolve.',
    dramaticPurpose: 'Introduce the threat and force the player to take action.',
    introDialogue: 'Sheriff Ada Mercer: Deputy, the vultures are circling. Show this town we do not fold.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'Deputy — they hung our colors upside down at the saloon. This is their first warning.',
        badge: 'CHAPTER I',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Pretty little town. Shame if discipline ran out before sundown.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Station platform’s a mess. If supplies stop, fear wins without a single shot.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue: 'Sheriff Ada Mercer: Good work. You answered their warning with steel and discipline.',
    failureDialogue: 'Sheriff Ada Mercer: They smell hesitation. Get back in the saddle before dusk.',
    questTemplates: [
      template('first-warning', 'cleaning', 'Sweep the Saloon Floor', 'Clean kitchen and counters', 'Glass and dust hide a message from the gang.', 110, 8, BRIGGS_ID),
      template('first-warning', 'fitness', 'Stable Drill', 'Do a quick bodyweight routine', 'A tired deputy cannot outrun an ambush.', 120, 10, ADA_MERCER_ID),
      template('first-warning', 'study', 'Decode the Warning Note', 'Study session with focused notes', 'The gang writes in riddles. Knowledge is your trigger finger.', 125, 9, ADA_MERCER_ID),
      template('first-warning', 'work', 'Fortify the Ledger', 'Complete one deep work block', 'The town books decide who gets fed and who gets desperate.', 120, 9, ADA_MERCER_ID),
      template('first-warning', 'health', 'Patch Up at the Clinic', 'Hydrate, meds, and a short recovery break', 'A wounded deputy is easy prey.', 100, 7, BRIGGS_ID),
      template('first-warning', 'social', 'Rally the Townfolk', 'Send one meaningful check-in message', 'Fear spreads faster than bullets unless someone speaks up.', 105, 7, ADA_MERCER_ID),
      template('first-warning', 'creative', 'Wanted Poster Draft', 'Create a short design or writing piece', 'Your words shape the town’s courage.', 115, 8, ADA_MERCER_ID),
      template('first-warning', 'errand', 'Supply Run at Sundown', 'Complete one pending errand', 'Ammo and bread vanish fast under siege.', 110, 8, BRIGGS_ID),
    ],
  },
  {
    id: 'smoke-at-dawn',
    order: 2,
    title: 'Smoke at Dawn',
    summary: 'Raiders strike before sunrise while the town still sleeps.',
    dramaticPurpose: 'Escalate urgency and push consistency under pressure.',
    introDialogue: 'Sheriff Ada Mercer: Smoke on the horizon. They hit at dawn. We answer before noon.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Dawn train never came. Smoke on the ridge — they’re cutting our lines.',
        badge: 'CHAPTER II',
      },
      {
        characterId: ADA_MERCER_ID,
        line: 'No panic. We move fast, we move together. Every chore done is a barricade.',
        badge: 'ORDERS',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Did you hear that? Silence at sunrise. That’s the sound of you falling behind.',
        badge: 'TAUNT',
      },
    ],
    successDialogue: 'Sheriff Ada Mercer: Dawn broke in our favor. Keep this pace and they panic.',
    failureDialogue: 'Sheriff Ada Mercer: We lost ground this morning. Reclaim it before nightfall.',
    questTemplates: [
      template('smoke-at-dawn', 'cleaning', 'Ashes in the Kitchen', 'Deep clean one neglected area', 'Soot in the air, panic in the room.', 120, 9, BRIGGS_ID),
      template('smoke-at-dawn', 'fitness', 'Chase the Outriders', 'Cardio sprint or brisk walk session', 'Outriders flee fast; your legs decide the chase.', 130, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'study', 'Map the Canyon Routes', 'Focused study block', 'Every page read closes an ambush route.', 130, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'work', 'Morning Dispatch', 'Ship one important work task', 'Delay is a telegram to the enemy.', 125, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'health', 'Smoke Recovery', 'Breathing routine and water reset', 'Clear lungs, clear aim.', 105, 8, BRIGGS_ID),
      template('smoke-at-dawn', 'social', 'Warn the Frontier Families', 'Reach out to someone who needs support', 'Warnings save lives before bullets fly.', 110, 8, ADA_MERCER_ID),
      template('smoke-at-dawn', 'creative', 'Dawn Ballad', 'Create a short audio/text/art piece', 'Hope is a weapon too.', 115, 8, ADA_MERCER_ID),
      template('smoke-at-dawn', 'errand', 'Railside Pickup', 'Finish one practical chore outside', 'Supplies arrive under fire.', 120, 9, BRIGGS_ID),
    ],
  },
  {
    id: 'broken-wagon',
    order: 3,
    title: 'Broken Wagon',
    summary: 'A sabotaged wagon stalls critical supplies for the town.',
    dramaticPurpose: 'Shift from reaction to strategic rebuilding.',
    introDialogue: 'Sheriff Ada Mercer: They snapped the axle and laughed. We rebuild while they watch.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'They sabotaged the supply wagon. This isn’t random — they’re starving our nerve.',
        badge: 'CHAPTER III',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Axle’s split, cargo’s scattered. I can keep the station alive if you keep your end moving.',
        badge: 'LOGISTICS',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Rebuild all you want. Every delay puts another nail in Dustfall’s coffin.',
        badge: 'TAUNT',
      },
    ],
    successDialogue: 'Sheriff Ada Mercer: Wagon rolling again. They expected panic, found resolve.',
    failureDialogue: 'Sheriff Ada Mercer: Supplies stalled means spirits stalled. Fix this fast.',
    questTemplates: [
      template('broken-wagon', 'cleaning', 'Clear the Wagon Yard', 'Declutter one messy zone', 'Debris hides nails and bad luck.', 130, 10, BRIGGS_ID),
      template('broken-wagon', 'fitness', 'Axle Strength Drill', 'Strength routine', 'You rebuild with muscle and grit.', 140, 11, ADA_MERCER_ID),
      template('broken-wagon', 'study', 'Blueprint the Repair', 'Study or planning session', 'A steady mind sets true wheels.', 135, 10, ADA_MERCER_ID),
      template('broken-wagon', 'work', 'Trade Route Papers', 'Complete one admin/work task', 'Routes fail when papers fail.', 130, 10, ADA_MERCER_ID),
      template('broken-wagon', 'health', 'Camp Recovery', 'Meal + rest hygiene block', 'Hungry deputies miss details.', 110, 8, BRIGGS_ID),
      template('broken-wagon', 'social', 'Crew Coordination', 'Coordinate one shared task', 'No wagon moves alone.', 115, 9, ADA_MERCER_ID),
      template('broken-wagon', 'creative', 'Paint the Crest', 'Create/update something expressive', 'Symbols remind people what they protect.', 120, 9, ADA_MERCER_ID),
      template('broken-wagon', 'errand', 'Find Spare Parts', 'Complete a practical pickup errand', 'The right part at the right hour saves the run.', 125, 10, BRIGGS_ID),
    ],
  },
  {
    id: 'night-ambush',
    order: 4,
    title: 'Night Ambush',
    summary: 'The gang attacks under moonlight, aiming to break morale.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue: 'Sheriff Ada Mercer: Lanterns low. Keep your nerve. They hunt fear in the dark.',
    introScene: [
      {
        characterId: ELIAS_CROW_ID,
        line: 'Moon’s up, deputy. Perfect light to see your chores go unfinished.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: ADA_MERCER_ID,
        line: 'They hit at night because they think exhaustion breaks people. It won’t break us.',
        badge: 'STAND FAST',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Last train out leaves at midnight. If we slip now, the whole line goes quiet.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue: 'Sheriff Ada Mercer: We held the line in moonlight. They’re rattled now.',
    failureDialogue: 'Sheriff Ada Mercer: Night took its toll. We stand again at first light.',
    questTemplates: [
      template('night-ambush', 'cleaning', 'Lantern Line Sweep', 'Night reset of your key area', 'Order in darkness keeps panic out.', 140, 11, BRIGGS_ID),
      template('night-ambush', 'fitness', 'Midnight Patrol', 'Evening movement session', 'If your body quits, the line breaks.', 145, 12, ADA_MERCER_ID),
      template('night-ambush', 'study', 'Ambush Pattern Notes', 'Deep focus study block', 'Their pattern repeats for those who look closely.', 140, 11, ADA_MERCER_ID),
      template('night-ambush', 'work', 'Night Ledger Lockdown', 'Finish one hard work deliverable', 'Loose ends invite raiders.', 140, 11, ADA_MERCER_ID),
      template('night-ambush', 'health', 'Nerve Steady Ritual', 'Sleep prep / mindfulness reset', 'Steady breath beats shaky hands.', 120, 9, BRIGGS_ID),
      template('night-ambush', 'social', 'Campfire Briefing', 'Support one teammate/friend', 'Courage travels voice to voice.', 120, 9, ADA_MERCER_ID),
      template('night-ambush', 'creative', 'Signal Flare Design', 'Creative micro-session', 'In darkness, even small lights matter.', 125, 9, ADA_MERCER_ID),
      template('night-ambush', 'errand', 'Moonlit Supply Check', 'Complete a practical checklist errand', 'One missing item can end the night.', 130, 10, BRIGGS_ID),
    ],
  },
  {
    id: 'high-noon',
    order: 5,
    title: 'High Noon',
    summary: 'Final showdown as the gang pushes all-in for control of Dustfall.',
    dramaticPurpose: 'Resolve the saga with earned momentum and consequences.',
    introDialogue: 'Sheriff Ada Mercer: High noon, deputy. One clean day of work decides this town’s future.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'This is it. High noon. The town watches whether discipline or chaos owns Dustfall.',
        badge: 'FINALE',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Platform’s packed, nerves are raw. Finish strong and the rails stay ours.',
        badge: 'LAST RUN',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Noon light, no shadows to hide in. Let’s see if your legend was real.',
        badge: 'SHOWDOWN',
      },
    ],
    successDialogue: 'Sheriff Ada Mercer: Dustfall stands. The vultures broke against your discipline.',
    failureDialogue: 'Sheriff Ada Mercer: We lost this round, not the frontier. We rise and ride again.',
    questTemplates: [
      template('high-noon', 'cleaning', 'Final Saloon Polish', 'Complete full cleaning sweep', 'The town meets noon in order, not chaos.', 150, 12, BRIGGS_ID),
      template('high-noon', 'fitness', 'Duel Conditioning', 'High-effort workout', 'Your body is your final weapon.', 155, 12, ADA_MERCER_ID),
      template('high-noon', 'study', 'Noon Strategy Brief', 'Focused study and recap', 'Clarity wins faster than panic.', 150, 12, ADA_MERCER_ID),
      template('high-noon', 'work', 'Marshal Directive', 'Ship priority work mission', 'Execution under pressure writes legends.', 150, 12, ADA_MERCER_ID),
      template('high-noon', 'health', 'Steady Hands Protocol', 'Health routine and recovery', 'A calm body sharpens the mind.', 130, 10, BRIGGS_ID),
      template('high-noon', 'social', 'Town Hall Resolve', 'Meaningful social accountability step', 'Nobody wins the frontier alone.', 130, 10, ADA_MERCER_ID),
      template('high-noon', 'creative', 'Victory Chronicle', 'Capture progress creatively', 'Your story becomes the town’s memory.', 135, 10, ADA_MERCER_ID),
      template('high-noon', 'errand', 'Last Bell Supplies', 'Finish critical practical errand', 'Noon waits for no one.', 140, 11, BRIGGS_ID),
    ],
  },
];
