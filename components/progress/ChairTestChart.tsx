import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import type { ChartChairTest } from '@/lib/api/types';
import { formatShortDate } from '@/lib/time';
import { LineChart } from './LineChart';

type ChairTestChartProps = {
  chairTests: ChartChairTest[];
  honorific: string;
};

function weeksBetween(fromIso: string, toIso: string): number {
  const days = Math.round(
    (new Date(toIso).getTime() - new Date(fromIso).getTime()) / 86_400_000,
  );
  return Math.max(1, Math.round(days / 7));
}

export function ChairTestChart({ chairTests, honorific }: ChairTestChartProps) {
  const [width, setWidth] = useState(0);
  // Default the tapped detail to the most recent test.
  const [selectedIndex, setSelectedIndex] = useState(chairTests.length - 1);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const title = 'Tes kursi';

  if (chairTests.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Ionicons name="body-outline" size={26} color={colors.primary} />
          </View>
          <Text style={styles.emptyTitle}>Tes kursi pertama {honorific} akan muncul di sini</Text>
          <Text style={styles.emptyBody}>
            Tes kursi menghitung berapa kali {honorific} bisa berdiri dari kursi dalam 30 detik,
            cara sederhana melihat kekuatan kakinya.
          </Text>
        </View>
      </Card>
    );
  }

  const first = chairTests[0];
  const latest = chairTests[chairTests.length - 1];
  const delta = latest.reps - first.reps;

  let callout: string;
  if (delta > 0) callout = `${latest.reps} kali, naik dari ${first.reps}!`;
  else if (delta === 0) callout = `${latest.reps} kali, stabil`;
  else callout = `${latest.reps} kali`;

  const weeks = weeksBetween(first.recorded_at, latest.recorded_at);
  const trendSummary =
    chairTests.length >= 2 && delta > 0
      ? `Naik dari ${first.reps} ke ${latest.reps} dalam ${weeks} minggu`
      : `Tes kursi terakhir ${latest.reps} kali`;

  // A 2-point line reads as a gimmick; show the numbers as cards instead (backlog).
  if (chairTests.length <= 2) {
    return (
      <Card>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.callout}>{callout}</Text>
        <View style={styles.numberRow}>
          {chairTests.map((t, i) => (
            <View key={i} style={styles.numberCard}>
              <Text style={styles.numberValue}>{t.reps}</Text>
              <Text style={styles.numberLabel}>kali</Text>
              <Text style={styles.numberDate}>{formatShortDate(t.recorded_at)}</Text>
            </View>
          ))}
        </View>
      </Card>
    );
  }

  const safeIndex = Math.min(Math.max(selectedIndex, 0), chairTests.length - 1);
  const selected = chairTests[safeIndex];

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        <View style={styles.calloutPill}>
          <Ionicons name="trending-up" size={16} color={colors.success} />
          <Text style={styles.calloutText}>{callout}</Text>
        </View>
      </View>

      <View
        style={styles.chart}
        onLayout={onLayout}
        accessible
        accessibilityLabel={trendSummary}
      >
        <LineChart
          values={chairTests.map((t) => t.reps)}
          dotLabels={chairTests.length <= 8 ? chairTests.map((t) => String(t.reps)) : undefined}
          width={width}
          height={176}
          onSelectPoint={setSelectedIndex}
          selectedIndex={safeIndex}
        />
      </View>

      <View style={styles.axisRow}>
        <Text style={styles.axisLabel}>{formatShortDate(first.recorded_at)}</Text>
        <Text style={styles.axisLabel}>{formatShortDate(latest.recorded_at)}</Text>
      </View>

      {/* Tapped-point detail — the "see my details" interaction. */}
      <View style={styles.detail}>
        <Ionicons name="ellipse" size={10} color={colors.primary} />
        <Text style={styles.detailDate}>{formatShortDate(selected.recorded_at)}</Text>
        <Text style={styles.detailValue}>{selected.reps} kali berdiri</Text>
      </View>

      <Text style={styles.summary}>{trendSummary}. Ketuk titik untuk lihat detail.</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.section,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  calloutPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  calloutText: {
    ...typography.caption,
    color: colors.success,
    fontWeight: '700',
  },
  callout: {
    ...typography.body,
    fontWeight: '700',
    color: colors.text,
  },
  chart: {
    marginTop: spacing.xs,
  },
  axisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
  },
  axisLabel: {
    ...typography.caption,
  },
  detail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: 40,
  },
  detailDate: {
    ...typography.body,
    fontWeight: '600',
  },
  detailValue: {
    ...typography.bodyMuted,
    flex: 1,
    textAlign: 'right',
  },
  summary: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
  numberRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  numberCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.lg,
    borderRadius: 12,
    backgroundColor: colors.primarySoft,
    gap: spacing.xs / 2,
  },
  numberValue: {
    ...typography.title,
    color: colors.primary,
  },
  numberLabel: {
    ...typography.bodyMuted,
  },
  numberDate: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  emptyIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  emptyTitle: {
    ...typography.body,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyBody: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
});
