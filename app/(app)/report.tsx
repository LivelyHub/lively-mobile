import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Card, EmptyState, ErrorState, Skeleton } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { useElders, useReport } from '@/lib/api/hooks';
import type { PerformanceReport, ReportPeriod } from '@/lib/api/types';

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const [period, setPeriod] = useState<ReportPeriod>('week');
  const elders = useElders();
  const elder = elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';
  const report = useReport(elder?.id ?? '', period);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await report.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [report]);

  const firstLoad = Boolean(elder) && report.isLoading && !report.data;
  const fullError = Boolean(elder) && report.isError && !report.data;
  const data = report.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>Ringkasan {honorific}</Text>
      </View>

      <PeriodToggle period={period} onChange={setPeriod} />

      {report.isError && data ? (
        <View style={styles.banner}>
          <Ionicons name="cloud-offline-outline" size={18} color={colors.danger} />
          <Text style={styles.bannerText}>Gagal memperbarui. Menampilkan data terakhir.</Text>
        </View>
      ) : null}

      {firstLoad ? <ReportSkeleton /> : null}

      {fullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void report.refetch()} isRetrying={report.isRefetching} />
        </View>
      ) : null}

      {!elder && elders.data ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="people-outline"
            title="Belum ada Eyang"
            body="Tambahkan orang tersayang Anda dulu untuk melihat ringkasannya."
            ctaLabel="Tambah Eyang"
            onCtaPress={() => router.replace('/setup-wizard')}
            iconAccessibilityLabel="Belum ada data"
          />
        </View>
      ) : null}

      {data && !firstLoad ? <ReportBody report={data} honorific={honorific} /> : null}
    </ScrollView>
  );
}

