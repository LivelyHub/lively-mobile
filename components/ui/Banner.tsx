import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

export type BannerVariant = 'info' | 'warning' | 'danger' | 'offline';

type BannerProps = {
  message: string;
  variant?: BannerVariant;
  actionLabel?: string;
  onActionPress?: () => void;
  onDismiss?: () => void;
};

type BannerStyle = {
  background: string;
  accent: string;
  icon: React.ComponentProps<typeof Ionicons>['name'];
};

// Urgency tiers map to UI-UX §5: info = neutral, warning = attention, danger = urgent.
const VARIANTS: Record<BannerVariant, BannerStyle> = {
  info: {
    background: colors.primarySoft,
    accent: colors.primary,
    icon: 'information-circle',
  },
  warning: {
    background: colors.warningSoft,
    accent: colors.warning,
    icon: 'alert-circle',
  },
  danger: {
    background: colors.dangerSoft,
    accent: colors.danger,
    icon: 'warning',
  },
  offline: {
    background: colors.hairline,
    accent: colors.textMuted,
    icon: 'cloud-offline',
  },
};

export function Banner({ message, variant = 'info', actionLabel, onActionPress, onDismiss }: BannerProps) {
  const v = VARIANTS[variant];
  return (
    <View style={[styles.container, { backgroundColor: v.background }]}>
      <Ionicons name={v.icon} size={20} color={v.accent} style={styles.icon} />
      <Text style={styles.message}>{message}</Text>
      {actionLabel && onActionPress ? (
        <Pressable
          onPress={onActionPress}
          accessibilityRole="button"
          hitSlop={8}
          style={({ pressed }) => [styles.action, pressed && styles.actionPressed]}
        >
          <Text style={[styles.actionLabel, { color: v.accent }]}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onDismiss ? (
        <Pressable
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Tutup"
          hitSlop={8}
          style={({ pressed }) => [styles.dismiss, pressed && styles.actionPressed]}
        >
          <Ionicons name="close" size={18} color={v.accent} />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    gap: spacing.sm,
    minHeight: 44,
  },
  icon: {
    marginTop: 1,
  },
  message: {
    ...typography.body,
    flex: 1,
  },
  action: {
    minHeight: 44,
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
  },
  dismiss: {
    minHeight: 44,
    minWidth: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionPressed: {
    opacity: 0.6,
  },
  actionLabel: {
    ...typography.button,
  },
});
