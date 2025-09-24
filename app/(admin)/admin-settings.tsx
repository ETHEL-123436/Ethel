import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Settings, Bell, Shield, Database, Users, LogOut } from 'lucide-react-native';
import { router } from 'expo-router';

export default function AdminSettings() {
  const insets = useSafeAreaInsets();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState<boolean>(true);
  const [autoApproveKYC, setAutoApproveKYC] = React.useState<boolean>(false);
  const [maintenanceMode, setMaintenanceMode] = React.useState<boolean>(false);

  const handleLogout = () => {
    router.replace('/');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Admin Settings</Text>
        <Text style={styles.subtitle}>Configure platform settings</Text>
      </View>

      {/* Platform Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Settings</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Bell size={20} color="#667eea" />
          <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>Enable system notifications</Text>
            </View>
          </View>
          <Switch
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            trackColor={{ false: '#e0e0e0', true: '#667eea' }}
            thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Shield size={20} color="#667eea" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Auto-approve KYC</Text>
              <Text style={styles.settingDescription}>Automatically approve basic KYC documents</Text>
            </View>
          </View>
          <Switch
            value={autoApproveKYC}
            onValueChange={setAutoApproveKYC}
            trackColor={{ false: '#e0e0e0', true: '#667eea' }}
            thumbColor={autoApproveKYC ? '#ffffff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Settings size={20} color="#667eea" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Maintenance Mode</Text>
              <Text style={styles.settingDescription}>Temporarily disable new bookings</Text>
            </View>
          </View>
          <Switch
            value={maintenanceMode}
            onValueChange={setMaintenanceMode}
            trackColor={{ false: '#e0e0e0', true: '#f44336' }}
            thumbColor={maintenanceMode ? '#ffffff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* System Management */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>System Management</Text>
        
        <TouchableOpacity style={styles.menuItem}>
          <Database size={20} color="#667eea" />
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>Database Backup</Text>
            <Text style={styles.menuDescription}>Create system backup</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Users size={20} color="#667eea" />
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>User Analytics</Text>
            <Text style={styles.menuDescription}>View detailed user statistics</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <Settings size={20} color="#667eea" />
          <View style={styles.menuText}>
            <Text style={styles.menuLabel}>System Logs</Text>
            <Text style={styles.menuDescription}>View application logs</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Platform Statistics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Platform Statistics</Text>
        
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>99.9%</Text>
            <Text style={styles.statLabel}>Uptime</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>2.3s</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>1.2GB</Text>
            <Text style={styles.statLabel}>Storage Used</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>45</Text>
            <Text style={styles.statLabel}>Active Sessions</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionText}>Export Data</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionText}>Send Broadcast</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <Text style={styles.quickActionText}>Clear Cache</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={[styles.menuItem, styles.logoutItem]}
          onPress={handleLogout}
        >
          <LogOut size={20} color="#f44336" />
          <View style={styles.menuText}>
            <Text style={[styles.menuLabel, styles.logoutText]}>Logout from Admin</Text>
            <Text style={styles.menuDescription}>Return to main app</Text>
          </View>
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
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  settingText: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  menuText: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 2,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },
  quickAction: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  quickActionText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
    textAlign: 'center',
  },
  logoutItem: {
    borderColor: '#ffebee',
    borderWidth: 1,
  },
  logoutText: {
    color: '#f44336',
  },
});