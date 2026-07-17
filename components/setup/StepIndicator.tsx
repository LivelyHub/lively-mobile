import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Warm, understated progress: a connected bar per step, filled left-to-right as
// steps complete, with a checkmark on finished segments — the wizard's one
// "Duolingo moment" per DESIGN.md, kept restrained (no numbers, no percentage,
// no mascot). The label names where you are instead of "step x of y".

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
            <View key={step} style={[styles.segment, (isActive || isDone) && styles.segmentFilled]}>
              {isDone ? (
                <Ionicons name="checkmark" size={12} color={colors.textOnPrimary} />
              ) : null}
            </View>
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
    gap: spacing.xs,
  },
  segment: {
    flex: 1,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentFilled: {
    backgroundColor: colors.primary,
  },
  label: {
    ...typography.caption,
    marginTop: spacing.sm,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
