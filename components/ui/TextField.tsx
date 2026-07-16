import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { colors, radii, spacing, typography } from '@/constants/tokens';

type TextFieldProps = TextInputProps & {
  label?: string;
  helper?: string;
  error?: string;
  disabled?: boolean;
  containerStyle?: StyleProp<ViewStyle>;
};

export function TextField({
  label,
  helper,
  error,
  disabled = false,
  containerStyle,
  onFocus,
  onBlur,
  ...inputProps
}: TextFieldProps) {
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? colors.danger
    : focused
      ? colors.primary
      : colors.border;

  return (
    <View style={containerStyle}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput
        editable={!disabled}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          { borderColor },
          disabled && styles.inputDisabled,
        ]}
        onFocus={(e) => {
          setFocused(true);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          onBlur?.(e);
        }}
        accessibilityState={{ disabled }}
        {...inputProps}
      />
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
  input: {
    ...typography.body,
    minHeight: 48,
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
  helper: {
    ...typography.caption,
    marginTop: spacing.xs,
  },
  errorText: {
    color: colors.danger,
  },
});
