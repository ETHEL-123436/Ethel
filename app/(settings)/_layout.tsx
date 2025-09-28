import { Stack } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';

export default function SettingsLayout() {
  const { user } = useAuth();
  const isDriver = user?.role === 'driver';

  return (
    <Stack screenOptions={{
      headerShown: false,
      animation: 'slide_from_right',
    }}>
      <Stack.Screen name="theme-selection" options={{ title: 'Theme Selection' }} />
      <Stack.Screen name="language-selection" options={{ title: 'Language Selection' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="privacy" options={{ title: 'Privacy' }} />
      <Stack.Screen name="kyc-upload" options={{ title: 'KYC Verification' }} />
      <Stack.Screen name="become-driver" options={{ title: 'Become a Driver' }} />
      <Stack.Screen name="help" options={{ title: 'Help & Support' }} />
      {isDriver && (
        <Stack.Screen name="driver-settings" options={{ title: 'Driver Settings' }} />
      )}
    </Stack>
  );
}
