import React, { useRef, useState, useCallback } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BottomSheet from '@gorhom/bottom-sheet';

import { useGetFeedQuery, useCreatePostMutation, Post } from '@store/api/postApi';
import { useAppSelector, useAppDispatch, logout } from '@store/index';
import { storage } from '@utils/storage';
import { PostCard } from '../../../src/components/PostCard';
import { CommentSheet } from '../../../src/components/CommentSheet';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, PAGINATION } from '@constants/index';
import { rs, isTablet } from '@utils/responsive';

const LIMIT = PAGINATION.DEFAULT_LIMIT;

export default function FeedScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // ── Feed pagination state ───────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const { data, isFetching, isLoading } = useGetFeedQuery({ page, limit: LIMIT });

  // ── Create post ─────────────────────────────────────────────────────────────
  const [showCreate, setShowCreate] = useState(false);
  const [postContent, setPostContent] = useState('');
  const [createPost, { isLoading: creating }] = useCreatePostMutation();

  // ── Comment bottom sheet ────────────────────────────────────────────────────
  const commentSheetRef = useRef<BottomSheet>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(() => {
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (data && page < data.meta.totalPages && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [data, page, isFetching]);

  const handleCommentPress = useCallback((post: Post) => {
    setSelectedPost(post);
    commentSheetRef.current?.snapToIndex(0);
  }, []);

  const handleCreatePost = async () => {
    if (!postContent.trim()) return;
    try {
      await createPost({ content: postContent.trim() }).unwrap();
      setPostContent('');
      setShowCreate(false);
      setPage(1); // refresh feed
    } catch {
      // Error handled by RTK Query
    }
  };

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
            <Pressable style={styles.createBtn} onPress={() => setShowCreate(true)}>
              <Text style={styles.createBtnText}>✏️</Text>
            </Pressable>
            <Pressable onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </Pressable>
          </View>
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
              <PostCard post={item} onCommentPress={handleCommentPress} />
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

        {/* ── Create Post Modal ─────────────────────────────────────────────── */}
        <Modal
          visible={showCreate}
          animationType="slide"
          transparent
          onRequestClose={() => setShowCreate(false)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalOverlay}
          >
            <View style={styles.createModal}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>New Post</Text>
                <Pressable onPress={() => setShowCreate(false)}>
                  <Text style={styles.modalClose}>✕</Text>
                </Pressable>
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
                value={postContent}
                onChangeText={setPostContent}
                maxLength={500}
              />

              <Text style={styles.charCount}>{postContent.length}/500</Text>

              <Pressable
                style={[
                  styles.postBtn,
                  (!postContent.trim() || creating) && styles.postBtnDisabled,
                ]}
                onPress={handleCreatePost}
                disabled={!postContent.trim() || creating}
              >
                {creating ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.postBtnText}>Post</Text>
                )}
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* ── Comment Sheet ─────────────────────────────────────────────────── */}
        <CommentSheet post={selectedPost} sheetRef={commentSheetRef} />
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
  createBtn: {
    width: rs(36),
    height: rs(36),
    borderRadius: rs(18),
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  createBtnText: { fontSize: FONT_SIZE.md },
  logoutText: {
    color: COLORS.primaryLight,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
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
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'flex-end',
  },
  createModal: {
    backgroundColor: COLORS.backgroundSecondary,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    padding: SPACING.xl,
    minHeight: 320,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.lg,
  },
  modalClose: {
    color: COLORS.textMuted,
    fontSize: FONT_SIZE.lg,
    padding: SPACING.xs,
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
    minHeight: 120,
    textAlignVertical: 'top',
    marginBottom: SPACING.xs,
  },
  charCount: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    textAlign: 'right',
    marginBottom: SPACING.md,
  },
  postBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.lg,
    height: 50,
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
