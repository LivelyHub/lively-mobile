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
import { useLogin } from '@/lib/api/hooks';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type FieldErrors = { email?: string; password?: string };

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const isOffline = useIsOffline();
  const login = useLogin();

  function validateEmail(value: string): string | undefined {
    if (!value.trim()) return 'Email wajib diisi';
    if (!EMAIL_REGEX.test(value.trim())) return 'Format email tidak valid';
    return undefined;
  }

  function validatePassword(value: string): string | undefined {
    if (!value) return 'Kata sandi wajib diisi';
    return undefined;
  }

  function validate(): boolean {
    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setFieldErrors(errors);
    return !errors.email && !errors.password;
  }

  function handleSubmit() {
    setBannerMessage(null);
    if (!validate()) return;

    login.mutate(
      { email: email.trim(), password },
      {
        onSuccess: () => {
          router.replace('/');
        },
        onError: (error) => {
          if (error instanceof ApiError) {
            if (error.fields) {
              setFieldErrors((prev) => ({ ...prev, ...error.fields }));
              return;
            }
            if (error.code === 'unauthorized' || error.code === 'not_found') {
              setBannerMessage('Email atau kata sandi salah. Coba lagi ya.');
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
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHero caption="Masuk untuk memantau kabar Eyang" />

        <View style={styles.body}>
          {bannerMessage ? <Banner variant="danger" message={bannerMessage} /> : null}

          <View style={styles.form}>
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
              editable={!login.isPending}
            />
            <TextField
              label="Kata sandi"
              placeholder="Kata sandi Anda"
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
              autoComplete="password"
              textContentType="password"
              editable={!login.isPending}
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
              label="Masuk"
              shape="pill"
              onPress={handleSubmit}
              loading={login.isPending}
              disabled={isOffline}
              fullWidth
              style={styles.submit}
            />
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Belum punya akun? </Text>
            <Link href="/register" replace>
              <Text style={styles.footerLink}>Daftar</Text>
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
