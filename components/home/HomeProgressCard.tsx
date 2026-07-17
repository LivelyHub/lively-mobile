import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { DayDots, ProgressRing } from '@/components/progress';
import { colors, spacing, typography } from '@/constants/tokens';
import type { ProgressWeekDay } from '@/lib/api/types';

const WEEKDAY_INITIALS = ['S', 'S', 'R', 'K', 'J', 'S', 'M'];

type HomeProgressCardProps = {
  pct: number;
  engagementStreakDays: number;
  exerciseStreakDays: number;
  thisWeek: ProgressWeekDay[];
  hasExerciseHistory: boolean;
  honorific: string;
};

// Home's single-card rollup of Progress's OverallProgress + StreakSection —
// same data, same primitives (ProgressRing, DayDots), one Card instead of two
// so the home feed reads as one glanceable block, not a stack of near-duplicate
// cards. The full two-card breakdown still lives on /progress.
export function HomeProgressCard({
  pct,
  engagementStreakDays,
  exerciseStreakDays,
  thisWeek,
  hasExerciseHistory,
  honorific,
}: HomeProgressCardProps) {
  const doneThisWeek = thisWeek.filter((d) => d.status === 'done').length;

  return (
    <Card style={styles.card}>
      <ProgressRing pct={pct} />
      <View style={styles.text}>
        <Text style={styles.label}>Kondisi {honorific} secara keseluruhan</Text>
        <Text style={styles.helper}>
          {pct === 0
            ? `Angka ini akan naik begitu ${honorific} mulai beraktivitas.`
            : `Gabungan dari latihan, tes kursi, dan obat ${honorific}.`}
        </Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.headline}>
        <View style={styles.flame}>
          <Ionicons name="flame" size={24} color={colors.primary} />
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
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  text: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.section,
    textAlign: 'center',
    color: colors.text,
  },
  helper: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
  divider: {
    alignSelf: 'stretch',
    height: 1,
    backgroundColor: colors.hairline,
  },
  headline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    alignSelf: 'stretch',
  },
  flame: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headlineText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  streakNumber: {
    ...typography.body,
    fontWeight: '700',
  },
  streakSub: {
    ...typography.bodyMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  weekBlock: {
    gap: spacing.md,
    alignSelf: 'stretch',
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
});
