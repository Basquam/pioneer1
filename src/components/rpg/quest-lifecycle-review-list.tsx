import { StyleSheet, View } from 'react-native';

import type { QuestBoardEntry } from '@/lib/quest-chain';
import { QuestCard } from '@/components/rpg/quest-card';
import { QuestChainGroup } from '@/components/rpg/quest-chain-group';
import { QuestLifecycleActions } from '@/components/rpg/quest-lifecycle-actions';
import type { UniversePalette } from '@/types/narrative';

type QuestLifecycleReviewListProps = {
  entries: QuestBoardEntry[];
  palette: UniversePalette;
  startIndex?: number;
};

export function QuestLifecycleReviewList({
  entries,
  palette,
  startIndex = 0,
}: QuestLifecycleReviewListProps) {
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
          <View key={entry.quest.id} style={styles.entry}>
            <QuestCard quest={entry.quest} index={cardIndex} />
            <QuestLifecycleActions questId={entry.quest.id} palette={palette} />
          </View>
        );
      })}
    </>
  );
}

const styles = StyleSheet.create({
  entry: {
    gap: 8,
    marginBottom: 4,
  },
});
