import { Ionicons } from '@expo/vector-icons';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { AuthHero, Banner, Button, TextField } from '@/components/ui';
import { colors, spacing, typography } from '@/constants/tokens';
import { useIsOffline } from '@/hooks/useIsOffline';
import { ApiError } from '@/lib/api/errors';
import { useRegister } from '@/lib/api/hooks';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_MIN_LENGTH = 8;

type FieldErrors = { name?: string; email?: string; password?: string };

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const isOffline = useIsOffline();
  const register = useRegister();

  function validateName(value: string): string | undefined {
    if (!value.trim()) return 'Nama wajib diisi';
    return undefined;
  }

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return 'Email wajib diisi';
    if (!EMAIL_REGEX.test(value.trim())) return 'Format email tidak valid';
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return 'Kata sandi wajib diisi';
    if (value.length < PASSWORD_MIN_LENGTH) return `Kata sandi minimal ${PASSWORD_MIN_LENGTH} karakter`;
    return undefined;
  }

  function validate(): boolean {
    const errors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    return !errors.name && !errors.email && !errors.password;
  }

  function handleSubmit() {
    setBannerMessage(null);
    if (!validate()) return;

    register.mutate(
      { name: name.trim(), email: email.trim(), password },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.code === 'conflict') {
              setFieldErrors((prev) => ({ ...prev, email: 'Email ini sudah terdaftar' }));
              return;
            }
            if (error.fields) {
              setFieldErrors((prev) => ({ ...prev, ...error.fields }));
              return;
            }
            setBannerMessage(error.message);
            return;
          }
          setBannerMessage('Terjadi kesalahan. Coba lagi ya.');
        },
      },
    );
  }

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHero caption="Buat akun untuk mulai menemani Eyang" />

        <View style={styles.body}>
          {bannerMessage ? <Banner variant="danger" message={bannerMessage} /> : null}

          <View style={styles.form}>
            <TextField
              label="Nama"
              placeholder="Nama Anda"
              value={name}
              onChangeText={(text) => {
                setName(text);
                if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }));
              }}
              onBlur={() => setFieldErrors((prev) => ({ ...prev, name: validateName(name) }))}
              error={fieldErrors.name}
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              editable={!register.isPending}
            />
            <TextField
              label="Email"
              placeholder="nama@email.com"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              onBlur={() => setFieldErrors((prev) => ({ ...prev, email: validateEmail(email) }))}
              error={fieldErrors.email}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              autoComplete="email"
              textContentType="username"
              editable={!register.isPending}
            />
            <TextField
              label="Kata sandi"
              placeholder="Minimal 8 karakter"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (fieldErrors.password) {
                  setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }
              }}
              onBlur={() =>
                setFieldErrors((prev) => ({ ...prev, password: validatePassword(password) }))
              }
              error={fieldErrors.password}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="password-new"
              textContentType="newPassword"
              editable={!register.isPending}
              rightElement={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={22}
                    color={colors.textMuted}
                  />
                </Pressable>
              }
            />

            <Button
              label="Daftar"
              shape="pill"
              onPress={handleSubmit}
              loading={register.isPending}
              disabled={isOffline}
              fullWidth
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Sudah punya akun? </Text>
            <Link href="/login" replace>
              <Text style={styles.footerLink}>Masuk</Text>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  body: {
    flex: 1,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    gap: spacing.xl,
  },
  form: {
    gap: spacing.lg,
  },
  submit: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    ...typography.body,
    color: colors.textMuted,
  },
  footerLink: {
    ...typography.body,
    color: colors.primary,
    fontWeight: '600',
  },
});
