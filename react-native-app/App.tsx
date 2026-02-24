import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Text, View, ActivityIndicator } from 'react-native';
import { Provider } from 'react-redux';
import {
  useFonts,
  Inter_400Regular,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { store } from './src/store';
import { COLORS } from './src/constants';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <Provider store={store}>
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <StatusBar style="light" />
        <Text style={{ color: COLORS.textPrimary, fontFamily: 'Inter_600SemiBold', fontSize: 24 }}>
          SocialFeed 🚀
        </Text>
        <Text style={{ color: COLORS.textSecondary, fontFamily: 'Inter_400Regular', marginTop: 8 }}>
          RTK Query setup complete
        </Text>
      </View>
    </Provider>
  );
}
