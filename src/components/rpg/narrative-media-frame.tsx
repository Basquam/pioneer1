import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, type ReactNode } from 'react';
import {
  StyleSheet,
  View,
  type ImageSourcePropType,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type NarrativeScrimVariant = 'bottom' | 'top' | 'full' | 'none';

type NarrativeMediaFrameProps = {
  source: ImageSourcePropType | null | undefined;
  height?: number;
  aspectRatio?: number;
  scrim?: NarrativeScrimVariant;
  borderRadius?: number;
  children?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<ViewStyle>;
  fallback?: ReactNode;
};

function getScrimColors(variant: NarrativeScrimVariant): [string, string, ...string[]] {
  switch (variant) {
    case 'full':
      return ['rgba(0,0,0,0.45)', 'rgba(0,0,0,0.78)'];
    case 'top':
      return ['rgba(0,0,0,0.78)', 'rgba(0,0,0,0.35)', 'transparent'];
    case 'bottom':
      return ['transparent', 'rgba(0,0,0,0.35)', 'rgba(0,0,0,0.82)'];
    default:
      return ['transparent', 'transparent'];
  }
}

function getScrimLocations(variant: NarrativeScrimVariant): [number, number, ...number[]] | undefined {
  switch (variant) {
    case 'full':
      return [0, 1];
    case 'top':
      return [0, 0.45, 1];
    case 'bottom':
      return [0, 0.45, 1];
    default:
      return undefined;
  }
}

export function NarrativeMediaFrame({
  source,
  height = 120,
  aspectRatio,
  scrim = 'bottom',
  borderRadius = 0,
  children,
  contentStyle,
  style,
  fallback,
}: NarrativeMediaFrameProps) {
  const [failed, setFailed] = useState(false);

  if (!source || failed) {
    if (fallback) {
      return (
        <View style={[styles.fallback, { height, borderRadius }, style]}>
          {fallback}
        </View>
      );
    }
    if (children) {
      return <View style={[contentStyle, style]}>{children}</View>;
    }
    return null;
  }

  const containerStyle = aspectRatio
    ? [styles.container, { aspectRatio, borderRadius }, style]
    : [styles.container, { height, borderRadius }, style];

  return (
    <View style={containerStyle}>
      <Image
        source={source}
        style={StyleSheet.absoluteFill}
        contentFit="cover"
        onError={() => setFailed(true)}
        transition={200}
      />
      {scrim !== 'none' && (
        <LinearGradient
          colors={getScrimColors(scrim)}
          locations={getScrimLocations(scrim)}
          style={StyleSheet.absoluteFill}
        />
      )}
      {children ? <View style={[styles.content, contentStyle]}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    width: '100%',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  fallback: {
    overflow: 'hidden',
    width: '100%',
  },
});
