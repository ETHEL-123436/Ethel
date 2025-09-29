import { useAuth } from '@/providers/auth-provider';
import { useTheme } from '@/providers/theme-provider';
import { Stack, router } from 'expo-router';
import { ChevronRight, Settings } from 'lucide-react-native';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PreferencesScreen() {
  const { settings, colors, isLoading, t } = useTheme();
  const { user } = useAuth();

  const currentTheme = settings?.theme || 'light';
  const currentLanguage = settings?.language || 'en';

  const getThemeDisplayName = () => {
    switch (currentTheme) {
      case 'light': return 'Light';
      case 'dark': return 'Dark';
      case 'auto': return 'Auto';
      default: return 'Light';
    }
  };

  const getLanguageDisplayName = () => {
    switch (currentLanguage) {
      case 'en': return 'English';
      case 'es': return 'Español';
      case 'fr': return 'Français';
      case 'de': return 'Deutsch';
      case 'pt': return 'Português';
      default: return 'English';
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ title: t('preferences') }} />

      {isLoading ? (
        <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
          <Text style={{ color: colors.text }}>{t('loading')}...</Text>
        </View>
      ) : (
        <>
          <View style={[styles.header, { backgroundColor: colors.surface }]}>
            <Settings size={24} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>{t('preferences')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('customizeApp')}</Text>
          </View>

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('appSettings')}</Text>

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => router.push('/(settings)/theme-selection')}
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('theme')}</Text>
                <View style={styles.menuItemRight}>
                  <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{getThemeDisplayName()}</Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => router.push('/(settings)/language-selection')}
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('language')}</Text>
                <View style={styles.menuItemRight}>
                  <Text style={[styles.menuValue, { color: colors.textSecondary }]}>{getLanguageDisplayName()}</Text>
                  <ChevronRight size={20} color={colors.textSecondary} />
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => router.push('/(settings)/notifications')}
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('notifications')}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Passenger-specific preferences */}
          {user?.role === 'passenger' && (
            <View style={[styles.section, { backgroundColor: colors.surface }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('ridePreferences')}</Text>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('preferredVehicleType')}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('paymentMethods')}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('rideHistory')}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
          )}

          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('account')}</Text>

            <TouchableOpacity
              style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}
              onPress={() => router.push('/(settings)/privacy')}
            >
              <View style={styles.menuItemContent}>
                <Text style={[styles.menuText, { color: colors.text }]}>{t('privacySettings')}</Text>
                <ChevronRight size={20} color={colors.textSecondary} />
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.menuItem, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
              <Text style={[styles.menuText, { color: colors.text }]}>{t('dataStorage')}</Text>
              <ChevronRight size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
