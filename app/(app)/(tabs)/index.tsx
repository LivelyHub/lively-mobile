import { useCallback, useState } from 'react';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useQueryClient } from '@tanstack/react-query';

import { Banner, Button, EmptyState, ErrorState, ProfileMenu } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/TabBar';
import { AlertCard } from '@/components/home/AlertCard';
import { sortAlertsByUrgency } from '@/components/home/alertPresentation';
import { ElderCard } from '@/components/home/ElderCard';
import { HomeSkeleton } from '@/components/home/HomeSkeleton';
import { QuickActions } from '@/components/home/QuickActions';
import { colors, spacing, typography } from '@/constants/tokens';
import { useAlerts, useElders, useFamilyMember } from '@/lib/api/hooks';

const POLL_MS = 60_000; // Home refreshes elders + alerts every 60s while focused (M3.1).

function greetingWord(hour: number): string {
  if (hour >= 4 && hour < 11) return 'pagi';
  if (hour >= 11 && hour < 15) return 'siang';
  if (hour >= 15 && hour < 19) return 'sore';
  return 'malam';
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const elders = useElders({ refetchInterval: POLL_MS });
  const alerts = useAlerts({ refetchInterval: POLL_MS });
  const family = useFamilyMember();
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        elders.refetch(),
        alerts.refetch(),
        queryClient.invalidateQueries({ queryKey: ['conversation'] }),
        queryClient.invalidateQueries({ queryKey: ['progress'] }),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [elders, alerts, queryClient]);

  const firstName = family.data?.name?.split(' ')[0];
  const eyebrow = `Selamat ${greetingWord(new Date().getHours())}`;

  const eldersData = elders.data ?? [];
  const unresolved = alerts.data ? sortAlertsByUrgency(alerts.data.filter((a) => !a.resolved_at)) : [];
  const topAlert = unresolved[0];
  const topAlertHonorific =
    eldersData.find((e) => e.id === topAlert?.elder_id)?.honorific ?? 'Eyang';

  const showFirstLoad = elders.isLoading && !elders.data;
  const showFullError = elders.isError && !elders.data;
  const showEmpty = !showFirstLoad && !showFullError && eldersData.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>{eyebrow}</Text>
          <Text style={styles.headline}>{firstName ?? 'Keluarga'}</Text>
        </View>
        <ProfileMenu name={family.data?.name} />
      </View>

      {!showFirstLoad && !showFullError && eldersData.length > 0 ? (
        <QuickActions
          onChat={() => router.navigate('/chat')}
          onProgress={() => router.navigate('/progress')}
          onTitipan={() => router.push('/titipan')}
        />
      ) : null}

      {elders.isError && elders.data ? (
        <Banner
          variant="danger"
          message="Gagal memperbarui. Menampilkan data terakhir."
          actionLabel="Coba lagi"
          onActionPress={onRefresh}
        />
      ) : null}

      {showFirstLoad ? <HomeSkeleton /> : null}

      {showFullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
        </View>
      ) : null}

      {showEmpty ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="people-outline"
            title="Belum ada Eyang di sini"
            body="Tambahkan orang tersayang Anda, lalu pilih pendamping yang menyapa mereka setiap hari."
            ctaLabel="Tambah Eyang"
            onCtaPress={() => router.push('/setup-wizard')}
            iconAccessibilityLabel="Belum ada data"
          />
        </View>
      ) : null}

      {!showFirstLoad && !showFullError && eldersData.length > 0 ? (
        <View style={styles.stack}>
          {topAlert ? (
            <AlertCard
              alert={topAlert}
              honorific={topAlertHonorific}
              extraCount={unresolved.length - 1}
              onPress={() => router.navigate('/alerts')}
            />
          ) : null}

          {eldersData.map((elder) => (
            <ElderCard key={elder.id} elder={elder} />
          ))}

          <Button
            label="Tambah Eyang"
            variant="secondary"
            onPress={() => router.push('/setup-wizard')}
          />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textMuted,
    letterSpacing: 0.3,
  },
  headline: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    lineHeight: 38,
    color: colors.text,
  },
  centerBlock: {
    paddingTop: spacing.xl,
  },
  stack: {
    gap: spacing.lg,
  },
});
