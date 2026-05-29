import {
  convertTaskToUserQuest,
  type CreateUserQuestOptions,
} from '@/lib/convert-task-to-quest';
import { generateStarterTaskTitle } from '@/lib/two-minute-starter';
import type { Chapter, Saga, TaskCategory, Universe, UserQuest } from '@/types/narrative';

export type QuestPackItem = {
  id: string;
  originalTitle: string;
  category: TaskCategory;
  options?: CreateUserQuestOptions;
};

export type QuestPack = {
  id: string;
  title: string;
  description: string;
  items: QuestPackItem[];
};

export type QuestPackPreviewItem = {
  packItemId: string;
  originalTitle: string;
  category: TaskCategory;
  narrativeTitle: string;
  options?: CreateUserQuestOptions;
};

const LOW_ENERGY_STARTER = generateStarterTaskTitle('Do one 2-minute task', 'health');

export const QUEST_PACKS: QuestPack[] = [
  {
    id: 'morning-reset',
    title: 'Morning Reset',
    description: 'A gentle start — hydrate, clear one surface, then pick your priority.',
    items: [
      { id: 'morning-1', originalTitle: 'Drink water', category: 'health' },
      { id: 'morning-2', originalTitle: 'Clear one surface', category: 'cleaning' },
      { id: 'morning-3', originalTitle: "Review today's priorities", category: 'work' },
    ],
  },
  {
    id: 'deep-work-sprint',
    title: 'Deep Work Sprint',
    description: 'Set up, clear space, then commit to a short focused sprint.',
    items: [
      { id: 'deep-1', originalTitle: 'Open the main document', category: 'work' },
      { id: 'deep-2', originalTitle: 'Clear workspace', category: 'cleaning' },
      { id: 'deep-3', originalTitle: 'Work for 10 minutes', category: 'work' },
    ],
  },
  {
    id: 'study-session',
    title: 'Study Session',
    description: 'Open notes, review one topic, and prep your desk.',
    items: [
      { id: 'study-1', originalTitle: 'Open notes', category: 'study' },
      { id: 'study-2', originalTitle: 'Review one topic', category: 'study' },
      { id: 'study-3', originalTitle: 'Prepare desk', category: 'cleaning' },
    ],
  },
  {
    id: 'clean-room-run',
    title: 'Clean Room Run',
    description: 'Three small wins — surface, laundry, trash.',
    items: [
      { id: 'clean-1', originalTitle: 'Clear one visible surface', category: 'cleaning' },
      { id: 'clean-2', originalTitle: 'Put laundry away', category: 'cleaning' },
      { id: 'clean-3', originalTitle: 'Take trash out', category: 'errand' },
    ],
  },
  {
    id: 'low-energy-recovery',
    title: 'Low Energy Recovery',
    description: 'Tiny moves when energy is low — no pressure.',
    items: [
      { id: 'recovery-1', originalTitle: 'Drink water', category: 'health' },
      {
        id: 'recovery-2',
        originalTitle: 'Do one 2-minute task',
        category: 'health',
        options: { starterTaskTitle: LOW_ENERGY_STARTER, riskLevel: 'low' },
      },
      { id: 'recovery-3', originalTitle: 'Clear one small thing', category: 'cleaning' },
    ],
  },
];

export function getQuestPackById(packId: string): QuestPack | undefined {
  return QUEST_PACKS.find((pack) => pack.id === packId);
}

export function previewQuestPack(
  pack: QuestPack,
  universe: Universe,
  saga: Saga,
  chapter: Chapter,
  recentQuests: UserQuest[] = [],
): QuestPackPreviewItem[] {
  const workingQuests = [...recentQuests];

  return pack.items.map((item) => {
    const converted = convertTaskToUserQuest(
      item.originalTitle,
      item.category,
      universe,
      saga,
      chapter,
      workingQuests,
    );

    workingQuests.push({
      ...converted,
      id: `preview-${item.id}`,
      isCompleted: false,
    });

    return {
      packItemId: item.id,
      originalTitle: item.originalTitle,
      category: item.category,
      narrativeTitle: converted.narrativeTitle,
      options: item.options,
    };
  });
}

export function packItemsToCreateInputs(
  pack: QuestPack,
  selectedItemIds: Set<string>,
): Array<{ originalTitle: string; category: TaskCategory; options?: CreateUserQuestOptions }> {
  return pack.items
    .filter((item) => selectedItemIds.has(item.id))
    .map((item) => ({
      originalTitle: item.originalTitle,
      category: item.category,
      options: item.options,
    }));
}
