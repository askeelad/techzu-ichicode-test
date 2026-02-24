import React from 'react';
import { View, StyleSheet, ViewProps, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { COLORS, RADIUS } from '@constants/index';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

/**
 * Reusable Glassmorphism Card Wrapper
 * Uses Expo BlurView with semi-transparent borders and background
 */
export const GlassCard: React.FC<GlassCardProps> = ({
  intensity = COLORS.glassBlur,
  style,
  children,
  ...rest
}) => {
  return (
    <View style={[styles.container, style]} {...rest}>
      <BlurView
        intensity={intensity}
        tint="dark"
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.content}>{children}</View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    backgroundColor: COLORS.glassBg,
    borderColor: COLORS.glassBorder,
    borderWidth: 1,
  },
  content: {
    padding: 24,
  },
});
