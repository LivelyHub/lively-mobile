import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// Shared logomark: a chat-bubble glyph on a primary-soft circle, same visual
// language as the setup wizard's SuccessMoment icon circle, so the brand reads
// identically at first launch (splash), first impression (auth), and the
// wizard's emotional payoff. No image asset — stays crisp at any density and
// needs no export pipeline under a same-day deadline.

type BrandMarkProps = {
  size?: number;
  withWordmark?: boolean;
};

export function BrandMark({ size = 88, withWordmark = false }: BrandMarkProps) {
  return (
    <View style={styles.wrap}>
      <View
        style={[styles.circle, { width: size, height: size, borderRadius: size / 2 }]}
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
      >
        <Ionicons name="chatbubbles" size={Math.round(size * 0.44)} color={colors.primary} />
      </View>
      {withWordmark ? <Text style={styles.wordmark}>Lively</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    gap: spacing.md,
  },
  circle: {
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  wordmark: {
    ...typography.title,
    color: colors.primary,
    letterSpacing: -0.5,
  },
});
