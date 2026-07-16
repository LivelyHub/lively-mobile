import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, spacing } from '@/constants/tokens';

// First-load skeleton, shaped like the real Home content (elder card header +
// last-heard line + three glance rows) so there is zero layout shift on arrival.
export function HomeSkeleton() {
  return (
    <View style={styles.container}>
      <Skeleton width={200} height={28} radius={radii.sm} />
      <Skeleton width={150} height={16} radius={radii.sm} />

      <Card style={styles.card}>
        <View style={styles.header}>
          <Skeleton width={52} height={52} radius={radii.pill} />
          <View style={styles.headerText}>
            <Skeleton width={'55%'} height={20} />
            <Skeleton width={'70%'} height={14} />
          </View>
        </View>
        <Skeleton width={160} height={13} style={styles.lastHeard} />
        <View style={styles.divider} />
        {[0, 1, 2].map((i) => (
          <View key={i} style={styles.row}>
            <Skeleton width={20} height={20} radius={radii.sm} />
            <Skeleton width={'45%'} height={16} />
            <View style={styles.grow} />
            <Skeleton width={72} height={16} />
          </View>
        ))}
      </Card>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
  },
  card: {
    marginTop: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.sm,
  },
  lastHeard: {
    marginTop: spacing.md,
  },
  divider: {
    height: 1,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  grow: {
    flex: 1,
  },
});
