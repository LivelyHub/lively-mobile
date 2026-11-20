import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { alertHeadline, alertIcon, alertTone, TONE_STYLE } from '@/components/home/alertPresentation';
import { PressableScale } from '@/components/ui/PressableScale';
import { colors, radii, shadow, spacing, typography } from '@/constants/tokens';
import type { Alert } from '@/lib/api/types';
import { relativeTime } from '@/lib/time';

// One row in the Alerts list. Unresolved rows carry the urgency-tiered accent
// (full tonal fill + tinted icon); resolved rows drop to a calm, muted treatment with
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
    <PressableScale
      onPress={onPress}
      pressedScale={0.98}
      accessibilityRole="button"
      accessibilityLabel={`${headline}. ${resolved ? 'Sudah selesai. ' : ''}Buka detail.`}
      style={[styles.row, resolved ? styles.rowResolved : { backgroundColor: background }]}
      pressedStyle={styles.pressed}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: resolved ? colors.hairline : colors.surface },
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
    </PressableScale>
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
