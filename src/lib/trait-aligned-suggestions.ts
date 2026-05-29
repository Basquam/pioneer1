import { getIdentityTraitMeta } from '@/lib/identity-votes';
import type { IdentityTraitKey, TaskCategory } from '@/types/narrative';

export const TRAIT_ALIGNED_SECTION_TITLE = "Suggested for who you're becoming";

const TRAIT_SUGGESTION_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Choose a trail that proves your badge.',
  neuronet: 'Choose an operation that strengthens your signal.',
  'neon-ashes': 'Choose a lead that proves your case.',
};

export const TRAIT_TO_SUGGESTED_CATEGORIES: Record<IdentityTraitKey, TaskCategory[]> = {
  organized: ['cleaning', 'errand'],
  resilient: ['fitness', 'health'],
  curious: ['study', 'creative'],
  reliable: ['work', 'errand'],
  selfRespecting: ['health', 'cleaning'],
  connected: ['social'],
  builder: ['creative', 'work'],
  prepared: ['errand', 'work', 'cleaning'],
};

export type TraitAlignedSuggestion = {
  traitKey: IdentityTraitKey;
  title: string;
  category: TaskCategory;
  reason: string;
  enableStarter: boolean;
};

type TraitSuggestionTemplate = Omit<TraitAlignedSuggestion, 'traitKey'>;

const TRAIT_SUGGESTION_POOL: Record<IdentityTraitKey, TraitSuggestionTemplate[]> = {
  organized: [
    {
      title: 'Clear one visible surface',
      category: 'cleaning',
      reason: 'Order starts where your eyes land.',
      enableStarter: true,
    },
    {
      title: 'Put away one pile',
      category: 'cleaning',
      reason: 'One cleared corner makes the next move obvious.',
      enableStarter: true,
    },
    {
      title: 'Handle one errand on your list',
      category: 'errand',
      reason: 'Small follow-through keeps chaos from spreading.',
      enableStarter: false,
    },
  ],
  resilient: [
    {
      title: 'Take a short walk',
      category: 'fitness',
      reason: 'Showing up again is how resilience gets recorded.',
      enableStarter: true,
    },
    {
      title: 'Do a 5-minute stretch',
      category: 'fitness',
      reason: 'A small reset keeps you in the fight.',
      enableStarter: true,
    },
    {
      title: 'Return to one healthy habit',
      category: 'health',
      reason: 'Resilience is built in the comeback, not the streak.',
      enableStarter: true,
    },
  ],
  curious: [
    {
      title: 'Read for 10 minutes',
      category: 'study',
      reason: 'Curiosity compounds one page at a time.',
      enableStarter: true,
    },
    {
      title: 'Review one note or article',
      category: 'study',
      reason: 'Gathering intel keeps your mind sharp.',
      enableStarter: true,
    },
    {
      title: 'Sketch or brainstorm one idea',
      category: 'creative',
      reason: 'Exploration turns into evidence when you capture it.',
      enableStarter: true,
    },
  ],
  reliable: [
    {
      title: 'Review one important work item',
      category: 'work',
      reason: 'A reliable person reduces uncertainty before it grows.',
      enableStarter: false,
    },
    {
      title: 'Reply to one pending message',
      category: 'work',
      reason: 'Closing loops is how others learn they can count on you.',
      enableStarter: true,
    },
    {
      title: 'Complete one small errand',
      category: 'errand',
      reason: 'Follow-through on the little things builds trust.',
      enableStarter: false,
    },
  ],
  selfRespecting: [
    {
      title: 'Drink water',
      category: 'health',
      reason: 'Taking care of your body is evidence too.',
      enableStarter: true,
    },
    {
      title: 'Prepare a simple meal',
      category: 'health',
      reason: 'Self-respect shows up in how you fuel yourself.',
      enableStarter: false,
    },
    {
      title: 'Tidy your personal space',
      category: 'cleaning',
      reason: 'Your environment deserves the same care you do.',
      enableStarter: true,
    },
  ],
  connected: [
    {
      title: 'Check in with someone you care about',
      category: 'social',
      reason: 'Bonds stay strong when you reach out first.',
      enableStarter: true,
    },
    {
      title: 'Send a message you have been putting off',
      category: 'social',
      reason: 'Connection grows through small acts of showing up.',
      enableStarter: true,
    },
  ],
  builder: [
    {
      title: 'Work on a creative project for 15 minutes',
      category: 'creative',
      reason: 'Builders leave something behind every session.',
      enableStarter: true,
    },
    {
      title: 'Draft one paragraph or sketch',
      category: 'creative',
      reason: 'Creation starts before it feels finished.',
      enableStarter: true,
    },
    {
      title: 'Make progress on one build task',
      category: 'work',
      reason: 'Shipping a piece proves you make things real.',
      enableStarter: false,
    },
  ],
  prepared: [
    {
      title: 'Pack what you need for tomorrow',
      category: 'errand',
      reason: 'Prepared people borrow calm from yesterday.',
      enableStarter: false,
    },
    {
      title: 'Prep materials for your next task',
      category: 'work',
      reason: 'Future-you moves faster when today-you sets the table.',
      enableStarter: true,
    },
    {
      title: 'Reset one space for tomorrow',
      category: 'cleaning',
      reason: 'A clear launchpad makes the next day easier.',
      enableStarter: true,
    },
  ],
};

export function getTraitSuggestionFlavor(universeId: string): string {
  return TRAIT_SUGGESTION_FLAVOR[universeId] ?? TRAIT_SUGGESTION_FLAVOR['dust-and-iron'];
}

export function getTraitAlignedSuggestions(
  desiredTraits: IdentityTraitKey[],
  maxCount = 3,
): TraitAlignedSuggestion[] {
  if (desiredTraits.length === 0) return [];

  const usedTitles = new Set<string>();
  const results: TraitAlignedSuggestion[] = [];

  for (const traitKey of desiredTraits) {
    if (results.length >= maxCount) break;

    const pool = TRAIT_SUGGESTION_POOL[traitKey] ?? [];
    const template = pool.find((entry) => !usedTitles.has(entry.title)) ?? pool[0];
    if (!template) continue;

    usedTitles.add(template.title);
    results.push({
      traitKey,
      ...template,
    });
  }

  return results;
}

export function formatTraitSuggestionLabel(traitKey: IdentityTraitKey): string {
  return getIdentityTraitMeta(traitKey).label;
}
