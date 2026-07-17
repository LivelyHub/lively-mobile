import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

type QuickActionsProps = {
  onChat: () => void;
  onProgress: () => void;
  onTitipan: () => void;
};

// Bento layout: chat is the action used most, so it gets the tall primary tile;
// progress and titipan share the second column as stacked secondary tiles.
export function QuickActions({ onChat, onProgress, onTitipan }: QuickActionsProps) {
  return (
    <View style={styles.grid}>
      <Tile
        icon="chatbubbles"
        label="Obrolan"
        onPress={onChat}
        style={styles.primaryTile}
        primary
      />
      <View style={styles.column}>
        <Tile icon="trending-up-outline" label="Perkembangan" onPress={onProgress} style={styles.secondaryTile} />
        <Tile icon="mail-outline" label="Titipan" onPress={onTitipan} style={styles.secondaryTile} />
      </View>
    </View>
  );
}

function Tile({
  icon,
  label,
  onPress,
  style,
  primary,
}: {
  icon: IconName;
  label: string;
  onPress: () => void;
  style: object;
  primary?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={({ pressed }) => [styles.tile, style, pressed && styles.tilePressed]}
    >
      <View style={[styles.iconBadge, primary && styles.iconBadgePrimary]}>
        <Ionicons name={icon} size={primary ? 24 : 20} color={primary ? colors.textOnPrimary : colors.primary} />
      </View>
      <Text style={[styles.label, primary && styles.labelPrimary]} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  column: {
    flex: 1,
    gap: spacing.sm,
  },
  tile: {
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    ...shadow.card,
  },
  tilePressed: {
    backgroundColor: colors.surfaceMuted,
  },
  primaryTile: {
    flex: 1,
    justifyContent: 'flex-end',
    padding: spacing.lg,
    minHeight: 148,
  },
  secondaryTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    minHeight: 68,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBadgePrimary: {
    width: 44,
    height: 44,
    backgroundColor: colors.primary,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '600',
  },
  labelPrimary: {
    ...typography.body,
    color: colors.text,
    fontWeight: '700',
  },
});
