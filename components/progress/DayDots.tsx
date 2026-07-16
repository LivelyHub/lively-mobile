import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/tokens';
import type { ProgressDayStatus } from '@/lib/api/types';

// One dot language for both the this-week streak row and the 30-day history
// strip. Statuses differ by fill AND shape (not color alone, per UI-UX §6):
// done = filled success dot, missed = muted outline with a small center mark,
// future = faint outline. Optional weekday initials sit under each dot.
type DayDotsProps = {
  days: ProgressDayStatus[];
  labels?: string[];
  size?: number;
  accessibilityLabel?: string;
};

export function DayDots({ days, labels, size = 18, accessibilityLabel }: DayDotsProps) {
  return (
    <View
      style={styles.row}
      accessible={Boolean(accessibilityLabel)}
      accessibilityLabel={accessibilityLabel}
    >
      {days.map((status, i) => (
        <View key={i} style={styles.item}>
          <Dot status={status} size={size} />
          {labels ? <Text style={styles.label}>{labels[i] ?? ''}</Text> : null}
        </View>
      ))}
    </View>
  );
}

function Dot({ status, size }: { status: ProgressDayStatus; size: number }) {
  const base = { width: size, height: size, borderRadius: size / 2 };
  if (status === 'done') {
    return <View style={[base, styles.done]} />;
  }
  if (status === 'future') {
    return <View style={[base, styles.future]} />;
  }
  return (
    <View style={[base, styles.missed]}>
      <View style={styles.missedMark} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.caption,
  },
  done: {
    backgroundColor: colors.success,
  },
  missed: {
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  missedMark: {
    width: 5,
    height: 1.5,
    borderRadius: 1,
    backgroundColor: colors.textMuted,
  },
  future: {
    borderWidth: 1.5,
    borderColor: colors.hairline,
    opacity: 0.6,
  },
});
