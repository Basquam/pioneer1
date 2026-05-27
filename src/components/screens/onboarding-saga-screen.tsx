import { type Href, router } from 'expo-router';
import { ScrollView, StyleSheet, Text, Pressable, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { GlowButton } from '@/components/rpg/glow-button';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { SectionHeader } from '@/components/rpg/section-header';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';

export function OnboardingSagaScreen() {
  const { activeUniverse, activeSaga, selectSaga } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <Animated.View entering={FadeInDown.duration(500)}>
        <SectionHeader eyebrow="SAGA SELECTION" title="CHOOSE YOUR ENEMY" />
      </Animated.View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {activeUniverse.sagas.map((saga, index) => {
          const selected = activeSaga.id === saga.id;
          const locked = saga.status === 'locked';
          return (
            <Animated.View entering={FadeInDown.delay(index * 80).springify()} key={saga.id}>
              <Pressable
                disabled={locked}
                onPress={() => selectSaga(saga.id)}
                style={[
                  styles.card,
                  {
                    backgroundColor: activeUniverse.palette.panel,
                    borderColor: selected ? activeUniverse.palette.gold : activeUniverse.palette.panelBorder,
                    opacity: locked ? 0.55 : 1,
                  },
                ]}>
                <Text style={[styles.title, { color: activeUniverse.palette.bone }]}>{saga.title}</Text>
                <Text style={[styles.subtitle, { color: activeUniverse.palette.fog }]}>
                  {locked ? 'LOCKED FOR FUTURE UPDATE' : saga.summary}
                </Text>
                <View style={styles.row}>
                  <Text style={[styles.villain, { color: activeUniverse.palette.villainGlow }]}>
                    {saga.villainName}
                  </Text>
                  {selected && (
                    <Text style={[styles.selected, { color: activeUniverse.palette.gold }]}>SELECTED</Text>
                  )}
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </ScrollView>

      <GlowButton
        label="BEGIN PROLOGUE"
        hint="MEET SHERIFF MORROW"
        onPress={() => router.push('/onboarding/intro' as Href)}
      />
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, marginVertical: 12 },
  card: {
    padding: 16,
    borderWidth: 2,
    marginBottom: 12,
    gap: 6,
    transform: [{ skewX: '-2deg' }],
  },
  title: { fontFamily: GameFonts.ui, fontSize: 18, letterSpacing: 2 },
  subtitle: { fontFamily: GameFonts.displayRegular, fontSize: 13, fontStyle: 'italic', lineHeight: 19 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  villain: { fontFamily: GameFonts.uiSemi, fontSize: 10, letterSpacing: 2 },
  selected: { fontFamily: GameFonts.ui, fontSize: 10, letterSpacing: 2 },
});
