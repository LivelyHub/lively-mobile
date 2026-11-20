import { useRef, useState } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { useReduceMotion } from '@/hooks/useReduceMotion';

// One press language for every tappable surface: a quick, subtle scale-down on
// press-in (ease-out, so movement starts the instant the finger lands) and a
// slightly slower release. Opacity/colour feedback (`pressedStyle`) still runs
// under reduced motion; only the scale is dropped.
const PRESS_IN_MS = 110;
const PRESS_OUT_MS = 180;
const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);

type PressableScaleProps = Omit<PressableProps, 'style'> & {
  style?: StyleProp<ViewStyle>;
  pressedStyle?: StyleProp<ViewStyle>;
  /** Target scale while pressed. Keep within 0.95-0.98; smaller for large surfaces. */
  pressedScale?: number;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function PressableScale({
  style,
  pressedStyle,
  pressedScale = 0.97,
  onPressIn,
  onPressOut,
  disabled,
  ...rest
}: PressableScaleProps) {
  const reduceMotion = useReduceMotion();
  const scale = useRef(new Animated.Value(1)).current;
  const [pressed, setPressed] = useState(false);

  const animateTo = (to: number, duration: number) => {
    if (reduceMotion) return;
    Animated.timing(scale, {
      toValue: to,
      duration,
      easing: EASE_OUT,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...rest}
      disabled={disabled}
      onPressIn={(e) => {
        setPressed(true);
        animateTo(pressedScale, PRESS_IN_MS);
        onPressIn?.(e);
      }}
      onPressOut={(e) => {
        setPressed(false);
        animateTo(1, PRESS_OUT_MS);
        onPressOut?.(e);
      }}
      style={[style, pressed && !disabled ? pressedStyle : null, { transform: [{ scale }] }]}
    />
  );
}
