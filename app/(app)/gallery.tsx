import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  Banner,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Skeleton,
  TextField,
  useToast,
} from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';

// Dev-only visual QA surface (M0.2 test). Every base component in every state.
export default function GalleryScreen() {
  const { showToast } = useToast();
  const [errorRetrying, setErrorRetrying] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fakeRetry = () => {
    setErrorRetrying(true);
    setTimeout(() => setErrorRetrying(false), 1500);
  };

  const fakeSubmit = () => {
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      showToast({ message: 'Tersimpan', variant: 'success' });
    }, 1500);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Section title="Buttons">
        <Row>
          <Button label="Simpan" onPress={() => showToast({ message: 'Tombol primary' })} />
          <Button label="Batal" variant="secondary" onPress={() => {}} />
        </Row>
        <Row>
          <Button label="Lewati" variant="ghost" onPress={() => {}} />
          <Button label="Hapus" variant="danger" onPress={() => {}} />
        </Row>
        <Button
          label="Kirim titipan"
          fullWidth
          loading={submitting}
          onPress={fakeSubmit}
          iconLeft={<Ionicons name="paper-plane" size={18} color={colors.textOnPrimary} />}
        />
        <Row>
          <Button label="Loading" loading onPress={() => {}} />
          <Button label="Nonaktif" disabled onPress={() => {}} />
        </Row>
        <Button label="Secondary loading" variant="secondary" loading fullWidth onPress={() => {}} />
      </Section>

      <Section title="Card">
        <Card>
          <Text style={typography.section}>Eyang Uti</Text>
          <Text style={[typography.bodyMuted, styles.gapTop]}>
            Ditemani Mbak Asih. Terakhir mengobrol 2 jam lalu.
          </Text>
        </Card>
        <Card padding="md" style={styles.gapTop}>
          <Text style={typography.body}>Kartu dengan padding lebih kecil.</Text>
        </Card>
      </Section>

      <Section title="TextField">
        <TextField
          label="Nama panggilan"
          placeholder="Eyang Uti"
          helper="Sapaan yang dipakai Mbak Asih setiap hari."
        />
        <TextField
          label="Nomor WhatsApp"
          placeholder="+62 812 3456 7890"
          keyboardType="phone-pad"
          containerStyle={styles.gapTop}
        />
        <TextField
          label="Nomor WhatsApp"
          value="0812"
          error="Nomor belum lengkap. Pakai format +62."
          containerStyle={styles.gapTop}
        />
        <TextField
          label="Nama panggilan"
          value="Eyang Kakung"
          disabled
          containerStyle={styles.gapTop}
        />
      </Section>

      <Section title="Skeleton">
        <Card>
          <View style={styles.skeletonRow}>
            <Skeleton width={48} height={48} radius={radii.pill} />
            <View style={styles.skeletonLines}>
              <Skeleton width="60%" height={18} />
              <Skeleton width="90%" height={14} />
              <Skeleton width="40%" height={14} />
            </View>
          </View>
        </Card>
      </Section>

      <Section title="Empty state">
        <Card padding="xs">
          <EmptyState
            icon="chatbubbles-outline"
            title="Belum ada percakapan"
            body="Mbak Asih akan menyapa Eyang Uti besok pagi."
            ctaLabel="Kirim titipan"
            onCtaPress={() => showToast({ message: 'Membuka titipan' })}
            iconAccessibilityLabel="Ilustrasi percakapan kosong"
          />
        </Card>
      </Section>

      <Section title="Error state">
        <Card padding="xs">
          <ErrorState onRetry={fakeRetry} isRetrying={errorRetrying} />
        </Card>
      </Section>

      <Section title="Banner">
        <Banner variant="offline" message="Tidak ada koneksi, menampilkan data terakhir." />
        <View style={styles.gapTop}>
          <Banner
            variant="info"
            message="Mbak Asih sedang dijeda."
            actionLabel="Aktifkan"
            onActionPress={() => showToast({ message: 'Diaktifkan', variant: 'success' })}
          />
        </View>
        <View style={styles.gapTop}>
          <Banner
            variant="warning"
            message="Eyang Uti belum membalas hari ini, mungkin layak ditelepon."
            actionLabel="Lihat"
            onActionPress={() => {}}
          />
        </View>
        <View style={styles.gapTop}>
          <Banner variant="danger" message="Eyang Uti menyebut nyeri. Lihat pesannya." actionLabel="Buka" onActionPress={() => {}} />
        </View>
      </Section>

      <Section title="Toast">
        <Row>
          <Button
            label="Default"
            variant="secondary"
            onPress={() => showToast({ message: 'Obat tersimpan' })}
          />
          <Button
            label="Sukses"
            variant="secondary"
            onPress={() => showToast({ message: 'Titipan terkirim', variant: 'success' })}
          />
        </Row>
        <Button
          label="Danger"
          variant="secondary"
          fullWidth
          onPress={() => showToast({ message: 'Gagal menyimpan. Coba lagi.', variant: 'danger' })}
        />
      </Section>

      <View style={styles.footerSpace} />
    </ScrollView>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.lg,
    gap: spacing.xl,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.section,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  gapTop: {
    marginTop: spacing.md,
  },
  skeletonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  skeletonLines: {
    flex: 1,
    gap: spacing.sm,
  },
  footerSpace: {
    height: spacing.xxl,
  },
});
