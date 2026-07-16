import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Shared selectable chip for honorific + health notes + medication time slots.
// Selected = filled primary-soft with primary text and border. 44pt touch target.
// When `onRemove` is set (custom flags, time chips) it renders a remove affordance.

type SelectChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
  onRemove?: () => void;
  accessibilityHint?: string;
};

export function SelectChip({ label, selected, onPress, onRemove, accessibilityHint }: SelectChipProps) {
  const labelNode = (
    <Text style={[styles.label, selected && styles.labelSelected]} numberOfLines={1}>
      {label}
    </Text>
  );

  // Removable variant: the chip body and the remove control are SIBLING buttons in
  // a plain View. Nesting a Pressable (which renders as <button> on web) inside
  // another is invalid HTML and throws a hydration error, so never nest them.
  if (onRemove) {
    return (
      <View style={[styles.chip, styles.chipRemovable, selected ? styles.chipSelected : styles.chipIdle]}>
        <Pressable
          onPress={onPress}
          accessibilityRole="button"
          accessibilityState={{ selected }}
          accessibilityHint={accessibilityHint}
          style={styles.body}
        >
          {labelNode}
        </Pressable>
        <Pressable
          onPress={onRemove}
          hitSlop={10}
          accessibilityRole="button"
          accessibilityLabel={`Hapus ${label}`}
          style={styles.remove}
        >
          <Ionicons name="close-circle" size={18} color={selected ? colors.primary : colors.textMuted} />
        </Pressable>
      </View>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      accessibilityHint={accessibilityHint}
      style={({ pressed }) => [
        styles.chip,
        styles.chipPadded,
        selected ? styles.chipSelected : styles.chipIdle,
        pressed && (selected ? styles.chipSelectedPressed : styles.chipIdlePressed),
      ]}
    >
      {labelNode}
      {selected ? (
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
    borderRadius: radii.pill,
    borderWidth: 1,
  },
  chipPadded: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  chipRemovable: {
    paddingRight: spacing.md,
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
  body: {
    minHeight: 44,
    justifyContent: 'center',
    paddingLeft: spacing.lg,
    paddingRight: spacing.sm,
    paddingVertical: spacing.sm,
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
    minHeight: 44,
    justifyContent: 'center',
  },
  check: {
    marginLeft: spacing.xs / 2,
  },
});
