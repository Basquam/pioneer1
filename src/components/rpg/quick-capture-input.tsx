import * as Haptics from 'expo-haptics';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { getQuickCaptureFlavor } from '@/lib/quest-inbox';

type QuickCaptureInputProps = {
  variant?: 'briefing' | 'compact';
};

export function QuickCaptureInput({ variant = 'briefing' }: QuickCaptureInputProps) {
  const { activeUniverse, captureInboxTask } = useGame();
  const { palette } = activeUniverse;
  const [title, setTitle] = useState('');

  const handleCapture = () => {
    const trimmed = title.trim();
    if (!trimmed) return;

    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    captureInboxTask(trimmed);
    setTitle('');
  };

  return (
    <View style={[styles.wrapper, variant === 'compact' && styles.wrapperCompact]}>
      <Text style={[styles.label, { color: palette.gold }]}>QUICK CAPTURE</Text>
      <Text style={[styles.flavor, { color: palette.fog }]}>{getQuickCaptureFlavor(activeUniverse.id)}</Text>
      <View style={styles.row}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Write a task before you forget…"
          placeholderTextColor={`${palette.fog}88`}
          returnKeyType="done"
          onSubmitEditing={handleCapture}
          style={[
            styles.input,
            { color: palette.bone, borderColor: palette.panelBorder, backgroundColor: palette.night },
          ]}
        />
        <Pressable
          onPress={handleCapture}
          disabled={!title.trim()}
          style={[
            styles.captureButton,
            {
              borderColor: palette.gold,
              backgroundColor: title.trim() ? palette.primary : palette.panel,
              opacity: title.trim() ? 1 : 0.6,
            },
          ]}>
          <Text style={[styles.captureButtonText, { color: palette.bone }]}>CAPTURE</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
    paddingTop: 4,
  },
  wrapperCompact: {
    paddingTop: 0,
  },
  label: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 2,
  },
  flavor: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 15,
    fontStyle: 'italic',
  },
  row: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontFamily: GameFonts.ui,
    fontSize: 14,
    minHeight: 44,
  },
  captureButton: {
    borderWidth: 1,
    paddingHorizontal: 12,
    justifyContent: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  captureButtonText: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.5,
  },
});
