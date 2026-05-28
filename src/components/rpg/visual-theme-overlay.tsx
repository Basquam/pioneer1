import { StyleSheet, View } from 'react-native';

type ScanlineOverlayProps = {
  color: string;
  lineCount?: number;
};

export function ScanlineOverlay({ color, lineCount = 48 }: ScanlineOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: lineCount }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: index * 8,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: color,
            opacity: index % 3 === 0 ? 0.08 : 0.04,
          }}
        />
      ))}
    </View>
  );
}

type GridDotOverlayProps = {
  color: string;
  accentColor: string;
};

export function GridDotOverlay({ color, accentColor }: GridDotOverlayProps) {
  const dots = Array.from({ length: 36 }, (_, index) => ({
    id: index,
    x: (index * 47) % 100,
    y: (index * 31) % 100,
    accent: index % 5 === 0,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {dots.map((dot) => (
        <View
          key={dot.id}
          style={{
            position: 'absolute',
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            width: dot.accent ? 2 : 1,
            height: dot.accent ? 2 : 1,
            borderRadius: 1,
            backgroundColor: dot.accent ? accentColor : color,
            opacity: dot.accent ? 0.45 : 0.2,
          }}
        />
      ))}
    </View>
  );
}

type HolographicPanelChromeProps = {
  accentColor: string;
  secondaryColor: string;
};

export function HolographicPanelChrome({ accentColor, secondaryColor }: HolographicPanelChromeProps) {
  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: accentColor,
          opacity: 0.85,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: secondaryColor,
          opacity: 0.35,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          width: 1,
          backgroundColor: accentColor,
          opacity: 0.25,
        }}
      />
    </>
  );
}
