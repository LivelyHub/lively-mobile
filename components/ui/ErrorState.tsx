import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';
import { Button } from './Button';

type ErrorStateProps = {
  title?: string;
  message?: string;
  onRetry: () => void;
  isRetrying?: boolean;
  retryLabel?: string;
};

export function ErrorState({
  title = 'Tidak bisa terhubung',
  message = 'Coba lagi ya. Kalau masih gagal, periksa koneksi internetmu.',
  onRetry,
  isRetrying = false,
  retryLabel = 'Coba lagi',
}: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <Ionicons name="cloud-offline-outline" size={32} color={colors.textMuted} />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{message}</Text>
      <Button
        label={retryLabel}
        variant="secondary"
        onPress={onRetry}
        loading={isRetrying}
        style={styles.cta}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
    gap: spacing.md,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.section,
    textAlign: 'center',
  },
  body: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
  cta: {
    marginTop: spacing.sm,
  },
});
