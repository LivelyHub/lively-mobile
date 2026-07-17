import { StyleSheet, View } from 'react-native';

import { Skeleton } from '@/components/ui';
import { radii, spacing } from '@/constants/tokens';

// Five alternating bubble skeletons, shaped and aligned like real bubbles (radius
// 18 with the matching tail corner) so there is zero layout shift when the real
// conversation arrives. The Skeleton primitive keeps one synchronized shimmer.
const ROWS: Array<{ side: 'left' | 'right'; width: number; height: number }> = [
  { side: 'left', width: 200, height: 44 },
  { side: 'right', width: 150, height: 40 },
  { side: 'left', width: 240, height: 60 },
  { side: 'right', width: 130, height: 40 },
  { side: 'left', width: 180, height: 44 },
];

export function ChatSkeleton() {
  return (
    <View style={styles.container}>
      {ROWS.map((row, i) => (
        <View key={i} style={row.side === 'left' ? styles.left : styles.right}>
          <Skeleton
            width={row.width}
            height={row.height}
            radius={radii.bubble}
            style={row.side === 'left' ? styles.tailLeft : styles.tailRight}
          />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    gap: spacing.md,
  },
  left: {
    alignSelf: 'flex-start',
  },
  right: {
    alignSelf: 'flex-end',
  },
  tailLeft: {
    borderBottomLeftRadius: radii.bubbleTail,
  },
  tailRight: {
    borderBottomRightRadius: radii.bubbleTail,
  },
});
