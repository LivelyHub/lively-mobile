import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type Shortcut = {
  key: string;
  icon: IconName;
  label: string;
  onPress: () => void;
};

// Circle-icon-over-label row (design ref: grocery app's category row), swapped
// in for the old bento QuickActions tiles removed earlier — same three
// destinations, lighter visual footprint.
export function ShortcutRow({ shortcuts }: { shortcuts: Shortcut[] }) {
  return (
    <View style={styles.row}>
      {shortcuts.map((s) => (
        <Pressable
          key={s.key}
          onPress={s.onPress}
          accessibilityRole="button"
          accessibilityLabel={s.label}
          style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
        >
          <View style={styles.iconBadge}>
            <Ionicons name={s.icon} size={22} color={colors.primary} />
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {s.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  item: {
    alignItems: 'center',
    gap: spacing.xs,
    flex: 1,
  },
  itemPressed: {
    opacity: 0.6,
  },
  iconBadge: {
    width: 52,
    height: 52,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...typography.caption,
    color: colors.text,
    fontWeight: '600',
  },
});
