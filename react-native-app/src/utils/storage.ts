import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants';

// ─── Token Storage ─────────────────────────────────────────────────────────────
export const storage = {
  getAccessToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(STORAGE_KEYS.ACCESS_TOKEN),

  setAccessToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, token),

  getRefreshToken: (): Promise<string | null> =>
    SecureStore.getItemAsync(STORAGE_KEYS.REFRESH_TOKEN),

  setRefreshToken: (token: string): Promise<void> =>
    SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, token),

  setTokens: async (accessToken: string, refreshToken: string): Promise<void> => {
    await Promise.all([
      SecureStore.setItemAsync(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      SecureStore.setItemAsync(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  clearTokens: async (): Promise<void> => {
    await Promise.all([
      SecureStore.deleteItemAsync(STORAGE_KEYS.ACCESS_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.REFRESH_TOKEN),
      SecureStore.deleteItemAsync(STORAGE_KEYS.USER),
    ]);
  },

  setUser: async (user: object): Promise<void> =>
    SecureStore.setItemAsync(STORAGE_KEYS.USER, JSON.stringify(user)),

  getUser: async (): Promise<object | null> => {
    const raw = await SecureStore.getItemAsync(STORAGE_KEYS.USER);
    return raw ? (JSON.parse(raw) as object) : null;
  },
};
