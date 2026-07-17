import { useCallback, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  alertDetailBody,
  alertHeadline,
  alertIcon,
  alertTone,
  TONE_LABEL,
  TONE_STYLE,
} from '@/components/home/alertPresentation';
import { Button, Card, EmptyState, ErrorState, Skeleton, useToast } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { useAlerts, useElders, useResolveAlert } from '@/lib/api/hooks';
import { formatShortDate, formatClock } from '@/lib/time';

export default function AlertDetailScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { id } = useLocalSearchParams<{ id: string }>();
  const alerts = useAlerts();
  const elders = useElders();
  const resolve = useResolveAlert();
  const [resolving, setResolving] = useState(false);

  const alert = alerts.data?.find((a) => a.id === id);
  const elder = elders.data?.find((e) => e.id === alert?.elder_id) ?? elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';

  const onCall = useCallback(() => {
    if (!elder?.phone_e164) return;
    void Haptics.selectionAsync();
    Linking.openURL(`tel:${elder.phone_e164}`).catch(() => {
      toast.showToast({ message: 'Tidak bisa membuka telepon di perangkat ini.', variant: 'danger' });
    });
  }, [elder?.phone_e164, toast]);

  const onResolve = useCallback(async () => {
    if (!alert) return;
    setResolving(true);
    try {
      await resolve.mutateAsync({ alertId: alert.id });
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      toast.showToast({ message: 'Peringatan ditandai selesai.', variant: 'success' });
    } catch {
      toast.showToast({ message: 'Gagal menandai selesai. Coba lagi.', variant: 'danger' });
    } finally {
      setResolving(false);
    }
  }, [alert, resolve, toast]);

  const firstLoad = alerts.isLoading && !alerts.data;
  const fullError = alerts.isError && !alerts.data;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
    >
      {firstLoad ? (
        <View style={styles.stack}>
          <Skeleton width={64} height={64} radius={radii.pill} />
          <Skeleton width={'80%'} height={24} />
          <Skeleton width={'100%'} height={80} radius={radii.card} />
          <Skeleton width={'100%'} height={48} radius={radii.button} />
        </View>
      ) : null}

      {fullError ? (
        <ErrorState onRetry={() => void alerts.refetch()} isRetrying={alerts.isRefetching} />
      ) : null}

      {!firstLoad && !fullError && !alert ? (
        <EmptyState
          icon="checkmark-done-outline"
          title="Peringatan tidak ditemukan"
          body="Mungkin sudah dihapus atau ditangani. Kembali ke daftar untuk melihat yang terbaru."
          ctaLabel="Kembali ke Peringatan"
          onCtaPress={() => router.replace('/alerts')}
          iconAccessibilityLabel="Tidak ditemukan"
        />
      ) : null}

      {alert ? (
        <AlertDetailBody
          tone={alertTone(alert.type)}
          icon={alertIcon(alert.type)}
          headline={alertHeadline(alert, honorific)}
          body={alertDetailBody(alert, honorific)}
          quote={typeof alert.payload.quote === 'string' ? alert.payload.quote : undefined}
          honorific={honorific}
          hasPhone={Boolean(elder?.phone_e164)}
          createdAt={alert.created_at}
          resolvedAt={alert.resolved_at}
          onCall={onCall}
          onResolve={onResolve}
          resolving={resolving}
        />
      ) : null}
    </ScrollView>
  );
}

type IconName = React.ComponentProps<typeof Ionicons>['name'];

function AlertDetailBody({
  tone,
  icon,
  headline,
  body,
  quote,
  honorific,
  hasPhone,
  createdAt,
  resolvedAt,
  onCall,
  onResolve,
  resolving,
}: {
  tone: 'danger' | 'warning' | 'info';
  icon: IconName;
  headline: string;
  body: string;
  quote?: string;
  honorific: string;
  hasPhone: boolean;
  createdAt: string;
  resolvedAt: string | null;
  onCall: () => void;
  onResolve: () => void;
  resolving: boolean;
}) {
  const { background, accent } = TONE_STYLE[tone];
  const resolved = Boolean(resolvedAt);

  return (
    <View style={styles.stack}>
      <View style={styles.hero}>
        <View style={[styles.heroIcon, { backgroundColor: background }]}>
          <Ionicons name={icon} size={30} color={accent} />
        </View>
        <Text style={[styles.tier, { color: accent }]}>{TONE_LABEL[tone]}</Text>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.time}>
          {formatShortDate(createdAt)} · {formatClock(createdAt)}
        </Text>
      </View>

      {quote ? (
        <View style={[styles.quoteCard, { borderLeftColor: accent }]}>
          <Text style={styles.quoteLabel}>Kata {honorific}</Text>
          <Text style={styles.quoteText}>&ldquo;{quote}&rdquo;</Text>
        </View>
      ) : null}

      <Card>
        <Text style={styles.bodyText}>{body}</Text>
      </Card>

      {resolved ? (
        <View style={styles.resolvedNote}>
          <Ionicons name="checkmark-circle" size={20} color={colors.success} />
          <Text style={styles.resolvedNoteText}>
            Sudah ditandai selesai pada {formatShortDate(resolvedAt!)} · {formatClock(resolvedAt!)}.
          </Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        <Button
          label={`Telepon ${honorific}`}
          onPress={onCall}
          disabled={!hasPhone}
          iconLeft={<Ionicons name="call" size={18} color={colors.textOnPrimary} />}
          fullWidth
        />
        {!resolved ? (
          <Button
            label="Tandai selesai"
            variant="secondary"
            onPress={onResolve}
            loading={resolving}
            iconLeft={<Ionicons name="checkmark" size={18} color={colors.primary} />}
            fullWidth
          />
        ) : null}
      </View>
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
  },
  stack: {
    gap: spacing.lg,
  },
  hero: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
  },
  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  tier: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  headline: {
    ...typography.section,
    textAlign: 'center',
  },
  time: {
    ...typography.caption,
  },
  quoteCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    borderLeftWidth: 4,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  quoteLabel: {
    ...typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  quoteText: {
    ...typography.body,
    fontStyle: 'italic',
    fontSize: 18,
    lineHeight: 26,
  },
  bodyText: {
    ...typography.body,
  },
  resolvedNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.xs,
  },
  resolvedNoteText: {
    ...typography.bodyMuted,
    flex: 1,
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
});
