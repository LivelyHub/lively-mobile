import { Ionicons } from '@expo/vector-icons';
import { Stack, router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  BackHandler,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChipListField } from '@/components/setup/ChipListField';
import { PersonaCard } from '@/components/setup/PersonaCard';
import { PhoneField } from '@/components/setup/PhoneField';
import { SelectChip } from '@/components/setup/SelectChip';
import { StepIndicator } from '@/components/setup/StepIndicator';
import { SuccessMoment } from '@/components/setup/SuccessMoment';
import {
  AVOID_TOPIC_PRESETS,
  HEALTH_PRESETS,
  HOBBY_PRESETS,
  HONORIFIC_OPTIONS,
  PERSONAS,
  RELIGION_OPTIONS,
  TOPIC_PRESETS,
  avoidTopicLabel,
  composeE164,
  formatPhoneDisplay,
  healthFlagLabel,
  hobbyLabel,
  personaByKey,
  topicLabel,
  validatePhone,
} from '@/components/setup/config';
import { Banner, Button, TextField } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { useRequestPushPermission } from '@/hooks/usePushRegistration';
import { ApiError } from '@/lib/api/errors';
import { useCreateElder } from '@/lib/api/hooks';
import type { CompanionKey, Religion, WelcomeMessageStatus } from '@/lib/api/types';

const STEP_LABELS = [
  'Tentang Eyang',
  'Pilih teman',
  'Catatan kesehatan',
  'Personalisasi',
  'Periksa kembali',
] as const;
const LAST_STEP = STEP_LABELS.length; // 5

// Generic preset-chip toggle + verbatim-custom-add, shared by health/hobbies/
// topics/avoid-topics so each field isn't its own hand-rolled copy.
function toggleChip(setter: (updater: (prev: string[]) => string[]) => void, code: string) {
  setter((prev) => (prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]));
}

function addCustomChip(
  setter: (updater: (prev: string[]) => string[]) => void,
  value: string,
  clearInput: () => void,
) {
  const trimmed = value.trim();
  if (!trimmed) return;
  setter((prev) => (prev.some((c) => c.toLowerCase() === trimmed.toLowerCase()) ? prev : [...prev, trimmed]));
  clearInput();
}

type FieldErrors = { name?: string; honorific?: string; phone?: string };

