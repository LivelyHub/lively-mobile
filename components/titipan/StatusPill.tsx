import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';
import { relativeTime } from '@/lib/time';

type StatusPillProps = {
  deliveredAt: string | null;
};

// Never color-only (UI-UX §3): pending vs delivered pairs a distinct icon +
// word with its tint, not just a color swap.
export function StatusPill({ deliveredAt }: StatusPillProps) {
  const delivered = deliveredAt != null;
  const presentation = delivered
    ? { icon: 'checkmark-circle' as const, color: colors.success, soft: colors.successSoft }
    : { icon: 'time-outline' as const, color: colors.warning, soft: colors.warningSoft };
  const label = delivered ? `Sudah disampaikan · ${relativeTime(deliveredAt!)}` : 'Menunggu disampaikan';

  return (
    <View style={[styles.pill, { backgroundColor: presentation.soft }]}>
      <Ionicons name={presentation.icon} size={14} color={presentation.color} />
      <Text style={[styles.label, { color: presentation.color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.xs,
    minHeight: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  label: {
    ...typography.caption,
    fontWeight: '600',
  },
});
