import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { TerritoryNode, TERRITORY_NODE_WIDTH } from '@/components/rpg/territory-node';
import type { TerritoryNode as TerritoryNodeData } from '@/lib/territory-map';
import type { UniversePalette } from '@/types/narrative';

type TerritoryMapProps = {
  nodes: TerritoryNodeData[];
  palette: UniversePalette;
  onNodePress: (node: TerritoryNodeData) => void;
};

const MAP_HEIGHT = 440;

function Connector({
  from,
  to,
  mapWidth,
  palette,
  reclaimed,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  mapWidth: number;
  palette: UniversePalette;
  reclaimed: boolean;
}) {
  const x1 = (from.x / 100) * mapWidth;
  const y1 = (from.y / 100) * MAP_HEIGHT;
  const x2 = (to.x / 100) * mapWidth;
  const y2 = (to.y / 100) * MAP_HEIGHT;
  const distance = Math.hypot(x2 - x1, y2 - y1);
  const angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;

  return (
    <View
      style={[
        styles.connector,
        {
          left: x1,
          top: y1,
          width: distance,
          backgroundColor: reclaimed ? `${palette.gold}88` : `${palette.villainGlow}55`,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

export function TerritoryMap({ nodes, palette, onNodePress }: TerritoryMapProps) {
  const [mapWidth, setMapWidth] = useState(0);
  const sorted = [...nodes].sort((a, b) => a.chapter.order - b.chapter.order);

  const handleLayout = (event: LayoutChangeEvent) => {
    setMapWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[styles.canvas, { borderColor: palette.panelBorder, backgroundColor: `${palette.night}cc` }]}>
      {mapWidth > 0 &&
        sorted.slice(0, -1).map((node, index) => {
          const next = sorted[index + 1];
          return (
            <Connector
              key={`${node.chapter.id}-line`}
              from={node.chapter.mapPosition}
              to={next.chapter.mapPosition}
              mapWidth={mapWidth}
              palette={palette}
              reclaimed={node.status === 'completed'}
            />
          );
        })}

      {sorted.map((node) => (
        <View
          key={node.chapter.id}
          style={[
            styles.nodeWrap,
            {
              left: `${node.chapter.mapPosition.x}%`,
              top: `${node.chapter.mapPosition.y}%`,
              marginLeft: -TERRITORY_NODE_WIDTH / 2,
              marginTop: -44,
            },
          ]}>
          <TerritoryNode
            chapter={node.chapter}
            status={node.status}
            palette={palette}
            onPress={() => onNodePress(node)}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  canvas: {
    height: MAP_HEIGHT,
    borderWidth: 1,
    position: 'relative',
    overflow: 'hidden',
    transform: [{ skewX: '-1deg' }],
  },
  connector: {
    position: 'absolute',
    height: 2,
    transformOrigin: 'left center',
  },
  nodeWrap: {
    position: 'absolute',
    width: TERRITORY_NODE_WIDTH,
  },
});
