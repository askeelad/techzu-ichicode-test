import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './apiClient';
import { POST_URLS } from '../../constants';

export interface PostAuthor {
  id: string;
  username: string;
  email: string;
}

export interface Post {
  id: string;
  content: string;
  author: PostAuthor;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  author: PostAuthor;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface FeedResponse {
  success: boolean;
  message: string;
  data: Post[];
  meta: PaginationMeta;
}

export interface SinglePostResponse {
  success: boolean;
  message: string;
  data: Post;
}

export interface CommentsResponse {
  success: boolean;
  message: string;
  data: Comment[];
  meta: PaginationMeta;
}

export interface LikeResponse {
  success: boolean;
  message: string;
  data: { liked: boolean };
}

export const postApi = createApi({
  reducerPath: 'postApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Post', 'Comments'],
  endpoints: (builder) => ({
    // Get paginated feed
    getFeed: builder.query<FeedResponse, { page: number; limit: number; username?: string }>({
      query: ({ page, limit, username }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
        });
        if (username) params.append('username', username);
        return `${POST_URLS.FEED}?${params.toString()}`;
      },
      providesTags: ['Post'],
      // Merge pages for infinite scroll
      serializeQueryArgs: ({ queryArgs }) => {
        const { username } = queryArgs;
        return username ?? 'feed';
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          // Fresh load / pull-to-refresh
          currentCache.data = newItems.data;
          currentCache.meta = newItems.meta;
        } else {
          // Append next page
          currentCache.data.push(...newItems.data);
          currentCache.meta = newItems.meta;
        }
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page ||
        currentArg?.username !== previousArg?.username,
    }),

    // Search feed/posts
    searchPosts: builder.query<FeedResponse, { page: number; limit: number; q: string }>({
      query: ({ page, limit, q }) => {
        const params = new URLSearchParams({
          page: String(page),
          limit: String(limit),
          q,
        });
        return `${POST_URLS.SEARCH}?${params.toString()}`;
      },
      providesTags: ['Post'],
      serializeQueryArgs: ({ queryArgs }) => {
        return `search-${queryArgs.q}`;
      },
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data;
          currentCache.meta = newItems.meta;
        } else {
          currentCache.data.push(...newItems.data);
          currentCache.meta = newItems.meta;
        }
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page || currentArg?.q !== previousArg?.q,
    }),

    // Get single post
    getPost: builder.query<SinglePostResponse, string>({
      query: (id) => POST_URLS.SINGLE(id),
      providesTags: (_result, _error, id) => [{ type: 'Post', id }],
    }),

    // Create post
    createPost: builder.mutation<SinglePostResponse, { content: string }>({
      query: (body) => ({
        url: POST_URLS.CREATE,
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Post'],
    }),

    // Update post
    updatePost: builder.mutation<SinglePostResponse, { id: string; content: string }>({
      query: ({ id, content }) => ({
        url: POST_URLS.SINGLE(id),
        method: 'PATCH',
        body: { content },
      }),
      invalidatesTags: ['Post'],
    }),

    // Delete post
    deletePost: builder.mutation<void, string>({
      query: (id) => ({
        url: POST_URLS.DELETE(id),
        method: 'DELETE',
      }),
      invalidatesTags: ['Post'],
    }),

    toggleLike: builder.mutation<LikeResponse, string>({
      query: (id) => ({
        url: POST_URLS.LIKE(id),
        method: 'POST',
      }),
      invalidatesTags: ['Post'], // Added so the feed updates the heart icon
    }),

    // Add comment
    addComment: builder.mutation<{ success: boolean; data: Comment }, { postId: string; content: string; user: any }>({
      query: ({ postId, content }) => ({
        url: POST_URLS.COMMENT(postId),
        method: 'POST',
        body: { content },
      }),
      invalidatesTags: (_result, _error, { postId }) => [
        { type: 'Comments', id: postId },
        'Post', // also refresh feed to update comment counts
      ],
      async onQueryStarted({ postId, content, user }, { dispatch, queryFulfilled }) {
        const tempId = Date.now().toString();
        const optimisticComment: Comment = {
          id: tempId,
          content,
          author: {
            id: user.id ?? 'me',
            username: user.username ?? 'Current User',
            email: user.email ?? '',
          },
          created_at: new Date().toISOString(),
        };

        const patchResult = dispatch(
          postApi.util.updateQueryData('getComments', { postId, page: 1, limit: 10 }, (draft) => {
            // Optimistically insert at the beginning
            draft.data.unshift(optimisticComment);
          })
        );
        try {
          await queryFulfilled;
        } catch {
          patchResult.undo();
        }
      },
    }),

    // Get comments
    getComments: builder.query<CommentsResponse, { postId: string; page: number; limit: number }>({
      query: ({ postId, page, limit }) =>
        `${POST_URLS.COMMENTS(postId)}?page=${page}&limit=${limit}`,
      providesTags: (_result, _error, { postId }) => [{ type: 'Comments', id: postId }],
      serializeQueryArgs: ({ queryArgs }) => queryArgs.postId,
      merge: (currentCache, newItems, { arg }) => {
        if (arg.page === 1) {
          currentCache.data = newItems.data;
        } else {
          currentCache.data.push(...newItems.data);
        }
        currentCache.meta = newItems.meta;
      },
      forceRefetch: ({ currentArg, previousArg }) =>
        currentArg?.page !== previousArg?.page,
    }),
  }),
});

export const {
  useGetFeedQuery,
  useSearchPostsQuery,
  useGetPostQuery,
  useCreatePostMutation,
  useUpdatePostMutation,
  useDeletePostMutation,
  useToggleLikeMutation,
  useAddCommentMutation,
  useGetCommentsQuery,
} = postApi;
