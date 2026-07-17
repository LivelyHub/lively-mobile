import { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import type { ExerciseHistoryDay } from '@/lib/api/types';

// 30-day exercise history as an interactive calendar (M5.1). The flat dot strip
// it replaces didn't read as a calendar; this aligns each day to its weekday
// column (Mon-first, Indonesian) with the date number inside, so it's obvious at
// a glance that it's a month of days. Tapping a day reveals its detail below —
// the "I can see my details" interaction, the way modern fitness apps do it.

type ExerciseCalendarProps = {
  history: ExerciseHistoryDay[]; // last 30 days, oldest -> newest
  hasExerciseHistory: boolean;
  honorific: string;
};

const WEEKDAY_SHORT = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const WEEKDAY_FULL = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
const MONTHS_ID = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function parseLocalDate(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
}
function weekdayMonFirst(d: Date): number {
  return (d.getDay() + 6) % 7; // 0 = Monday ... 6 = Sunday
}
function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

type Cell = { type: 'blank'; key: string } | { type: 'day'; day: ExerciseHistoryDay };

export function ExerciseCalendar({ history, hasExerciseHistory, honorific }: ExerciseCalendarProps) {
  const today = todayKey();
  const doneCount = history.filter((d) => d.completed).length;

  // Default the detail to today so the card is informative before any tap.
  const [selectedKey, setSelectedKey] = useState<string>(today);

  const rows = useMemo<Cell[][]>(() => {
    if (history.length === 0) return [];
    const cells: Cell[] = [];
    const lead = weekdayMonFirst(parseLocalDate(history[0].date));
    for (let i = 0; i < lead; i += 1) cells.push({ type: 'blank', key: `lead-${i}` });
    for (const day of history) cells.push({ type: 'day', day });
    while (cells.length % 7 !== 0) cells.push({ type: 'blank', key: `trail-${cells.length}` });
    const grouped: Cell[][] = [];
    for (let i = 0; i < cells.length; i += 7) grouped.push(cells.slice(i, i + 7));
    return grouped;
  }, [history]);

  const selectedDay = history.find((d) => d.date === selectedKey) ?? null;
  const monthSpan = useMemo(() => {
    if (history.length === 0) return '';
    const start = parseLocalDate(history[0].date);
    const end = parseLocalDate(history[history.length - 1].date);
    const startM = MONTHS_ID[start.getMonth()];
    const endM = MONTHS_ID[end.getMonth()];
    return startM === endM ? endM : `${startM}–${endM}`;
  }, [history]);

  if (!hasExerciseHistory) {
    return (
      <Card>
        <Text style={styles.title}>Kalender latihan</Text>
        <Text style={styles.emptyText}>
          Setiap hari {honorific} berolahraga akan muncul di kalender ini selama 30 hari terakhir.
        </Text>
      </Card>
    );
  }

  return (
    <Card>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Kalender latihan</Text>
          <Text style={styles.subtitle}>30 hari terakhir · {monthSpan}</Text>
        </View>
        <View style={styles.countPill}>
          <Ionicons name="checkmark-circle" size={16} color={colors.success} />
          <Text style={styles.countText}>{doneCount}/30 hari</Text>
        </View>
      </View>

      <View style={styles.weekdayRow}>
        {WEEKDAY_SHORT.map((w, i) => (
          <Text key={i} style={styles.weekdayLabel}>
            {w}
          </Text>
        ))}
      </View>

      <View style={styles.grid}>
        {rows.map((row, ri) => (
          <View key={ri} style={styles.weekRow}>
            {row.map((cell) =>
              cell.type === 'blank' ? (
                <View key={cell.key} style={styles.cell} />
              ) : (
                <DayCell
                  key={cell.day.date}
                  day={cell.day}
                  isToday={cell.day.date === today}
                  selected={cell.day.date === selectedKey}
                  onPress={() => setSelectedKey(cell.day.date)}
                />
              ),
            )}
          </View>
        ))}
      </View>

      <View style={styles.detail}>
        <SelectedDetail day={selectedDay} isToday={selectedKey === today} />
      </View>

      <View style={styles.legend}>
        <LegendItem swatchStyle={styles.legendDone} label="Latihan" />
        <LegendItem swatchStyle={styles.legendMissed} label="Terlewat" />
        <LegendItem swatchStyle={styles.legendToday} label="Hari ini" />
      </View>
    </Card>
  );
}

function DayCell({
  day,
  isToday,
  selected,
  onPress,
}: {
  day: ExerciseHistoryDay;
  isToday: boolean;
  selected: boolean;
  onPress: () => void;
}) {
  const dateNum = parseLocalDate(day.date).getDate();
  const label = `${WEEKDAY_FULL[weekdayMonFirst(parseLocalDate(day.date))]} ${dateNum}, ${
    day.completed ? 'latihan selesai' : 'tidak ada latihan'
  }`;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityLabel={label}
      style={({ pressed }) => [
        styles.cell,
        styles.dayCell,
        day.completed ? styles.dayDone : styles.dayMissed,
        isToday && styles.dayToday,
        selected && styles.daySelected,
        pressed && styles.dayPressed,
      ]}
    >
      <Text style={[styles.dayNum, day.completed && styles.dayNumDone, isToday && styles.dayNumToday]}>
        {dateNum}
      </Text>
    </Pressable>
  );
}

