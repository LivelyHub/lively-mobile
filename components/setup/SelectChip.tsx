import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Shared selectable chip for honorific + health notes. Selected = filled
// primary-soft with primary text and border. 44pt touch target. When `onRemove`
// is set (custom flags) it renders a remove affordance instead of relying on tap.

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
  accessibilityHint?: string;
};

export function SelectChip({ label, selected, onPress, onRemove, accessibilityHint }: SelectChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.chip,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && (selected ? styles.chipSelectedPressed : styles.chipIdlePressed),
      ]}
    >
      <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
        {label}
      </Text>
      {onRemove ? (
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Hapus ${label}`}
          style={styles.remove}
        >
          <Ionicons
            name="close-circle"
            size={18}
            color={selected ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ) : selected ? (
        <View style={styles.check}>
          <Ionicons name="checkmark" size={16} color={colors.primary} />
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipIdle: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  chipIdlePressed: {
    backgroundColor: colors.background,
  },
  chipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  chipSelectedPressed: {
    backgroundColor: colors.primarySoftPressed,
  },
  label: {
    ...typography.body,
    color: colors.text,
  },
  labelSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
  remove: {
    marginLeft: spacing.xs / 2,
  },
  check: {
    marginLeft: spacing.xs / 2,
  },
});
