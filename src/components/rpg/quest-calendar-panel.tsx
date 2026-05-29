import * as Haptics from 'expo-haptics';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { GameFonts } from '@/constants/typography';
import { useGame } from '@/hooks/use-game';
import { useUniverseUiCopy } from '@/lib/universe-ui-copy';
import {
  buildQuestCalendarDays,
  formatEmptyDayDetailMessage,
  formatQuestCalendarDayLabel,
  getQuestCalendarHeaderFlavor,
  QUEST_CALENDAR_EXPLANATION,
  type QuestCalendarDay,
  type QuestCalendarIntensity,
} from '@/lib/quest-calendar';

const INTENSITY_OPACITY: Record<QuestCalendarIntensity, number> = {
  none: 0,
  light: 0.35,
  medium: 0.62,
  strong: 1,
};

export function QuestCalendarPanel() {
  const ui = useUniverseUiCopy();
  const { activeUniverse, playerProgress } = useGame();
  const { palette } = activeUniverse;
  const [selectedDateKey, setSelectedDateKey] = useState<string | null>(null);

  const days = useMemo(
    () => buildQuestCalendarDays(playerProgress.activityByDate),
    [playerProgress.activityByDate],
  );

  const selectedDay = useMemo(
    () => days.find((day) => day.dateKey === selectedDateKey) ?? null,
    [days, selectedDateKey],
  );

  const handleSelectDay = (day: QuestCalendarDay) => {
    void Haptics.selectionAsync();
    setSelectedDateKey((current) => (current === day.dateKey ? null : day.dateKey));
  };

  return (
    <View style={[styles.panel, { borderColor: palette.panelBorder, backgroundColor: palette.panel }]}>
      <Text style={[styles.headerFlavor, { color: palette.gold }]}>
        {getQuestCalendarHeaderFlavor(activeUniverse.id)}
      </Text>
      <Text style={[styles.explanation, { color: palette.fog }]}>{QUEST_CALENDAR_EXPLANATION}</Text>

      <View style={styles.grid}>
        {days.map((day) => (
          <Pressable
            key={day.dateKey}
            onPress={() => handleSelectDay(day)}
            style={[
              styles.cell,
              {
                borderColor: selectedDateKey === day.dateKey ? palette.gold : palette.panelBorder,
                backgroundColor: palette.night,
              },
              day.isToday && { borderColor: palette.accent },
            ]}>
            <View
              style={[
                styles.mark,
                {
                  backgroundColor: palette.gold,
                  opacity: INTENSITY_OPACITY[day.intensity],
                },
              ]}
            />
            <Text style={[styles.dayNumber, { color: palette.fog }]}>{day.dayOfMonth}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.legend}>
        <LegendItem label="0" intensity="none" palette={palette} />
        <LegendItem label="1" intensity="light" palette={palette} />
        <LegendItem label="2–3" intensity="medium" palette={palette} />
        <LegendItem label="4+" intensity="strong" palette={palette} />
      </View>

      {selectedDay ? (
        <View style={[styles.detail, { borderColor: palette.panelBorder, backgroundColor: palette.night }]}>
          <Text style={[styles.detailDate, { color: palette.bone }]}>
            {formatQuestCalendarDayLabel(selectedDay.dateKey)}
          </Text>

          {selectedDay.activity.questsCompleted === 0 ? (
            <Text style={[styles.detailEmpty, { color: palette.fog }]}>
              {formatEmptyDayDetailMessage()}
            </Text>
          ) : (
            <View style={styles.detailStats}>
              <DetailStat label="QUESTS CLEARED" value={String(selectedDay.activity.questsCompleted)} palette={palette} />
              <DetailStat label="XP EARNED" value={`+${selectedDay.activity.xpEarned}`} palette={palette} />
              <DetailStat
                label={ui.reputationLabel.toUpperCase()}
                value={`+${selectedDay.activity.reputationEarned}`}
                palette={palette}
              />
              {selectedDay.activity.chaptersCompleted > 0 ? (
                <DetailStat
                  label="CHAPTERS CLEARED"
                  value={String(selectedDay.activity.chaptersCompleted)}
                  palette={palette}
                />
              ) : null}
            </View>
          )}
        </View>
      ) : null}

      <Text style={[styles.timelineHint, { color: palette.fog }]}>
        For quest-by-quest proof, see Evidence Timeline above.
      </Text>
    </View>
  );
}

function LegendItem({
  label,
  intensity,
  palette,
}: {
  label: string;
  intensity: QuestCalendarIntensity;
  palette: { fog: string; gold: string; night: string; panelBorder: string };
}) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendMark,
          { backgroundColor: palette.gold, opacity: INTENSITY_OPACITY[intensity], borderColor: palette.panelBorder },
        ]}
      />
      <Text style={[styles.legendLabel, { color: palette.fog }]}>{label}</Text>
    </View>
  );
}

function DetailStat({
  label,
  value,
  palette,
}: {
  label: string;
  value: string;
  palette: { fog: string; gold: string };
}) {
  return (
    <View style={styles.detailStat}>
      <Text style={[styles.detailStatLabel, { color: palette.fog }]}>{label}</Text>
      <Text style={[styles.detailStatValue, { color: palette.gold }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderWidth: 1,
    padding: 14,
    gap: 10,
    transform: [{ skewX: '-2deg' }],
  },
  headerFlavor: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 11,
    letterSpacing: 1.2,
  },
  explanation: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 11,
    lineHeight: 16,
    fontStyle: 'italic',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: '12.8%',
    minWidth: 28,
    aspectRatio: 1,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  mark: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  dayNumber: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.3,
    zIndex: 1,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingTop: 2,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendMark: {
    width: 10,
    height: 10,
    borderWidth: 1,
  },
  legendLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 0.3,
  },
  detail: {
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  detailDate: {
    fontFamily: GameFonts.ui,
    fontSize: 13,
    letterSpacing: 0.4,
  },
  detailEmpty: {
    fontFamily: GameFonts.displayRegular,
    fontSize: 12,
    lineHeight: 17,
    fontStyle: 'italic',
  },
  detailStats: {
    gap: 6,
  },
  detailStat: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  detailStatLabel: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 9,
    letterSpacing: 1.2,
  },
  detailStatValue: {
    fontFamily: GameFonts.ui,
    fontSize: 14,
    letterSpacing: 0.5,
  },
  timelineHint: {
    fontFamily: GameFonts.uiSemi,
    fontSize: 10,
    lineHeight: 14,
    fontStyle: 'italic',
  },
});
