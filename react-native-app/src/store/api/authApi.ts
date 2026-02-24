import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiClient';
import { AUTH_URLS } from '../../constants';
import { AuthUser } from '../authSlice';

export interface SignupRequest {
  username: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: AuthUser;
    tokens: AuthTokens;
  };
}

export interface RefreshResponse {
  success: boolean;
  message: string;
  data: { accessToken: string };
}

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    signup: builder.mutation<AuthResponse, SignupRequest>({
      query: (body) => ({
        url: AUTH_URLS.SIGNUP,
        method: 'POST',
        body,
      }),
    }),

    login: builder.mutation<AuthResponse, LoginRequest>({
      query: (body) => ({
        url: AUTH_URLS.LOGIN,
        method: 'POST',
        body,
      }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({
        url: AUTH_URLS.LOGOUT,
        method: 'POST',
      }),
    }),

    updateFcmToken: builder.mutation<void, { fcmToken: string }>({
      query: (body) => ({
        url: AUTH_URLS.FCM_TOKEN,
        method: 'PUT',
        body,
      }),
    }),
  }),
});

export const {
  useSignupMutation,
  useLoginMutation,
  useLogoutMutation,
  useUpdateFcmTokenMutation,
} = authApi;
