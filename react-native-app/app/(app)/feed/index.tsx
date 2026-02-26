import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';

import { 
  useGetFeedQuery, 
  useSearchPostsQuery, 
  useCreatePostMutation, 
  useUpdatePostMutation,
  Post 
} from '@store/api/postApi';
import { useGetNotificationsQuery } from '@store/api/notificationApi';
import { useAppSelector, useAppDispatch, logout } from '@store/index';
import { storage } from '@utils/storage';
import { PostCard } from '@components/PostCard';
import { CommentSheet } from '@components/CommentSheet';
import { PostOptionsSheet } from '@components/PostOptionsSheet';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, PAGINATION } from '@constants/index';
import { rs, isTablet } from '@utils/responsive';
import { useRouter } from 'expo-router';
import { Plus } from 'lucide-react-native'

const LIMIT = PAGINATION.DEFAULT_LIMIT;

export default function FeedScreen() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // ── Feed pagination state ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const [searchText, setSearchText] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // ── Notifications check ─────────────────────────────────────────────────────
  const { data: notifData } = useGetNotificationsQuery(
    { page: 1, limit: 10 },
    { pollingInterval: 10000 }
  );
  const hasUnread = notifData?.data?.some((n) => !n.is_read) ?? false;

  // Debounce search input to avoid hitting the API on every keystroke
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchText);
      setPage(1); // Reset to page 1 when search changes
    }, 500);
    return () => clearTimeout(timer);
  }, [searchText]);

  const isSearching = debouncedSearch.trim().length > 0;

  // Regular Feed Query (skips if searching)
  const feedQuery = useGetFeedQuery(
    { page, limit: LIMIT },
    { skip: isSearching }
  );

  // Search Query (skips if NOT searching)
  const searchQuery = useSearchPostsQuery(
    { page, limit: LIMIT, q: debouncedSearch.trim() },
    { skip: !isSearching }
  );

  // Combine the active query state
  const activeQuery = isSearching ? searchQuery : feedQuery;
  const { data, isFetching, isLoading } = activeQuery;

  // ── Create or Edit post ─────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [createContent, setCreateContent] = useState('');
  const [editPostId, setEditPostId] = useState<string | null>(null);

  const [createPost, { isLoading: isCreating }] = useCreatePostMutation();
  const [updatePost, { isLoading: isUpdating }] = useUpdatePostMutation();

  const handleOpenCreatePost = () => {
    setEditPostId(null);
    setCreateContent('');
    setShowCreate(true);
  };

  const handlePostSubmit = async () => {
    if (!createContent.trim()) return;
    try {
      if (editPostId) {
        await updatePost({ id: editPostId, content: createContent.trim() }).unwrap();
      } else {
        await createPost({ content: createContent.trim() }).unwrap();
      }
      setShowCreate(false);
      setCreateContent('');
      setEditPostId(null);
    } catch (error) {
      console.error('Failed to save post', error);
    }
  };

  // ── Comments interaction ────────────────────────────────────────────────────
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);

  const handleCommentPress = useCallback((post: Post) => {
    setSelectedPost(post);
    bottomSheetRef.current?.expand();
  }, []);

  // ── Options interaction (Instagram style) ──────────────────────────────────
  const [selectedOptionsPost, setSelectedOptionsPost] = useState<Post | null>(null);
  const optionsSheetRef = useRef<BottomSheet>(null);

  const handleOptionsPress = useCallback((post: Post) => {
    setSelectedOptionsPost(post);
    optionsSheetRef.current?.expand(); // expand the new options sheet
  }, []);

  const handleEditIntent = useCallback((post: Post) => {
    setEditPostId(post.id);
    setCreateContent(post.content);
    setShowCreate(true);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data && page < data.meta.totalPages && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [data, page, isFetching]);

  const handleLogout = async () => {
    await storage.clearTokens();
    dispatch(logout());
  };

  const posts = data?.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
        {/* ── Header ────────────────────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>SocialFeed</Text>
          <View style={styles.headerRight}>
            <Pressable onPress={() => router.push('/notifications')} style={styles.iconBtn}>
              <Text style={styles.iconBtnText}>🔔</Text>
              {hasUnread && <View style={styles.notificationDot} />}
            </Pressable>
            <Pressable style={styles.iconBtn} onPress={handleOpenCreatePost}>
              <Text style={styles.iconBtnText}>✏️</Text>
            </Pressable>
            <Pressable onPress={handleLogout} style={styles.logoutBtn}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
        </View>

        {/* ── Search Bar ────────────────────────────────────────────────────── */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts & users..."
            placeholderTextColor={COLORS.textMuted}
            value={searchText}
            onChangeText={setSearchText}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchText.length > 0 && (
            <Pressable onPress={() => setSearchText('')} style={styles.clearBtn}>
              <Text style={styles.clearBtnText}>✕</Text>
            </Pressable>
          )}
        </View>

        {/* ── Feed FlatList ──────────────────────────────────────────────────── */}
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator color={COLORS.primary} size="large" />
          </View>
        ) : (
          <FlatList
            data={posts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <PostCard 
                post={item} 
                onCommentPress={handleCommentPress} 
                onOptionsPress={handleOptionsPress}
              />
            )}
            numColumns={isTablet() ? 2 : 1}
            key={isTablet() ? 'tablet' : 'phone'}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={isFetching && page === 1}
                onRefresh={handleRefresh}
                tintColor={COLORS.primary}
              />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isFetching && page > 1 ? (
                <ActivityIndicator
                  color={COLORS.primary}
                  size="small"
                  style={{ marginVertical: SPACING.lg }}
                />
              ) : null
            }
            ListEmptyComponent={
              <View style={styles.centered}>
                <Text style={styles.emptyTitle}>Nothing here yet</Text>
                <Text style={styles.emptySubtitle}>Be the first to post something!</Text>
              </View>
            }
          />
        )}

        {/* Floating Action Button for Create Post */}
        <TouchableOpacity 
          style={styles.fab} 
          onPress={handleOpenCreatePost}
          activeOpacity={0.8}
        >
          <Plus size={24} color={COLORS.white} />
        </TouchableOpacity>

        {/* Create / Edit Modal */}
        <Modal visible={showCreate} animationType="slide" presentationStyle="pageSheet">
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowCreate(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </TouchableOpacity>
              <Text style={styles.modalTitle}>{editPostId ? 'Edit Post' : 'New Post'}</Text>
              <TouchableOpacity onPress={handlePostSubmit} disabled={isCreating || isUpdating}>
                <Text style={styles.modalPost}>
                  {isCreating || isUpdating ? 'Saving...' : editPostId ? 'Save' : 'Post'}
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalAuthor}>
              <View style={styles.miniAvatar}>
                <Text style={styles.miniAvatarText}>
                  {user?.username[0]?.toUpperCase() ?? '?'}
                </Text>
              </View>
              <Text style={styles.modalUsername}>@{user?.username ?? 'you'}</Text>
            </View>

            <TextInput
              style={styles.postInput}
              placeholder="What's on your mind?"
              placeholderTextColor={COLORS.placeholder}
              multiline
              autoFocus
              value={createContent}
              onChangeText={setCreateContent}
              maxLength={500}
            />

            <Text style={styles.charCount}>{createContent.length}/500</Text>

            <Pressable
              style={[
                styles.postBtn,
                (!createContent.trim() || isCreating || isUpdating) && styles.postBtnDisabled,
              ]}
              onPress={handlePostSubmit}
              disabled={!createContent.trim() || isCreating || isUpdating}
            >
              {(isCreating || isUpdating) ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.postBtnText}>{editPostId ? 'Save' : 'Post'}</Text>
              )}
            </Pressable>
          </SafeAreaView>
        </Modal>

        {/* Comment Bottom Sheet */}
        <CommentSheet
          ref={bottomSheetRef}
          post={selectedPost}
          onClose={() => bottomSheetRef.current?.close()}
        />

        {/* Options Bottom Sheet */}
        <PostOptionsSheet
          ref={optionsSheetRef}
          post={selectedOptionsPost}
          onEdit={handleEditIntent}
          onClose={() => optionsSheetRef.current?.close()}
        />
      </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xl,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  iconBtnText: { fontSize: FONT_SIZE.md },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.error,
    borderWidth: 1,
    borderColor: COLORS.surface,
  },
  logoutBtn: {
    marginLeft: SPACING.xs,
  },
  logoutText: {
    color: COLORS.primaryLight,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  searchInput: {
    flex: 1,
    height: 40,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingRight: SPACING.xl + SPACING.base,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  clearBtn: {
    position: 'absolute',
    right: SPACING.base + SPACING.md,
    height: 40,
    justifyContent: 'center',
    paddingHorizontal: SPACING.xs,
  },
  clearBtnText: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.md,
  },
  listContent: {
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xxxl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 200,
  },
  emptyTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.lg,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
  fab: {
    position: 'absolute',
    bottom: SPACING.xl,
    right: SPACING.xl,
    width: rs(56),
    height: rs(56),
    borderRadius: rs(28),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.lg,
  },
  modalCancel: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.md,
  },
  modalPost: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  modalAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  miniAvatar: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  miniAvatarText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
  },
  modalUsername: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
  },
  postInput: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.base,
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    textAlignVertical: 'top',
    marginBottom: SPACING.xs,
  },
  charCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    paddingHorizontal: SPACING.xl,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 50,
    marginHorizontal: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
  },
  postBtnDisabled: { opacity: 0.4 },
  postBtnText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
});
