import { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

// WhatsApp number field with a fixed "+62" prefix affordance. The user types the
// local number (numeric keyboard); the wizard composes the E.164 value on submit.
// Mirrors the TextField token styling so it sits consistently with the rest.

type PhoneFieldProps = {
  value: string;
  onChangeText: (text: string) => void;
  onBlur?: () => void;
  error?: string;
  helper?: string;
  editable?: boolean;
};

export function PhoneField({ value, onChangeText, onBlur, error, helper, editable = true }: PhoneFieldProps) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? colors.danger : focused ? colors.primary : colors.border;

  return (
    <View>
      <Text style={styles.label}>Nomor WhatsApp</Text>
      <View style={[styles.row, { borderColor }, !editable && styles.rowDisabled]}>
        <View style={styles.prefix}>
          <Text style={styles.prefixText}>+62</Text>
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="number-pad"
          placeholder="812 3456 7890"
          placeholderTextColor={colors.textMuted}
          style={styles.input}
          onFocus={() => setFocused(true)}
          onBlur={() => {
            setFocused(false);
            onBlur?.();
          }}
          accessibilityLabel="Nomor WhatsApp Eyang"
        />
      </View>
      {error ? (
        <Text style={[styles.helper, styles.errorText]}>{error}</Text>
      ) : helper ? (
        <Text style={styles.helper}>{helper}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    ...typography.body,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderWidth: 1,
    borderRadius: radii.input,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  rowDisabled: {
    backgroundColor: colors.hairline,
  },
  prefix: {
    paddingHorizontal: spacing.md,
    alignSelf: 'stretch',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderRightWidth: 1,
    borderRightColor: colors.border,
  },
  prefixText: {
    ...typography.body,
    fontWeight: '600',
    color: colors.text,
  },
  input: {
    ...typography.body,
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
  },
  helper: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
  },
});
