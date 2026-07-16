import { StyleSheet, View } from 'react-native';

import { Card, Skeleton } from '@/components/ui';
import { radii, spacing } from '@/constants/tokens';

// List skeleton (M6.1 matrix row): 3 rows shaped like the real row (name +
// dosage, toggle, schedule chips) sharing Skeleton's single synchronized pulse
// so there is zero layout shift when the medications list arrives.
export function MedicationsSkeleton() {
  return (
    <View style={styles.container}>
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <View style={styles.header}>
            <View style={styles.headerText}>
              <Skeleton width="55%" height={20} />
              <Skeleton width="35%" height={14} style={styles.dosageGap} />
            </View>
            <Skeleton width={44} height={26} radius={radii.pill} />
          </View>
          <View style={styles.chipRow}>
            <Skeleton width={68} height={28} radius={radii.pill} />
            <Skeleton width={68} height={28} radius={radii.pill} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.sm,
  },
  dosageGap: {
    marginTop: spacing.xs,
  },
  chipRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
});
