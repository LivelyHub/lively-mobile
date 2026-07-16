import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// TextField (components/ui) isn't used here: it spreads TextInputProps after
// computing its border-color style, so a caller-supplied `style` would clobber
// it, and it has no room to grow past its fixed 48pt height for a multiline
// composer. This mirrors TextField's token styling instead (PhoneField does
// the same for its own specialized input).
const MAX_LENGTH = 500;

type ComposerInputProps = {
  value: string;
  onChangeText: (text: string) => void;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
};

export function ComposerInput({ value, onChangeText, label, placeholder, disabled = false }: ComposerInputProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = focused ? colors.primary : colors.border;

  return (
    <View>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        value={value}
        onChangeText={(text) => onChangeText(text.length > MAX_LENGTH ? text.slice(0, MAX_LENGTH) : text)}
        editable={!disabled}
        multiline
        maxLength={MAX_LENGTH}
        textAlignVertical="top"
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        accessibilityLabel={label ?? 'Pesan titipan'}
        style={[styles.input, { borderColor }, disabled && styles.inputDisabled]}
      />
      <Text style={styles.counter}>
        {value.length}/{MAX_LENGTH}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    minHeight: 96,
    borderWidth: 1,
    borderRadius: radii.input,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    color: colors.text,
  },
  inputDisabled: {
    backgroundColor: colors.hairline,
    color: colors.textMuted,
  },
  counter: {
    ...typography.caption,
    textAlign: 'right',
    marginTop: spacing.xs,
  },
});
