// ─── Backend Base URL ─────────────────────────────────────────────────────────
// The base URL should be configured in your .env file as EXPO_PUBLIC_API_URL.
// Example: EXPO_PUBLIC_API_URL=http://192.168.0.111:3000/api/v1
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// ─── Auth Endpoints ───────────────────────────────────────────────────────────
export const AUTH_URLS = {
  SIGNUP: '/auth/signup',
  LOGIN: '/auth/login',
  REFRESH: '/auth/refresh',
  LOGOUT: '/auth/logout',
  FCM_TOKEN: '/auth/fcm-token',
} as const;

// ─── Posts Endpoints ──────────────────────────────────────────────────────────
export const POST_URLS = {
  FEED: '/posts',
  SEARCH: '/posts/search',
  SINGLE: (id: string) => `/posts/${id}`,
  CREATE: '/posts',
  DELETE: (id: string) => `/posts/${id}`,
  LIKE: (id: string) => `/posts/${id}/like`,
  COMMENT: (id: string) => `/posts/${id}/comment`,
  COMMENTS: (id: string) => `/posts/${id}/comments`,
} as const;

// ─── Health ───────────────────────────────────────────────────────────────────
export const HEALTH_URL = '/health';
