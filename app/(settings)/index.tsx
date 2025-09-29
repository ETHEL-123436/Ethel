import { Stack } from 'expo-router';
import { View, Text } from 'react-native';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsLayout() {
  const { user } = useAuth();

  if (!user) {
    return null; // or return a loading screen
  }

  const isDriver = user?.role === 'driver';

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
      <Stack.Screen name="index" options={{ title: 'Settings' }} />
      <Stack.Screen name="profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="preferences" options={{ title: 'Preferences' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      {isDriver && (
        <Stack.Screen name="driver-settings" options={{ title: 'Driver Settings' }} />
      )}
    </Stack>
  );
}
