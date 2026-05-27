import { ScrollView, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { MapNode } from '@/components/rpg/map-node';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function MapScreen() {
  const { activeUniverse, activeSaga, playerProgress, selectSaga } = useGame();

  return (
    <ScreenShell edges={['top']} padded={false}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.pad}>
          <SectionHeader eyebrow="SAGA MAP" title="FRONTIER INTELLIGENCE" />
          <Text style={styles.hint}>
            Tap a saga to deploy your focus for the next chapter push.
          </Text>
          {activeUniverse.sagas.map((saga) => {
            const influence = playerProgress.villainInfluenceBySaga[saga.id] ?? 100;
            return (
              <MapNode
                key={saga.id}
                saga={saga}
                palette={activeUniverse.palette}
                active={activeSaga.id === saga.id}
                influence={influence}
                onPress={() => selectSaga(saga.id)}
              />
            );
          })}
        </Animated.View>
      </ScrollView>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 100 },
  pad: { paddingHorizontal: 20, gap: 10, paddingTop: 8 },
  hint: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 14,
    color: '#a8a29e',
    fontStyle: 'italic',
    marginBottom: 8,
  },
});
