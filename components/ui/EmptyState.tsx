import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';
import { Button } from './Button';

type EmptyStateProps = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  body?: string;
  ctaLabel?: string;
  onCtaPress?: () => void;
  iconAccessibilityLabel?: string;
};

export function EmptyState({
  icon,
  title,
  body,
  ctaLabel,
  onCtaPress,
  iconAccessibilityLabel,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <View
        style={styles.iconCircle}
        accessibilityRole="image"
        accessibilityLabel={iconAccessibilityLabel}
      >
        <Ionicons name={icon} size={32} color={colors.primary} />
      </View>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {ctaLabel && onCtaPress ? (
        <Button label={ctaLabel} onPress={onCtaPress} style={styles.cta} />
      ) : null}
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
    backgroundColor: colors.primarySoft,
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
