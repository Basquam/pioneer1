import { StyleSheet, View } from 'react-native';

import { QuestCard } from '@/components/rpg/quest-card';
import type { BoardQuest } from '@/types/narrative';

type QuestChainGroupProps = {
  parent: BoardQuest;
  children: BoardQuest[];
  startIndex: number;
};

export function QuestChainGroup({ parent, children, startIndex }: QuestChainGroupProps) {
  return (
    <View style={styles.group}>
      <QuestCard quest={parent} index={startIndex} />
      <View style={styles.childList}>
        {children.map((child, childIndex) => (
          <View key={child.id} style={styles.childWrap}>
            <QuestCard quest={child} index={startIndex + childIndex + 1} variant="chain-child" />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: 0,
  },
  childList: {
    marginTop: -4,
    paddingLeft: 14,
    gap: 0,
  },
  childWrap: {
    marginBottom: 0,
  },
});
