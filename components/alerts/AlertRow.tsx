import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { alertHeadline, alertIcon, alertTone, TONE_STYLE } from '@/components/home/alertPresentation';
import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import type { Alert } from '@/lib/api/types';
import { relativeTime } from '@/lib/time';

// One row in the Alerts list. Unresolved rows carry the urgency-tiered accent
// (icon tint + a left rail); resolved rows drop to a calm, muted treatment with
// a check, so the list reads "handled below, live on top" at a glance.
type AlertRowProps = {
  alert: Alert;
  honorific: string;
  onPress: () => void;
};

export function AlertRow({ alert, honorific, onPress }: AlertRowProps) {
  const tone = alertTone(alert.type);
  const { background, accent } = TONE_STYLE[tone];
  const headline = alertHeadline(alert, honorific);
  const resolved = Boolean(alert.resolved_at);

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${headline}. ${resolved ? 'Sudah selesai. ' : ''}Buka detail.`}
      style={({ pressed }) => [
        styles.row,
        resolved && styles.rowResolved,
        pressed && styles.pressed,
      ]}
    >
      {!resolved ? <View style={[styles.rail, { backgroundColor: accent }]} /> : null}
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: resolved ? colors.hairline : background },
        ]}
      >
        <Ionicons
          name={resolved ? 'checkmark' : alertIcon(alert.type)}
          size={22}
          color={resolved ? colors.textMuted : accent}
        />
      </View>
      <View style={styles.body}>
        <Text style={[styles.headline, resolved && styles.headlineResolved]} numberOfLines={2}>
          {headline}
        </Text>
        <Text style={styles.meta}>
          {resolved ? 'Selesai · ' : ''}
          {relativeTime(alert.created_at)}
        </Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={resolved ? colors.textMuted : accent}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    minHeight: 72,
    overflow: 'hidden',
    ...shadow.card,
  },
  rowResolved: {
    backgroundColor: colors.surface,
    shadowOpacity: 0,
    elevation: 0,
    borderWidth: 1,
    borderColor: colors.hairline,
  },
  pressed: {
    opacity: 0.85,
  },
  rail: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  iconWrap: {
    width: 44,
    height: 44,
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
  headlineResolved: {
    color: colors.textMuted,
    fontWeight: '500',
  },
  meta: {
    ...typography.caption,
  },
});
