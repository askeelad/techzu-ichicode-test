import {
  BaseQueryFn,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { RootState } from '../store';
import { tokenRefreshed, logout } from '../authSlice';
import { storage } from '../../utils/storage';
import { API_BASE_URL, AUTH_URLS } from '../../constants';

// Mutex prevents concurrent refresh calls (only one refresh at a time)
const refreshMutex = new Mutex();

const rawBaseQuery = fetchBaseQuery({
  baseUrl: API_BASE_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    headers.set('Content-Type', 'application/json');
    return headers;
  },
});

/**
 * RTK Query base query with automatic access-token refresh.
 *
 * Flow:
 *  1. Execute the original request.
 *  2. If the response is 401, acquire the mutex (so concurrent calls wait).
 *  3. Attempt to refresh the token from SecureStore.
 *  4. On success, store the new token in Redux + SecureStore and retry.
 *  5. On failure, dispatch logout() and return the original error.
 */
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error?.status !== 401) {
    return result;
  }

  // Only one refresh in-flight at a time
  if (refreshMutex.isLocked()) {
    await refreshMutex.waitForUnlock();
    result = await rawBaseQuery(args, api, extraOptions);
    return result;
  }

  const release = await refreshMutex.acquire();

  try {
    const refreshToken = await storage.getRefreshToken();

    if (!refreshToken) {
      api.dispatch(logout());
      return result;
    }

    const refreshResult = await rawBaseQuery(
      {
        url: AUTH_URLS.REFRESH,
        method: 'POST',
        body: { refreshToken },
      },
      api,
      extraOptions,
    );

    if (refreshResult.data) {
      const data = refreshResult.data as { data: { accessToken: string } };
      const newAccessToken = data.data.accessToken;

      api.dispatch(tokenRefreshed({ accessToken: newAccessToken }));
      await storage.setAccessToken(newAccessToken);

      // Retry the original request with the new token
      result = await rawBaseQuery(args, api, extraOptions);
    } else {
      // Refresh failed → kick the user out
      await storage.clearTokens();
      api.dispatch(logout());
    }
  } finally {
    release();
  }

  return result;
};