export default function SetupWizardScreen() {
  const insets = useSafeAreaInsets();
  const createElder = useCreateElder();
  const requestPush = useRequestPushPermission();

  // All input lives here so back-nav and edit-jumps preserve everything. Mounting
  // this route fresh (a new push from Home) resets it — the re-entry requirement.
  const [step, setStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [welcomeMessageStatus, setWelcomeMessageStatus] = useState<WelcomeMessageStatus | undefined>();

  const [name, setName] = useState('');
  const [honorificPreset, setHonorificPreset] = useState<string | null>(null);
  const [honorificCustom, setHonorificCustom] = useState('');
  const [phone, setPhone] = useState('');
  const [companionKey, setCompanionKey] = useState<CompanionKey | null>(null);
  const [healthCodes, setHealthCodes] = useState<string[]>([]);
  const [customHealth, setCustomHealth] = useState('');

  const [hobbies, setHobbies] = useState<string[]>([]);
  const [customHobby, setCustomHobby] = useState('');
  const [favoriteTopics, setFavoriteTopics] = useState<string[]>([]);
  const [customTopic, setCustomTopic] = useState('');
  const [avoidTopics, setAvoidTopics] = useState<string[]>([]);
  const [customAvoidTopic, setCustomAvoidTopic] = useState('');
  const [speechStyle, setSpeechStyle] = useState('');
  const [religion, setReligion] = useState<Religion | null>(null);

  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [companionError, setCompanionError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const honorific = (honorificPreset ?? honorificCustom.trim()).trim();
  const persona = companionKey ? personaByKey(companionKey) : null;

  const goBack = useCallback(() => {
    setSubmitError(null);
    setStep((s) => Math.max(1, s - 1));
  }, []);

  // Android hardware back: step back when past step 1, otherwise let the modal
  // dismiss. On the success screen it is consumed so the button is the only exit.
  useEffect(() => {
    const onHardwareBack = () => {
      if (showSuccess) return true;
      if (step > 1) {
        goBack();
        return true;
      }
      return false;
    };
    const sub = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => sub.remove();
  }, [step, showSuccess, goBack]);

  function validateStep1(): boolean {
    const errors: FieldErrors = {};
    if (!name.trim()) errors.name = 'Nama Eyang wajib diisi';
    if (!honorific) errors.honorific = 'Pilih atau tulis panggilan untuk Eyang';
    errors.phone = validatePhone(phone);
    setFieldErrors(errors);
    return !errors.name && !errors.honorific && !errors.phone;
  }

  function handleNext() {
    setSubmitError(null);
    if (step === 1) {
      if (!validateStep1()) return;
    }
    if (step === 2) {
      if (!companionKey) {
        setCompanionError('Pilih salah satu teman dulu ya');
        return;
      }
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  }

  function handleSelectCompanion(key: CompanionKey) {
    setCompanionKey(key);
    setCompanionError(null);
  }

  function toggleHealth(code: string) {
    toggleChip(setHealthCodes, code);
  }

  function addCustomHealth() {
    addCustomChip(setHealthCodes, customHealth, () => setCustomHealth(''));
  }

  function handleSubmit() {
    if (!companionKey) return;
    setSubmitError(null);
    createElder.mutate(
      {
        name: name.trim(),
        honorific,
        companion_key: companionKey,
        health_flags: healthCodes,
        phone_e164: composeE164(phone),
        hobbies,
        favorite_topics: favoriteTopics,
        avoid_topics: avoidTopics,
        speech_style: speechStyle.trim(),
        religion: religion ?? undefined,
      },
      {
        onSuccess: (elder) => {
          setWelcomeMessageStatus(elder.welcome_message_status);
          setShowSuccess(true);
          // Ask for notification permission now that there's an elder to be
          // notified about (M8.1) — fire-and-forget so the success moment isn't
          // blocked; no-ops on web/simulator.
          void requestPush();
        },
        onError: (error) => {
          if (error instanceof ApiError && error.fields) {
            const mapped: FieldErrors = {};
            if (error.fields.name) mapped.name = error.fields.name;
            if (error.fields.honorific) mapped.honorific = error.fields.honorific;
            if (error.fields.phone_e164) mapped.phone = error.fields.phone_e164;
            if (mapped.name || mapped.honorific || mapped.phone) {
              setFieldErrors((prev) => ({ ...prev, ...mapped }));
              setStep(1);
              return;
            }
          }
          const message =
            error instanceof ApiError ? error.message : 'Tidak bisa menyimpan. Coba lagi ya.';
          setSubmitError(message);
        },
      },
    );
  }

  function handleDone() {
    if (router.canGoBack()) router.back();
    else router.replace('/');
  }

  if (showSuccess && persona) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false, gestureEnabled: false }} />
        <SuccessMoment
          companionName={persona.displayName}
          honorific={honorific}
          welcomeMessageStatus={welcomeMessageStatus}
          onDone={handleDone}
        />
      </>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.indicatorWrap}>
        <StepIndicator steps={STEP_LABELS} current={step - 1} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        {step === 1 ? renderAboutStep() : null}
        {step === 2 ? renderCompanionStep() : null}
        {step === 3 ? renderHealthStep() : null}
        {step === 4 ? renderPersonalizationStep() : null}
        {step === 5 ? renderConfirmStep() : null}
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.md }]}>
        {renderFooter()}
      </View>
    </KeyboardAvoidingView>
  );

  function renderAboutStep() {
    return (
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.heading}>Ceritakan tentang Eyang</Text>
          <Text style={styles.subheading}>
            Nama dan panggilan ini yang akan dipakai teman Eyang setiap hari.
          </Text>
        </View>

        <TextField
          label="Nama Eyang"
          placeholder="Nama lengkap atau nama panggilan"
          value={name}
          onChangeText={(text) => {
            setName(text);
            if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
          }}
          error={fieldErrors.name}
          autoCapitalize="words"
          editable={!createElder.isPending}
        />

        <View>
          <Text style={styles.fieldLabel}>Panggilan</Text>
          <Text style={styles.fieldHelper}>Eyang selalu dipanggil dengan hormat, tidak dengan nama saja.</Text>
          <View style={styles.chipWrap}>
            {HONORIFIC_OPTIONS.map((option) => (
              <SelectChip
                key={option}
                label={option}
                selected={honorificPreset === option}
                onPress={() => {
                  setHonorificPreset(option);
                  setHonorificCustom('');
                  if (fieldErrors.honorific) setFieldErrors((prev) => ({ ...prev, honorific: undefined }));
                }}
              />
            ))}
          </View>
          <TextField
            containerStyle={styles.customHonorific}
            placeholder="Atau tulis panggilan lain"
            value={honorificCustom}
            onChangeText={(text) => {
              setHonorificCustom(text);
              setHonorificPreset(null);
              if (fieldErrors.honorific) setFieldErrors((prev) => ({ ...prev, honorific: undefined }));
            }}
            autoCapitalize="words"
            editable={!createElder.isPending}
          />
          {fieldErrors.honorific ? <Text style={styles.errorText}>{fieldErrors.honorific}</Text> : null}
        </View>

        <PhoneField
          value={phone}
          onChangeText={(text) => {
            setPhone(text);
            if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
          }}
          onBlur={() => setFieldErrors((prev) => ({ ...prev, phone: validatePhone(phone) }))}
          error={fieldErrors.phone}
          helper="Nomor WhatsApp yang dipakai Eyang untuk mengobrol."
          editable={!createElder.isPending}
        />
      </View>
    );
  }

  function renderCompanionStep() {
    return (
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.heading}>Pilih teman untuk {honorific || 'Eyang'}</Text>
          <Text style={styles.subheading}>
            Keduanya penyayang. Pilih yang gaya bicaranya paling cocok untuk Eyang.
          </Text>
        </View>

        <View style={styles.personaList}>
          {PERSONAS.map((p) => (
            <PersonaCard
              key={p.key}
              persona={p}
              honorific={honorific}
              selected={companionKey === p.key}
              onPress={() => handleSelectCompanion(p.key)}
            />
          ))}
        </View>

        {companionError ? <Text style={styles.errorText}>{companionError}</Text> : null}
      </View>
    );
  }

  function renderHealthStep() {
    return (
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.heading}>Ada yang perlu diperhatikan?</Text>
          <Text style={styles.subheading}>
            Teman Eyang akan lebih peka soal ini. Boleh dilewati kalau belum ada.
          </Text>
        </View>

        <ChipListField
          presets={HEALTH_PRESETS}
          selected={healthCodes}
          onToggle={toggleHealth}
          customValue={customHealth}
          onCustomChange={setCustomHealth}
          onAddCustom={addCustomHealth}
          placeholder="Tambah catatan lain"
          disabled={createElder.isPending}
        />
      </View>
    );
  }

  function renderPersonalizationStep() {
    return (
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.heading}>Kenali {honorific || 'Eyang'} lebih dekat</Text>
          <Text style={styles.subheading}>
            Ini yang bikin obrolan teman Eyang terasa personal, bukan sekadar sapaan.
          </Text>
        </View>

        <ChipListField
          label="Hobi"
          presets={HOBBY_PRESETS}
          selected={hobbies}
          onToggle={(code) => toggleChip(setHobbies, code)}
          customValue={customHobby}
          onCustomChange={setCustomHobby}
          onAddCustom={() => addCustomChip(setHobbies, customHobby, () => setCustomHobby(''))}
          placeholder="Tambah hobi lain"
          disabled={createElder.isPending}
        />

        <ChipListField
          label="Topik favorit"
          helper="Hal-hal yang bikin semangat kalau dibahas."
          presets={TOPIC_PRESETS}
          selected={favoriteTopics}
          onToggle={(code) => toggleChip(setFavoriteTopics, code)}
          customValue={customTopic}
          onCustomChange={setCustomTopic}
          onAddCustom={() => addCustomChip(setFavoriteTopics, customTopic, () => setCustomTopic(''))}
          placeholder="Tambah topik lain"
          disabled={createElder.isPending}
        />

        <ChipListField
          label="Topik yang dihindari"
          helper="Kalau ada duka atau hal berat yang sebaiknya tidak disinggung dulu."
          presets={AVOID_TOPIC_PRESETS}
          selected={avoidTopics}
          onToggle={(code) => toggleChip(setAvoidTopics, code)}
          customValue={customAvoidTopic}
          onCustomChange={setCustomAvoidTopic}
          onAddCustom={() =>
            addCustomChip(setAvoidTopics, customAvoidTopic, () => setCustomAvoidTopic(''))
          }
          placeholder="Tambah topik lain"
          disabled={createElder.isPending}
        />

        <View>
          <Text style={styles.fieldLabel}>Agama</Text>
          <View style={styles.chipWrap}>
            {RELIGION_OPTIONS.map((option) => (
              <SelectChip
                key={option.code}
                label={option.label}
                selected={religion === option.code}
                onPress={() => setReligion(option.code)}
              />
            ))}
          </View>
        </View>

        <TextField
          label="Gaya bicara"
          placeholder="Misalnya: banyak pakai bahasa Jawa, suka bercanda"
          value={speechStyle}
          onChangeText={setSpeechStyle}
          autoCapitalize="sentences"
          editable={!createElder.isPending}
        />
      </View>
    );
  }

  function renderConfirmStep() {
    const healthLabels = healthCodes.map((code) => healthFlagLabel(code));
    const hobbyLabels = hobbies.map((code) => hobbyLabel(code));
    const topicLabels = favoriteTopics.map((code) => topicLabel(code));
    const avoidLabels = avoidTopics.map((code) => avoidTopicLabel(code));
    const religionLabel = religion ? RELIGION_OPTIONS.find((o) => o.code === religion)?.label : undefined;
    return (
      <View style={styles.stepBody}>
        <View style={styles.stepHeader}>
          <Text style={styles.heading}>Sudah pas?</Text>
          <Text style={styles.subheading}>Periksa sebentar sebelum kita mulai.</Text>
        </View>

        {submitError ? <Banner variant="danger" message={submitError} /> : null}

        <View style={styles.summary}>
          <SummaryRow
            label="Panggilan & nama"
            value={`${honorific} ${name.trim()}`.trim()}
            onEdit={() => setStep(1)}
          />
          <SummaryRow label="Teman" value={persona?.displayName ?? '-'} onEdit={() => setStep(2)} />
          <SummaryRow
            label="Nomor WhatsApp"
            value={formatPhoneDisplay(phone)}
            onEdit={() => setStep(1)}
          />
          <SummaryRow
            label="Catatan kesehatan"
            value={healthLabels.length ? healthLabels.join(', ') : 'Belum ada'}
            onEdit={() => setStep(3)}
            muted={healthLabels.length === 0}
          />
          <SummaryRow
            label="Hobi"
            value={hobbyLabels.length ? hobbyLabels.join(', ') : 'Belum ada'}
            onEdit={() => setStep(4)}
            muted={hobbyLabels.length === 0}
          />
          <SummaryRow
            label="Topik favorit"
            value={topicLabels.length ? topicLabels.join(', ') : 'Belum ada'}
            onEdit={() => setStep(4)}
            muted={topicLabels.length === 0}
          />
          <SummaryRow
            label="Topik yang dihindari"
            value={avoidLabels.length ? avoidLabels.join(', ') : 'Belum ada'}
            onEdit={() => setStep(4)}
            muted={avoidLabels.length === 0}
          />
          <SummaryRow
            label="Gaya bicara"
            value={speechStyle.trim() || 'Belum ada'}
            onEdit={() => setStep(4)}
            muted={!speechStyle.trim()}
          />
          <SummaryRow
            label="Agama"
            value={religionLabel ?? 'Belum ada'}
            onEdit={() => setStep(4)}
            muted={!religionLabel}
          />
        </View>
      </View>
    );
  }

  function renderFooter() {
    if (step === 1) {
      return <Button label="Lanjut" onPress={handleNext} fullWidth disabled={createElder.isPending} />;
    }
    if (step === LAST_STEP) {
      return (
        <View style={styles.footerRow}>
          <Button
            label="Kembali"
            variant="ghost"
            onPress={goBack}
            disabled={createElder.isPending}
            style={styles.footerBack}
          />
          <Button
            label="Simpan"
            onPress={handleSubmit}
            loading={createElder.isPending}
            style={styles.footerPrimary}
          />
        </View>
      );
    }
    const step3Empty = step === 3 && healthCodes.length === 0;
    const step4Empty =
      step === 4 &&
      hobbies.length === 0 &&
      favoriteTopics.length === 0 &&
      avoidTopics.length === 0 &&
      !speechStyle.trim() &&
      !religion;
    const primaryLabel = step3Empty || step4Empty ? 'Lewati' : 'Lanjut';
    return (
      <View style={styles.footerRow}>
        <Button
          label="Kembali"
          variant="ghost"
          onPress={goBack}
          disabled={createElder.isPending}
          style={styles.footerBack}
        />
        <Button label={primaryLabel} onPress={handleNext} style={styles.footerPrimary} />
      </View>
    );
  }
}

