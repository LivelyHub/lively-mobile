import { useEffect, useState } from 'react';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Banner, Button, TextField, useToast } from '@/components/ui';
import { SelectChip } from '@/components/setup/SelectChip';
import { colors, spacing, typography } from '@/constants/tokens';
import { ApiError } from '@/lib/api/errors';
import { useCreateMedication, useElders, useMedications, useUpdateMedication } from '@/lib/api/hooks';
import { companionMetaFromId } from '@/lib/companions';

type FieldErrors = { name?: string; dosage?: string; times?: string };

// HH:MM masking: strip non-digits, cap at 4 digits, insert the colon after the
// hour pair as the user types (no native picker per BACKLOG M6.1).
function maskTimeInput(text: string): string {
  const digits = text.replace(/[^0-9]/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

function validateTimeInput(value: string): string | undefined {
  if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(value)) {
    return 'Format waktu HH:MM, contoh 07:00';
  }
  return undefined;
}

export default function MedicationFormScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const params = useLocalSearchParams<{ id?: string }>();
  const isEditing = Boolean(params.id);

  const elders = useElders();
  const elder = elders.data?.[0];
  const companion = elder ? companionMetaFromId(elder.companion_id) : null;

  const medications = useMedications(elder?.id ?? '');
  const existing = isEditing ? medications.data?.find((m) => m.id === params.id) : undefined;

  const createMedication = useCreateMedication(elder?.id ?? '');
  const updateMedication = useUpdateMedication(elder?.id ?? '');
  const isPending = createMedication.isPending || updateMedication.isPending;

  const [prefilled, setPrefilled] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [times, setTimes] = useState<string[]>([]);
  const [active, setActive] = useState(true);
  const [timeInput, setTimeInput] = useState('');
  const [timeInputError, setTimeInputError] = useState<string | undefined>();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Prefill once the cached medication arrives (edit mode); guarded by `prefilled`
  // so a later cache refresh (post-save invalidation) never stomps live edits.
  useEffect(() => {
    if (isEditing && existing && !prefilled) {
      setName(existing.name);
      setDosage(existing.dosage);
      setTimes([...existing.schedule_times].sort());
      setActive(existing.active);
      setPrefilled(true);
    }
  }, [isEditing, existing, prefilled]);

  function dismiss() {
    if (router.canGoBack()) router.back();
    else router.replace('/medications');
  }

  function handleAddTime() {
    const error = validateTimeInput(timeInput);
    if (error) {
      setTimeInputError(error);
      return;
    }
    if (times.includes(timeInput)) {
      setTimeInputError('Waktu ini sudah ditambahkan');
      return;
    }
    setTimes((prev) => [...prev, timeInput].sort());
    setTimeInput('');
    setTimeInputError(undefined);
    if (fieldErrors.times) setFieldErrors((prev) => ({ ...prev, times: undefined }));
  }

  function removeTime(time: string) {
    setTimes((prev) => prev.filter((t) => t !== time));
  }

  function validate(): boolean {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Nama obat wajib diisi';
    if (!dosage.trim()) errors.dosage = 'Dosis wajib diisi';
    if (times.length === 0) errors.times = 'Tambahkan minimal satu waktu jadwal';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!elder) return;
    setSubmitError(null);
    if (!validate()) return;

    const body = { name: name.trim(), dosage: dosage.trim(), schedule_times: times, active };

    const onError = (error: unknown) => {
      setSubmitError(error instanceof ApiError ? error.message : 'Tidak bisa menyimpan. Coba lagi ya.');
    };
    const onSuccess = () => {
      toast.showToast({ message: 'Obat disimpan', variant: 'success' });
      dismiss();
    };

    if (isEditing && existing) {
      updateMedication.mutate({ medicationId: existing.id, body }, { onSuccess, onError });
    } else {
      createMedication.mutate({ elder_id: elder.id, ...body }, { onSuccess, onError });
    }
  }

  if (!elder) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{ title: isEditing ? 'Ubah Obat' : 'Tambah Obat' }} />

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {submitError ? <Banner variant="danger" message={submitError} /> : null}

        <TextField
          label="Nama obat"
          placeholder="Amlodipine"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={fieldErrors.name}
          editable={!isPending}
        />

        <TextField
          label="Dosis"
          placeholder="1 tablet, 5 mg"
          value={dosage}
          onChangeText={(text) => {
            setDosage(text);
            if (fieldErrors.dosage) setFieldErrors((prev) => ({ ...prev, dosage: undefined }));
          }}
          error={fieldErrors.dosage}
          editable={!isPending}
        />

        <View>
          <Text style={styles.fieldLabel}>Waktu jadwal</Text>
          <View style={styles.timeInputRow}>
            <TextField
              placeholder="07:00"
              value={timeInput}
              onChangeText={(text) => {
                setTimeInput(maskTimeInput(text));
                if (timeInputError) setTimeInputError(undefined);
              }}
              error={timeInputError}
              keyboardType="number-pad"
              maxLength={5}
              editable={!isPending}
              containerStyle={styles.timeInputField}
            />
            <Button
              label="Tambah waktu"
              variant="secondary"
              onPress={handleAddTime}
              disabled={isPending}
            />
          </View>

          {times.length > 0 ? (
            <View style={styles.chipWrap}>
              {times.map((time) => (
                <SelectChip
                  key={time}
                  label={time}
                  selected
                  onPress={() => removeTime(time)}
                  onRemove={() => removeTime(time)}
                  accessibilityHint="Ketuk untuk menghapus waktu ini"
                />
              ))}
            </View>
          ) : (
            <Text style={styles.emptyTimesText}>Belum ada waktu ditambahkan.</Text>
          )}
          {fieldErrors.times ? <Text style={styles.errorText}>{fieldErrors.times}</Text> : null}
        </View>

        <View style={styles.activeRow}>
          <View style={styles.activeText}>
            <Text style={styles.fieldLabel}>Aktif</Text>
            <Text style={styles.activeHelper}>
              {companion?.displayName ?? 'Pendamping'} akan mengingatkan sesuai jadwal di atas.
            </Text>
          </View>
          <Switch
            value={active}
            onValueChange={setActive}
            disabled={isPending}
            trackColor={{ false: colors.hairline, true: colors.primarySoft }}
            thumbColor={active ? colors.primary : colors.surface}
            accessibilityLabel="Obat aktif"
            accessibilityRole="switch"
          />
        </View>
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        <Button label="Simpan" onPress={handleSave} loading={isPending} fullWidth />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    gap: spacing.xl,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  timeInputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  timeInputField: {
    flex: 1,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  emptyTimesText: {
    ...typography.bodyMuted,
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  activeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  activeText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  activeHelper: {
    ...typography.caption,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
  },
});
