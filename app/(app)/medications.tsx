import { useCallback, useMemo, useState } from 'react';
import { router } from 'expo-router';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { MedicationRow, MedicationsSkeleton } from '@/components/medications';
import { Banner, Button, ConfirmSheet, EmptyState, ErrorState, useToast } from '@/components/ui';
import { colors, spacing } from '@/constants/tokens';
import { useElders, useMedications, useProgress, useUpdateMedication } from '@/lib/api/hooks';
import type { Medication } from '@/lib/api/types';
import { companionMetaFromId } from '@/lib/companions';
import { todayMedSlots } from '@/lib/medications';

export default function MedicationsScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const elders = useElders();
  const elder = elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';
  const companion = elder ? companionMetaFromId(elder.companion_id) : null;

  const medications = useMedications(elder?.id ?? '');
  const progress = useProgress(elder?.id ?? '');
  const updateMedication = useUpdateMedication(elder?.id ?? '');

  const [refreshing, setRefreshing] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Medication | null>(null);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        elder ? medications.refetch() : Promise.resolve(),
        elder ? progress.refetch() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [elder, medications, progress]);

  // Per-slot "taken today" needs medication_logs, which only /progress returns
  // (BACKLOG M6.1 note) — grouped here by medication id for the row renderer.
  const slotsByMedicationId = useMemo(() => {
    const map = new Map<string, ReturnType<typeof todayMedSlots>>();
    if (medications.data) {
      const logs = progress.data?.medication_logs ?? [];
      for (const slot of todayMedSlots(medications.data, logs)) {
        const existing = map.get(slot.medicationId);
        if (existing) existing.push(slot);
        else map.set(slot.medicationId, [slot]);
      }
    }
    return map;
  }, [medications.data, progress.data]);

  function runToggle(medication: Medication, active: boolean) {
    updateMedication.mutate(
      { medicationId: medication.id, body: { active } },
      {
        onError: () => {
          toast.showToast({ variant: 'danger', message: 'Gagal memperbarui. Coba lagi ya.' });
        },
      },
    );
  }

  function handleToggle(medication: Medication, next: boolean) {
    // Deactivating needs a confirm sheet first (UI-UX §4); activating is reversible
    // and low-stakes, so it applies immediately.
    if (medication.active && !next) {
      setConfirmTarget(medication);
      return;
    }
    runToggle(medication, next);
  }

  function confirmDeactivate() {
    if (!confirmTarget) return;
    runToggle(confirmTarget, false);
    setConfirmTarget(null);
  }

  const eldersFirstLoad = elders.isLoading && !elders.data;
  const eldersError = elders.isError && !elders.data;
  const noElders = Boolean(elders.data) && !elder;

  const medsFirstLoad = Boolean(elder) && medications.isLoading && !medications.data;
  const medsFullError = Boolean(elder) && medications.isError && !medications.data;
  const list = medications.data ?? [];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
      }
    >
      {medications.isError && medications.data ? (
        <Banner
          variant="danger"
          message="Gagal memperbarui. Menampilkan data terakhir."
          actionLabel="Coba lagi"
          onActionPress={onRefresh}
        />
      ) : null}

      {eldersFirstLoad || medsFirstLoad ? <MedicationsSkeleton /> : null}

      {eldersError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
        </View>
      ) : null}

      {medsFullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void medications.refetch()} isRetrying={medications.isRefetching} />
        </View>
      ) : null}

      {noElders ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="people-outline"
            title="Belum ada Eyang di sini"
            body="Tambahkan orang tersayang Anda dulu, lalu obatnya bisa dikelola di sini."
            ctaLabel="Tambah Eyang"
            onCtaPress={() => router.push('/setup-wizard')}
            iconAccessibilityLabel="Belum ada data"
          />
        </View>
      ) : null}

      {elder && !medsFirstLoad && !medsFullError && list.length === 0 ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="medkit-outline"
            title="Belum ada obat"
            body={`Tambahkan supaya ${companion?.displayName ?? 'pendamping'} bisa mengingatkan ${honorific}.`}
            ctaLabel="Tambah obat"
            onCtaPress={() => router.push('/medication-form')}
            iconAccessibilityLabel="Belum ada obat"
          />
        </View>
      ) : null}

      {elder && !medsFirstLoad && !medsFullError && list.length > 0 ? (
        <View style={styles.stack}>
          {list.map((medication) => (
            <MedicationRow
              key={medication.id}
              medication={medication}
              slots={slotsByMedicationId.get(medication.id) ?? []}
              onPress={() => router.push({ pathname: '/medication-form', params: { id: medication.id } })}
              onToggleActive={(next) => handleToggle(medication, next)}
              toggling={
                updateMedication.isPending && updateMedication.variables?.medicationId === medication.id
              }
            />
          ))}

          <Button
            label="+ Tambah obat"
            variant="secondary"
            onPress={() => router.push('/medication-form')}
          />
        </View>
      ) : null}

      <ConfirmSheet
        visible={Boolean(confirmTarget)}
        title={`${companion?.displayName ?? 'Pendamping'} akan berhenti mengingatkan obat ini`}
        body={
          confirmTarget
            ? `${confirmTarget.name} ${confirmTarget.dosage} tidak akan diingatkan lagi sampai diaktifkan kembali.`
            : undefined
        }
        confirmLabel="Nonaktifkan"
        cancelLabel="Batal"
        onConfirm={confirmDeactivate}
        onCancel={() => setConfirmTarget(null)}
      />
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
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  centerBlock: {
    paddingTop: spacing.xl,
  },
  stack: {
    gap: spacing.md,
  },
});
