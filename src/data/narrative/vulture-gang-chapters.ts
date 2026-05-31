import {
  ADA_MERCER_ID,
  BRIGGS_ID,
  ELIAS_CROW_ID,
} from '@/data/narrative/vulture-gang-characters';
import { FIRST_WARNING_QUEST_VARIATIONS } from '@/data/narrative/quest-variations/first-warning-variations';
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

const VULTURE_GANG_CHAPTERS_RAW: Chapter[] = [
  {
    id: 'first-warning',
    order: 1,
    title: 'First Warning',
    territoryName: 'Dustfall Gate',
    media: { sceneImageKey: 'dust-and-iron.chapter.01-dustfall-gate' },
    mapPosition: { x: 16, y: 82 },
    summary:
      'The Black Vulture Gang marks Dustfall — a reminder that order is fragile and fear travels faster than law.',
    dramaticPurpose: 'Introduce the threat and force the player to take action.',
    introDialogue:
      'Sheriff Ada Mercer: Deputy, they hung our colors upside down at the gate. Show this town order still means something.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'Deputy — report to the gate. They hung our colors upside down at the saloon. First warning. No speeches — just work.',
        badge: 'CHAPTER I',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Pretty little town. Shame if discipline ran out before sundown. Order is fragile, sheriff — I’m merely pointing at the cracks.',
        badge: 'VILLAIN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Platform’s a mess and the morning freight is late. If supplies stop, fear wins without a single shot fired.',
        badge: 'FIELD REPORT',
      },
    ],
    successDialogue:
      'Sheriff Ada Mercer: Good work. You answered their warning with steel and discipline. But look east — smoke on the warehouse ridge at first light. They weren’t bluffing. Dawn belongs to whoever wakes ready.',
    failureDialogue:
      'Sheriff Ada Mercer: They smell hesitation. Order is fragile, deputy — get back in the saddle before dusk.',
    questTemplates: [
      template('first-warning', 'cleaning', 'Sweep the Saloon Floor', 'Clean kitchen and counters', 'Glass and dust hide a message from the gang.', 110, 8, BRIGGS_ID, FIRST_WARNING_QUEST_VARIATIONS.cleaning),
      template('first-warning', 'fitness', 'Stable Drill', 'Do a quick bodyweight routine', 'A tired deputy cannot outrun an ambush.', 120, 10, ADA_MERCER_ID, FIRST_WARNING_QUEST_VARIATIONS.fitness),
      template('first-warning', 'study', 'Decode the Warning Note', 'Study session with focused notes', 'The gang writes in riddles. Knowledge is your trigger finger.', 125, 9, ADA_MERCER_ID, FIRST_WARNING_QUEST_VARIATIONS.study),
      template('first-warning', 'work', 'Fortify the Ledger', 'Complete one deep work block', 'The town books decide who gets fed and who gets desperate.', 120, 9, ADA_MERCER_ID, FIRST_WARNING_QUEST_VARIATIONS.work),
      template('first-warning', 'health', 'Patch Up at the Clinic', 'Hydrate, meds, and a short recovery break', 'A wounded deputy is easy prey.', 100, 7, BRIGGS_ID, FIRST_WARNING_QUEST_VARIATIONS.health),
      template('first-warning', 'social', 'Rally the Townfolk', 'Send one meaningful check-in message', 'Fear spreads faster than bullets unless someone speaks up.', 105, 7, ADA_MERCER_ID, FIRST_WARNING_QUEST_VARIATIONS.social),
      template('first-warning', 'creative', 'Wanted Poster Draft', 'Create a short design or writing piece', 'Your words shape the town’s courage.', 115, 8, ADA_MERCER_ID, FIRST_WARNING_QUEST_VARIATIONS.creative),
      template('first-warning', 'errand', 'Supply Run at Sundown', 'Complete one pending errand', 'Ammo and bread vanish fast under siege.', 110, 8, BRIGGS_ID, FIRST_WARNING_QUEST_VARIATIONS.errand),
    ],
    chapterRewards: [{ id: 'first-warning-badge', type: 'badge', name: 'First Dustfall Patrol' }],
  },
  {
    id: 'smoke-at-dawn',
    order: 2,
    title: 'Smoke at Dawn',
    territoryName: 'Burnt Warehouse',
    media: { sceneImageKey: 'dust-and-iron.chapter.02-burnt-warehouse' },
    mapPosition: { x: 38, y: 62 },
    summary: 'Raiders strike before sunrise — proof again that order is fragile when the town sleeps.',
    dramaticPurpose: 'Escalate urgency and push consistency under pressure.',
    introDialogue:
      'Sheriff Ada Mercer: Smoke on the horizon. They hit at dawn. We answer before noon — together.',
    introScene: [
      {
        characterId: BRIGGS_ID,
        line: 'Dawn train never came. Smoke on the ridge — they’re cutting our lines before the town wakes.',
        badge: 'CHAPTER II',
      },
      {
        characterId: ADA_MERCER_ID,
        line: 'No panic. We move fast, we move together. You’ve kept pace so far — I expect the same at sunrise.',
        badge: 'ORDERS',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Did you hear that silence at sunrise? That’s the sound of order slipping. I didn’t start the fire — I just stopped pretending the town was safe.',
        badge: 'TAUNT',
      },
    ],
    successDialogue:
      'Sheriff Ada Mercer: Dawn broke in our favor. You held when it counted — I won’t forget that. But Crow’s men were seen on the wagon trail. They snapped an axle once; they’ll try again.',
    failureDialogue:
      'Sheriff Ada Mercer: We lost ground this morning. Reclaim it before nightfall — the warehouse folk are watching.',
    questTemplates: [
      template('smoke-at-dawn', 'cleaning', 'Ashes in the Kitchen', 'Deep clean one neglected area', 'Soot in the air, panic in the room.', 120, 9, BRIGGS_ID),
      template('smoke-at-dawn', 'fitness', 'Chase the Outriders', 'Cardio sprint or brisk walk session', 'Outriders flee fast; your legs decide the chase.', 130, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'study', 'Map the Canyon Routes', 'Focused study block', 'Every page read closes an ambush route.', 130, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'work', 'Morning Dispatch', 'Complete one important work item', 'Delay is a telegram to the enemy.', 125, 10, ADA_MERCER_ID),
      template('smoke-at-dawn', 'health', 'Smoke Recovery', 'Breathing routine and water reset', 'Clear lungs, clear aim.', 105, 8, BRIGGS_ID),
      template('smoke-at-dawn', 'social', 'Warn the Frontier Families', 'Reach out to someone who needs support', 'Warnings save lives before bullets fly.', 110, 8, ADA_MERCER_ID),
      template('smoke-at-dawn', 'creative', 'Dawn Ballad', 'Create a short audio/text/art piece', 'Hope is a weapon too.', 115, 8, ADA_MERCER_ID),
      template('smoke-at-dawn', 'errand', 'Railside Pickup', 'Finish one practical chore outside', 'Supplies arrive under fire.', 120, 9, BRIGGS_ID),
    ],
    chapterRewards: [{ id: 'smoke-at-dawn-title', type: 'title', name: 'Smoke Watcher' }],
  },
  {
    id: 'broken-wagon',
    order: 3,
    title: 'Broken Wagon',
    territoryName: 'Broken Wagon Trail',
    media: { sceneImageKey: 'dust-and-iron.chapter.03-broken-wagon-trail' },
    mapPosition: { x: 54, y: 42 },
    summary: 'A sabotaged wagon stalls critical supplies — order is fragile when hunger joins the gang.',
    dramaticPurpose: 'Shift from reaction to strategic rebuilding.',
    introDialogue:
      'Sheriff Ada Mercer: They snapped the axle and laughed. We rebuild while they watch — and we don’t blink.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'They sabotaged the supply wagon. This isn’t random — they’re starving our nerve. I trust you to hold the trail.',
        badge: 'CHAPTER III',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Axle’s split, cargo’s scattered. I can keep the station alive if you keep your end moving.',
        badge: 'LOGISTICS',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Rebuild all you want. Every delay teaches Dustfall who really keeps the clocks wound. I’m not cruel — I’m honest.',
        badge: 'TAUNT',
      },
    ],
    successDialogue:
      'Sheriff Ada Mercer: Wagon rolling again. They expected panic, found resolve — and found you. But listen: Crow’s riders were seen in Ambush Canyon after dark. The next test won’t wait for sunrise.',
    failureDialogue:
      'Sheriff Ada Mercer: Supplies stalled means spirits stalled. Fix this fast — I’ll cover the platform if you cover the trail.',
    questTemplates: [
      template('broken-wagon', 'cleaning', 'Clear the Wagon Yard', 'Declutter one messy zone', 'Debris hides nails and bad luck.', 130, 10, BRIGGS_ID),
      template('broken-wagon', 'fitness', 'Axle Strength Drill', 'Strength routine', 'You rebuild with muscle and grit.', 140, 11, ADA_MERCER_ID),
      template('broken-wagon', 'study', 'Blueprint the Repair', 'Study or planning session', 'A steady mind sets true wheels.', 135, 10, ADA_MERCER_ID),
      template('broken-wagon', 'work', 'Trade Route Papers', 'Finish one admin or work item', 'Routes fail when papers fail.', 130, 10, ADA_MERCER_ID),
      template('broken-wagon', 'health', 'Camp Recovery', 'Meal + rest hygiene block', 'Hungry deputies miss details.', 110, 8, BRIGGS_ID),
      template('broken-wagon', 'social', 'Crew Coordination', 'Coordinate one shared errand', 'No wagon moves alone.', 115, 9, ADA_MERCER_ID),
      template('broken-wagon', 'creative', 'Paint the Crest', 'Create/update something expressive', 'Symbols remind people what they protect.', 120, 9, ADA_MERCER_ID),
      template('broken-wagon', 'errand', 'Find Spare Parts', 'Complete a practical pickup errand', 'The right part at the right hour saves the run.', 125, 10, BRIGGS_ID),
    ],
    chapterRewards: [{ id: 'broken-wagon-cosmetic', type: 'cosmetic', name: 'Railway Deputy Bandana' }],
  },
  {
    id: 'night-ambush',
    order: 4,
    title: 'Night Ambush',
    territoryName: 'Ambush Canyon',
    media: { sceneImageKey: 'dust-and-iron.chapter.04-ambush-canyon' },
    mapPosition: { x: 70, y: 24 },
    summary: 'The gang attacks under moonlight — order is fragile when exhaustion finds you alone.',
    dramaticPurpose: 'Deliver the darkest moment before the finale.',
    introDialogue:
      'Sheriff Ada Mercer: Lanterns low. Keep your nerve. They hunt fear in the dark — I’ll be on the ridge if you need me.',
    introScene: [
      {
        characterId: ELIAS_CROW_ID,
        line: 'Moon’s up, deputy. Perfect light to see your chores go unfinished — and your sheriff’s little order fray at the edges.',
        badge: 'CHAPTER IV',
      },
      {
        characterId: ADA_MERCER_ID,
        line: 'They hit at night because they think exhaustion breaks people. It won’t break us. Stay close to the line — I mean that.',
        badge: 'STAND FAST',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Last train out leaves at midnight. If we slip now, the whole line goes quiet — and quiet towns get bought cheap.',
        badge: 'MIDNIGHT',
      },
    ],
    successDialogue:
      'Sheriff Ada Mercer: We held the line in moonlight. They’re rattled — and so am I, if I’m honest. High Noon is coming, deputy. One clean day decides whether Dustfall keeps breathing. Rest if you can. I’ll wake you at first bell.',
    failureDialogue:
      'Sheriff Ada Mercer: Night took its toll. We stand again at first light — and I’ll be on the square with you.',
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
    chapterRewards: [{ id: 'night-ambush-badge', type: 'badge', name: 'Ambush Survivor' }],
  },
  {
    id: 'high-noon',
    order: 5,
    title: 'High Noon',
    territoryName: 'High Noon Square',
    media: { sceneImageKey: 'dust-and-iron.chapter.05-high-noon-square' },
    mapPosition: { x: 86, y: 8 },
    summary:
      'Final showdown at High Noon Square — order is fragile one last time, and the whole territory watches.',
    dramaticPurpose: 'Resolve the saga with earned momentum and consequences.',
    introDialogue:
      'Sheriff Ada Mercer: High noon, deputy. One clean day of work decides this town’s future — ride at my side.',
    introScene: [
      {
        characterId: ADA_MERCER_ID,
        line: 'This is it. High noon. The town watches whether discipline or chaos owns Dustfall. I’d rather have you here than half my old posse.',
        badge: 'FINALE',
      },
      {
        characterId: BRIGGS_ID,
        line: 'Platform’s packed, nerves are raw. Finish strong and the rails stay ours — because what comes next costs more than bullets.',
        badge: 'LAST RUN',
      },
      {
        characterId: ELIAS_CROW_ID,
        line: 'Noon light, no shadows to hide in. Let’s see if your legend was real — or if Dustfall finally admits it needs a harder hand.',
        badge: 'SHOWDOWN',
      },
      {
        characterId: BRIGGS_ID,
        line: 'When the square clears — win or lose — find me at the railyard. Silas Vane bought the contracts Crow left bleeding. Progress always costs something.',
        badge: 'WHISPER',
      },
    ],
    successDialogue:
      'Sheriff Ada Mercer: Dustfall stands. The vultures broke against your discipline — and against mine, for trusting you with it. But listen: Briggs telegraphed from the railyard. Crow fled east, yet Silas Vane bought every contract he abandoned. Progress always costs something, deputy. The Iron Railway Company needs a manager who won’t fold. When you’re ready — the line is calling.',
    failureDialogue:
      'Sheriff Ada Mercer: We lost this round, not the frontier. We rise and ride again — and Vane still waits on the rails whether we’re ready or not.',
    questTemplates: [
      template('high-noon', 'cleaning', 'Final Saloon Polish', 'Complete full cleaning sweep', 'The town meets noon in order, not chaos.', 150, 12, BRIGGS_ID),
      template('high-noon', 'fitness', 'Duel Conditioning', 'High-effort workout', 'Your body is your final weapon.', 155, 12, ADA_MERCER_ID),
      template('high-noon', 'study', 'Noon Strategy Brief', 'Focused study and recap', 'Clarity wins faster than panic.', 150, 12, ADA_MERCER_ID),
      template('high-noon', 'work', 'Marshal Directive', 'Complete one priority work item', 'Execution under pressure writes legends.', 150, 12, ADA_MERCER_ID),
      template('high-noon', 'health', 'Steady Hands Protocol', 'Health routine and recovery', 'A calm body sharpens the mind.', 130, 10, BRIGGS_ID),
      template('high-noon', 'social', 'Town Hall Resolve', 'Meaningful social accountability step', 'Nobody wins the frontier alone.', 130, 10, ADA_MERCER_ID),
      template('high-noon', 'creative', 'Victory Chronicle', 'Capture progress creatively', 'Your story becomes the town’s memory.', 135, 10, ADA_MERCER_ID),
      template('high-noon', 'errand', 'Last Bell Supplies', 'Finish critical practical errand', 'Noon waits for no one.', 140, 11, BRIGGS_ID),
    ],
    chapterRewards: [
      {
        id: 'high-noon-story-unlock',
        type: 'storyUnlock',
        name: 'Iron Railway Company',
        unlockTargetId: 'iron-railway-company',
      },
    ],
  },
];

export const VULTURE_GANG_CHAPTERS = enrichSagaChapters(VULTURE_GANG_CHAPTERS_RAW, {
  ...WILD_WEST_VARIATION_PROFILE,
  villainName: 'Elias Crow',
});