function PeriodToggle({
  period,
  onChange,
}: {
  period: ReportPeriod;
  onChange: (p: ReportPeriod) => void;
}) {
  const options: { key: ReportPeriod; label: string }[] = [
    { key: 'week', label: 'Minggu ini' },
    { key: 'month', label: 'Bulan ini' },
  ];
  return (
    <View style={styles.toggle}>
      {options.map((opt) => {
        const active = period === opt.key;
        return (
          <Pressable
            key={opt.key}
            onPress={() => onChange(opt.key)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            style={({ pressed }) => [
              styles.toggleItem,
              active && styles.toggleItemActive,
              pressed && !active && styles.togglePressed,
            ]}
          >
            <Text style={[styles.toggleLabel, active && styles.toggleLabelActive]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function ReportBody({ report, honorific }: { report: PerformanceReport; honorific: string }) {
  if (!report.has_data) {
    return (
      <View style={styles.centerBlock}>
        <EmptyState
          icon="sparkles-outline"
          title="Ringkasan segera hadir"
          body={report.headline}
          iconAccessibilityLabel="Belum ada data"
        />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      <View style={styles.headlineCard}>
        <Ionicons name="heart" size={22} color={colors.primary} />
        <Text style={styles.headlineText}>{report.headline}</Text>
      </View>

      <View style={styles.statRow}>
        <StatTile label="Konsistensi" pct={report.consistency_pct} icon="calendar-outline" />
        <StatTile label="Latihan" pct={report.exercise_completion_pct} icon="barbell-outline" />
        <StatTile label="Obat" pct={report.medication_adherence_pct} icon="medical-outline" />
      </View>

      {report.chair_test_latest !== null ? (
        <Card style={styles.chairCard}>
          <View style={styles.chairText}>
            <Text style={styles.chairLabel}>Tes kursi terakhir</Text>
            <Text style={styles.chairValue}>
              {report.chair_test_latest} <Text style={styles.chairUnit}>kali</Text>
            </Text>
          </View>
          {report.chair_test_delta !== null && report.chair_test_delta !== 0 ? (
            <View
              style={[
                styles.deltaChip,
                report.chair_test_delta > 0 ? styles.deltaUp : styles.deltaDown,
              ]}
            >
              <Ionicons
                name={report.chair_test_delta > 0 ? 'trending-up' : 'trending-down'}
                size={16}
                color={report.chair_test_delta > 0 ? colors.success : colors.warning}
              />
              <Text
                style={[
                  styles.deltaText,
                  { color: report.chair_test_delta > 0 ? colors.success : colors.warning },
                ]}
              >
                {report.chair_test_delta > 0 ? '+' : ''}
                {report.chair_test_delta}
              </Text>
            </View>
          ) : null}
        </Card>
      ) : null}

      {report.highlights.length > 0 ? (
        <Card>
          <Text style={styles.sectionTitle}>Yang membanggakan</Text>
          <View style={styles.list}>
            {report.highlights.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <Ionicons name="checkmark-circle" size={20} color={colors.success} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {report.areas_needing_support.length > 0 ? (
        <Card style={styles.supportCard}>
          <Text style={styles.sectionTitle}>Bisa kita bantu</Text>
          <Text style={styles.supportHelp}>
            Bukan hal yang mendesak, hanya ide lembut untuk menemani {honorific}.
          </Text>
          <View style={styles.list}>
            {report.areas_needing_support.map((item, i) => (
              <View key={i} style={styles.listRow}>
                <Ionicons name="hand-left-outline" size={20} color={colors.primary} />
                <Text style={styles.listText}>{item}</Text>
              </View>
            ))}
          </View>
        </Card>
      ) : null}
    </View>
  );
}

function StatTile({
  label,
  pct,
  icon,
}: {
  label: string;
  pct: number;
  icon: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <View style={styles.tile}>
      <Ionicons name={icon} size={18} color={colors.primary} />
      <Text style={styles.tilePct}>{clamped}%</Text>
      <Text style={styles.tileLabel}>{label}</Text>
      <View style={styles.tileTrack}>
        <View style={[styles.tileFill, { width: `${clamped}%` }]} />
      </View>
    </View>
  );
}

function ReportSkeleton() {
  return (
    <View style={styles.stack}>
      <Skeleton width={'100%'} height={72} radius={radii.card} />
      <View style={styles.statRow}>
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} width={'31%'} height={110} radius={radii.card} />
        ))}
      </View>
      <Skeleton width={'100%'} height={140} radius={radii.card} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.lg,
  },
  headerRow: {
    marginBottom: spacing.xs,
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
  toggle: {
    flexDirection: 'row',
    backgroundColor: colors.hairline,
    borderRadius: radii.pill,
    padding: 4,
  },
  toggleItem: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
  },
  toggleItemActive: {
    backgroundColor: colors.surface,
  },
  togglePressed: {
    opacity: 0.6,
  },
  toggleLabel: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMuted,
  },
  toggleLabelActive: {
    color: colors.primary,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.dangerSoft,
    borderRadius: radii.sm,
    padding: spacing.md,
  },
  bannerText: {
    ...typography.body,
    flex: 1,
  },
  headlineCard: {
    flexDirection: 'row',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.card,
    padding: spacing.lg,
    alignItems: 'flex-start',
  },
  headlineText: {
    ...typography.body,
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 26,
    flex: 1,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  tile: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: 'flex-start',
  },
  tilePct: {
    ...typography.section,
    color: colors.text,
  },
  tileLabel: {
    ...typography.caption,
  },
  tileTrack: {
    height: 6,
    width: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
    overflow: 'hidden',
    marginTop: spacing.xs / 2,
  },
  tileFill: {
    height: '100%',
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  chairCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chairText: {
    gap: spacing.xs / 2,
  },
  chairLabel: {
    ...typography.bodyMuted,
  },
  chairValue: {
    ...typography.title,
    color: colors.primary,
  },
  chairUnit: {
    ...typography.section,
    color: colors.primary,
  },
  deltaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  deltaUp: {
    backgroundColor: colors.successSoft,
  },
  deltaDown: {
    backgroundColor: colors.warningSoft,
  },
  deltaText: {
    ...typography.body,
    fontWeight: '700',
  },
  sectionTitle: {
    ...typography.section,
  },
  supportHelp: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
  },
  supportCard: {
    backgroundColor: colors.surface,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  listText: {
    ...typography.body,
    flex: 1,
  },
});
