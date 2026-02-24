import React, { useState } from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  Pressable,
} from 'react-native';
import { COLORS, FONTS, FONT_SIZE, RADIUS, SPACING } from '@constants/index';

interface AuthInputProps extends TextInputProps {
  label: string;
  error?: string;
  isPassword?: boolean;
}

export const AuthInput: React.FC<AuthInputProps> = ({
  label,
  error,
  isPassword,
  style,
  ...rest
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          error ? styles.inputContainerError : null,
        ]}
      >
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={COLORS.placeholder}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          secureTextEntry={isPassword && !showPassword}
          {...rest}
        />
        
        {isPassword && (
          <Pressable
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={styles.eyeText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </Pressable>
        )}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.lg,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    marginLeft: SPACING.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: RADIUS.lg,
    height: 52,
    paddingHorizontal: SPACING.md,
  },
  inputContainerFocused: {
    borderColor: COLORS.inputBorderFocused,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  inputContainerError: {
    borderColor: COLORS.error,
  },
  input: {
    flex: 1,
    height: '100%',
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
  },
  eyeButton: {
    padding: SPACING.xs,
  },
  eyeText: {
    color: COLORS.primaryLight,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
  },
  errorText: {
    color: COLORS.error,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    marginTop: SPACING.xs,
    marginLeft: SPACING.xs,
  },
});
