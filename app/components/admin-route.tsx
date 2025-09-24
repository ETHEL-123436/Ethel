import { Redirect } from 'expo-router';
import { useAuth } from '@/providers/auth-provider';
import { ActivityIndicator, View } from 'react-native';

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  if (!user || user.role !== 'admin') {
    // Redirect to home if user is not an admin
    return <Redirect href="/(tabs)/home" />;
  }

  return <>{children}</>;
}

export default AdminRoute;
