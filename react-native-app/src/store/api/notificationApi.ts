import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiClient';
import { PaginationMeta, PostAuthor } from './postApi';

export interface Notification {
  id: string;
  type: 'like' | 'comment';
  is_read: boolean;
  post_id: string;
  created_at: string;
  actor: PostAuthor;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: Notification[];
  meta: PaginationMeta;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query<NotificationsResponse, { page: number; limit: number }>({
      query: ({ page, limit }) => `/notifications?page=${page}&limit=${limit}`,
      providesTags: ['Notifications'],
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data;
        } else {
          currentCache.data.push(...newItems.data);
        }
        currentCache.meta = newItems.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg?.page !== previousArg?.page,
    }),
    markAsRead: builder.mutation<void, void>({
      query: () => ({
        url: `/notifications/read`,
        method: 'PUT',
      }),
      invalidatesTags: ['Notifications'],
    }),
  }),
});

export const { useGetNotificationsQuery, useMarkAsReadMutation } = notificationApi;
