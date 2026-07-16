import { useEffect, useState } from 'react';
import {
  AccessibilityInfo,
  Animated,
  Easing,
  StyleSheet,
  type DimensionValue,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii } from '@/constants/tokens';

// One shared loop so every skeleton on a screen pulses in sync (§2 state rules).
const sharedPulse = new Animated.Value(0);
let started = false;

function ensureLoop() {
  if (started) return;
  started = true;
  Animated.loop(
    Animated.sequence([
      Animated.timing(sharedPulse, {
        toValue: 1,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(sharedPulse, {
        toValue: 0,
        duration: 600,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
    ]),
  ).start();
}

type SkeletonProps = {
  width?: DimensionValue;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ width = '100%', height = 16, radius = radii.sm, style }: SkeletonProps) {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (mounted) setReduceMotion(enabled);
    });
    const sub = AccessibilityInfo.addEventListener('reduceMotionChanged', (enabled) =>
      setReduceMotion(enabled),
    );
    ensureLoop();
    return () => {
      mounted = false;
      sub.remove();
    };
  }, []);

  const opacity = reduceMotion
    ? 0.5
    : sharedPulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.7] });

  return (
    <Animated.View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={[styles.block, { width, height, borderRadius: radius, opacity }, style]}
    />
  );
}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.hairline,
  },
});
