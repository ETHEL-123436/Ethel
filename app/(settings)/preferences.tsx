import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { Stack, router } from 'expo-router';
import { ChevronRight, Settings } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PreferencesScreen() {
  const { settings } = useTheme();
  const { user } = useAuth();

  const getThemeDisplayName = () => {
    switch (settings.theme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Auto';
      default: return 'Light';
    }
  };

  const getLanguageDisplayName = () => {
    switch (settings.language) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'pt': return 'Português';
      default: return 'English';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ title: 'Preferences' }} />

      <View style={styles.header}>
        <Settings size={24} color="#667eea" />
        <Text style={styles.title}>Preferences</Text>
        <Text style={styles.subtitle}>Customize your app experience</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>App Settings</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(settings)/theme-selection')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Theme</Text>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuValue}>{getThemeDisplayName()}</Text>
              <ChevronRight size={20} color="#999" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(settings)/language-selection')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Language</Text>
            <View style={styles.menuItemRight}>
              <Text style={styles.menuValue}>{getLanguageDisplayName()}</Text>
              <ChevronRight size={20} color="#999" />
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(settings)/notifications')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Notifications</Text>
            <ChevronRight size={20} color="#999" />
          </View>
        </TouchableOpacity>
      </View>

      {/* Passenger-specific preferences */}
      {user?.role === 'passenger' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ride Preferences</Text>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Preferred Vehicle Type</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Payment Methods</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuText}>Ride History</Text>
            <ChevronRight size={20} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push('/(settings)/privacy')}
        >
          <View style={styles.menuItemContent}>
            <Text style={styles.menuText}>Privacy Settings</Text>
            <ChevronRight size={20} color="#999" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Text style={styles.menuText}>Data & Storage</Text>
          <ChevronRight size={20} color="#999" />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    alignItems: 'center',
    backgroundColor: 'white',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  section: {
    backgroundColor: 'white',
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginVertical: 15,
  },
  menuItem: {
    paddingVertical: 15,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuText: {
    fontSize: 16,
    color: '#333',
  },
  menuValue: {
    fontSize: 14,
    color: '#666',
  },
});
