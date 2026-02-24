import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useAppDispatch, useAppSelector, logout } from '@store/index';
import { storage } from '@utils/storage';
import { COLORS, FONTS, FONT_SIZE, SPACING, RADIUS } from '@constants/index';
import { rs } from '@utils/responsive';

export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = async () => {
    await storage.clearTokens();
    dispatch(logout());
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <Text style={styles.avatarText}>
            {user?.username[0]?.toUpperCase() ?? '?'}
          </Text>
        </View>

        <Text style={styles.username}>@{user?.username ?? '—'}</Text>
        <Text style={styles.email}>{user?.email ?? '—'}</Text>

        <View style={styles.divider} />

        <Pressable style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const AVATAR = rs(80);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scroll: { alignItems: 'center', padding: SPACING.xl, paddingTop: SPACING.xxxl },
  avatarWrap: {
    width: AVATAR,
    height: AVATAR,
    borderRadius: AVATAR / 2,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: { color: COLORS.white, fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xxl },
  username: { color: COLORS.textPrimary, fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.xl },
  email: { color: COLORS.textSecondary, fontFamily: FONTS.regular, fontSize: FONT_SIZE.sm, marginTop: 4 },
  divider: { width: '100%', height: 1, backgroundColor: COLORS.divider, marginVertical: SPACING.xxxl },
  logoutBtn: {
    width: '100%',
    height: 52,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: { color: COLORS.error, fontFamily: FONTS.semiBold, fontSize: FONT_SIZE.md },
});
