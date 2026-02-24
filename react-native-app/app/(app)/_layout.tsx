import { Tabs } from 'expo-router';
import { Text } from 'react-native';
import { COLORS, FONTS, FONT_SIZE } from '../../src/constants';

const TabIcon = ({ emoji, focused }: { emoji: string; focused: boolean }) => (
  <Text style={{ fontSize: FONT_SIZE.xxl, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>
);

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: COLORS.backgroundSecondary,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          height: 70,
          paddingHorizontal: 8,
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarLabelStyle: {
          fontFamily: FONTS.semiBold,
          fontSize: FONT_SIZE.sm,
        },
      }}
    >
      <Tabs.Screen
        name="feed/index"
        options={{
          title: 'Feed',
          tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon emoji="👤" focused={focused} />,
        }}
      />
      {/* Hide the notifications screen from the tab bar */}
      <Tabs.Screen
        name="notifications/index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
