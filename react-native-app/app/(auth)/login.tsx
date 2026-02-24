import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { loginSchema, LoginFormData } from '@schemas/auth.schema';
import { useLoginMutation } from '@store/api/authApi';
import { setCredentials, useAppDispatch } from '@store/index';
import { storage } from '@utils/storage';
import { AuthInput } from '@components/ui/AuthInput';
import { PrimaryButton } from '@components/ui/PrimaryButton';
import { GlassCard } from '@components/ui/GlassCard';
import { COLORS, FONTS, FONT_SIZE, SPACING } from '@constants/index';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const [login, { isLoading, error }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const res = await login(data).unwrap();
      await storage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      dispatch(setCredentials({
        user: res.data.user,
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      }));
      router.replace('/(app)/feed');
    } catch (err) {
      // Error handled by RTK Query / UI
    }
  };

  const errorMessage = (error as any)?.data?.message;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <LinearGradient
        colors={[COLORS.background, COLORS.backgroundSecondary]}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to SocialFeed</Text>
          </View>

          <GlassCard style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Email"
                  placeholder="name@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Password"
                  placeholder="Enter your password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <PrimaryButton
              title="Sign In"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={{ marginTop: SPACING.md }}
            />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Don't have an account? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.push('/(auth)/signup')}
            >
              Sign Up
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
  },
  header: {
    marginBottom: SPACING.xxxl,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.display,
    color: COLORS.textPrimary,
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
    color: COLORS.textSecondary,
  },
  card: {
    width: '100%',
  },
  errorBox: {
    backgroundColor: COLORS.errorLight,
    padding: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.lg,
  },
  errorBoxText: {
    color: COLORS.error,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.xxxl,
  },
  footerText: {
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.primaryLight,
  },
});