function SummaryRow({
  label,
  value,
  onEdit,
  muted,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  muted?: boolean;
}) {
  return (
    <View style={styles.summaryRow}>
      <View style={styles.summaryText}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <Text style={[styles.summaryValue, muted && styles.summaryValueMuted]}>{value}</Text>
      </View>
      <Pressable
        onPress={onEdit}
        hitSlop={8}
        accessibilityRole="button"
        accessibilityLabel={`Ubah ${label}`}
        style={({ pressed }) => [styles.editButton, pressed && styles.editButtonPressed]}
      >
        <Ionicons name="pencil" size={16} color={colors.primary} />
        <Text style={styles.editLabel}>Ubah</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  indicatorWrap: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.xxl,
  },
  stepBody: {
    gap: spacing.xl,
  },
  stepHeader: {
    gap: spacing.sm,
  },
  heading: {
    ...typography.title,
  },
  subheading: {
    ...typography.bodyMuted,
  },
  fieldLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fieldHelper: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  customHonorific: {
    marginTop: spacing.md,
  },
  errorText: {
    ...typography.caption,
    color: colors.danger,
    marginTop: spacing.xs,
  },
  personaList: {
    gap: spacing.lg,
  },
  summary: {
    gap: spacing.xs,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.hairline,
    gap: spacing.md,
  },
  summaryText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  summaryLabel: {
    ...typography.caption,
    color: colors.textMuted,
  },
  summaryValue: {
    ...typography.body,
    fontWeight: '600',
  },
  summaryValueMuted: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 44,
    paddingHorizontal: spacing.sm,
  },
  editButtonPressed: {
    opacity: 0.6,
  },
  editLabel: {
    ...typography.button,
    color: colors.primary,
  },
  footer: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.hairline,
    backgroundColor: colors.surface,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  footerBack: {
    flex: 1,
  },
  footerPrimary: {
    flex: 1.4,
  },
});
