import { QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { AccessibilityInfo, Animated, Platform, StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { BrandMark, ToastProvider } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { useAuthStatus } from '@/hooks/useAuthStatus';
import { useReactQueryFocusManager } from '@/lib/query/focus';
import { setupOnlineManager } from '@/lib/query/online';
import { queryClient } from '@/lib/query/queryClient';

setupOnlineManager();

// Web preview only: the app is designed for a phone, so a full-bleed desktop
// browser window misrepresents every layout decision. Cap it to a phone-shaped
// column so `expo start --web` reads like a device, not a stretched web page.
const isWeb = Platform.OS === 'web';

export default function RootLayout() {
  useReactQueryFocusManager();
  const authStatus = useAuthStatus();

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <ToastProvider>
          <View style={isWeb ? styles.webBackdrop : styles.flex}>
            <View style={isWeb ? styles.webPhoneFrame : styles.flex}>
              {authStatus === 'loading' ? (
                <BrandSplash />
              ) : (
                <Stack screenOptions={{ headerShown: false }}>
                  {/* M1.1 auth gate: logged-out users can't reach (app), logged-in users skip (auth). */}
                  <Stack.Protected guard={authStatus === 'guest'}>
                    <Stack.Screen name="(auth)" />
                  </Stack.Protected>
                  <Stack.Protected guard={authStatus === 'authed'}>
                    <Stack.Screen name="(app)" />
                  </Stack.Protected>
                </Stack>
              )}
            </View>
          </View>
        </ToastProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
}

// Shown only while the stored token is being read on cold start, so there is
// never a flash of the wrong (auth) vs (app) screen. Brief, warm, and quiet —
// this is a hold-on-a-second beat, not a marketing moment, so it fades in and
// gets out of the way rather than performing an entrance.
function BrandSplash() {
  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    let mounted = true;
    AccessibilityInfo.isReduceMotionEnabled().then((reduceMotion) => {
      if (!mounted) return;
      if (reduceMotion) {
        opacity.setValue(1);
        scale.setValue(1);
        return;
      }
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 360, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1, useNativeDriver: true, bounciness: 4, speed: 14 }),
      ]).start();
    });
    return () => {
      mounted = false;
    };
  }, [opacity, scale]);

  return (
    <View style={styles.splash}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <BrandMark size={96} withWordmark />
        <Text style={styles.tagline}>Menemani Eyang, setiap hari</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  webBackdrop: {
    flex: 1,
    alignItems: 'center',
    // Slightly darker neutral than the app background so the phone frame reads
    // as a device against a desk, not as a page with dead margins.
    backgroundColor: '#EDE6DC',
    ...(Platform.OS === 'web' ? ({ height: '100vh', overflow: 'hidden' } as object) : null),
  },
  webPhoneFrame: {
    flex: 1,
    width: '100%',
    maxWidth: 430,
    overflow: 'hidden',
    ...(Platform.OS === 'web'
      ? ({
          height: '100vh',
          boxShadow: '0 0 0 1px rgba(46,42,40,0.08), 0 24px 64px rgba(46,42,40,0.18)',
        } as object)
      : null),
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tagline: {
    ...typography.bodyMuted,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});
