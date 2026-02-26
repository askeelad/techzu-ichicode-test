import { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Slot, Stack, router, useSegments } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Provider } from 'react-redux';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { store, useAppDispatch, useAppSelector, setCredentials, RootState } from '@store/index';
import { storage } from '@utils/storage';
import { registerForPushNotificationsAsync } from '@utils/fcm';
import { useUpdateFcmTokenMutation } from '@store/api/authApi';
import { notificationApi } from '@store/api/notificationApi';
import { COLORS } from '@constants/index';

// ─── Inner App containing Auth Guard ──────────────────────────────────────────
function AuthGuard() {
  const segments = useSegments();
  const dispatch = useAppDispatch();
  const isAuthenticated = useAppSelector((state: RootState) => state.auth.isAuthenticated);
  const [isReady, setIsReady] = useState(false);

  // Hydrate auth from SecureStore on startup
  useEffect(() => {
    async function hydrateAuth() {
      try {
        const [accessToken, refreshToken, user] = await Promise.all([
          storage.getAccessToken(),
          storage.getRefreshToken(),
          storage.getUser(),
        ]);

        if (accessToken && refreshToken && user) {
          dispatch(
            setCredentials({
              user: user as any,
              accessToken,
              refreshToken,
            })
          );
        }
      } catch (e) {
        // Ignore read errors
      } finally {
        setIsReady(true);
      }
    }
    void hydrateAuth();
  }, [dispatch]);

  // Request FCM token and register with API if authenticated
  const [updateFcm] = useUpdateFcmTokenMutation();
  useEffect(() => {
    if (isAuthenticated) {
      registerForPushNotificationsAsync().then((token) => {
        if (token) {
          updateFcm({ fcmToken: token }).catch(() => {
            // Silently ignore if it fails to update
          });
        }
      });

      // Listen for foreground push notifications to instantly refetch the notifications list
      const subscription = Notifications.addNotificationReceivedListener((notification) => {
        // Invalidate the 'Notifications' tag in RTK Query to force an instant refetch
        // This makes the red dot and notification list update "live" without polling delay
        dispatch(notificationApi.util.invalidateTags(['Notifications']));
      });

      return () => {
        subscription.remove();
      };
    }
  }, [isAuthenticated, updateFcm]);

  // Auth routing logic
  useEffect(() => {
    if (!isReady) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to app
      router.replace('/(app)/feed');
    }
  }, [isAuthenticated, isReady, segments]);

  if (!isReady) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(app)" />
    </Stack>
  );
}

// ─── Root Provider Wrapper ────────────────────────────────────────────────────
export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <View style={styles.container}>
          <StatusBar style="light" />
          <AuthGuard />
        </View>
      </Provider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
