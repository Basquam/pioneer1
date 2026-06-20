import * as Haptics from 'expo-haptics';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

export type HqActionGridItem = {
  key: string;
  icon: string;
  label: string;
  sub?: string;
  primary?: boolean;
  onPress: () => void;
};

type HqActionGridProps = {
  universeId: string;
  items: HqActionGridItem[];
};

export function HqActionGrid({ universeId, items }: HqActionGridProps) {
  const skin = getUniverseSkin(universeId);
  const isProtocol = skin.id === 'neuronet';

  return (
    <View style={styles.wrap}>
      <Text style={[QuestoryTypography.sectionEyebrow, styles.sectionLabel, { color: skin.accentPrimary }]}>
        QUICK ACCESS
      </Text>
      <View style={styles.grid}>
        {items.map((item) => {
          const isPrimary = item.primary === true;
          return (
            <Pressable
              key={item.key}
              onPress={() => {
                void Haptics.selectionAsync();
                item.onPress();
              }}
              style={({ pressed }) => [
                styles.tile,
                {
                  backgroundColor: isPrimary
                    ? `${skin.accentPrimary}30`
                    : isProtocol
                      ? 'rgba(10, 16, 34, 0.96)'
                      : 'rgba(28, 18, 14, 0.96)',
                  opacity: pressed ? 0.86 : 1,
                },
                QuestoryTheme.shadow.soft,
              ]}>
              {isPrimary ? (
                <View style={[styles.primaryRail, { backgroundColor: skin.accentPrimary }]} />
              ) : null}
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor: isPrimary ? `${skin.accentPrimary}44` : `${skin.accentPrimary}22`,
                  },
                ]}>
                <Text style={[styles.icon, { color: skin.accentPrimary }]}>{item.icon}</Text>
              </View>
              <View style={styles.textCol}>
                <Text
                  style={[QuestoryTypography.caption, styles.label, { color: QuestoryTheme.colors.text.primary }]}
                  numberOfLines={1}>
                  {item.label}
                </Text>
                {item.sub ? (
                  <Text
                    style={[QuestoryTypography.caption, styles.sub, { color: QuestoryTheme.colors.text.muted }]}
                    numberOfLines={2}>
                    {item.sub}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginTop: 4, marginBottom: 8, gap: 10 },
  sectionLabel: { letterSpacing: 3, fontSize: 10 },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '47%',
    flexGrow: 1,
    minWidth: '46%',
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 96,
    overflow: 'hidden',
  },
  primaryRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  icon: { fontSize: 20, lineHeight: 24 },
  textCol: { flex: 1, gap: 2, minWidth: 0 },
  label: { letterSpacing: 1, fontSize: 11 },
  sub: { fontSize: 9, lineHeight: 12 },
});
