import { useCallback, useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PersonaCard } from '@/components/setup/PersonaCard';
import { HEALTH_PRESETS, HONORIFIC_OPTIONS, healthFlagLabel, PERSONAS, personaByKey } from '@/components/setup/config';
import { SelectChip } from '@/components/setup/SelectChip';
import { Avatar, Button, Card, ConfirmSheet, EmptyState, ErrorState, Skeleton, TextField, useToast } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import { useElders, useFamilyMember, useUpdateElder } from '@/lib/api/hooks';
import type { CompanionKey, Elder } from '@/lib/api/types';
import { clearToken } from '@/lib/auth/token';
import { queryClient } from '@/lib/query/queryClient';

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const elders = useElders();
  const elder = elders.data?.[0];

  const firstLoad = elders.isLoading && !elders.data;
  const fullError = elders.isError && !elders.data;
  const noElder = Boolean(elders.data) && !elder;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
    >
      {firstLoad ? <SettingsSkeleton /> : null}

      {fullError ? (
        <View style={styles.centerBlock}>
          <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
        </View>
      ) : null}

      {noElder ? (
        <View style={styles.centerBlock}>
          <EmptyState
            icon="person-outline"
            title="Belum ada Eyang"
            body="Tambahkan orang tersayang Anda dulu untuk mengatur pendamping dan panggilannya."
            ctaLabel="Tambah Eyang"
            onCtaPress={() => router.replace('/setup-wizard')}
            iconAccessibilityLabel="Belum ada data"
          />
          <View style={styles.accountStandalone}>
            <AccountCard />
          </View>
        </View>
      ) : null}

      {elder ? <ElderSettings elder={elder} /> : null}
    </ScrollView>
  );
}

