import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, View } from 'react-native';

import { CinematicEmptyState } from '@/components/rpg/cinematic-empty-state';
import { ScreenShell } from '@/components/rpg/screen-shell';
import { useGame } from '@/hooks/use-game';

export function StoryRecoveryScreen() {
  const { restoreDefaultStory } = useGame();

  return (
    <ScreenShell edges={['top', 'bottom']}>
      <LinearGradient
        colors={['#050308', '#1a0a12', '#0c0610']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>
        <CinematicEmptyState
          title="Story state got lost."
          message="Your XP, rewards, and quest history are kept safe. Restore the default Dust & Iron saga to continue."
          primaryLabel="Restore Default Saga"
          onPrimaryPress={restoreDefaultStory}
        />
      </View>
    </ScreenShell>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
});