function SelectedDetail({ day, isToday }: { day: ExerciseHistoryDay | null; isToday: boolean }) {
  if (!day) {
    return <Text style={styles.detailHint}>Ketuk tanggal untuk melihat detailnya.</Text>;
  }
  const d = parseLocalDate(day.date);
  const dateLabel = `${WEEKDAY_FULL[weekdayMonFirst(d)]}, ${d.getDate()} ${MONTHS_ID[d.getMonth()]}`;
  const icon = day.completed ? 'checkmark-circle' : isToday ? 'time-outline' : 'remove-circle-outline';
  const accent = day.completed ? colors.success : isToday ? colors.primary : colors.textMuted;
  const status = day.completed
    ? 'Latihan kursi selesai'
    : isToday
      ? 'Belum latihan hari ini'
      : 'Tidak ada latihan';
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon} size={20} color={accent} />
      <Text style={styles.detailDate}>{dateLabel}</Text>
      <Text style={[styles.detailStatus, { color: accent }]}>{status}</Text>
    </View>
  );
}

function LegendItem({ swatchStyle, label }: { swatchStyle: object; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendSwatch, swatchStyle]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.section,
  },
  subtitle: {
    ...typography.caption,
    marginTop: spacing.xs / 2,
  },
  countPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  countText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  weekdayRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  weekdayLabel: {
    ...typography.caption,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
  },
  grid: {
    gap: spacing.xs + 2,
  },
  weekRow: {
    flexDirection: 'row',
    gap: spacing.xs + 2,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
  },
  dayCell: {
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayDone: {
    backgroundColor: colors.success,
  },
  dayMissed: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  dayToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  daySelected: {
    borderWidth: 2,
    borderColor: colors.text,
  },
  dayPressed: {
    opacity: 0.7,
  },
  dayNum: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textMuted,
  },
  dayNumDone: {
    color: colors.textOnPrimary,
  },
  dayNumToday: {
    color: colors.primary,
  },
  detail: {
    minHeight: 44,
    justifyContent: 'center',
    marginTop: spacing.lg,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailDate: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
  detailStatus: {
    ...typography.caption,
    fontWeight: '600',
  },
  detailHint: {
    ...typography.bodyMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendSwatch: {
    width: 14,
    height: 14,
    borderRadius: radii.sm - 2,
  },
  legendDone: {
    backgroundColor: colors.success,
  },
  legendMissed: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  legendToday: {
    borderWidth: 2,
    borderColor: colors.primary,
  },
  legendText: {
    ...typography.caption,
  },
  emptyText: {
    ...typography.bodyMuted,
    marginTop: spacing.sm,
  },
});
