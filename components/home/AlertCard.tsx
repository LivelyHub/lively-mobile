import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';
import type { Alert } from '@/lib/api/types';
import { relativeTime } from '@/lib/time';
import { alertHeadline, alertIcon, alertTone, TONE_STYLE } from './alertPresentation';

// The most important pixel on Home when an alert is unresolved. Urgency-tiered
// color (§5), type icon, headline copy, relative time, and a chevron into Alerts.
type AlertCardProps = {
  alert: Alert;
  honorific: string;
  extraCount?: number;
  onPress: () => void;
};

export function AlertCard({ alert, honorific, extraCount = 0, onPress }: AlertCardProps) {
  const tone = alertTone(alert.type);
  const { background, accent } = TONE_STYLE[tone];
  const headline = alertHeadline(alert, honorific);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${headline}. Buka Peringatan.`}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: background, borderColor: accent },
        pressed && styles.pressed,
      ]}
    >
      <View style={[styles.iconWrap, { backgroundColor: colors.surface }]}>
        <Ionicons name={alertIcon(alert.type)} size={22} color={accent} />
      </View>
      <View style={styles.body}>
        <Text style={styles.headline}>{headline}</Text>
        <Text style={styles.meta}>
          {relativeTime(alert.created_at)}
          {extraCount > 0 ? ` · dan ${extraCount} lainnya` : ''}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={accent} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radii.card,
    borderWidth: 1,
    minHeight: 64,
  },
  pressed: {
    opacity: 0.85,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  headline: {
    ...typography.body,
    fontWeight: '600',
  },
  meta: {
    ...typography.caption,
  },
});
