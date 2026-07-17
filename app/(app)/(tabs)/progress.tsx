import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  ChairTestChart,
  ExerciseCalendar,
  MedicationSection,
  OverallProgress,
  ProgressSkeleton,
  StreakSection,
} from '@/components/progress';
import { Banner, EmptyState, ErrorState } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/TabBar';
import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import { useElders, useProgress } from '@/lib/api/hooks';

export default function ProgressScreen() {
  const insets = useSafeAreaInsets();
  const elders = useElders();
  const elder = elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';
  const progress = useProgress(elder?.id ?? '');
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([elders.refetch(), elder ? progress.refetch() : Promise.resolve()]);
    } finally {
      setRefreshing(false);
    }
  }, [elders, progress, elder]);

  const eldersFirstLoad = elders.isLoading && !elders.data;
  const eldersError = elders.isError && !elders.data;
  const noElders = Boolean(elders.data) && !elder;

  const progressFirstLoad = Boolean(elder) && progress.isLoading && !progress.data;
  const progressFullError = Boolean(elder) && progress.isError && !progress.data;
  const data = progress.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={styles.title}>Perkembangan {honorific}</Text>

      {progress.isError && data ? (
        <Banner
          variant="danger"
          message="Gagal memperbarui. Menampilkan data terakhir."
          actionLabel="Coba lagi"
          onActionPress={onRefresh}
        />
      ) : null}

      {eldersFirstLoad || progressFirstLoad ? <ProgressSkeleton /> : null}

      {eldersError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
        </View>
      ) : null}

      {progressFullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void progress.refetch()} isRetrying={progress.isRefetching} />
        </View>
      ) : null}

      {noElders ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="people-outline"
            title="Belum ada Eyang di sini"
            body="Tambahkan orang tersayang Anda dulu, lalu perkembangan hariannya akan muncul di sini."
            ctaLabel="Tambah Eyang"
            onCtaPress={() => router.push('/setup-wizard')}
            iconAccessibilityLabel="Belum ada data"
          />
        </View>
      ) : null}

      {elder && data && !progressFirstLoad ? (
        <View style={styles.stack}>
          <OverallProgress pct={data.overall_progress_pct} honorific={honorific} />

          <StreakSection
            engagementStreakDays={data.engagement_streak_days}
            exerciseStreakDays={data.exercise.current_streak_days}
            thisWeek={data.exercise.this_week}
            hasExerciseHistory={data.exercise_logs.length > 0}
            honorific={honorific}
          />

          <ChairTestChart chairTests={data.chair_tests} honorific={honorific} />

          <ExerciseCalendar
            history={data.exercise_history}
            hasExerciseHistory={data.exercise_logs.length > 0}
            honorific={honorific}
          />

          {/* P1 — medication adherence (CORE §7, lands with backend B6). */}
          <MedicationSection
            adherence={data.medication_adherence}
            trend={data.medication_adherence_trend}
            medications={data.medications}
            medicationLogs={data.medication_logs}
            honorific={honorific}
          />

          {/* M11.1 performance-report entry point. */}
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push('/report')}
            style={({ pressed }) => [styles.reportCard, pressed && styles.reportPressed]}
          >
            <Ionicons name="document-text-outline" size={22} color={colors.primary} />
            <Text style={styles.reportText}>Lihat ringkasan minggu ini</Text>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
          </Pressable>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: TAB_BAR_CLEARANCE,
    gap: spacing.lg,
  },
  title: {
    ...typography.title,
  },
  centerBlock: {
    paddingTop: spacing.xl,
  },
  stack: {
    gap: spacing.lg,
  },
  reportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.lg,
    minHeight: 56,
    ...shadow.card,
  },
  reportPressed: {
    opacity: 0.7,
  },
  reportText: {
    ...typography.body,
    fontWeight: '600',
    flex: 1,
  },
});
