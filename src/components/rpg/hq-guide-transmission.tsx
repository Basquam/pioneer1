import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useGame } from '@/hooks/use-game';
import { trackAnalyticsOnce } from '@/lib/analytics/analytics-dedupe';
import type { MascotId } from '@/lib/analytics/analytics-types';
import { trackMascotTipSeen } from '@/lib/analytics/questory-analytics';
import { getMascotPreference } from '@/lib/app-mascot-coach';
import { resolveMascotImageSource } from '@/lib/mascot-assets';
import { getMascotGuideCopy, type MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
import type { AppMascotId, MascotPreference } from '@/types/narrative';

function shouldShowGuideForPreference(preference: MascotPreference, mascot: AppMascotId): boolean {
  if (preference === 'off') return false;
  if (preference === 'sasha') return mascot === 'sasha';
  if (preference === 'marcus') return mascot === 'marcus';
  return true;
}

type HqGuideTransmissionProps = {
  contextId: MascotGuideContextId;
  onAction?: () => void;
};

export function HqGuideTransmission({ contextId, onAction }: HqGuideTransmissionProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isProtocol = skin.id === 'neuronet';
  const copy = getMascotGuideCopy(contextId);
  const preference = getMascotPreference(playerProgress);
  const trackedRef = useRef(false);

  const directiveLabel = copy.mascot === 'sasha' ? 'SASHA DIRECTIVE' : 'MARCUS NOTE';
  const shouldShow = shouldShowGuideForPreference(preference, copy.mascot);
  const shouldShowImage = preference !== 'minimal';
  const imageSource = resolveMascotImageSource(copy.mascot, copy.mood, 'half');

  useEffect(() => {
    if (!shouldShow || trackedRef.current) return;
    trackedRef.current = true;
    trackAnalyticsOnce(`mascot_tip_seen:${contextId}`, () => {
      trackMascotTipSeen({
        mascot_id: copy.mascot as MascotId,
        tip_context: contextId,
        universe_id: activeUniverse.id,
        screen_name: '/(game)/hq',
      });
    });
  }, [activeUniverse.id, contextId, copy.mascot, shouldShow]);

  if (!shouldShow) return null;

  const actionLabel = copy.actionLabel;

  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={
          isProtocol
            ? ['rgba(8, 14, 32, 0.98)', 'rgba(6, 10, 22, 0.98)', 'rgba(4, 6, 14, 0.99)']
            : ['rgba(42, 24, 16, 0.35)', 'rgba(16, 12, 18, 0.98)', 'rgba(8, 6, 12, 0.99)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, QuestoryTheme.shadow.soft]}>
        <View style={[styles.rail, { backgroundColor: skin.accentPrimary, width: isProtocol ? 3 : 4 }]} />
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={[styles.liveDot, { backgroundColor: skin.accentPrimary }]} />
            <Text style={[QuestoryTypography.sectionEyebrow, { color: skin.accentPrimary, fontSize: 10 }]}>
              {directiveLabel}
            </Text>
            <View style={[styles.signalBar, { backgroundColor: `${skin.accentPrimary}44` }]}>
              <View style={[styles.signalFill, { backgroundColor: skin.accentPrimary, width: '72%' }]} />
            </View>
          </View>

          <View style={styles.body}>
            {shouldShowImage ? (
              <View style={styles.portraitCol}>
                <View style={[styles.portraitGlow, { backgroundColor: skin.glowColor }]} />
                <View
                  style={[
                    styles.portraitFrame,
                    { backgroundColor: isProtocol ? 'rgba(8, 14, 32, 0.9)' : 'rgba(42, 24, 16, 0.85)' },
                  ]}>
                  <Image source={imageSource} style={styles.portrait} contentFit="cover" transition={120} />
                </View>
              </View>
            ) : null}
            <View style={styles.messageCol}>
              <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone, fontSize: 17 }]}>
                {copy.title}
              </Text>
              <Text style={[QuestoryTypography.body, { color: palette.fog, fontSize: 13, lineHeight: 20 }]}>
                {copy.message}
              </Text>
            </View>
          </View>

          {actionLabel && onAction ? (
            <Pressable
              onPress={onAction}
              style={[styles.actionBtn, { backgroundColor: `${skin.accentPrimary}40` }]}>
              <Text style={[QuestoryTypography.caption, { color: palette.bone, letterSpacing: 1.4 }]}>
                {actionLabel}
              </Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginVertical: 6 },
  card: {
    borderRadius: 16,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  rail: { flexShrink: 0 },
  content: { flex: 1, padding: 16, gap: 12 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4 },
  signalBar: { flex: 1, height: 3, borderRadius: 2, overflow: 'hidden', maxWidth: 64 },
  signalFill: { height: '100%', borderRadius: 2 },
  body: { flexDirection: 'row', gap: 14, alignItems: 'flex-start' },
  portraitCol: { position: 'relative', flexShrink: 0 },
  portraitGlow: {
    position: 'absolute',
    top: -8,
    left: -8,
    width: 88,
    height: 112,
    borderRadius: 12,
    opacity: 0.55,
  },
  portraitFrame: {
    width: 100,
    height: 128,
    borderRadius: 12,
    overflow: 'hidden',
  },
  portrait: { width: '100%', height: '100%' },
  messageCol: { flex: 1, gap: 8, minWidth: 0, paddingTop: 2 },
  actionBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 10,
    minHeight: 44,
    justifyContent: 'center',
  },
});
