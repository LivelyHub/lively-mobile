import { useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  iconLeft?: React.ReactNode;
  accessibilityLabel?: string;
  style?: StyleProp<ViewStyle>;
};

type VariantStyle = {
  background: string;
  backgroundPressed: string;
  label: string;
  borderColor?: string;
};

const VARIANTS: Record<ButtonVariant, VariantStyle> = {
  primary: {
    background: colors.primary,
    backgroundPressed: colors.primaryPressed,
    label: colors.textOnPrimary,
  },
  secondary: {
    background: colors.primarySoft,
    backgroundPressed: colors.primarySoftPressed,
    label: colors.primary,
  },
  ghost: {
    background: 'transparent',
    backgroundPressed: colors.primarySoft,
    label: colors.primary,
  },
  danger: {
    background: colors.danger,
    backgroundPressed: colors.dangerPressed,
    label: colors.textOnPrimary,
  },
};

export function Button({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  fullWidth = false,
  iconLeft,
  accessibilityLabel,
  style,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const isDisabled = disabled || loading;
  const scale = useRef(new Animated.Value(1)).current;

  const animateTo = (to: number) => {
    Animated.spring(scale, {
      toValue: to,
      useNativeDriver: true,
      speed: 40,
      bounciness: 0,
    }).start();
  };

  return (
    <Animated.View
      style={[
        fullWidth && styles.fullWidth,
        { transform: [{ scale }], opacity: isDisabled && !loading ? 0.45 : 1 },
        style,
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={accessibilityLabel ?? label}
        accessibilityState={{ disabled: isDisabled, busy: loading }}
        disabled={isDisabled}
        onPress={onPress}
        onPressIn={() => animateTo(0.98)}
        onPressOut={() => animateTo(1)}
        style={({ pressed }) => [
          styles.base,
          {
            backgroundColor: pressed && !isDisabled ? v.backgroundPressed : v.background,
            borderColor: v.borderColor ?? 'transparent',
            borderWidth: v.borderColor ? 1 : 0,
          },
        ]}
      >
        {/* Keep width stable while loading: label stays laid out, hidden under the spinner. */}
        <View style={styles.content}>
          {iconLeft ? <View style={styles.icon}>{iconLeft}</View> : null}
          <Text
            style={[typography.button, { color: v.label }, loading && styles.hiddenLabel]}
            numberOfLines={1}
          >
            {label}
          </Text>
        </View>
        {loading ? (
          <View style={styles.spinnerOverlay} pointerEvents="none">
            <ActivityIndicator color={v.label} />
          </View>
        ) : null}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  fullWidth: {
    alignSelf: 'stretch',
  },
  base: {
    minHeight: 48,
    borderRadius: radii.button,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  icon: {
    marginRight: 0,
  },
  hiddenLabel: {
    opacity: 0,
  },
  spinnerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
