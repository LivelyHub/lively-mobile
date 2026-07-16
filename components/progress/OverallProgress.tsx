import { StyleSheet, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { ProgressRing } from './ProgressRing';

// Warm, non-competitive readout of overall_progress_pct (CORE §7). No "target"
// or "score to beat" framing; 0% stays forward-looking, never an alarm.
export function OverallProgress({ pct, honorific }: { pct: number; honorific: string }) {
  return (
    <Card style={styles.card}>
      <ProgressRing pct={pct} />
      <View style={styles.text}>
        <Text style={styles.label}>Kondisi {honorific} secara keseluruhan</Text>
        <Text style={styles.helper}>
          {pct === 0
            ? `Angka ini akan naik begitu ${honorific} mulai beraktivitas.`
            : `Gabungan dari latihan, tes kursi, dan obat ${honorific}.`}
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.xl,
  },
  text: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  label: {
    ...typography.section,
    textAlign: 'center',
    color: colors.text,
  },
  helper: {
    ...typography.bodyMuted,
    textAlign: 'center',
  },
});
