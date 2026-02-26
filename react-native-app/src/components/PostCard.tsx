import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Share,
  Animated,
  ActionSheetIOS,
  Alert,
  Platform,
} from 'react-native';
import { Send, MoreHorizontal, Heart, MessageCircle } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS, SHADOW } from '@constants/index';
import { rs } from '@utils/responsive';
import { Post } from '@store/api/postApi';
import { useToggleLikeMutation } from '@store/api/postApi';
import { useAppSelector } from '@store/index';

interface PostCardProps {
  post: Post;
  onCommentPress: (post: Post) => void;
  onOptionsPress: (post: Post) => void;
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

export const PostCard: React.FC<PostCardProps> = ({ post, onCommentPress, onOptionsPress }) => {
  const [toggleLike] = useToggleLikeMutation();
  const currentUser = useAppSelector((s) => s.auth.user);

  // Local optimistic like state
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes_count);

  // Built-in Animated (no worklets / reanimated needed)
  const heartScale = useRef(new Animated.Value(1)).current;

  const bounceHeart = () => {
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.5, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  };

  const handleLike = async () => {
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));
    bounceHeart();

    try {
      await toggleLike(post.id).unwrap();
    } catch {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleShare = async () => {
    await Share.share({ message: post.content });
  };

  const handleOptions = () => {
    onOptionsPress(post);
  };

  return (
    <View style={styles.card}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.avatarWrapper}>
          <Text style={styles.avatarText}>
            {post.author.username[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text style={styles.username}>@{post.author.username}</Text>
          <Text style={styles.timestamp}>{timeAgo(post.created_at)}</Text>
        </View>
        {currentUser?.id === post.author.id && (
          <TouchableOpacity 
            style={styles.moreBtn} 
            onPress={handleOptions}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <MoreHorizontal size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Divider */}
      <View style={styles.divider} />

      {/* Actions */}
      <View style={styles.actions}>
        {/* Like */}
        <Pressable style={styles.actionBtn} onPress={handleLike}>
          <Animated.View style={{ transform: [{ scale: heartScale }] }}>
            <Heart
              size={20}
              color={liked ? COLORS.like : COLORS.textSecondary}
              fill={liked ? COLORS.like : 'transparent'}
            />
          </Animated.View>
          <Text style={[styles.actionLabel, liked && styles.actionLabelActive]}>
            {likeCount}
          </Text>
        </Pressable>

        {/* Comment */}
        <Pressable style={styles.actionBtn} onPress={() => onCommentPress(post)}>
          <MessageCircle size={20} color={COLORS.textSecondary} />
          <Text style={styles.actionLabel}>{post.comments_count}</Text>
        </Pressable>

        {/* Share */}
        <Pressable style={styles.actionBtn} onPress={handleShare}>
          <Send size={20} color={COLORS.textSecondary} />
        </Pressable>
      </View>
    </View>
  );
};

const AVATAR_SIZE = rs(40);

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginHorizontal: SPACING.base,
    marginBottom: SPACING.md,
    padding: SPACING.base,
    ...SHADOW.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarWrapper: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  authorInfo: {
    flex: 1,
  },
  username: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.sm,
  },
  timestamp: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  moreBtn: {
    padding: SPACING.xs,
  },
  content: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.base,
    lineHeight: FONT_SIZE.base * 1.6,
    marginBottom: SPACING.md,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.divider,
    marginBottom: SPACING.sm,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.lg,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  actionLabel: {
    color: COLORS.textSecondary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
  shareIcon: {
    transform: [{ translateY: -1 }], // minor adjustment to center with line-height of text
  },
  actionLabelActive: {
    color: COLORS.like,
    fontFamily: FONTS.semiBold,
  },
});