function ElderSettings({ elder }: { elder: Elder }) {
  const toast = useToast();
  const update = useUpdateElder(elder.id);
  const currentCompanion = elder.companion_key;

  const [savingField, setSavingField] = useState<null | 'honorific' | 'health' | 'companion' | 'pause'>(null);
  const [honorific, setHonorific] = useState(elder.honorific);
  const [flags, setFlags] = useState<string[]>(elder.health_flags);
  const [pendingCompanion, setPendingCompanion] = useState<CompanionKey | null>(null);
  const [pauseConfirm, setPauseConfirm] = useState(false);

  const persona = personaByKey(currentCompanion);

  const honorificDirty = honorific.trim().length > 0 && honorific.trim() !== elder.honorific;

  const saveHonorific = useCallback(async () => {
    const value = honorific.trim();
    if (!value || value === elder.honorific) return;
    setSavingField('honorific');
    try {
      await update.mutateAsync({ honorific: value });
      void Haptics.selectionAsync();
      toast.showToast({ message: 'Panggilan diperbarui.', variant: 'success' });
    } catch {
      setHonorific(elder.honorific);
      toast.showToast({ message: 'Gagal menyimpan. Coba lagi.', variant: 'danger' });
    } finally {
      setSavingField(null);
    }
  }, [honorific, elder.honorific, update, toast]);

  const toggleFlag = useCallback(
    async (code: string) => {
      const next = flags.includes(code) ? flags.filter((f) => f !== code) : [...flags, code];
      setFlags(next);
      setSavingField('health');
      try {
        await update.mutateAsync({ health_flags: next });
      } catch {
        setFlags(elder.health_flags);
        toast.showToast({ message: 'Gagal menyimpan catatan kesehatan.', variant: 'danger' });
      } finally {
        setSavingField(null);
      }
    },
    [flags, elder.health_flags, update, toast],
  );

  const confirmCompanionSwitch = useCallback(async () => {
    if (!pendingCompanion) return;
    setSavingField('companion');
    try {
      await update.mutateAsync({ companion_key: pendingCompanion });
      void Haptics.selectionAsync();
      toast.showToast({ message: `Pendamping diganti ke ${personaByKey(pendingCompanion).displayName}.`, variant: 'success' });
    } catch {
      toast.showToast({ message: 'Gagal mengganti pendamping.', variant: 'danger' });
    } finally {
      setSavingField(null);
      setPendingCompanion(null);
    }
  }, [pendingCompanion, update, toast]);

  const setPaused = useCallback(
    async (paused: boolean) => {
      setSavingField('pause');
      try {
        await update.mutateAsync({ paused });
        void Haptics.selectionAsync();
        toast.showToast({
          message: paused ? `${persona.displayName} dijeda.` : `${persona.displayName} aktif kembali.`,
          variant: 'success',
        });
      } catch {
        toast.showToast({ message: 'Gagal memperbarui status jeda.', variant: 'danger' });
      } finally {
        setSavingField(null);
      }
    },
    [update, toast, persona.displayName],
  );

  const customFlags = useMemo(
    () => flags.filter((f) => !HEALTH_PRESETS.some((p) => p.code === f)),
    [flags],
  );

  return (
    <View style={styles.stack}>
      {/* Elder header */}
      <View style={styles.elderHeader}>
        <Avatar initials={persona.initials} tint={persona.tint} tintText={persona.tintText} size={56} />
        <View style={styles.elderHeaderText}>
          <Text style={styles.elderName}>{elder.honorific}</Text>
          <Text style={styles.elderSub}>{elder.name}</Text>
        </View>
        {elder.paused ? (
          <View style={styles.pausedChip}>
            <Ionicons name="pause" size={13} color={colors.warning} />
            <Text style={styles.pausedChipText}>Dijeda</Text>
          </View>
        ) : null}
      </View>

      {/* Honorific */}
      <Card>
        <SectionHeader title="Panggilan" saving={savingField === 'honorific'} />
        <Text style={styles.sectionHelp}>
          Cara pendamping menyapa {elder.name}. Pilih salah satu atau tulis sendiri.
        </Text>
        <View style={styles.chipWrap}>
          {HONORIFIC_OPTIONS.map((option) => (
            <SelectChip
              key={option}
              label={option}
              selected={honorific.trim() === option}
              onPress={() => setHonorific(option)}
            />
          ))}
        </View>
        <TextField
          label="Atau tulis sendiri"
          value={honorific}
          onChangeText={setHonorific}
          placeholder="Mis. Eyang Uti"
          containerStyle={styles.honorificInput}
        />
        {honorificDirty ? (
          <Button
            label="Simpan panggilan"
            variant="secondary"
            onPress={saveHonorific}
            loading={savingField === 'honorific'}
            style={styles.saveButton}
          />
        ) : null}
      </Card>

      {/* Companion */}
      <Card>
        <SectionHeader title="Pendamping" saving={savingField === 'companion'} />
        <Text style={styles.sectionHelp}>
          Ganti siapa yang menemani {elder.honorific} mengobrol setiap hari.
        </Text>
        <View style={styles.personaStack}>
          {PERSONAS.map((p) => (
            <PersonaCard
              key={p.key}
              persona={p}
              honorific={honorific.trim() || elder.honorific}
              selected={p.key === currentCompanion}
              onPress={() => {
                if (p.key !== currentCompanion) setPendingCompanion(p.key);
              }}
            />
          ))}
        </View>
      </Card>

      {/* Health flags */}
      <Card>
        <SectionHeader title="Catatan kesehatan" saving={savingField === 'health'} />
        <Text style={styles.sectionHelp}>
          Membantu pendamping menyesuaikan obrolan dan pengingat untuk {elder.honorific}.
        </Text>
        <View style={styles.chipWrap}>
          {HEALTH_PRESETS.map((preset) => (
            <SelectChip
              key={preset.code}
              label={preset.label}
              selected={flags.includes(preset.code)}
              onPress={() => toggleFlag(preset.code)}
            />
          ))}
          {customFlags.map((code) => (
            <SelectChip
              key={code}
              label={healthFlagLabel(code)}
              selected
              onPress={() => toggleFlag(code)}
              onRemove={() => toggleFlag(code)}
            />
          ))}
        </View>
      </Card>

      {/* Pause */}
      <Card>
        <View style={styles.pauseRow}>
          <View style={styles.pauseText}>
            <Text style={styles.sectionTitle}>Jeda pendamping</Text>
            <Text style={styles.sectionHelp}>
              {elder.paused
                ? `${persona.displayName} sedang dijeda dan tidak mengirim pesan.`
                : `${persona.displayName} akan berhenti mengirim pesan sampai diaktifkan lagi.`}
            </Text>
          </View>
          {savingField === 'pause' ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Switch
              value={elder.paused}
              onValueChange={(next) => {
                if (next) setPauseConfirm(true);
                else void setPaused(false);
              }}
              trackColor={{ false: colors.hairline, true: colors.warning }}
              thumbColor={colors.surface}
            />
          )}
        </View>
      </Card>

      <AccountCard />

      <ConfirmSheet
        visible={pendingCompanion !== null}
        title={pendingCompanion ? `Ganti ke ${personaByKey(pendingCompanion).displayName}?` : ''}
        body="Gaya bicara dan sapaan hariannya akan berubah. Riwayat obrolan tetap tersimpan."
        confirmLabel="Ganti pendamping"
        onConfirm={confirmCompanionSwitch}
        onCancel={() => setPendingCompanion(null)}
        loading={savingField === 'companion'}
      />

      <ConfirmSheet
        visible={pauseConfirm}
        title={`Jeda ${persona.displayName}?`}
        body={`${persona.displayName} akan berhenti mengirim pesan ke ${elder.honorific} sampai Anda mengaktifkannya lagi.`}
        confirmLabel="Jeda pendamping"
        confirmVariant="danger"
        onConfirm={async () => {
          setPauseConfirm(false);
          await setPaused(true);
        }}
        onCancel={() => setPauseConfirm(false)}
        loading={savingField === 'pause'}
      />
    </View>
  );
}

