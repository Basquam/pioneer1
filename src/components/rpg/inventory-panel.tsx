import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  getInventoryItemDefinition,
  INVENTORY_RARITY_LABEL,
  INVENTORY_SLOT_LABEL,
} from '@/constants/inventory-items';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getEquippedLoadout, getInventorySourceLabel, listOwnedInventoryItems, unequipInventorySlot } from '@/lib/inventory';
import type { ItemSlot, PlayerInventoryItem } from '@/types/narrative';

const SLOTS: ItemSlot[] = ['badge', 'tool', 'charm', 'cosmetic'];

type InventoryPanelProps = {
  palette: {
    panel: string;
    panelBorder: string;
    bone: string;
    fog: string;
    gold: string;
    accent: string;
    primary: string;
    night: string;
  };
};

export function InventoryPanel({ palette }: InventoryPanelProps) {
  const { activeUniverse, playerProgress, equipInventoryItemForUniverse, unequipInventorySlotForUniverse, markInventoryViewed } =
    useGame();
  const owned = listOwnedInventoryItems(playerProgress);
  const loadout = getEquippedLoadout(playerProgress, activeUniverse.id);

  useEffect(() => {
    if (owned.some((entry) => entry.isNew)) {
      markInventoryViewed();
    }
  }, [markInventoryViewed, owned]);

  if (owned.length === 0) {
    return (
      <Text style={[styles.empty, { color: palette.fog }]}>
        Clear chapters and return on hard days to earn items that support your quests.
      </Text>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.gold }]}>EQUIPPED · {activeUniverse.name}</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map((slot) => {
            const itemId = loadout[slot];
            const definition = itemId ? getInventoryItemDefinition(itemId) : null;
            return (
              <View
                key={slot}
                style={[styles.slotCard, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
                <Text style={[styles.slotName, { color: palette.fog }]}>{INVENTORY_SLOT_LABEL[slot]}</Text>
                {definition ? (
                  <>
                    <ItemIcon definition={definition} palette={palette} compact />
                    <Text style={[styles.itemTitle, { color: palette.bone }]} numberOfLines={2}>
                      {definition.name}
                    </Text>
                    <Pressable
                      onPress={() => {
                        void Haptics.selectionAsync();
                        unequipInventorySlotForUniverse(activeUniverse.id, slot);
                      }}
                      hitSlop={8}>
                      <Text style={[styles.unequip, { color: palette.accent }]}>Unequip</Text>
                    </Pressable>
                  </>
                ) : (
                  <Text style={[styles.emptySlot, { color: palette.fog }]}>Empty</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: palette.gold }]}>OWNED ITEMS</Text>
        {owned.map((entry) => (
          <OwnedItemRow
            key={entry.itemId}
            entry={entry}
            palette={palette}
            universeId={activeUniverse.id}
            isEquipped={Object.values(loadout).includes(entry.itemId)}
            onEquip={(slot) => equipInventoryItemForUniverse(activeUniverse.id, slot, entry.itemId)}
          />
        ))}
      </View>
    </View>
  );
}

function OwnedItemRow({
  entry,
  palette,
  universeId,
  isEquipped,
  onEquip,
}: {
  entry: PlayerInventoryItem;
  palette: InventoryPanelProps['palette'];
  universeId: string;
  isEquipped: boolean;
  onEquip: (slot: ItemSlot) => void;
}) {
  const definition = getInventoryItemDefinition(entry.itemId);
  if (!definition) return null;

  const canEquip =
    !definition.universeId || definition.universeId === universeId;

  return (
    <View style={[styles.itemRow, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <ItemIcon definition={definition} palette={palette} />
      <View style={styles.itemCopy}>
        <View style={styles.itemHeader}>
          <Text style={[styles.itemName, { color: palette.bone }]}>{definition.name}</Text>
          {entry.isNew ? (
            <Text style={[styles.newBadge, { color: palette.gold }]}>NEW</Text>
          ) : null}
        </View>
        <Text style={[styles.rarity, { color: palette.accent }]}>
          {INVENTORY_RARITY_LABEL[definition.rarity]} · {INVENTORY_SLOT_LABEL[definition.slot]}
        </Text>
        <Text style={[styles.effect, { color: palette.fog }]}>{definition.effectDescription}</Text>
        <Text style={[styles.flavor, { color: palette.fog }]}>{definition.flavorText}</Text>
        <Text style={[styles.source, { color: palette.fog }]}>
          {getInventorySourceLabel(entry.source)}
        </Text>
        {canEquip && !isEquipped ? (
          <Pressable
            onPress={() => {
              void Haptics.selectionAsync();
              onEquip(definition.slot);
            }}
            style={[styles.equipButton, { borderColor: palette.gold }]}>
            <Text style={[styles.equipLabel, { color: palette.bone }]}>Equip</Text>
          </Pressable>
        ) : isEquipped ? (
          <Text style={[styles.equippedHint, { color: palette.gold }]}>Equipped</Text>
        ) : null}
      </View>
    </View>
  );
}

function ItemIcon({
  definition,
  palette,
  compact = false,
}: {
  definition: NonNullable<ReturnType<typeof getInventoryItemDefinition>>;
  palette: InventoryPanelProps['palette'];
  compact?: boolean;
}) {
  const size = compact ? 28 : 36;
  const rarityColor =
    definition.rarity === 'legendary'
      ? palette.gold
      : definition.rarity === 'epic'
        ? palette.accent
        : definition.rarity === 'rare'
          ? palette.primary
          : palette.panelBorder;

  return (
    <View
      style={[
        styles.icon,
        {
          width: size,
          height: size,
          borderColor: rarityColor,
          backgroundColor: `${palette.primary}44`,
        },
      ]}>
      <Text style={[styles.iconLetter, { color: palette.bone, fontSize: compact ? 12 : 14 }]}>
        {definition.name.slice(0, 1)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 12 },
  section: { gap: 8 },
  sectionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  slotGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    borderWidth: 1,
    padding: 8,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  slotName: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.2,
  },
  itemTitle: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    lineHeight: 15,
  },
  emptySlot: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    fontStyle: 'italic',
  },
  unequip: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.8,
  },
  itemRow: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    flexDirection: 'row',
    transform: [{ skewX: '-2deg' }],
  },
  icon: {
    borderWidth: 1,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  iconLetter: {
    fontFamily: GameFonts.uiSemi,
  },
  itemCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemName: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    flex: 1,
  },
  newBadge: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1,
  },
  rarity: {
    fontFamily: GameFonts.ui,
    fontSize: 9,
    letterSpacing: 0.6,
  },
  effect: {
    fontFamily: GameFonts.ui,
    fontSize: 10,
    lineHeight: 14,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
  source: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 0.8,
  },
  equipButton: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 2,
  },
  equipLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
  },
  equippedHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1,
  },
  empty: {
    fontFamily: GameFonts.ui,
    fontSize: 12,
    lineHeight: 18,
  },
});
