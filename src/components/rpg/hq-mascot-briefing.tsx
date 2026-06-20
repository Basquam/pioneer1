import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MascotGuideFromContext } from '@/components/rpg/mascot-guide-card';
import { useGame } from '@/hooks/use-game';
import type { MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';

type HqMascotBriefingProps = {
  contextId: MascotGuideContextId;
  onAction?: () => void;
};

export function HqMascotBriefing({ contextId, onAction }: HqMascotBriefingProps) {
  const { activeUniverse } = useGame();
  const skin = getUniverseSkin(activeUniverse.id);

  return (
    <Animated.View entering={FadeInDown.duration(480).delay(200)} style={styles.wrap}>
      <View style={[styles.transmissionRail, { backgroundColor: skin.accentSecondary }]} />
      <View style={[styles.frame, { borderColor: skin.surfaceBorder, backgroundColor: 'rgba(13, 10, 20, 0.94)' }]}>
        <View style={styles.transmissionHeader}>
          <View style={[styles.signalDot, { backgroundColor: skin.accentPrimary }]} />
          <Text style={[QuestoryTypography.caption, { color: skin.accentPrimary, letterSpacing: 3 }]}>
            INCOMING TRANSMISSION
          </Text>
        </View>
        <MascotGuideFromContext
          contextId={contextId}
          screenName="/(game)/hq"
          onAction={onAction}
          presentation="transmission"
        />
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 8, position: 'relative' },
  transmissionRail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 3,
    zIndex: 1,
  },
  frame: {
    borderWidth: 1,
    marginLeft: 6,
    overflow: 'hidden',
  },
  transmissionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 4,
  },
  signalDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});
