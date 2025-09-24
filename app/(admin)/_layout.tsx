import { Tabs } from "expo-router";
import { Users, Car, CreditCard, MessageSquare, BarChart3, Settings } from "lucide-react-native";
import React from "react";
import { AdminRoute } from "@/app/components/admin-route";

export default function AdminTabLayout() {
  return (
    <AdminRoute>
      <AdminTabs />
    </AdminRoute>
  );
}

function AdminTabs() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#dc2626',
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color, size }) => <BarChart3 color={color} size={size} />,
        }}
      />
      
      <Tabs.Screen
        name="users"
        options={{
          title: "Users",
          tabBarIcon: ({ color, size }) => <Users color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="rides"
        options={{
          title: "Rides",
          tabBarIcon: ({ color, size }) => <Car color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="payments"
        options={{
          title: "Payments",
          tabBarIcon: ({ color, size }) => <CreditCard color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="disputes"
        options={{
          title: "Disputes",
          tabBarIcon: ({ color, size }) => <MessageSquare color={color} size={size} />,
        }}
      />

      <Tabs.Screen
        name="admin-settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size }) => <Settings color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}