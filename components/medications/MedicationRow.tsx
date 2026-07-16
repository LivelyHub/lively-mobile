import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { Card } from '@/components/ui';
import { colors, radii, spacing, typography } from '@/constants/tokens';
import type { Medication } from '@/lib/api/types';
import { slotDisplayStatus, type MedSlotDisplayStatus, type MedSlotStatus } from '@/lib/medications';

type StatusPresentation = {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  color: string;
  softColor: string;
  label: string;
};

// Never color-only (UI-UX §3): every status pairs a distinct icon + word with
// its tint, so it still reads correctly for colorblind users or screen readers.
const STATUS_PRESENTATION: Record<MedSlotDisplayStatus, StatusPresentation> = {
  taken: { icon: 'checkmark-circle', color: colors.success, softColor: colors.successSoft, label: 'Sudah diminum' },
  upcoming: { icon: 'time-outline', color: colors.textMuted, softColor: colors.hairline, label: 'Akan datang' },
  unconfirmed: { icon: 'alert-circle', color: colors.warning, softColor: colors.warningSoft, label: 'Belum dikonfirmasi' },
};

type MedicationRowProps = {
  medication: Medication;
  slots: MedSlotStatus[];
  onPress: () => void;
  onToggleActive: (next: boolean) => void;
  toggling?: boolean;
};

export function MedicationRow({ medication, slots, onPress, onToggleActive, toggling = false }: MedicationRowProps) {
  const times = [...medication.schedule_times].sort();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`Ubah ${medication.name}`}
      style={({ pressed }) => [styles.pressable, pressed && styles.pressed]}
    >
      <Card>
        <View style={styles.header}>
          <View style={styles.headerText}>
            <Text style={styles.name} numberOfLines={1}>
              {medication.name}
            </Text>
            <Text style={styles.dosage} numberOfLines={1}>
              {medication.dosage}
            </Text>
          </View>
          <Switch
            value={medication.active}
            onValueChange={onToggleActive}
            disabled={toggling}
            trackColor={{ false: colors.hairline, true: colors.primarySoft }}
            thumbColor={medication.active ? colors.primary : colors.surface}
            accessibilityLabel={medication.active ? `Nonaktifkan ${medication.name}` : `Aktifkan ${medication.name}`}
            accessibilityRole="switch"
          />
        </View>

        {times.length > 0 ? (
          <View style={styles.chipRow}>
            {times.map((time) => {
              const slot = slots.find((s) => s.time === time);
              const status = slot ? slotDisplayStatus(slot) : null;
              const presentation = status ? STATUS_PRESENTATION[status] : null;
              return (
                <View
                  key={time}
                  style={[styles.chip, presentation ? { backgroundColor: presentation.softColor } : styles.chipNeutral]}
                  accessibilityLabel={presentation ? `${time}, ${presentation.label}` : time}
                >
                  {presentation ? (
                    <Ionicons name={presentation.icon} size={14} color={presentation.color} />
                  ) : null}
                  <Text style={[styles.chipText, presentation && { color: presentation.color }]}>{time}</Text>
                </View>
              );
            })}
          </View>
        ) : null}

        {!medication.active ? (
          <Text style={styles.inactiveNote}>Nonaktif — tidak diingatkan hari ini.</Text>
        ) : null}
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressable: {
    minHeight: 56,
  },
  pressed: {
    opacity: 0.7,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: spacing.xs / 2,
  },
  name: {
    ...typography.body,
    fontWeight: '600',
  },
  dosage: {
    ...typography.bodyMuted,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: 28,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radii.pill,
  },
  chipNeutral: {
    backgroundColor: colors.hairline,
  },
  chipText: {
    ...typography.caption,
    fontWeight: '600',
    color: colors.text,
  },
  inactiveNote: {
    ...typography.caption,
    marginTop: spacing.sm,
  },
});
