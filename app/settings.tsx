import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  User,
  Bell,
  Shield,
  Settings as SettingsIcon,
  HelpCircle,
  Info,
  Package,
  ChevronRight
} from 'lucide-react-native';
import { router } from 'expo-router';

const TabButton = ({ title, icon: Icon, isActive, onPress, badge }: {
  title: string;
  icon: any;
  isActive: boolean;
  onPress: () => void;
  badge?: number;
}) => (
  <TouchableOpacity
    style={[styles.tabButton, isActive && styles.activeTab]}
    onPress={onPress}
  >
    <View style={styles.tabContent}>
      <View style={styles.tabIconContainer}>
        <Icon size={20} color={isActive ? '#ffffff' : '#667eea'} />
      </View>
      <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
      {badge && badge > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <ChevronRight size={16} color={isActive ? '#ffffff' : '#9ca3af'} />
    </View>
  </TouchableOpacity>
);

export default function Settings() {
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<string>('profile');

  const tabs = [
    {
      id: 'profile',
      title: 'Profile',
      icon: User,
      route: '/(settings)/profile',
    },
    {
      id: 'notifications',
      title: 'Notifications',
      icon: Bell,
      route: '/(settings)/notifications',
    },
    {
      id: 'privacy',
      title: 'Privacy',
      icon: Shield,
      route: '/(settings)/privacy',
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: SettingsIcon,
      route: '/(settings)/preferences',
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      route: '/(settings)/help',
    },
    {
      id: 'about',
      title: 'About',
      icon: Info,
      route: '/(settings)/kyc-upload', // Using KYC upload as about page for now
    },
  ];

  const handleTabPress = (tabId: string, route: string) => {
    setActiveTab(tabId);
    router.push(route as any);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage your account and preferences</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              title={tab.title}
              icon={tab.icon}
              isActive={activeTab === tab.id}
              onPress={() => handleTabPress(tab.id, tab.route)}
            />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(settings)/lost-item-complaint')}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Report Lost Item</Text>
              <Text style={styles.actionDescription}>Report items lost during rides</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/payment-methods')}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>Payment Methods</Text>
              <Text style={styles.actionDescription}>Manage your mobile money accounts</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionItem}
            onPress={() => router.push('/(settings)/kyc-upload')}
          >
            <View style={styles.actionInfo}>
              <Text style={styles.actionLabel}>KYC Verification</Text>
              <Text style={styles.actionDescription}>Verify your identity</Text>
            </View>
            <ChevronRight size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
  },
  tabsContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  tabButton: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activeTab: {
    backgroundColor: '#667eea',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  tabIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tabText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  activeTabText: {
    color: '#ffffff',
  },
  badge: {
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  quickActions: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionInfo: {
    flex: 1,
  },
  actionLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  actionDescription: {
    fontSize: 14,
    color: '#666',
  },
});