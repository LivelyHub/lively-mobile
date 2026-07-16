import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';

// The emotional beat (M2.1): a full-screen warm confirmation. Soft primary circle
// with an Ionicon (never an emoji), the headline promising tomorrow's first
// greeting, a soft sub-line, one way home. Entrance is a simple fade + scale-in,
// skipped under reduce-motion; a light success haptic fires once.

type SuccessMomentProps = {
  companionName: string;
  honorific: string;
  onDone: () => void;
};

export function SuccessMoment({ companionName, honorific, onDone }: SuccessMomentProps) {
  const insets = useSafeAreaInsets();
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.92)).current;
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
      if (!mounted) return;
      setReduceMotion(enabled);
      if (enabled) {
        opacity.setValue(1);
        scale.setValue(1);
      } else {
        Animated.parallel([
          Animated.timing(opacity, { toValue: 1, duration: 320, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 6, speed: 12 }),
        ]).start();
      }
    });
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    return () => {
      mounted = false;
    };
  }, [opacity, scale]);

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.xl }]}>
      <Animated.View style={[styles.content, { opacity, transform: [{ scale }] }]}>
        <View style={styles.iconCircle} accessibilityRole="image" accessibilityLabel="Berhasil">
          <Ionicons name="chatbubbles" size={44} color={colors.primary} />
        </View>
        <Text style={styles.headline}>
          {companionName} akan menyapa {honorific} besok pagi
        </Text>
        <Text style={styles.sub}>
          Semua sudah siap. Kami kabari kalau ada yang perlu Anda tahu tentang {honorific}.
        </Text>
      </Animated.View>

      <Button label="Kembali ke Beranda" onPress={onDone} fullWidth />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xxl,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  iconCircle: {
    width: 112,
    height: 112,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  headline: {
    ...typography.title,
    textAlign: 'center',
  },
  sub: {
    ...typography.bodyMuted,
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
});
