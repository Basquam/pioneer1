import { useState } from 'react';
import { LayoutChangeEvent, StyleSheet, View } from 'react-native';

import { TerritoryNode, TERRITORY_NODE_WIDTH } from '@/components/rpg/territory-node';
import { ScanlineOverlay } from '@/components/rpg/visual-theme-overlay';
import { skewTransform } from '@/constants/universe-visual-theme';
import { useUniverseVisualTheme } from '@/hooks/use-universe-visual-theme';
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
  holographic,
}: {
  from: { x: number; y: number };
  to: { x: number; y: number };
  mapWidth: number;
  palette: UniversePalette;
  reclaimed: boolean;
  holographic: boolean;
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
          backgroundColor: reclaimed
            ? `${holographic ? palette.accent : palette.gold}88`
            : `${holographic ? palette.primary : palette.villainGlow}55`,
          transform: [{ rotate: `${angle}deg` }],
        },
      ]}
    />
  );
}

export function TerritoryMap({ nodes, palette, onNodePress }: TerritoryMapProps) {
  const visualTheme = useUniverseVisualTheme();
  const [mapWidth, setMapWidth] = useState(0);
  const sorted = [...nodes].sort((a, b) => a.chapter.order - b.chapter.order);

  const handleLayout = (event: LayoutChangeEvent) => {
    setMapWidth(event.nativeEvent.layout.width);
  };

  return (
    <View
      onLayout={handleLayout}
      style={[
        styles.canvas,
        {
          borderColor: visualTheme.panelUsesHolographic ? palette.accent : palette.panelBorder,
          backgroundColor: visualTheme.panelUsesHolographic ? `${palette.void}ee` : `${palette.night}cc`,
          transform: skewTransform(visualTheme.mapSkew),
        },
      ]}>
      {visualTheme.mapShowGrid && (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          {Array.from({ length: 12 }, (_, row) =>
            Array.from({ length: 8 }, (_, col) => (
              <View
                key={`${row}-${col}`}
                style={{
                  position: 'absolute',
                  left: `${col * 14}%`,
                  top: `${row * 9}%`,
                  width: 1,
                  height: 1,
                  backgroundColor: palette.accent,
                  opacity: 0.12,
                }}
              />
            )),
          )}
        </View>
      )}
      {visualTheme.showScanlines && <ScanlineOverlay color={palette.accent} lineCount={24} />}
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
              holographic={visualTheme.panelUsesHolographic}
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
