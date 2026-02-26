import { StyleSheet, View, Text, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Stack, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { signupSchema, SignupFormData } from '@schemas/auth.schema';
import { useSignupMutation } from '@store/api/authApi';
import { setCredentials, useAppDispatch } from '@store/index';
import { storage } from '@utils/storage';
import { AuthInput } from '@components/ui/AuthInput';
import { PrimaryButton } from '@components/ui/PrimaryButton';
import { GlassCard } from '@components/ui/GlassCard';
import { COLORS, FONTS, FONT_SIZE, SPACING } from '@constants/index';

export default function SignupScreen() {
  const dispatch = useAppDispatch();
  const [signup, { isLoading, error }] = useSignupMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { username: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: SignupFormData) => {
    try {
      const res = await signup({
        username: data.username,
        email: data.email,
        password: data.password,
      }).unwrap();

      await Promise.all([
        storage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken),
        storage.setUser(res.data.user)
      ]);
      dispatch(setCredentials({
        user: res.data.user,
        accessToken: res.data.tokens.accessToken,
        refreshToken: res.data.tokens.refreshToken,
      }));
      router.replace('/(app)/feed');
    } catch (err: any) {
      console.error('[SIGNUP] Error:', err);
    }
  };

  const errObj = error as any;
  const errorMessage = errObj?.data?.message || errObj?.error || errObj?.message;

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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Join SocialFeed today</Text>
          </View>

          <GlassCard style={styles.card}>
            {errorMessage ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorBoxText}>{errorMessage}</Text>
              </View>
            ) : null}

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Username"
                  placeholder="johndoe"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.username?.message}
                />
              )}
            />

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
                  placeholder="Create a password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.password?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <AuthInput
                  label="Confirm Password"
                  placeholder="Repeat your password"
                  isPassword
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  error={errors.confirmPassword?.message}
                />
              )}
            />

            <PrimaryButton
              title="Sign Up"
              onPress={handleSubmit(onSubmit)}
              loading={isLoading}
              style={{ marginTop: SPACING.md }}
            />
          </GlassCard>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text
              style={styles.footerLink}
              onPress={() => router.back()}
            >
              Sign In
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  // Similar styles to login
  container: { flex: 1 },
  keyboardView: { flex: 1 },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    paddingVertical: 60, // extra padding for taller form
  },
  header: {
    marginBottom: SPACING.xl,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xxl,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
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
    marginTop: SPACING.xxl,
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
