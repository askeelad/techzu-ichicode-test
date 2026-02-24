// ─── App-level Constants ──────────────────────────────────────────────────────
export const APP_NAME = 'SocialFeed';

// ─── Secure Storage Keys ──────────────────────────────────────────────────────
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'sf_access_token',
  REFRESH_TOKEN: 'sf_refresh_token',
  USER: 'sf_user',
} as const;

// ─── Pagination Defaults ──────────────────────────────────────────────────────
export const PAGINATION = {
  DEFAULT_LIMIT: 10,
  COMMENTS_LIMIT: 15,
} as const;

// ─── Animation Durations (ms) ─────────────────────────────────────────────────
export const ANIMATION = {
  fast: 150,
  normal: 250,
  slow: 400,
} as const;

// ─── Avatar / Image Fallback ──────────────────────────────────────────────────
export const AVATAR_PLACEHOLDER = 'https://ui-avatars.com/api/?background=7C3AED&color=fff&size=128&name=';
