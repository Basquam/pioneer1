import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { APP_MASCOTS } from '@/constants/app-mascots';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { trackAnalyticsOnce } from '@/lib/analytics/analytics-dedupe';
import type { MascotId } from '@/lib/analytics/analytics-types';
import { trackGuidePanelOpened, trackMascotTipSeen } from '@/lib/analytics/questory-analytics';
import { getMascotPreference } from '@/lib/app-mascot-coach';
import { resolveMascotImageSource, type MascotFraming, type MascotMood } from '@/lib/mascot-assets';
import { getMascotGuideCopy, type MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import type { AppMascotId, MascotPreference } from '@/types/narrative';

function shouldShowGuideForPreference(preference: MascotPreference, mascot: AppMascotId): boolean {
  if (preference === 'off') return false;
  if (preference === 'sasha') return mascot === 'sasha';
  if (preference === 'marcus') return mascot === 'marcus';
  return true;
}

export type MascotGuideCardProps = {
  mascot: AppMascotId;
  mood?: MascotMood;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  /** compact = half-body inline card; full = hero layout with full-body asset */
  mode?: 'compact' | 'full';
  /** Stable id for analytics dedupe */
  tipId: string;
  screenName?: string;
  /** Optional expandable details — fires guide_panel_opened on expand */
  expandableDetail?: string;
  style?: StyleProp<ViewStyle>;
  respectPreference?: boolean;
};

function MascotGuideCardComponent({
  mascot,
  mood = 'neutral',
  title,
  message,
  actionLabel,
  onAction,
  mode = 'compact',
  tipId,
  screenName,
  expandableDetail,
  style,
  respectPreference = true,
}: MascotGuideCardProps) {
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const preference = getMascotPreference(playerProgress);
  const [expanded, setExpanded] = useState(false);
  const trackedRef = useRef(false);

  const framing: MascotFraming = mode === 'full' ? 'full' : 'half';
  const imageSource = resolveMascotImageSource(mascot, mood, framing);
  const mascotMeta = APP_MASCOTS[mascot];

  const shouldShowImage = preference !== 'minimal';
  const shouldShowCard = !respectPreference || shouldShowGuideForPreference(preference, mascot);

  useEffect(() => {
    if (!shouldShowCard || trackedRef.current) return;
    trackedRef.current = true;

    trackAnalyticsOnce(`mascot_tip_seen:${tipId}`, () => {
      trackMascotTipSeen({
        mascot_id: mascot as MascotId,
        tip_context: tipId,
        universe_id: activeUniverse.id,
        screen_name: screenName,
      });
    });
  }, [activeUniverse.id, mascot, screenName, shouldShowCard, tipId]);

  const handleExpand = useCallback(() => {
    setExpanded((prev) => {
      if (!prev && expandableDetail) {
        trackAnalyticsOnce(`guide_panel_opened:${tipId}`, () => {
          trackGuidePanelOpened({
            mascot_id: mascot as MascotId,
            tip_context: tipId,
            screen_name: screenName,
            universe_id: activeUniverse.id,
          });
        });
      }
      return !prev;
    });
  }, [activeUniverse.id, expandableDetail, mascot, tipId]);

  if (!shouldShowCard) return null;

  const isFull = mode === 'full';
  const imageWidth = isFull ? 120 : 72;
  const imageHeight = isFull ? 160 : 88;

  return (
    <View
      style={[
        isFull ? styles.fullCard : styles.compactCard,
        { backgroundColor: palette.night, borderColor: palette.panelBorder },
        style,
      ]}>
      <View style={styles.row}>
        {shouldShowImage ? (
          <Image
            source={imageSource}
            style={[styles.image, { width: imageWidth, height: imageHeight, borderColor: palette.gold }]}
            contentFit="contain"
            transition={120}
          />
        ) : null}
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: palette.accent }]}>
            {mascotMeta.name.toUpperCase()} · {mascotMeta.role.toUpperCase()}
          </Text>
          <Text style={[styles.title, { color: palette.bone }]}>{title}</Text>
          <Text style={[styles.message, { color: palette.fog }]}>{message}</Text>
          {expandableDetail ? (
            <>
              {expanded ? (
                <Text style={[styles.detail, { color: palette.fog }]}>{expandableDetail}</Text>
              ) : null}
              <Pressable onPress={handleExpand} hitSlop={8}>
                <Text style={[styles.expandLabel, { color: palette.gold }]}>
                  {expanded ? 'SHOW LESS' : 'LEARN MORE'}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      </View>

      {actionLabel && onAction ? (
        <Pressable
          onPress={onAction}
          style={[styles.action, { borderColor: palette.gold, backgroundColor: `${palette.primary}66` }]}>
          <Text style={[styles.actionLabel, { color: palette.bone }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

export const MascotGuideCard = memo(MascotGuideCardComponent);

type MascotGuideFromContextProps = {
  contextId: MascotGuideContextId;
  tipId?: string;
  screenName?: string;
  actionLabel?: string;
  onAction?: () => void;
  mode?: 'compact' | 'full';
  expandableDetail?: string;
  style?: StyleProp<ViewStyle>;
};

export function MascotGuideFromContext({
  contextId,
  tipId,
  screenName,
  actionLabel,
  onAction,
  mode,
  expandableDetail,
  style,
}: MascotGuideFromContextProps) {
  const copy = getMascotGuideCopy(contextId);

  return (
    <MascotGuideCard
      mascot={copy.mascot}
      mood={copy.mood}
      title={copy.title}
      message={copy.message}
      actionLabel={actionLabel ?? copy.actionLabel}
      onAction={onAction}
      mode={mode}
      tipId={tipId ?? contextId}
      screenName={screenName}
      expandableDetail={expandableDetail}
      style={style}
    />
  );
}

const styles = StyleSheet.create({
  compactCard: {
    borderWidth: 1,
    padding: 10,
    gap: 8,
    transform: [{ skewX: '-2deg' }],
  },
  fullCard: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  image: {
    borderWidth: 1,
    borderRadius: 4,
    flexShrink: 0,
    backgroundColor: '#0a0810',
  },
  copy: {
    flex: 1,
    gap: 4,
    minWidth: 0,
  },
  eyebrow: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 8,
    letterSpacing: 1.4,
  },
  title: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 13,
    letterSpacing: 0.3,
    lineHeight: 18,
  },
  message: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  detail: {
    fontFamily: GameFonts.ui,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2,
  },
  expandLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.2,
    marginTop: 4,
  },
  action: {
    borderWidth: 1,
    paddingVertical: 9,
    paddingHorizontal: 12,
    alignItems: 'center',
    transform: [{ skewX: '-4deg' }],
  },
  actionLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    letterSpacing: 1.2,
  },
});
