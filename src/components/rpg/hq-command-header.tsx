import { StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { QuestoryStatusPill } from '@/components/ui/questory-status-pill';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import { QuestoryTheme } from '@/theme/questory-theme';
import { getUniverseSkin } from '@/theme/universe-skins';
import { QuestoryTypography } from '@/theme/typography';
import type { Chapter } from '@/types/narrative';

type HqCommandHeaderProps = {
  currentChapter: Chapter | null | undefined;
  earlyHq?: boolean;
};

export function HqCommandHeader({ currentChapter, earlyHq = false }: HqCommandHeaderProps) {
  const ui = useUniverseUiCopy();
  const { activeUniverse, activeSaga, player } = useGame();
  const { palette } = activeUniverse;
  const skin = getUniverseSkin(activeUniverse.id);
  const isTerminal = skin.id === 'neuronet';

  const chapterLabel = ui.hqChapterEyebrow(activeSaga.title, currentChapter?.order);

  return (
    <Animated.View entering={FadeInDown.duration(480)} style={styles.wrap}>
      <View style={[styles.topRail, { backgroundColor: skin.accentPrimary }]} />
      <View
        style={[
          styles.panel,
          {
            backgroundColor: QuestoryTheme.colors.background.panel,
            borderColor: skin.surfaceBorder,
          },
          skin.panelShadow,
        ]}>
        <CornerBracket position="tl" color={skin.accentPrimary} />
        <CornerBracket position="tr" color={skin.accentPrimary} />
        <CornerBracket position="bl" color={`${skin.accentPrimary}88`} />
        <CornerBracket position="br" color={`${skin.accentPrimary}88`} />

        {isTerminal ? (
          <View pointerEvents="none" style={styles.terminalStripe}>
            {Array.from({ length: 6 }).map((_, i) => (
              <View
                key={i}
                style={[styles.terminalLine, { backgroundColor: `${skin.accentPrimary}${i % 2 ? '18' : '0c'}` }]}
              />
            ))}
          </View>
        ) : null}

        <View style={styles.inner}>
          <View style={styles.identityRow}>
            <Text style={styles.universeIcon}>{activeUniverse.icon}</Text>
            <View style={styles.identityCopy}>
              <Text style={[QuestoryTypography.sectionEyebrow, { color: skin.accentPrimary, letterSpacing: 4 }]}>
                {earlyHq ? 'COMMAND HQ' : "TODAY'S OPERATION"}
              </Text>
              <Text style={[QuestoryTypography.cinematicTitle, { color: palette.bone, fontSize: 30, lineHeight: 36 }]}>
                {ui.hqTitle(activeUniverse.locationName).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.pillRow}>
            <QuestoryStatusPill label={activeUniverse.name.toUpperCase()} tone="accent" universeId={activeUniverse.id} />
            <QuestoryStatusPill label={activeSaga.title.toUpperCase()} tone="muted" />
            {currentChapter ? (
              <QuestoryStatusPill label={`CH ${currentChapter.order}`} tone="default" />
            ) : null}
          </View>

          <View style={[styles.metaRail, { borderTopColor: `${skin.accentPrimary}33` }]}>
            <MetaChip label="LVL" value={String(player.level)} accent={skin.accentPrimary} />
            <MetaChip label="REP" value={String(player.reputation)} accent={skin.accentSecondary} />
            <Text style={[QuestoryTypography.caption, { color: palette.fog, flex: 1, textAlign: 'right' }]} numberOfLines={2}>
              {chapterLabel}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

function MetaChip({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <View style={[styles.metaChip, { borderColor: `${accent}55` }]}>
      <Text style={[QuestoryTypography.caption, { color: accent, letterSpacing: 1.5 }]}>{label}</Text>
      <Text style={[QuestoryTypography.statValue, { color: QuestoryTheme.colors.text.primary, fontSize: 16 }]}>
        {value}
      </Text>
    </View>
  );
}

function CornerBracket({
  position,
  color,
}: {
  position: 'tl' | 'tr' | 'bl' | 'br';
  color: string;
}) {
  const base = { width: BRACKET, height: BRACKET, position: 'absolute' as const, borderColor: color };
  const style =
    position === 'tl'
      ? { ...base, top: 6, left: 6, borderTopWidth: 2, borderLeftWidth: 2 }
      : position === 'tr'
        ? { ...base, top: 6, right: 6, borderTopWidth: 2, borderRightWidth: 2 }
        : position === 'bl'
          ? { ...base, bottom: 6, left: 6, borderBottomWidth: 2, borderLeftWidth: 2 }
          : { ...base, bottom: 6, right: 6, borderBottomWidth: 2, borderRightWidth: 2 };

  return <View style={style} />;
}

const BRACKET = 14;

const styles = StyleSheet.create({
  wrap: { marginBottom: 4 },
  topRail: { height: 3, width: '100%' },
  panel: {
    borderWidth: 1,
    overflow: 'hidden',
    minHeight: 132,
  },
  terminalStripe: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 48,
    bottom: 0,
    gap: 3,
    paddingVertical: 8,
    paddingHorizontal: 6,
  },
  terminalLine: { flex: 1 },
  inner: { padding: 16, paddingTop: 18, gap: 12 },
  identityRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  universeIcon: { fontSize: 42, lineHeight: 46, marginTop: 2 },
  identityCopy: { flex: 1, gap: 4, minWidth: 0 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  metaRail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderTopWidth: 1,
    paddingTop: 10,
  },
  metaChip: {
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 2,
    minWidth: 52,
  },
});
