import { Image } from 'expo-image';
import { memo, useCallback, useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { APP_MASCOTS } from '@/constants/app-mascots';
import { QuestoryCard } from '@/components/ui/questory-card';
import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { trackAnalyticsOnce } from '@/lib/analytics/analytics-dedupe';
import type { MascotId } from '@/lib/analytics/analytics-types';
import { trackGuidePanelOpened, trackMascotTipSeen } from '@/lib/analytics/questory-analytics';
import { getMascotPreference } from '@/lib/app-mascot-coach';
import { resolveMascotImageSource, type MascotFraming, type MascotMood } from '@/lib/mascot-assets';
import { getMascotGuideCopy, type MascotGuideContextId } from '@/lib/mascots/mascot-guide-copy';
import { playMascotTip } from '@/lib/audio/sound-service';
import { QuestoryTypography } from '@/theme/typography';
import { getUniverseAccent } from '@/theme/universe-skins';
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
  presentation?: 'default' | 'transmission';
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
  presentation = 'default',
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
        playMascotTip();
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
  const accent = getUniverseAccent(activeUniverse.id);
  const isTransmission = presentation === 'transmission';
  const directiveLabel = mascot === 'sasha' ? 'SASHA DIRECTIVE' : 'MARCUS NOTE';
  const imageWidth = isTransmission ? 88 : isFull ? 120 : 72;
  const imageHeight = isTransmission ? 112 : isFull ? 160 : 88;

  const body = (
    <>
      {!isTransmission ? (
        <QuestoryStatusPill label="COMMAND BRIEFING" tone="accent" universeId={activeUniverse.id} />
      ) : (
        <QuestoryStatusPill label={directiveLabel} tone="accent" universeId={activeUniverse.id} />
      )}
      <View style={[styles.row, isTransmission && styles.transmissionRow]}>
        {shouldShowImage ? (
          <Image
            source={imageSource}
            style={[
              styles.image,
              isTransmission && styles.transmissionImage,
              {
                width: imageWidth,
                height: imageHeight,
                borderColor: accent.primary,
                backgroundColor: palette.ink,
              },
            ]}
            contentFit={isTransmission ? 'cover' : 'contain'}
            transition={120}
          />
        ) : null}
        <View style={styles.copy}>
          {!isTransmission ? (
            <Text style={[QuestoryTypography.caption, { color: palette.accent }]}>
              {mascotMeta.name.toUpperCase()} · {mascotMeta.role.toUpperCase()}
            </Text>
          ) : null}
          <Text style={[QuestoryTypography.sectionTitle, { color: palette.bone }]}>{title}</Text>
          <Text style={[QuestoryTypography.flavor, { color: palette.fog }]}>{message}</Text>
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
    </>
  );

  if (isTransmission) {
    return (
      <View style={[isTransmission ? styles.transmissionContent : undefined, style]}>
        {body}
      </View>
    );
  }

  return (
    <QuestoryCard
      variant="elevated"
      style={style}
      contentStyle={[isFull ? styles.fullContent : styles.compactContent]}>
      {body}
    </QuestoryCard>
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
  presentation?: 'default' | 'transmission';
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
  presentation,
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
      presentation={presentation}
    />
  );
}

const styles = StyleSheet.create({
  compactContent: {
    gap: 8,
    padding: 10,
    paddingLeft: 14,
  },
  fullContent: {
    gap: 10,
    padding: 14,
    paddingLeft: 18,
  },
  transmissionContent: {
    gap: 10,
    paddingHorizontal: 14,
    paddingBottom: 14,
  },
  transmissionRow: {
    alignItems: 'stretch',
  },
  transmissionImage: {
    borderRadius: 2,
    overflow: 'hidden',
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
  },
  copy: {
    flex: 1,
    gap: 6,
    minWidth: 0,
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
