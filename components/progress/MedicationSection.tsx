import { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { StyleSheet, Text, View, type LayoutChangeEvent } from 'react-native';

import { Button, Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import type {
  MedicationAdherence,
  MedicationAdherenceTrendDay,
  Medication,
  MedicationLog,
} from '@/lib/api/types';
import { unconfirmedTodaySlots } from '@/lib/medications';
import { LineChart } from './LineChart';

// P1 section (CORE §7 medication adherence, lands with backend B6). Built now
// because the mock supplies the data; the 7-day rollup and 30-day trend both
// come straight from the computed progress response.
type MedicationSectionProps = {
  adherence: MedicationAdherence;
  trend: MedicationAdherenceTrendDay[];
  medications: Medication[];
  medicationLogs: MedicationLog[];
  honorific: string;
};

export function MedicationSection({
  adherence,
  trend,
  medications,
  medicationLogs,
  honorific,
}: MedicationSectionProps) {
  const [width, setWidth] = useState(0);
  const onLayout = (e: LayoutChangeEvent) => setWidth(e.nativeEvent.layout.width);

  const activeMeds = medications.filter((m) => m.active);
  const unconfirmed = unconfirmedTodaySlots(medications, medicationLogs);

  if (activeMeds.length === 0) {
    return (
      <Card>
        <Text style={styles.title}>Kepatuhan obat</Text>
        <Text style={styles.emptyText}>
          Belum ada obat. Tambahkan supaya pendamping bisa mengingatkan {honorific} tiap jadwal.
        </Text>
        <Button
          label="Kelola obat"
          variant="ghost"
          onPress={() => router.push('/medications')}
          style={styles.manageButton}
        />
      </Card>
    );
  }

  const trendValues = trend.map((d) => (d.scheduled > 0 ? (d.taken / d.scheduled) * 100 : 0));

  return (
    <Card>
      <Text style={styles.title}>Kepatuhan obat</Text>

      <View style={styles.adherenceRow}>
        <Text style={styles.adherencePct}>{adherence.pct}%</Text>
        <Text style={styles.adherenceMeta}>
          {adherence.last7d_taken} dari {adherence.last7d_scheduled} dosis (7 hari terakhir)
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(0, Math.min(100, adherence.pct))}%` }]} />
      </View>

      <View style={styles.trendBlock} onLayout={onLayout}>
        <Text style={styles.trendLabel}>Tren 30 hari</Text>
        <LineChart
          values={trendValues}
          width={width}
          height={72}
          strokeWidth={2}
          showDots={false}
          yMin={0}
          yMax={100}
        />
      </View>

      <View style={styles.divider} />

      {unconfirmed.length > 0 ? (
        <View style={styles.unconfirmedBlock}>
          <Text style={styles.unconfirmedTitle}>Belum dikonfirmasi hari ini</Text>
          {unconfirmed.map((slot, i) => (
            <View key={`${slot.medicationId}-${slot.time}-${i}`} style={styles.unconfirmedRow}>
              <View style={styles.unconfirmedDot} />
              <Text style={styles.unconfirmedText}>
                {slot.name} {slot.dosage}
              </Text>
              <Text style={styles.unconfirmedTime}>{slot.time}</Text>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.allDoneRow}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.allDoneText}>Semua dosis hari ini sudah dikonfirmasi.</Text>
        </View>
      )}

      <Button
        label="Kelola obat"
        variant="ghost"
        onPress={() => router.push('/medications')}
        style={styles.manageButton}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  title: {
    ...typography.section,
    marginBottom: spacing.md,
  },
  adherenceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: spacing.sm,
  },
  adherencePct: {
    ...typography.title,
    color: colors.primary,
  },
  adherenceMeta: {
    ...typography.bodyMuted,
    flex: 1,
  },
  track: {
    height: 10,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
    marginTop: spacing.sm,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  trendBlock: {
    marginTop: spacing.lg,
    gap: spacing.xs,
  },
  trendLabel: {
    ...typography.caption,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: spacing.lg,
  },
  unconfirmedBlock: {
    gap: spacing.sm,
  },
  unconfirmedTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  unconfirmedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    minHeight: 32,
  },
  unconfirmedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  unconfirmedText: {
    ...typography.body,
    flex: 1,
  },
  unconfirmedTime: {
    ...typography.caption,
  },
  allDoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  allDoneText: {
    ...typography.bodyMuted,
    flex: 1,
  },
  emptyText: {
    ...typography.bodyMuted,
  },
  manageButton: {
    alignSelf: 'flex-end',
    marginTop: spacing.md,
  },
});
