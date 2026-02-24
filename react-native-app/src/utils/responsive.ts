import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Responsive Scale ─────────────────────────────────────────────────────────
// Base design width = 390 (iPhone 14)
const BASE_WIDTH = 390;

/**
 * Scale a value proportionally to the screen width.
 * Use for widths, font sizes, paddings.
 */
export const rs = (size: number): number => {
  const scale = SCREEN_WIDTH / BASE_WIDTH;
  return Math.round(PixelRatio.roundToNearestPixel(size * scale));
};

/**
 * Returns true if device is tablet-sized (width >= 768)
 */
export const isTablet = (): boolean => SCREEN_WIDTH >= 768;

/**
 * Returns current screen dimensions (updates on re-call, not reactive)
 */
export const getScreen = () => ({
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height,
});

/**
 * Responsive column count for grids
 */
export const numColumns = (): number => (isTablet() ? 2 : 1);

export { SCREEN_WIDTH, SCREEN_HEIGHT };
