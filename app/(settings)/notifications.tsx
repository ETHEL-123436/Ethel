import { View, Text, StyleSheet, Switch, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useState } from 'react';
import { ArrowLeft, Bell, BellOff, MessageSquare, Phone } from 'lucide-react-native';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native-gesture-handler';

type NotificationSetting = {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  value: boolean;
};

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'ride_updates',
      label: 'Ride Updates',
      description: 'Get notified about ride status and updates',
      icon: <Bell size={20} color="#4f46e5" />,
      value: true,
    },
    {
      id: 'messages',
      label: 'Messages',
      description: 'Get notified about new messages',
      icon: <MessageSquare size={20} color="#4f46e5" />,
      value: true,
    },
    {
      id: 'promotions',
      label: 'Promotions',
      description: 'Get notified about special offers and promotions',
      icon: <Bell size={20} color="#4f46e5" />,
      value: false,
    },
    {
      id: 'sound',
      label: 'Sound',
      description: 'Enable sound for notifications',
      icon: <Phone size={20} color="#4f46e5" />,
      value: true,
    },
  ]);

  const toggleSwitch = (id: string) => {
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
        <Text style={styles.headerTitle}>Notifications</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.scrollView}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Push Notifications</Text>
          <View style={styles.sectionContent}>
            {settings.map((setting) => (
              <View key={setting.id} style={styles.settingItem}>
                <View style={styles.settingIcon}>{setting.icon}</View>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>{setting.label}</Text>
                  <Text style={styles.settingDescription}>{setting.description}</Text>
                </View>
                <Switch
                  trackColor={{ false: '#d1d5db', true: '#c7d2fe' }}
                  thumbColor={setting.value ? '#4f46e5' : '#f3f4f6'}
                  onValueChange={() => toggleSwitch(setting.id)}
                  value={setting.value}
                />
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notification Preferences</Text>
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.preferenceItem}>
              <BellOff size={20} color="#4f46e5" />
              <Text style={styles.preferenceText}>Snooze Notifications</Text>
            </TouchableOpacity>
          </View>
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
  },
  section: {
    marginTop: 16,
  },
  sectionTitle: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  settingInfo: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderColor: '#f3f4f6',
  },
  preferenceText: {
    marginLeft: 16,
    fontSize: 16,
    color: '#111827',
  },
});
