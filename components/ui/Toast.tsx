import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';

export type ToastVariant = 'default' | 'success' | 'danger';

type ToastOptions = {
  message: string;
  variant?: ToastVariant;
};

type ToastContextValue = {
  showToast: (options: ToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DURATION = 2500;

const VARIANT_ICON: Record<ToastVariant, React.ComponentProps<typeof Ionicons>['name']> = {
  default: 'chatbox-ellipses',
  success: 'checkmark-circle',
  danger: 'alert-circle',
};

const VARIANT_ACCENT: Record<ToastVariant, string> = {
  default: colors.primary,
  success: colors.success,
  danger: colors.danger,
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const insets = useSafeAreaInsets();
  const [toast, setToast] = useState<ToastOptions | null>(null);
  const translateY = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    Animated.parallel([
      Animated.timing(translateY, { toValue: 20, duration: 180, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) setToast(null);
    });
  }, [opacity, translateY]);

  const showToast = useCallback(
    ({ message, variant = 'default' }: ToastOptions) => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
      setToast({ message, variant });
      translateY.setValue(20);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(translateY, { toValue: 0, useNativeDriver: true, bounciness: 4 }),
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
      ]).start();
      hideTimer.current = setTimeout(hide, DURATION);
    },
    [hide, opacity, translateY],
  );

  useEffect(() => {
    return () => {
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast ? (
        <Animated.View
          pointerEvents="none"
          accessibilityLiveRegion="polite"
          style={[
            styles.wrapper,
            { bottom: insets.bottom + spacing.xl, opacity, transform: [{ translateY }] },
          ]}
        >
          <View style={styles.toast}>
            <Ionicons
              name={VARIANT_ICON[toast.variant ?? 'default']}
              size={20}
              color={VARIANT_ACCENT[toast.variant ?? 'default']}
            />
            <Text style={styles.message}>{toast.message}</Text>
          </View>
        </Animated.View>
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within a ToastProvider');
  return ctx;
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    maxWidth: '100%',
    ...shadow.card,
  },
  message: {
    ...typography.body,
    flexShrink: 1,
  },
});
