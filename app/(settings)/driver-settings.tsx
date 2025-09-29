import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Car, Clock, CreditCard, MapPin, Settings as SettingsIcon, User, Palette, Globe } from 'lucide-react-native';
import { router } from 'expo-router';
import { Switch } from 'react-native-gesture-handler';
import { useTheme } from '@/providers/theme-provider';

type DriverSetting = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  value?: boolean;
  type: 'toggle' | 'navigation';
  route?: string;
};

export default function DriverSettingsScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const [settings, setSettings] = useState<DriverSetting[]>([
    {
      id: 'auto_accept',
      title: 'Auto-Accept Rides',
      description: 'Automatically accept ride requests',
      icon: <Clock size={20} color="#4f46e5" />,
      value: false,
      type: 'toggle',
    },
    {
      id: 'availability',
      title: 'Go Online',
      description: 'Make yourself available for ride requests',
      icon: <Car size={20} color="#4f46e5" />,
      value: true,
      type: 'toggle',
    },
    {
      id: 'navigation',
      title: 'Navigation App',
      description: 'Choose your preferred navigation app',
      icon: <MapPin size={20} color="#4f46e5" />,
      type: 'navigation',
      route: '/(settings)/navigation-preferences',
    },
    {
      id: 'payment',
      title: 'Payment Settings',
      description: 'Manage your payment methods and preferences',
      icon: <CreditCard size={20} color="#4f46e5" />,
      type: 'navigation',
      route: '/payment-methods',
    },
    {
      id: 'driver_profile',
      title: 'Driver Profile',
      description: 'Update your driver information and documents',
      icon: <User size={20} color="#4f46e5" />,
      type: 'navigation',
      route: '/(settings)/driver-profile',
    },
    {
      id: 'theme',
      title: 'Theme',
      description: 'Choose your preferred app theme',
      icon: <Palette size={20} color="#4f46e5" />,
      type: 'navigation',
      route: '/(settings)/theme-selection',
    },
    {
      id: 'language',
      title: 'Language',
      description: 'Select your preferred language',
      icon: <Globe size={20} color="#4f46e5" />,
      type: 'navigation',
      route: '/(settings)/language-selection',
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id && setting.type === 'toggle'
          ? { ...setting, value: !setting.value }
          : setting
      )
    );
    // TODO: Save to backend
  };

  const handleSettingPress = (setting: DriverSetting) => {
    if (setting.type === 'navigation' && setting.route) {
      router.push(setting.route as any);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.surface }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Driver Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={[styles.scrollView, { backgroundColor: colors.background }]}>
        <View style={styles.statusCard}>
          <View style={styles.statusIcon}>
            <Car size={24} color="#ffffff" />
          </View>
          <View style={styles.statusContent}>
            <Text style={[styles.statusTitle, { color: '#ffffff' }]}>Driver Mode</Text>
            <Text style={[styles.statusSubtitle, { color: 'rgba(255, 255, 255, 0.9)' }]}>
              {settings.find(s => s.id === 'availability')?.value
                ? 'You are currently online and receiving ride requests'
                : 'You are currently offline and not receiving ride requests'}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Driver Preferences</Text>
          <View style={[styles.settingsList, { backgroundColor: colors.surface }]}>
            {settings.map((setting) => (
              <TouchableOpacity
                key={setting.id}
                style={[styles.settingItem, { borderBottomColor: colors.border }]}
                onPress={() => handleSettingPress(setting)}
                activeOpacity={0.7}
              >
                <View style={styles.settingIcon}>{setting.icon}</View>
                <View style={styles.settingInfo}>
                  <Text style={[styles.settingTitle, { color: colors.text }]}>{setting.title}</Text>
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{setting.description}</Text>
                </View>
                {setting.type === 'toggle' ? (
                  <Switch
                    trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                    thumbColor={setting.value ? '#4f46e5' : '#f3f4f6'}
                    onValueChange={() => toggleSetting(setting.id)}
                    value={setting.value}
                  />
                ) : (
                  <ArrowLeft size={20} color={colors.textSecondary} style={{ transform: [{ rotate: '180deg' }] }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.footer, { backgroundColor: colors.surface }]}>
          <SettingsIcon size={20} color={colors.textSecondary} />
          <Text style={[styles.footerText, { color: colors.textSecondary }]}>
            These settings help customize your driving experience and preferences.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  statusCard: {
    flexDirection: 'row',
    backgroundColor: '#4f46e5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusContent: {
    flex: 1,
  },
  statusTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  statusSubtitle: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    lineHeight: 18,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  settingsList: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingInfo: {
    flex: 1,
    marginRight: 12,
  },
  settingTitle: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  footerText: {
    flex: 1,
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    marginLeft: 12,
  },
});
