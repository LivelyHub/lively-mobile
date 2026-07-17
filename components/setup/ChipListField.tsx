import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { TextField } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { SelectChip } from './SelectChip';

type ChipPreset = { code: string; label: string };

type ChipListFieldProps = {
  label?: string;
  helper?: string;
  presets: readonly ChipPreset[];
  selected: string[];
  onToggle: (code: string) => void;
  customValue: string;
  onCustomChange: (text: string) => void;
  onAddCustom: () => void;
  placeholder: string;
  disabled?: boolean;
};

// Shared preset-chips + verbatim-custom-chip + add-input pattern (hobbies,
// favorite/avoid topics, and health notes all need it). `selected` holds every
// chosen code; anything not in `presets` renders as a removable custom chip.
export function ChipListField({
  label,
  helper,
  presets,
  selected,
  onToggle,
  customValue,
  onCustomChange,
  onAddCustom,
  placeholder,
  disabled,
}: ChipListFieldProps) {
  const customCodes = selected.filter((code) => !presets.some((p) => p.code === code));

  return (
    <View>
      {label ? <Text style={styles.fieldLabel}>{label}</Text> : null}
      {helper ? <Text style={styles.fieldHelper}>{helper}</Text> : null}

      <View style={styles.chipWrap}>
        {presets.map((preset) => (
          <SelectChip
            key={preset.code}
            label={preset.label}
            selected={selected.includes(preset.code)}
            onPress={() => onToggle(preset.code)}
          />
        ))}
        {customCodes.map((code) => (
          <SelectChip key={code} label={code} selected onPress={() => onToggle(code)} onRemove={() => onToggle(code)} />
        ))}
      </View>

      <TextField
        containerStyle={styles.customInput}
        placeholder={placeholder}
        value={customValue}
        onChangeText={onCustomChange}
        onSubmitEditing={onAddCustom}
        returnKeyType="done"
        autoCapitalize="none"
        editable={!disabled}
        rightElement={
          <Pressable
            onPress={onAddCustom}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel={`Tambahkan ${label ?? 'catatan'}`}
          >
            <Ionicons name="add-circle" size={24} color={colors.primary} />
          </Pressable>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fieldLabel: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  fieldHelper: {
    ...typography.caption,
    marginBottom: spacing.md,
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  customInput: {
    marginTop: 0,
  },
});
