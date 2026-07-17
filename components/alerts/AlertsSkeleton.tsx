import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { radii, shadow, spacing } from '@/constants/tokens';

// Three alert-row skeletons shaped exactly like AlertRow (icon circle + two text
// lines) so there is zero layout shift when the list arrives.
export function AlertsSkeleton() {
  return (
    <View style={styles.stack}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={44} height={44} radius={radii.pill} />
          <View style={styles.body}>
            <Skeleton width={'85%'} height={16} />
            <Skeleton width={'40%'} height={13} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    backgroundColor: '#FFFFFF',
    minHeight: 72,
    ...shadow.card,
  },
  body: {
    flex: 1,
    gap: spacing.sm,
  },
});
