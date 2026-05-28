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

type RainGlassPanelChromeProps = {
  creamColor: string;
  redColor: string;
  goldColor: string;
};

/** Frosted rain-glass panel edge — cream highlight, deep red base, muted gold accent. */
export function RainGlassPanelChrome({ creamColor, redColor, goldColor }: RainGlassPanelChromeProps) {
  return (
    <>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: creamColor,
          opacity: 0.55,
        }}
      />
      <View
        style={{
          position: 'absolute',
          top: 1,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: goldColor,
          opacity: 0.28,
        }}
      />
      <View
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: redColor,
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
          backgroundColor: creamColor,
          opacity: 0.18,
        }}
      />
    </>
  );
}

type RainStreakOverlayProps = {
  color: string;
  streakCount?: number;
};

/** Subtle vertical rain streaks for noir ambience. */
export function RainStreakOverlay({ color, streakCount = 28 }: RainStreakOverlayProps) {
  const streaks = Array.from({ length: streakCount }, (_, index) => ({
    id: index,
    left: (index * 17) % 100,
    heightRatio: 0.4 + (index % 5) * 0.18,
    opacity: 0.04 + (index % 4) * 0.02,
    width: index % 3 === 0 ? 1 : 0.5,
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {streaks.map((streak) => (
        <View
          key={streak.id}
          style={{
            position: 'absolute',
            top: 0,
            left: `${streak.left}%` as `${number}%`,
            width: streak.width,
            bottom: `${(1 - streak.heightRatio) * 100}%` as `${number}%`,
            backgroundColor: color,
            opacity: streak.opacity,
          }}
        />
      ))}
    </View>
  );
}

type TypewriterTextureOverlayProps = {
  color: string;
  lineCount?: number;
};

/** Fine horizontal grain — typewriter paper / case-file texture. */
export function TypewriterTextureOverlay({ color, lineCount = 64 }: TypewriterTextureOverlayProps) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {Array.from({ length: lineCount }, (_, index) => (
        <View
          key={index}
          style={{
            position: 'absolute',
            top: index * 6,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: color,
            opacity: index % 4 === 0 ? 0.05 : 0.025,
          }}
        />
      ))}
    </View>
  );
}
