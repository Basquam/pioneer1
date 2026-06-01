import {
  ADA_MERCER_ID,
  BRIGGS_ID,
} from '@/data/narrative/vulture-gang-characters';
import type { SagaEndingVariant } from '@/types/narrative';

export const VULTURE_GANG_ENDING_VARIANTS: SagaEndingVariant[] = [
  {
    id: 'vulture-gang-recovery',
    label: 'Recovery Ending',
    priority: 70,
    conditionType: 'recovery',
    title: 'Dustfall Still Stands',
    summary:
      'Not every day was clean. But you came back, and that was enough to keep the town alive.',
    dialogueOverride:
      'Ada Mercer: The trail was rough some days. Dustfall still stands because you kept returning.',
    rewardFlavorLine: 'The town remembers who came back.',
    universeFlavorLine: 'Order holds when someone returns.',
  },
  {
    id: 'vulture-gang-high-noon',
    label: 'High Noon Ending',
    priority: 60,
    conditionType: 'high-noon',
    title: 'High Noon Answered',
    summary:
      'When the square went silent, Dustfall already knew who would stand there.',
    dialogueOverride:
      'Ada Mercer: When the square went quiet, Dustfall already knew who would stand there.',
    rewardFlavorLine: 'High noon answered.',
    universeFlavorLine: 'The frontier remembers courage under pressure.',
  },
  {
    id: 'vulture-gang-loyal',
    label: 'Loyal Ending',
    priority: 50,
    conditionType: 'loyal',
    title: 'Trusted Under the Badge',
    summary:
      'You did not just clear bounties. You earned the trust of the people beside you.',
    dialogueOverride:
      'Ada Mercer: You did not just clear bounties. You earned the trust at my side.',
    rewardFlavorLine: 'Trusted under the badge.',
    universeFlavorLine: 'Allies remember who stood with them.',
  },
  {
    id: 'vulture-gang-reliable',
    label: 'Reliable Ending',
    priority: 40,
    conditionType: 'reliable',
    title: 'The Deputy Who Showed Up',
    summary:
      'Dustfall learned that order is built by someone who returns when needed.',
    dialogueOverride:
      'Ada Mercer: Dustfall learned that order is built by someone who returns when needed.',
    rewardFlavorLine: 'The deputy who showed up.',
    universeFlavorLine: 'Reliability keeps a frontier town standing.',
  },
  {
    id: 'vulture-gang-organized',
    label: 'Organized Ending',
    priority: 40,
    conditionType: 'organized',
    title: 'The Town Put Back Together',
    summary:
      'Dustfall did not only survive. It was put back in order, one small duty at a time.',
    dialogueOverride:
      'Ada Mercer: Dustfall did not only survive. It was put back in order, one duty at a time.',
    rewardFlavorLine: 'The town put back together.',
    universeFlavorLine: 'Small order holds back chaos.',
  },
  {
    id: 'vulture-gang-resilient',
    label: 'Resilient Ending',
    priority: 40,
    conditionType: 'resilient',
    title: 'The One Who Returned',
    summary:
      'The trail was hard, but you returned enough times for Dustfall to believe again.',
    dialogueOverride:
      'Ada Mercer: The trail was hard, but you returned enough times for Dustfall to believe again.',
    rewardFlavorLine: 'The one who returned.',
    universeFlavorLine: 'Resilience keeps the town alive.',
  },
  {
    id: 'vulture-gang-default',
    label: 'Default Ending',
    priority: 0,
    conditionType: 'default',
    title: 'Dustfall Holds',
    summary:
      'The Vulture Gang is broken, but the frontier remembers who showed up.',
    rewardFlavorLine: 'Dustfall holds.',
    universeFlavorLine: 'The town stands.',
  },
];

/** Character ids checked for the loyal ending variant per saga. */
export const SAGA_LOYAL_CHARACTER_IDS: Record<string, string[]> = {
  'vulture-gang': [ADA_MERCER_ID, BRIGGS_ID],
};

export const SAGA_ENDING_VARIANTS_BY_SAGA_ID: Record<string, SagaEndingVariant[]> = {
  'vulture-gang': VULTURE_GANG_ENDING_VARIANTS,
};

export function getSagaEndingVariants(sagaId: string): SagaEndingVariant[] {
  return SAGA_ENDING_VARIANTS_BY_SAGA_ID[sagaId] ?? [];
}

export function getLoyalCharacterIdsForSaga(sagaId: string): string[] {
  return SAGA_LOYAL_CHARACTER_IDS[sagaId] ?? [];
}
