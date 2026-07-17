import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, shadow, spacing } from '@/constants/tokens';

// Pill height (44 item + 2x8 padding) + its bottom margin — screens under the
// floating bar add this much bottom padding so content never sits behind it.
export const TAB_BAR_CLEARANCE = 44 + spacing.sm * 2 + spacing.md + spacing.md;

// Icon-only floating pill, one per active elder check-in — labels would repeat
// what the icon already says, and this is a 4-item bar so shape alone reads fine.
const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  progress: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  alerts: { active: 'notifications', inactive: 'notifications-outline' },
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: insets.bottom + spacing.md }]}>
      <View style={styles.pill}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const icon = ICONS[route.name];
          if (!icon) return null;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={route.name}
              onPress={onPress}
              hitSlop={8}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <View style={[styles.iconDot, focused && styles.iconDotActive]}>
                <Ionicons
                  name={focused ? icon.active : icon.inactive}
                  size={22}
                  color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
                />
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.tabBarBg,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm,
    ...shadow.card,
    shadowOpacity: 0.22,
    shadowRadius: 16,
  },
  item: {
    width: 52,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemPressed: {
    opacity: 0.75,
  },
  iconDot: {
    width: 40,
    height: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDotActive: {
    backgroundColor: colors.primary,
  },
});
