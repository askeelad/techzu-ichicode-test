// ─── Brand Palette ────────────────────────────────────────────────────────────
export const COLORS = {
  // Backgrounds
  background: '#0A0A0F',
  backgroundSecondary: '#12121A',
  surface: 'rgba(255, 255, 255, 0.06)',
  surfaceHover: 'rgba(255, 255, 255, 0.10)',

  // Glass
  glassBg: 'rgba(255, 255, 255, 0.07)',
  glassBorder: 'rgba(255, 255, 255, 0.13)',
  glassBlur: 20,

  // Brand / Primary
  primary: '#7C3AED',
  primaryLight: '#8B5CF6',
  primaryDark: '#4F46E5',
  gradientStart: '#7C3AED',
  gradientEnd: '#4F46E5',

  // Text
  textPrimary: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  textInverse: '#0A0A0F',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  errorLight: 'rgba(239, 68, 68, 0.12)',

  // Like
  like: '#EF4444',
  likeInactive: '#6B7280',

  // Borders / Dividers
  border: 'rgba(255, 255, 255, 0.10)',
  divider: 'rgba(255, 255, 255, 0.06)',

  // Input
  inputBg: 'rgba(255, 255, 255, 0.05)',
  inputBorder: 'rgba(255, 255, 255, 0.15)',
  inputBorderFocused: '#7C3AED',
  placeholder: '#6B7280',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.60)',
  overlayLight: 'rgba(0, 0, 0, 0.30)',

  // Transparent
  transparent: 'transparent',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export type ColorKey = keyof typeof COLORS;
