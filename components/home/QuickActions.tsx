import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type QuickAction = { key: string; icon: IconName; label: string; onPress: () => void };

type QuickActionsProps = {
  onChat: () => void;
  onProgress: () => void;
  onTitipan: () => void;
};

// Compact icon + label pills, spacing-driven, deliberately not a row of heavy
// equal cards. Each is a soft tonal button.
export function QuickActions({ onChat, onProgress, onTitipan }: QuickActionsProps) {
  const actions: QuickAction[] = [
    { key: 'chat', icon: 'chatbubbles-outline', label: 'Obrolan', onPress: onChat },
    { key: 'progress', icon: 'trending-up-outline', label: 'Perkembangan', onPress: onProgress },
    { key: 'titipan', icon: 'mail-outline', label: 'Titipan', onPress: onTitipan },
  ];

  return (
    <View style={styles.row}>
      {actions.map((action) => (
        <Pressable
          key={action.key}
          onPress={action.onPress}
          accessibilityRole="button"
          accessibilityLabel={action.label}
          style={({ pressed }) => [styles.pill, pressed && styles.pillPressed]}
        >
          <Ionicons name={action.icon} size={22} color={colors.primary} />
          <Text style={styles.label} numberOfLines={1}>
            {action.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  pill: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: radii.card,
    backgroundColor: colors.primarySoft,
    minHeight: 72,
    justifyContent: 'center',
  },
  pillPressed: {
    backgroundColor: colors.primarySoftPressed,
  },
  label: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
});
