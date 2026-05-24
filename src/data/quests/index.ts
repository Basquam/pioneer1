import type { Quest } from '@/types/quest';
import type { ThemeId } from '@/types/theme';

const QUEST_TEMPLATES: Record<
  ThemeId,
  [Omit<Quest, 'id' | 'themeId'>, Omit<Quest, 'id' | 'themeId'>, Omit<Quest, 'id' | 'themeId'>]
> = {
  'wild-west': [
    {
      realTask: 'Clean kitchen',
      questTitle: 'Saloon Showdown — Scrub the Bar Before Sundown',
      questSubtitle: 'Poisoned stew pots and shattered glass. Reclaim the hearth.',
      xpReward: 120,
      threatReduction: 34,
      completionLine: 'The saloon gleams. One less hideout for the Black Vultures.',
      category: 'chore',
    },
    {
      realTask: 'Laundry',
      questTitle: 'High Noon Hang — Save the Town\'s Colors',
      questSubtitle: 'The gang hung your shirts as a warning. Wash the shame away.',
      xpReward: 100,
      threatReduction: 33,
      completionLine: 'Fresh laundry on the line. The Vultures lose face in Dustfall.',
      category: 'chore',
    },
    {
      realTask: 'Organize desk',
      questTitle: 'Sheriff\'s Ledger — Decode the Gang\'s Plans',
      questSubtitle: 'Papers scattered like spent shells. Order reveals their next move.',
      xpReward: 150,
      threatReduction: 33,
      completionLine: 'Desk clear. The gang\'s grip on Dustfall weakens.',
      category: 'study',
    },
  ],
  noir: [
    {
      realTask: 'Clean kitchen',
      questTitle: 'The Greasy Spoon — Clean the Crime Scene Kitchen',
      questSubtitle: 'Blood isn\'t ketchup. Scrub before the Syndicate returns.',
      xpReward: 120,
      threatReduction: 34,
      completionLine: 'Kitchen spotless. One less alibi for the Crown Syndicate.',
      category: 'chore',
    },
    {
      realTask: 'Laundry',
      questTitle: 'Midnight Laundry — Wash Out the Evidence',
      questSubtitle: 'Stains tell stories. Erase them before dawn breaks.',
      xpReward: 100,
      threatReduction: 33,
      completionLine: 'Clean threads. The Syndicate\'s trail runs colder.',
      category: 'chore',
    },
    {
      realTask: 'Organize desk',
      questTitle: 'Case Files — Connect the Dots on Your Desk',
      questSubtitle: 'Chaos on the desk means chaos in the streets.',
      xpReward: 150,
      threatReduction: 33,
      completionLine: 'Files aligned. The Crown Syndicate\'s pattern emerges.',
      category: 'study',
    },
  ],
  cyberpunk: [
    {
      realTask: 'Clean kitchen',
      questTitle: 'Neon Kitchen Op — Purge the Slum Feed Cache',
      questSubtitle: 'Black ICE planted malware in your food synth.',
      xpReward: 120,
      threatReduction: 34,
      completionLine: 'Cache purged. Omnicorp loses a surveillance node.',
      category: 'chore',
    },
    {
      realTask: 'Laundry',
      questTitle: 'Data Scrub — Launder Your Digital Footprint',
      questSubtitle: 'Your clothes carry tracking threads. Cut them.',
      xpReward: 100,
      threatReduction: 33,
      completionLine: 'Footprint scrubbed. Black ICE blind in sector 7.',
      category: 'chore',
    },
    {
      realTask: 'Organize desk',
      questTitle: 'Deck Sort — Recompile Your Mission Stack',
      questSubtitle: 'Fragmented tasks corrupt your neural queue.',
      xpReward: 150,
      threatReduction: 33,
      completionLine: 'Stack recompiled. Grid resistance rising.',
      category: 'study',
    },
  ],
  zombie: [
    {
      realTask: 'Clean kitchen',
      questTitle: 'Mess Hall Fortification — Clear the Feeding Ground',
      questSubtitle: 'Rot attracts rot. Clean before the Horde smells dinner.',
      xpReward: 120,
      threatReduction: 34,
      completionLine: 'Mess hall secure. Hollows lose interest in Haven-7.',
      category: 'chore',
    },
    {
      realTask: 'Laundry',
      questTitle: 'Decon Run — Purge Contamination from Gear',
      questSubtitle: 'Spores cling to fabric. Wash or become bait.',
      xpReward: 100,
      threatReduction: 33,
      completionLine: 'Gear decontaminated. Perimeter whispers quiet.',
      category: 'chore',
    },
    {
      realTask: 'Organize desk',
      questTitle: 'Supply Manifest — Catalog What Keeps You Alive',
      questSubtitle: 'Disorder kills faster than teeth.',
      xpReward: 150,
      threatReduction: 33,
      completionLine: 'Manifest complete. Haven-7\'s odds just improved.',
      category: 'study',
    },
  ],
  'space-horror': [
    {
      realTask: 'Clean kitchen',
      questTitle: 'Galley Protocol — Sterilize the Bloom Spores',
      questSubtitle: 'Organic matter feeds the Entity. Purge the galley.',
      xpReward: 120,
      threatReduction: 34,
      completionLine: 'Galley sterile. Bloom retreat from sector C.',
      category: 'chore',
    },
    {
      realTask: 'Laundry',
      questTitle: 'Suit Maintenance — Scrub the Contamination Seals',
      questSubtitle: 'Micro-spores in fabric. One tear dooms the crew.',
      xpReward: 100,
      threatReduction: 33,
      completionLine: 'Suits sealed. Entity loses a vector on Orpheus.',
      category: 'chore',
    },
    {
      realTask: 'Organize desk',
      questTitle: 'Captain\'s Log — Restore Command Order',
      questSubtitle: 'Chaos in records opens doors chaos shouldn\'t.',
      xpReward: 150,
      threatReduction: 33,
      completionLine: 'Log restored. Orpheus systems stabilize.',
      category: 'study',
    },
  ],
};

export function getQuestsForTheme(themeId: ThemeId): Quest[] {
  const templates = QUEST_TEMPLATES[themeId];
  const keys = ['a', 'b', 'c'] as const;
  return templates.map((t, i) => ({
    ...t,
    id: `${themeId}-${keys[i]}`,
    themeId,
  }));
}

export function getAllQuestKeys(): string[] {
  return (Object.keys(QUEST_TEMPLATES) as ThemeId[]).flatMap((themeId) =>
    getQuestsForTheme(themeId).map((q) => q.id),
  );
}
