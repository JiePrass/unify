import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/contexts/auth-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { Redirect, Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarButton: HapticTab,

        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.tabIconDefault,

        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },

        tabBarStyle: {
          height: 88,
          paddingBottom: 8,
          paddingTop: 8,
          borderRadius: 24,

          backgroundColor: colors.card,
          position: 'absolute',

          elevation: colorScheme === 'dark' ? 10 : 6,
          shadowColor: '#000',
          shadowOpacity: colorScheme === 'dark' ? 0.35 : 0.15,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 4 },
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Beranda',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="help"
        options={{
          title: 'Bantu',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'hand-left' : 'hand-left-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="missions"
        options={{
          title: 'Misi',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'clipboard' : 'clipboard-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
