import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacityProps,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, FONTS, FONT_SIZE, RADIUS } from '@constants/index';

interface PrimaryButtonProps extends TouchableOpacityProps {
  title: string;
  loading?: boolean;
}

export const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  title,
  loading = false,
  style,
  disabled,
  ...rest
}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      disabled={disabled || loading}
      style={[styles.container, style]}
      {...rest}
    >
      <LinearGradient
        colors={[
          disabled ? COLORS.surface : COLORS.gradientStart,
          disabled ? COLORS.surface : COLORS.gradientEnd,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={COLORS.white} />
        ) : (
          <Text style={[styles.text, disabled && styles.textDisabled]}>
            {title}
          </Text>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 54,
    borderRadius: RADIUS.lg,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  textDisabled: {
    color: COLORS.textMuted,
  },
});
