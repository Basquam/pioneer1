import type { QuestInboxItem, QuestInboxItemStatus, TaskCategory } from '@/types/narrative';

import { suggestTaskCategory } from '@/lib/suggest-task-category';

export const QUEST_INBOX_EMPTY_MESSAGE = 'No loose tasks captured.';

export const MAX_QUEST_INBOX_ITEMS = 100;

const QUICK_CAPTURE_FLAVOR: Record<string, string> = {
  'dust-and-iron': 'Jot it on the bounty board.',
  neuronet: 'Capture the signal before it decays.',
  'neon-ashes': 'Pin the lead before it goes cold.',
};

export function createQuestInboxItemId(): string {
  return `inbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getQuickCaptureFlavor(universeId: string): string {
  return QUICK_CAPTURE_FLAVOR[universeId] ?? QUICK_CAPTURE_FLAVOR['dust-and-iron'];
}

export function createQuestInboxItem(title: string): QuestInboxItem {
  const trimmed = title.trim();
  const suggestedCategory = suggestTaskCategory(trimmed) ?? undefined;

  return {
    id: createQuestInboxItemId(),
    title: trimmed,
    createdAt: new Date().toISOString(),
    status: 'inbox',
    ...(suggestedCategory ? { suggestedCategory } : {}),
  };
}

export function getActiveInboxItems(items: QuestInboxItem[]): QuestInboxItem[] {
  return items
    .filter((item) => item.status === 'inbox')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function captureQuestInboxItem(items: QuestInboxItem[], title: string): QuestInboxItem[] {
  const trimmed = title.trim();
  if (!trimmed) return items;

  return pruneQuestInbox([createQuestInboxItem(trimmed), ...items]);
}

export function captureQuestInboxItemForDate(
  items: QuestInboxItem[],
  title: string,
  targetDate: string,
): QuestInboxItem[] {
  const trimmed = title.trim();
  if (!trimmed) return items;

  const item = {
    ...createQuestInboxItem(trimmed),
    targetDate,
  };

  return pruneQuestInbox([item, ...items]);
}

export function markInboxItemConverted(items: QuestInboxItem[], itemId: string): QuestInboxItem[] {
  return items.map((item) =>
    item.id === itemId && item.status === 'inbox'
      ? { ...item, status: 'converted' as QuestInboxItemStatus }
      : item,
  );
}

export function markInboxItemArchived(items: QuestInboxItem[], itemId: string): QuestInboxItem[] {
  return items.map((item) =>
    item.id === itemId && item.status === 'inbox'
      ? { ...item, status: 'archived' as QuestInboxItemStatus }
      : item,
  );
}

export function findInboxItem(items: QuestInboxItem[], itemId: string): QuestInboxItem | undefined {
  return items.find((item) => item.id === itemId);
}

export function pruneQuestInbox(items: QuestInboxItem[]): QuestInboxItem[] {
  const active = items.filter((item) => item.status === 'inbox');
  const inactive = items
    .filter((item) => item.status !== 'inbox')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, MAX_QUEST_INBOX_ITEMS);

  return [...active, ...inactive].slice(0, MAX_QUEST_INBOX_ITEMS);
}

const TASK_CATEGORIES = new Set<TaskCategory>([
  'cleaning',
  'fitness',
  'study',
  'work',
  'health',
  'social',
  'creative',
  'errand',
]);

const INBOX_STATUSES = new Set<QuestInboxItemStatus>(['inbox', 'converted', 'archived']);

export function sanitizeQuestInboxItem(raw: unknown): QuestInboxItem | null {
  if (!raw || typeof raw !== 'object') return null;

  const item = raw as Record<string, unknown>;
  if (typeof item.id !== 'string' || !item.id.startsWith('inbox-')) return null;
  if (typeof item.title !== 'string' || item.title.trim().length === 0) return null;
  if (typeof item.createdAt !== 'string' || item.createdAt.length === 0) return null;
  if (typeof item.status !== 'string' || !INBOX_STATUSES.has(item.status as QuestInboxItemStatus)) {
    return null;
  }

  const sanitized: QuestInboxItem = {
    id: item.id,
    title: item.title.trim(),
    createdAt: item.createdAt,
    status: item.status as QuestInboxItemStatus,
  };

  if (
    typeof item.suggestedCategory === 'string' &&
    TASK_CATEGORIES.has(item.suggestedCategory as TaskCategory)
  ) {
    sanitized.suggestedCategory = item.suggestedCategory as TaskCategory;
  }

  if (typeof item.targetDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.targetDate)) {
    sanitized.targetDate = item.targetDate;
  }

  return sanitized;
}

export function sanitizeQuestInbox(raw: unknown): QuestInboxItem[] {
  if (!Array.isArray(raw)) return [];

  return pruneQuestInbox(
    raw
      .map((entry) => sanitizeQuestInboxItem(entry))
      .filter((entry): entry is QuestInboxItem => entry !== null),
  );
}
