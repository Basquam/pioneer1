import type { ImageSourcePropType } from 'react-native';

import type { AppMascotId } from '@/types/narrative';

export type MascotFraming = 'half' | 'full';

export type MascotMood = 'neutral' | 'happy' | 'approve' | 'inviting' | 'sad';

const SASHA_HALF: Record<MascotMood, ImageSourcePropType> = {
  neutral: require('@/assets/images/mascots/sasha/half/sasha-neutral-half.png'),
  happy: require('@/assets/images/mascots/sasha/half/sasha-inviting-half.png'),
  approve: require('@/assets/images/mascots/sasha/half/sasha-approve-half.png'),
  inviting: require('@/assets/images/mascots/sasha/half/sasha-inviting-half.png'),
  sad: require('@/assets/images/mascots/sasha/half/sasha-sad-half.png'),
};

const MARCUS_HALF: Record<MascotMood, ImageSourcePropType> = {
  neutral: require('@/assets/images/mascots/marcus/half/marcus-neutral-half.png'),
  happy: require('@/assets/images/mascots/marcus/half/marcus-happy-half.png'),
  approve: require('@/assets/images/mascots/marcus/half/marcus-approves-half.png'),
  inviting: require('@/assets/images/mascots/marcus/half/marcus-happy-half.png'),
  sad: require('@/assets/images/mascots/marcus/half/marcus-sad-half.png'),
};

const SASHA_FULL: Partial<Record<MascotMood, ImageSourcePropType>> = {
  neutral: require('@/assets/images/mascots/sasha/full/sasha-neutral-full.png'),
};

const MARCUS_FULL: Partial<Record<MascotMood, ImageSourcePropType>> = {
  neutral: require('@/assets/images/mascots/marcus/full/marcus-neutral-full.png'),
};

export function resolveMascotImageSource(
  mascotId: AppMascotId,
  mood: MascotMood = 'neutral',
  framing: MascotFraming = 'half',
): ImageSourcePropType {
  if (framing === 'full') {
    const fullMap = mascotId === 'sasha' ? SASHA_FULL : MARCUS_FULL;
    return fullMap[mood] ?? fullMap.neutral ?? (mascotId === 'sasha' ? SASHA_HALF.neutral : MARCUS_HALF.neutral);
  }

  const halfMap = mascotId === 'sasha' ? SASHA_HALF : MARCUS_HALF;
  return halfMap[mood] ?? halfMap.neutral;
}
