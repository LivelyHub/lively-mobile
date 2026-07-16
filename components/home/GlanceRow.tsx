import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, typography } from '@/constants/tokens';
import type { GlanceRowData, GlanceTone } from './glance';

const TONE_COLOR: Record<GlanceTone, string> = {
  positive: colors.success,
  neutral: colors.textMuted,
  attention: colors.warning,
};

export function GlanceRow({ data }: { data: GlanceRowData }) {
  const tone = TONE_COLOR[data.tone];
  return (
    <View style={styles.row} accessibilityRole="text" accessibilityLabel={`${data.label}: ${data.value}`}>
      <Ionicons name={data.icon} size={20} color={colors.textMuted} style={styles.icon} />
      <Text style={styles.label}>{data.label}</Text>
      <Text style={[styles.value, { color: tone }]}>{data.value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: 44,
  },
  icon: {
    width: 24,
    textAlign: 'center',
  },
  label: {
    ...typography.body,
    flex: 1,
  },
  value: {
    ...typography.body,
    fontWeight: '600',
  },
});
