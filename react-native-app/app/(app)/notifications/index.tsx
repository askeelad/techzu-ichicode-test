import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGetNotificationsQuery, useMarkAsReadMutation, Notification } from '@store/api/notificationApi';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS } from '@constants/index';
import { rs } from '@utils/responsive';
import { useRouter } from 'expo-router';

export default function NotificationsScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { data, isFetching, isLoading, refetch } = useGetNotificationsQuery({ page, limit: 20 });
  const [markAsRead] = useMarkAsReadMutation();

  useEffect(() => {
    // Optimistically mark all as read whenever notifications screen is opened
    markAsRead().catch(() => {});
  }, [markAsRead]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(() => {
    if (data && page < (data.meta?.totalPages || 1) && !isFetching) {
      setPage((p) => p + 1);
    }
  }, [data, page, isFetching]);

  const notifications = data?.data ?? [];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>←</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 60 }} />
      </View>

      {isLoading ? (
        <View style={styles.centered}>
          <ActivityIndicator color={COLORS.primary} size="large" />
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: Notification) => item.id}
          renderItem={({ item }: { item: Notification }) => (
            <View style={[styles.item, !item.is_read && styles.itemUnread]}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.actor.username[0].toUpperCase()}</Text>
              </View>
              <View style={styles.itemBody}>
                <Text style={styles.itemText}>
                  <Text style={styles.bold}>@{item.actor.username}</Text>
                  {item.type === 'like' ? ' liked your post' : ' commented on your post'}
                </Text>
                <Text style={styles.itemTime}>
                  {new Date(item.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          )}
          contentContainerStyle={styles.listContent}
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
              <ActivityIndicator color={COLORS.primary} style={{ margin: SPACING.md }} />
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.centered}>
              <Text style={styles.emptyText}>No notifications yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const AVATAR = rs(40);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
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
    fontSize: FONT_SIZE.lg,
  },
  backBtn: {
    width: 60,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  backBtnText: {
    color: COLORS.textPrimary,
    fontSize: FONT_SIZE.xxl,
  },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  listContent: { paddingBottom: SPACING.xxxl },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.base,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemUnread: {
    backgroundColor: COLORS.surface,
  },
  avatar: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  avatarText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZE.md,
  },
  itemBody: { flex: 1 },
  itemText: {
    color: COLORS.textPrimary,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
    lineHeight: FONT_SIZE.sm * 1.5,
  },
  bold: { fontFamily: FONTS.semiBold },
  itemTime: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.xs,
    marginTop: 4,
  },
  emptyText: {
    color: COLORS.textMuted,
    fontFamily: FONTS.regular,
    fontSize: FONT_SIZE.sm,
  },
});
