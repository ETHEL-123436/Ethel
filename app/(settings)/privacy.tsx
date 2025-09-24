import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Lock, Eye, MapPin, Shield, User } from 'lucide-react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

type PrivacySetting = {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
};

export default function PrivacyScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<PrivacySetting[]>([
    {
      id: 'location',
      title: 'Location Services',
      description: 'Allow access to your location for better ride experience',
      icon: <MapPin size={20} color="#4f46e5" />,
      value: true,
    },
    {
      id: 'profile_visibility',
      title: 'Profile Visibility',
      description: 'Make your profile visible to drivers/passengers',
      icon: <User size={20} color="#4f46e5" />,
      value: true,
    },
    {
      id: 'activity_status',
      title: 'Activity Status',
      description: 'Show when you\'re active on the app',
      icon: <Eye size={20} color="#4f46e5" />,
      value: false,
    },
  ]);

  const toggleSetting = (id: string) => {
    setSettings(prevSettings =>
      prevSettings.map(setting =>
        setting.id === id ? { ...setting, value: !setting.value } : setting
      )
    );
    // TODO: Save to backend
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Shield size={20} color="#4f46e5" />
            <Text style={styles.sectionTitle}>Privacy Settings</Text>
          </View>
          
          <View style={styles.settingsList}>
            {settings.map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingIcon}>{setting.icon}</View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                  thumbColor={setting.value ? '#4f46e5' : '#f3f4f6'}
                  onValueChange={() => toggleSetting(setting.id)}
                  value={setting.value}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { paddingHorizontal: 0 }]}>
            Data & Permissions
          </Text>
          <View style={styles.card}>
            <View style={styles.cardIcon}>
              <Lock size={24} color="#4f46e5" />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitle}>Data Privacy</Text>
              <Text style={styles.cardDescription}>
                Learn how we collect, use, and protect your data
              </Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.cardLink}>View</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Your privacy is important to us. We use your data to provide and improve our services.
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginLeft: 8,
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
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 2,
  },
  cardDescription: {
    fontSize: 13,
    color: '#6b7280',
  },
  cardLink: {
    color: '#4f46e5',
    fontWeight: '500',
    marginLeft: 8,
  },
  footer: {
    marginTop: 8,
    padding: 16,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 20,
    textAlign: 'center',
  },
});
