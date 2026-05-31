import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { getChapterRewardImage } from '@/lib/narrative-media';
import { REWARD_TYPE_LABELS } from '@/lib/reward-unlocks';
import type { ChapterReward, ChapterRewardType, UniversePalette } from '@/types/narrative';

type ChapterRewardBadgeProps = {
  reward: ChapterReward;
  palette: UniversePalette;
  size?: 'sm' | 'md';
};

function rewardFallbackGlyph(type: ChapterRewardType): string {
  switch (type) {
    case 'badge':
      return '★';
    case 'title':
      return 'T';
    case 'cosmetic':
      return '◆';
    case 'storyUnlock':
      return '▶';
    default:
      return '★';
  }
}

export function ChapterRewardBadge({ reward, palette, size = 'md' }: ChapterRewardBadgeProps) {
  const dim = size === 'sm' ? 44 : 64;
  const rewardImage = getChapterRewardImage(reward);
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = rewardImage && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [reward.id]);

  return (
    <View
      style={[
        styles.frame,
        {
          width: dim,
          height: dim,
          backgroundColor: palette.ink,
          borderColor: palette.gold,
        },
      ]}>
      {showImage ? (
        <>
          <Image
            source={rewardImage}
            style={StyleSheet.absoluteFill}
            contentFit="contain"
            onError={() => setImageFailed(true)}
            transition={150}
          />
          <LinearGradient
            colors={['rgba(0,0,0,0.08)', 'rgba(0,0,0,0.28)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </>
      ) : (
        <View style={styles.fallback}>
          <Text style={[styles.glyph, { color: palette.gold, fontSize: size === 'sm' ? 18 : 24 }]}>
            {rewardFallbackGlyph(reward.type)}
          </Text>
          <Text style={[styles.fallbackLabel, { color: palette.fog }]} numberOfLines={1}>
            {REWARD_TYPE_LABELS[reward.type]}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderWidth: 1,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fallback: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingHorizontal: 4 },
  glyph: { lineHeight: 24 },
  fallbackLabel: {
    fontSize: 7,
    letterSpacing: 1,
    textAlign: 'center',
  },
});
