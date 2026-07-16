import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import type { ProgressWeekDay } from '@/lib/api/types';
import { DayDots } from './DayDots';

// Indonesian weekday initials, Monday -> Sunday (Sen Sel Rab Kam Jum Sab Min).
const WEEKDAY_INITIALS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

type StreakSectionProps = {
  engagementStreakDays: number;
  exerciseStreakDays: number;
  thisWeek: ProgressWeekDay[];
  hasExerciseHistory: boolean;
  honorific: string;
};

export function StreakSection({
  engagementStreakDays,
  exerciseStreakDays,
  thisWeek,
  hasExerciseHistory,
  honorific,
}: StreakSectionProps) {
  const doneThisWeek = thisWeek.filter((d) => d.status === 'done').length;

  return (
    <Card>
      <View style={styles.headline}>
        {/* Ionicons flame, not the emoji, per the anti-emoji policy. */}
        <View style={styles.flame}>
          <Ionicons name="flame" size={28} color={colors.primary} />
        </View>
        <View style={styles.headlineText}>
          {engagementStreakDays > 0 ? (
            <>
              <Text style={styles.streakNumber}>{engagementStreakDays} hari berturut-turut</Text>
              <Text style={styles.streakSub}>{honorific} aktif setiap hari, terus begini ya.</Text>
            </>
          ) : (
            <>
              <Text style={styles.streakNumber}>Belum ada rangkaian hari</Text>
              <Text style={styles.streakSub}>
                Rangkaian hari aktif {honorific} akan mulai terhitung di sini.
              </Text>
            </>
          )}
        </View>
      </View>

      <View style={styles.divider} />

      {hasExerciseHistory ? (
        <View style={styles.weekBlock}>
          <View style={styles.weekHeader}>
            <Text style={styles.weekTitle}>Latihan minggu ini</Text>
            <Text style={styles.weekMeta}>{exerciseStreakDays} hari beruntun</Text>
          </View>
          <DayDots
            days={thisWeek.map((d) => d.status)}
            labels={WEEKDAY_INITIALS}
            accessibilityLabel={`Latihan minggu ini: ${doneThisWeek} dari 7 hari`}
          />
        </View>
      ) : (
        <Text style={styles.emptyText}>
          Catatan latihan {honorific} minggu ini akan muncul di sini.
        </Text>
      )}
    </Card>
  );
}

const styles = StyleSheet.create({
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  flame: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  streakNumber: {
    ...typography.section,
  },
  streakSub: {
    ...typography.bodyMuted,
  },
  divider: {
    height: 1,
    backgroundColor: colors.hairline,
    marginVertical: spacing.lg,
  },
  weekBlock: {
    gap: spacing.md,
  },
  weekHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weekTitle: {
    ...typography.body,
    fontWeight: '600',
  },
  weekMeta: {
    ...typography.bodyMuted,
  },
  emptyText: {
    ...typography.bodyMuted,
  },
});
