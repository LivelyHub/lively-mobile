import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';

// Brand-forward hero card (design ref: bold promo banner on grocery-style
// homes). Fills the same "why is this screen so empty" gap with a card that
// nudges toward Titipan instead of a literal product/discount pitch.
export function HomeBanner({ honorific, onPress }: { honorific: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
    >
      <View style={styles.text}>
        <Text style={styles.eyebrow}>Kirim kabar</Text>
        <Text style={styles.headline}>Titip pesan buat {honorific} hari ini</Text>
        <View style={styles.cta}>
          <Text style={styles.ctaText}>Kirim Titipan</Text>
          <Ionicons name="arrow-forward" size={16} color={colors.primary} />
        </View>
      </View>
      <View style={styles.iconBadge}>
        <Ionicons name="gift" size={32} color={colors.textOnPrimary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    borderRadius: radii.card,
    padding: spacing.lg,
    gap: spacing.md,
    ...shadow.card,
  },
  cardPressed: {
    backgroundColor: colors.primaryPressed,
  },
  text: {
    flex: 1,
    gap: spacing.xs,
  },
  eyebrow: {
    ...typography.caption,
    color: colors.textOnPrimary,
    opacity: 0.8,
    fontWeight: '600',
  },
  headline: {
    ...typography.section,
    color: colors.textOnPrimary,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs / 2,
    backgroundColor: colors.surface,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
    marginTop: spacing.xs,
  },
  ctaText: {
    ...typography.caption,
    color: colors.primary,
    fontWeight: '700',
  },
  iconBadge: {
    width: 56,
    height: 56,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
