import { useMemo, useState } from 'react';
import { router } from 'expo-router';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ComposerInput, TitipanListSkeleton, TitipanRow } from '@/components/titipan';
import { Banner, Button, EmptyState, ErrorState, useToast } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { useIsOffline } from '@/hooks/useIsOffline';
import { ApiError } from '@/lib/api/errors';
import { useElders, useSendTitipan, useTitipanList } from '@/lib/api/hooks';
import { companionMetaFromKey } from '@/lib/companions';

const TITIPAN_POLL_MS = 15_000; // Poll while the modal is open so a delivered_at set by the backend flips the pill (M7.1).

export default function TitipanScreen() {
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isOffline = useIsOffline();

  const elders = useElders();
  const elder = elders.data?.[0];
  const honorific = elder?.honorific ?? 'Eyang';

  const titipan = useTitipanList(elder?.id ?? '', { refetchInterval: TITIPAN_POLL_MS });
  const sendTitipan = useSendTitipan(elder?.id ?? '');

  const [text, setText] = useState('');
  const [sendError, setSendError] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...(titipan.data ?? [])].sort((a, b) => (a.created_at < b.created_at ? 1 : -1)),
    [titipan.data],
  );

  function handleSend() {
    if (!elder || sendTitipan.isPending) return;
    const trimmed = text.trim();
    if (!trimmed) return;
    setSendError(null);
    sendTitipan.mutate(
      { body: trimmed },
      {
        onSuccess: () => {
          toast.showToast({ variant: 'success', message: 'Titipan terkirim' });
          setText('');
        },
        onError: (error) => {
          setSendError(error instanceof ApiError ? error.message : 'Tidak bisa mengirim. Coba lagi ya.');
        },
      },
    );
  }

  const eldersFirstLoad = elders.isLoading && !elders.data;
  const eldersError = elders.isError && !elders.data;
  const noElders = Boolean(elders.data) && !elder;

  const titipanFirstLoad = Boolean(elder) && titipan.isLoading && !titipan.data;
  const titipanFullError = Boolean(elder) && titipan.isError && !titipan.data;

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + spacing.xxl }]}
        keyboardShouldPersistTaps="handled"
      >
        {eldersFirstLoad ? (
          <View style={styles.centerBlock}>
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : null}

        {eldersError ? (
          <View style={styles.centerBlock}>
            <ErrorState onRetry={() => void elders.refetch()} isRetrying={elders.isRefetching} />
          </View>
        ) : null}

        {noElders ? (
          <View style={styles.centerBlock}>
            <EmptyState
              icon="people-outline"
              title="Belum ada Eyang di sini"
              body="Tambahkan orang tersayang Anda dulu, supaya titipan bisa disampaikan lewat pendampingnya."
              ctaLabel="Tambah Eyang"
              onCtaPress={() => router.push('/setup-wizard')}
              iconAccessibilityLabel="Belum ada data"
            />
          </View>
        ) : null}

        {elder ? (
          <View style={styles.stack}>
            <Text style={styles.explainer}>
              {companionMetaFromKey(elder.companion_key).displayName} akan menyampaikan pesan ini ke {honorific} dengan
              gayanya sendiri.
            </Text>

            <ComposerInput
              label="Pesan"
              placeholder={`Tulis titipan untuk ${honorific}...`}
              value={text}
              onChangeText={setText}
              disabled={sendTitipan.isPending}
            />

            {sendError ? <Banner variant="danger" message={sendError} /> : null}

            <Button
              label="Kirim titipan"
              onPress={handleSend}
              loading={sendTitipan.isPending}
              disabled={!text.trim() || isOffline}
              fullWidth
            />

            <View style={styles.listSection}>
              <Text style={styles.sectionLabel}>Titipan terkirim</Text>

              {titipanFirstLoad ? <TitipanListSkeleton /> : null}

              {titipanFullError ? (
                <ErrorState
                  message="Tidak bisa memuat titipan sebelumnya."
                  onRetry={() => void titipan.refetch()}
                  isRetrying={titipan.isRefetching}
                />
              ) : null}

              {titipan.isError && titipan.data ? (
                <Banner
                  variant="danger"
                  message="Gagal memperbarui daftar titipan. Menampilkan data terakhir."
                  actionLabel="Coba lagi"
                  onActionPress={() => void titipan.refetch()}
                />
              ) : null}

              {!titipanFirstLoad && !titipanFullError && sorted.length === 0 ? (
                <Text style={styles.emptyList}>Belum ada titipan.</Text>
              ) : null}

              {!titipanFirstLoad && !titipanFullError && sorted.length > 0 ? (
                <View style={styles.rows}>
                  {sorted.map((message) => (
                    <TitipanRow key={message.id} message={message} />
                  ))}
                </View>
              ) : null}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
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
    gap: spacing.md,
  },
  centerBlock: {
    paddingTop: spacing.xl,
  },
  stack: {
    gap: spacing.md,
  },
  explainer: {
    ...typography.bodyMuted,
  },
  listSection: {
    marginTop: spacing.xl,
    gap: spacing.md,
  },
  sectionLabel: {
    ...typography.section,
  },
  emptyList: {
    ...typography.bodyMuted,
  },
  rows: {
    gap: spacing.md,
  },
});
