import { Ionicons } from '@expo/vector-icons';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PressableScale } from './PressableScale';
import { colors, radii, shadow, spacing } from '@/constants/tokens';

// Pill height (44 item + 2x8 padding) + its bottom margin + a gap above it. The
// pill is positioned at `insets.bottom + spacing.md`, so screens must add the
// device's bottom inset too (gesture bar / home indicator) — use
// `useTabBarClearance()` rather than this constant alone, or the last element
// on a screen ends up behind the pill.
export const TAB_BAR_CLEARANCE = 44 + spacing.sm * 2 + spacing.md + spacing.md;

export function useTabBarClearance(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_CLEARANCE + insets.bottom;
}

// Icon-only floating pill, one per active elder check-in — labels would repeat
// what the icon already says, and this is a 4-item bar so shape alone reads fine.
const ICONS: Record<string, { active: keyof typeof Ionicons.glyphMap; inactive: keyof typeof Ionicons.glyphMap }> = {
  index: { active: 'home', inactive: 'home-outline' },
  chat: { active: 'chatbubble', inactive: 'chatbubble-outline' },
  progress: { active: 'stats-chart', inactive: 'stats-chart-outline' },
  alerts: { active: 'notifications', inactive: 'notifications-outline' },
};

export function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
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
            <PressableScale
              key={route.key}
              pressedScale={0.92}
              accessibilityRole="button"
              accessibilityState={focused ? { selected: true } : {}}
              accessibilityLabel={descriptors[route.key]?.options.title ?? route.name}
              onPress={onPress}
              hitSlop={8}
              style={styles.item}
            >
              <View style={[styles.iconDot, focused && styles.iconDotActive]}>
                <Ionicons
                  name={focused ? icon.active : icon.inactive}
                  size={22}
                  color={focused ? colors.tabBarIconActive : colors.tabBarIconInactive}
                />
              </View>
            </PressableScale>
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
