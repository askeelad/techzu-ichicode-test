import React, { useCallback, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetFlatList,
  BottomSheetTextInput,
} from '@gorhom/bottom-sheet';
import { Comment, Post } from '@store/api/postApi';
import { useGetCommentsQuery, useAddCommentMutation } from '@store/api/postApi';
import { useAppSelector } from '@store/index';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, PAGINATION } from '@constants/index';
import { rs } from '@utils/responsive';

interface CommentSheetProps {
  post: Post | null;
  sheetRef: React.RefObject<BottomSheet | null>;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const CommentItem: React.FC<{ item: Comment }> = ({ item }) => (
  <View style={styles.commentItem}>
    <View style={styles.commentAvatar}>
      <Text style={styles.commentAvatarText}>
        {item.author.username[0]?.toUpperCase() ?? '?'}
      </Text>
    </View>
    <View style={styles.commentBody}>
      <Text style={styles.commentUsername}>@{item.author.username}</Text>
      <Text style={styles.commentContent}>{item.content}</Text>
      <Text style={styles.commentTime}>{timeAgo(item.created_at)}</Text>
    </View>
  </View>
);

export const CommentSheet: React.FC<CommentSheetProps> = ({ post, sheetRef }) => {
  const user = useAppSelector((s) => s.auth.user);
  const [text, setText] = useState('');
  const [page, setPage] = useState(1);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        pressBehavior="close"
      />
    ),
    [],
  );

  const { data, isFetching } = useGetCommentsQuery(
    { postId: post?.id ?? '', page, limit: PAGINATION.COMMENTS_LIMIT },
    { skip: !post }
  );

  const [addComment, { isLoading: sending }] = useAddCommentMutation();

  const handleSend = async () => {
    if (!text.trim() || !post) return;
    const content = text.trim();
    setText('');
    try {
      await addComment({ postId: post.id, content, user }).unwrap();
    } catch {
      setText(content); // revert
    }
  };

  const loadMore = () => {
    if (data && page < data.meta.totalPages && !isFetching) {
      setPage((p) => p + 1);
    }
  };

  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={['55%', '90%']}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.indicator}
      backdropComponent={renderBackdrop}
    >
      <BottomSheetFlatList
        data={data?.data ?? []}
        keyExtractor={(c: Comment) => c.id}
        renderItem={({ item }: { item: Comment }) => <CommentItem item={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Comments {post ? `(${post.comments_count})` : ''}</Text>
          </View>
        }
        ListEmptyComponent={
          isFetching ? (
            <ActivityIndicator color={COLORS.primary} style={{ marginTop: SPACING.xl }} />
          ) : (
            <Text style={styles.emptyText}>No comments yet. Be the first!</Text>
          )
        }
        ListFooterComponent={
          <View style={{ marginTop: 24 }}>
            {isFetching && page > 1 ? (
              <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.md }} />
            ) : null}
            <View style={styles.inputRow}>
              <BottomSheetTextInput
                style={styles.input}
                placeholder="Add a comment…"
                placeholderTextColor={COLORS.placeholder}
                value={text}
                onChangeText={setText}
                multiline
              />
              <Pressable
                onPress={handleSend}
                disabled={sending || !text.trim()}
                style={[styles.sendBtn, (!text.trim() || sending) && styles.sendBtnDisabled]}
              >
                {sending ? (
                  <ActivityIndicator color={COLORS.white} size="small" />
                ) : (
                  <Text style={styles.sendText}>↑</Text>
                )}
              </Pressable>
            </View>
          </View>
        }
      />
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: COLORS.backgroundSecondary, borderRadius: RADIUS.xl },
  indicator: { backgroundColor: COLORS.border },
  header: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    marginBottom: SPACING.md,
  },
  title: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
  },
  listContent: { paddingBottom: SPACING.xl },
  commentItem: {
    paddingHorizontal: SPACING.base,
    paddingVertical: SPACING.md,
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  commentAvatar: {
    width: rs(32),
    height: rs(32),
    borderRadius: rs(16),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
  },
  commentBody: { flex: 1 },
  commentUsername: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.xs,
    marginBottom: 2,
  },
  commentContent: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  commentTime: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.md,
    backgroundColor: COLORS.backgroundSecondary,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.inputBg,
    borderRadius: RADIUS.xl,
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    maxHeight: 100,
  },
  sendBtn: {
    width: rs(40),
    height: rs(40),
    borderRadius: rs(20),
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendText: {
    color: COLORS.white,
    fontSize: FONT_SIZE.md,
    fontFamily: FONTS.semiBold,
  },
})