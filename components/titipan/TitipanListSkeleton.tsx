import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, spacing } from '@/constants/tokens';

// Brief row-level loading for the sent list (M7.1): the composer above renders
// immediately and never waits on this fetch, so this stays small, not a
// full-screen skeleton.
export function TitipanListSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1].map((i) => (
        <Card key={i}>
          <Skeleton width="90%" height={16} />
          <Skeleton width="55%" height={16} style={styles.gap} />
          <View style={styles.footer}>
            <Skeleton width={64} height={13} />
            <Skeleton width={120} height={24} radius={radii.pill} />
          </View>
        </Card>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.md,
  },
  gap: {
    marginTop: spacing.xs,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});
