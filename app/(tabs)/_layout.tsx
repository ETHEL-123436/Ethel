import { Tabs } from "expo-router";
import { Home, Search, MessageCircle, User, Car, Plus } from "lucide-react-native";
import React from "react";
import { useAuth } from "@/providers/auth-provider";
import { useTheme } from "@/providers/theme-provider";

export default function TabLayout() {
  const { user } = useAuth();
  const { colors, t } = useTheme();
  const isDriver = user?.role === 'driver';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />

      {isDriver ? (
        <Tabs.Screen
          name="rides"
          options={{
            title: t('totalRides'),
            tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
          }}
        />
      ) : (
        <Tabs.Screen
          name="search"
          options={{
            title: t('search'),
            tabBarIcon: ({ color, size }) => <Search color={color} size={size} />,
          }}
        />
      )}

      <Tabs.Screen
        name="bookings"
        options={{
          title: t('bookings'),
          tabBarIcon: ({ color, size }) => <Plus color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="messages"
        options={{
          title: t('messages'),
          tabBarIcon: ({ color, size }) => <MessageCircle color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}