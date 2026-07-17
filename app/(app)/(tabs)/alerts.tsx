import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import { Linking, Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AlertRow } from '@/components/alerts/AlertRow';
import { AlertsSkeleton } from '@/components/alerts/AlertsSkeleton';
import { sortAlertsByUrgency } from '@/components/home/alertPresentation';
import { Banner, EmptyState, ErrorState } from '@/components/ui';
import { TAB_BAR_CLEARANCE } from '@/components/ui/TabBar';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { usePushPermission } from '@/hooks/usePushRegistration';
import { useAlerts, useElders } from '@/lib/api/hooks';
import type { Alert, Elder } from '@/lib/api/types';

const POLL_MS = 60_000; // Alerts refresh every 60s while focused (M8.2).

export default function AlertsScreen() {
  const insets = useSafeAreaInsets();
  const elders = useElders();
  const alerts = useAlerts({ refetchInterval: POLL_MS });
  const [refreshing, setRefreshing] = useState(false);
  const [showResolved, setShowResolved] = useState(false);

  // Re-read notification permission each time the screen focuses, so returning
  // from OS settings updates the enable-notifications banner (M8.1).
  const [focusKey, setFocusKey] = useState(0);
  useFocusEffect(useCallback(() => setFocusKey((k) => k + 1), []));
  const pushPermission = usePushPermission(focusKey);
  const [pushDismissed, setPushDismissed] = useState(false);
  const showPushBanner = pushPermission === 'denied' && !pushDismissed;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([elders.refetch(), alerts.refetch()]);
    } finally {
      setRefreshing(false);
    }
  }, [elders, alerts]);

  const honorificFor = useMemo(() => {
    const byId = new Map<string, Elder>((elders.data ?? []).map((e) => [e.id, e]));
    return (alert: Alert) => byId.get(alert.elder_id)?.honorific ?? 'Eyang';
  }, [elders.data]);

  const primaryHonorific = elders.data?.[0]?.honorific ?? 'Eyang';

  const { unresolved, resolved } = useMemo(() => {
    const all = alerts.data ?? [];
    return {
      unresolved: sortAlertsByUrgency(all.filter((a) => !a.resolved_at)),
      resolved: all
        .filter((a) => a.resolved_at)
        .sort((a, b) => (b.resolved_at ?? '').localeCompare(a.resolved_at ?? '')),
    };
  }, [alerts.data]);

  const firstLoad = alerts.isLoading && !alerts.data;
  const fullError = alerts.isError && !alerts.data;
  const hasData = Boolean(alerts.data);
  const isEmpty = hasData && unresolved.length === 0 && resolved.length === 0;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingTop: insets.top + spacing.md }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      <Text style={styles.title}>Peringatan</Text>

      {showPushBanner ? (
        <Banner
          variant="warning"
          message="Notifikasi mati. Aktifkan supaya kami bisa mengabari Anda langsung."
          actionLabel="Aktifkan"
          onActionPress={() => void Linking.openSettings()}
          onDismiss={() => setPushDismissed(true)}
        />
      ) : null}

      {alerts.isError && alerts.data ? (
        <Banner
          variant="danger"
          message="Gagal memperbarui. Menampilkan data terakhir."
          actionLabel="Coba lagi"
          onActionPress={onRefresh}
        />
      ) : null}

      {firstLoad ? <AlertsSkeleton /> : null}

      {fullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void alerts.refetch()} isRetrying={alerts.isRefetching} />
        </View>
      ) : null}

      {isEmpty ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="shield-checkmark-outline"
            title={`${primaryHonorific} baik-baik saja`}
            body="Tidak ada peringatan saat ini. Kami akan memberi tahu Anda kalau ada yang perlu diperhatikan."
            iconAccessibilityLabel="Semua baik-baik saja"
          />
        </View>
      ) : null}

      {hasData && !isEmpty ? (
        <View style={styles.stack}>
          {unresolved.length > 0 ? (
            <View style={styles.section}>
              {unresolved.map((alert) => (
                <AlertRow
                  key={alert.id}
                  alert={alert}
                  honorific={honorificFor(alert)}
                  onPress={() => router.push({ pathname: '/alert/[id]', params: { id: alert.id } })}
                />
              ))}
            </View>
          ) : (
            <View style={styles.allClear}>
              <View style={styles.allClearIcon}>
                <Ionicons name="shield-checkmark" size={24} color={colors.success} />
              </View>
              <Text style={styles.allClearText}>
                Tidak ada peringatan aktif. {primaryHonorific} baik-baik saja.
              </Text>
            </View>
          )}

          {resolved.length > 0 ? (
            <View>
              <Pressable
                onPress={() => setShowResolved((v) => !v)}
                accessibilityRole="button"
                accessibilityState={{ expanded: showResolved }}
                style={({ pressed }) => [styles.resolvedHeader, pressed && styles.pressed]}
              >
                <Text style={styles.resolvedHeaderText}>Riwayat selesai ({resolved.length})</Text>
                <Ionicons
                  name={showResolved ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={colors.textMuted}
                />
              </Pressable>
              {showResolved ? (
                <View style={styles.section}>
                  {resolved.map((alert) => (
                    <AlertRow
                      key={alert.id}
                      alert={alert}
                      honorific={honorificFor(alert)}
                      onPress={() => router.push({ pathname: '/alert/[id]', params: { id: alert.id } })}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null}
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
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  allClear: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.successSoft,
    borderRadius: radii.card,
    padding: spacing.lg,
  },
  allClearIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  allClearText: {
    ...typography.body,
    flex: 1,
  },
  resolvedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
    marginBottom: spacing.sm,
  },
  resolvedHeaderText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.textMuted,
  },
  pressed: {
    opacity: 0.6,
  },
});
