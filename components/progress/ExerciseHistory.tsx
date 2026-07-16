import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import type { ExerciseHistoryDay } from '@/lib/api/types';
import { DayDots } from './DayDots';

type ExerciseHistoryProps = {
  history: ExerciseHistoryDay[];
  hasExerciseHistory: boolean;
  honorific: string;
};

export function ExerciseHistory({ history, hasExerciseHistory, honorific }: ExerciseHistoryProps) {
  const doneCount = history.filter((d) => d.completed).length;

  return (
    <Card>
      <View style={styles.header}>
        <Text style={styles.title}>Riwayat latihan</Text>
        {hasExerciseHistory ? (
          <Text style={styles.meta}>{doneCount} dari {history.length} hari</Text>
        ) : null}
      </View>

      {hasExerciseHistory ? (
        <>
          <DayDots
            days={history.map((d) => (d.completed ? 'done' : 'missed'))}
            size={16}
            accessibilityLabel={`Latihan ${history.length} hari terakhir: ${doneCount} hari selesai`}
          />
          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendDone]} />
              <Text style={styles.legendText}>Latihan</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, styles.legendMissed]} />
              <Text style={styles.legendText}>Terlewat</Text>
            </View>
          </View>
        </>
      ) : (
        <Text style={styles.emptyText}>
          Setiap hari {honorific} berolahraga akan tercatat di sini selama 30 hari terakhir.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  title: {
    ...typography.section,
  },
  meta: {
    ...typography.bodyMuted,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginTop: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendDone: {
    backgroundColor: colors.success,
  },
  legendMissed: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  legendText: {
    ...typography.caption,
  },
  emptyText: {
    ...typography.bodyMuted,
  },
});
