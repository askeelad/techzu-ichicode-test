// ─── Backend Base URL ─────────────────────────────────────────────────────────
// In production, replace with your deployed API URL
export const API_BASE_URL = 'http://localhost:3000/api/v1';

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
  SINGLE: (id: string) => `/posts/${id}`,
  CREATE: '/posts',
  DELETE: (id: string) => `/posts/${id}`,
  LIKE: (id: string) => `/posts/${id}/like`,
  COMMENT: (id: string) => `/posts/${id}/comment`,
  COMMENTS: (id: string) => `/posts/${id}/comments`,
} as const;

// ─── Health ───────────────────────────────────────────────────────────────────
export const HEALTH_URL = '/health';