function AccountCard() {
  const family = useFamilyMember();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = useCallback(async () => {
    setLoggingOut(true);
    await clearToken();
    queryClient.clear();
    router.replace('/login');
  }, []);

  return (
    <Card>
      <Text style={styles.sectionTitle}>Akun</Text>
      <View style={styles.accountRow}>
        <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
        <Text style={styles.accountEmail} numberOfLines={1}>
          {family.data?.email ?? '—'}
        </Text>
      </View>
      <Button label="Keluar" variant="danger" onPress={handleLogout} loading={loggingOut} style={styles.saveButton} />
    </Card>
  );
}

function SectionHeader({ title, saving }: { title: string; saving: boolean }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {saving ? <ActivityIndicator size="small" color={colors.primary} /> : null}
    </View>
  );
}

function SettingsSkeleton() {
  return (
    <View style={styles.stack}>
      <View style={styles.elderHeader}>
        <Skeleton width={56} height={56} radius={radii.pill} />
        <View style={styles.grow}>
          <Skeleton width={'50%'} height={20} />
          <Skeleton width={'35%'} height={14} />
        </View>
      </View>
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <Skeleton width={'40%'} height={20} />
          <Skeleton width={'90%'} height={14} style={styles.skeletonMt} />
          <View style={styles.chipWrap}>
            {[0, 1, 2, 3].map((j) => (
              <Skeleton key={j} width={92} height={40} radius={radii.pill} />
            ))}
          </View>
        </Card>
      ))}
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
  centerBlock: {
    paddingTop: spacing.lg,
  },
  accountStandalone: {
    marginTop: spacing.lg,
  },
  stack: {
    gap: spacing.lg,
  },
  elderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xs,
  },
  elderHeaderText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  elderName: {
    ...typography.section,
  },
  elderSub: {
    ...typography.bodyMuted,
  },
  pausedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.warningSoft,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  pausedChipText: {
    ...typography.caption,
    color: colors.warning,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 28,
  },
  sectionTitle: {
    ...typography.section,
  },
  sectionHelp: {
    ...typography.bodyMuted,
    marginTop: spacing.xs,
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  honorificInput: {
    marginTop: spacing.md,
  },
  saveButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  personaStack: {
    gap: spacing.md,
  },
  pauseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  pauseText: {
    flex: 1,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  accountEmail: {
    ...typography.body,
    flex: 1,
  },
  grow: {
    flex: 1,
    gap: spacing.sm,
  },
  skeletonMt: {
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
});
