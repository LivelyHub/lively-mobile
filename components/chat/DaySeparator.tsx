import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Centered day label ("Hari ini" / "Kemarin" / a short date) that sits visually
// above the first message of each day. Rendered as its own inverted-list row.
export function DaySeparator({ label }: { label: string }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.pill}>
        <Text style={styles.text}>{label}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: spacing.md,
  },
  pill: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.hairline,
  },
  text: {
    ...typography.caption,
    color: colors.textMuted,
    fontWeight: '600',
  },
});
