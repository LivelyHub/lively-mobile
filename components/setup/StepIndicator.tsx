import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Warm, understated progress: one segment per step, the active one elongated in
// primary, completed ones filled short, upcoming ones a calm hairline. No
// percentage, no numbered "step x of y" stepper — the label names where you are.

type StepIndicatorProps = {
  steps: readonly string[];
  current: number; // 0-based index
};

export function StepIndicator({ steps, current }: StepIndicatorProps) {
  const label = steps[current] ?? '';
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 1, max: steps.length, now: current + 1 }}
      accessibilityLabel={`Langkah ${current + 1} dari ${steps.length}: ${label}`}
    >
      <View style={styles.track}>
        {steps.map((step, index) => {
          const isActive = index === current;
          const isDone = index < current;
          return (
            <View
              key={step}
              style={[
                styles.segment,
                isActive && styles.segmentActive,
                (isActive || isDone) && styles.segmentFilled,
              ]}
            />
          );
        })}
      </View>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  segment: {
    height: 6,
    width: 6,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
  },
  segmentFilled: {
    backgroundColor: colors.primary,
  },
  segmentActive: {
    width: 28,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
