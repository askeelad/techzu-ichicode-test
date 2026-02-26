import React, { useCallback, useMemo, forwardRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import BottomSheet, { BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { Trash2, Edit2 } from 'lucide-react-native';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS } from '@constants/index';
import { Post } from '@store/api/postApi';
import { useDeletePostMutation } from '@store/api/postApi';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface PostOptionsSheetProps {
  post: Post | null;
  onClose: () => void;
  onEdit: (post: Post) => void;
}

export const PostOptionsSheet = forwardRef<BottomSheet, PostOptionsSheetProps>(
  ({ post, onClose, onEdit }, ref) => {
    const insets = useSafeAreaInsets();
    const [deletePost, { isLoading: isDeleting }] = useDeletePostMutation();

    // The snap points for the bottom sheet (only need a small menu size)
    const snapPoints = useMemo(() => ['25%'], []);

    const renderBackdrop = useCallback(
      (props: any) => (
        <BottomSheetBackdrop
          {...props}
          disappearsOnIndex={-1}
          appearsOnIndex={0}
          opacity={0.4}
          onPress={onClose}
        />
      ),
      [onClose]
    );

    const handleEdit = () => {
      if (post) {
        onClose();
        onEdit(post);
      }
    };

    const handleDelete = () => {
      if (!post) return;
      Alert.alert('Delete Post', 'Are you sure you want to delete this post?', [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePost(post.id).unwrap();
              onClose();
            } catch (error) {
              console.error('Failed to delete post', error);
            }
          },
        },
      ]);
    };

    if (!post) return null;

    return (
      <BottomSheet
        ref={ref}
        index={-1}
        snapPoints={snapPoints}
        enablePanDownToClose
        onClose={onClose}
        backdropComponent={renderBackdrop}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
      >
        <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, SPACING.lg) }]}>
          <View style={styles.header}>
            <Text style={styles.title}>Post Options</Text>
          </View>

          <View style={styles.optionsList}>
            <TouchableOpacity style={styles.optionBtn} onPress={handleEdit} disabled={isDeleting}>
              <View style={styles.iconContainer}>
                <Edit2 size={24} color={COLORS.textPrimary} />
              </View>
              <Text style={styles.optionText}>Edit</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.optionBtn} onPress={handleDelete} disabled={isDeleting}>
              <View style={[styles.iconContainer, styles.destructiveIconContainer]}>
                <Trash2 size={24} color={COLORS.error} />
              </View>
              <Text style={[styles.optionText, styles.destructiveText]}>Delete</Text>
            </TouchableOpacity>
          </View>
        </View>
      </BottomSheet>
    );
  }
);

PostOptionsSheet.displayName = 'PostOptionsSheet';

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  handleIndicator: {
    backgroundColor: COLORS.border,
    width: 40,
  },
  container: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  optionsList: {
    gap: SPACING.sm,
  },
  optionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.md,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  destructiveIconContainer: {
    backgroundColor: COLORS.error + '15', // 15% opacity red background
  },
  optionText: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
    color: COLORS.textPrimary,
  },
  destructiveText: {
    color: COLORS.error,
  },
});
