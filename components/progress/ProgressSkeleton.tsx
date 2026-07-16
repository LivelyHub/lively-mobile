import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, spacing } from '@/constants/tokens';

// Shaped like the real Progress content (ring block, streak row, chart block,
// list rows) so there is zero layout shift when data arrives. One shared shimmer
// via the Skeleton primitive.
export function ProgressSkeleton() {
  return (
    <View style={styles.stack}>
      <Card style={styles.centerCard}>
        <Skeleton width={148} height={148} radius={74} />
        <Skeleton width={220} height={16} />
        <Skeleton width={160} height={13} />
      </Card>

      <Card>
        <View style={styles.row}>
          <Skeleton width={52} height={52} radius={radii.pill} />
          <View style={styles.grow}>
            <Skeleton width={'70%'} height={20} />
            <Skeleton width={'90%'} height={13} />
          </View>
        </View>
        <View style={styles.dotsRow}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} width={18} height={18} radius={radii.pill} />
          ))}
        </View>
      </Card>

      <Card>
        <Skeleton width={120} height={20} />
        <Skeleton width={'55%'} height={16} style={styles.mt} />
        <Skeleton width={'100%'} height={140} radius={radii.sm} style={styles.mt} />
      </Card>

      <Card>
        <Skeleton width={140} height={20} />
        <View style={styles.stripRow}>
          {Array.from({ length: 15 }).map((_, i) => (
            <Skeleton key={i} width={16} height={16} radius={radii.pill} />
          ))}
        </View>
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: spacing.lg,
  },
  centerCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  grow: {
    flex: 1,
    gap: spacing.sm,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  stripRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  mt: {
    marginTop: spacing.md,
  },
});
