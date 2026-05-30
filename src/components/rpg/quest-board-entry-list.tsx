import type { QuestBoardEntry } from '@/lib/quest-chain';
import { QuestCard } from '@/components/rpg/quest-card';
import { QuestChainGroup } from '@/components/rpg/quest-chain-group';

type QuestBoardEntryListProps = {
  entries: QuestBoardEntry[];
  startIndex?: number;
};

export function QuestBoardEntryList({
  entries,
  startIndex = 0,
}: QuestBoardEntryListProps) {
  return (
    <>
      {entries.map((entry, index) => {
        const cardIndex = startIndex + index;
        if (entry.kind === 'chain') {
          return (
            <QuestChainGroup
              key={entry.parent.id}
              parent={entry.parent}
              children={entry.children}
              startIndex={cardIndex}
            />
          );
        }

        return (
          <QuestCard
            key={entry.quest.id}
            quest={entry.quest}
            index={cardIndex}
          />
        );
      })}
    </>
  );
}
