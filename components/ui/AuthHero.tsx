import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Auth screens' hero panel: stands in for a photo banner without needing a
// stock photo of an unrelated scene. A warm terracotta gradient + two soft
// tonal "light" blobs read as an atmosphere (morning warmth, a home) rather
// than a flat color block, with the wordmark set directly into it like a
// photo caption. Rounded-bottom, full-bleed — the one deliberately bold
// moment on these screens; everything below stays quiet.

type AuthHeroProps = {
  caption: string;
};

export function AuthHero({ caption }: AuthHeroProps) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryPressed]}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}
      style={styles.hero}
    >
      <View style={[styles.blob, styles.blobLarge]} />
      <View style={[styles.blob, styles.blobSmall]} />

      <View style={styles.iconCircle}>
        <Ionicons name="chatbubbles" size={36} color={colors.primary} />
      </View>

      <View style={styles.captionWrap}>
        <Text style={styles.wordmark}>Lively</Text>
        <Text style={styles.subtitle}>{caption}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    height: 260,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingHorizontal: spacing.xl,
    paddingBottom: spacing.xl,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  blobLarge: {
    width: 220,
    height: 220,
    top: -90,
    right: -60,
  },
  blobSmall: {
    width: 120,
    height: 120,
    bottom: 20,
    left: -40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  iconCircle: {
    position: 'absolute',
    top: spacing.xxl,
    left: spacing.xl,
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    backgroundColor: colors.textOnPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  captionWrap: {
    gap: spacing.xs,
  },
  wordmark: {
    ...typography.title,
    fontSize: 32,
    color: colors.textOnPrimary,
  },
  subtitle: {
    ...typography.body,
    color: 'rgba(255,255,255,0.88)',
  },
});
