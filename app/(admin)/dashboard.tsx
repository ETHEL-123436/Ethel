import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Users, Car, CreditCard, TrendingUp, AlertTriangle, MapPin, ArrowRight } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';
import { useTheme } from '@/providers/theme-provider';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { stats } = useAdmin();
  const { colors, t } = useTheme();
  const router = useRouter();
  const styles = createStyles(colors);

  const recentActivity = [
    { id: '1', message: 'New user registration: John Doe', time: '2 minutes ago', color: '#4CAF50' },
    { id: '2', message: 'Payment processed: 15,000 XAF', time: '5 minutes ago', color: '#2196F3' },
    { id: '3', message: 'Dispute opened: Ride #1234', time: '10 minutes ago', color: '#f44336' },
    { id: '4', message: 'KYC document approved', time: '15 minutes ago', color: '#4CAF50' },
  ];

  const [selectedPeriod, setSelectedPeriod] = useState<'today' | 'week' | 'month'>('today');

  const periods = [
    { key: 'today' as const, label: 'Today' },
    { key: 'week' as const, label: 'This Week' },
    { key: 'month' as const, label: 'This Month' },
  ];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20, backgroundColor: colors.surface }]}>
        <Text style={[styles.title, { color: colors.text }]}>{t('adminDashboard')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('managePlatform')}</Text>
      </View>

      {/* Period Selector */}
      <View style={[styles.periodSelector, { backgroundColor: colors.surface }]}>
        {periods.map((period) => (
          <TouchableOpacity
            key={period.key}
            style={[
              styles.periodButton,
              { backgroundColor: colors.surface, borderColor: colors.border },
              selectedPeriod === period.key && [styles.periodButtonActive, { backgroundColor: colors.primary, borderColor: colors.primary }]
            ]}
            onPress={() => setSelectedPeriod(period.key)}
          >
            <Text style={[
              styles.periodButtonText,
              { color: colors.textSecondary },
              selectedPeriod === period.key && [styles.periodButtonTextActive, { color: '#fff' }]
            ]}>
              {t(period.key === 'today' ? 'today' : period.key === 'week' ? 'thisWeek' : 'thisMonth')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <LinearGradient
          colors={['#667eea', '#764ba2']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statIcon}>
            <Users size={24} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: '#fff' }]}>{stats?.totalUsers?.toLocaleString() || '0'}</Text>
          <Text style={[styles.statLabel, { color: '#e0e0e0' }]}>Total Users</Text>
          <View style={styles.statChange}>
            <TrendingUp size={12} color="#fff" />
            <Text style={[styles.statChangeText, { color: '#fff' }]}>+12%</Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#f093fb', '#f5576c']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statIcon}>
            <Car size={24} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: '#fff' }]}>{stats?.totalRides?.toLocaleString() || '0'}</Text>
          <Text style={[styles.statLabel, { color: '#e0e0e0' }]}>Total Rides</Text>
          <View style={styles.statChange}>
            <TrendingUp size={12} color="#fff" />
            <Text style={[styles.statChangeText, { color: '#fff' }]}>+8%</Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#4facfe', '#00f2fe']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statIcon}>
            <CreditCard size={24} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: '#fff' }]}>{stats?.totalRevenue?.toLocaleString() || '0'} XAF</Text>
          <Text style={[styles.statLabel, { color: '#e0e0e0' }]}>Total Revenue</Text>
          <View style={styles.statChange}>
            <TrendingUp size={12} color="#fff" />
            <Text style={[styles.statChangeText, { color: '#fff' }]}>+15%</Text>
          </View>
        </LinearGradient>

        <LinearGradient
          colors={['#ff9a9e', '#fecfef']}
          style={styles.statCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.statIcon}>
            <AlertTriangle size={24} color="#fff" />
          </View>
          <Text style={[styles.statValue, { color: '#fff' }]}>{stats?.openDisputes || 0}</Text>
          <Text style={[styles.statLabel, { color: '#e0e0e0' }]}>Active Disputes</Text>
          <View style={styles.statChange}>
            <Text style={[styles.statChangeText, { color: '#fff' }]}>Needs attention</Text>
          </View>
        </LinearGradient>
      </View>

      {/* User Management Section - Prominent placement */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>👥 {t('userManagement')}</Text>
        <TouchableOpacity
          style={[styles.userManagementCard, { backgroundColor: colors.surface, borderLeftColor: colors.primary }]}
          onPress={() => router.push('/users')}
        >
          <View style={styles.userManagementContent}>
            <View style={styles.userManagementLeft}>
              <Users size={32} color={colors.primary} />
              <View>
                <Text style={[styles.userManagementTitle, { color: colors.text }]}>{t('viewAllUsers')}</Text>
                <Text style={[styles.userManagementSubtitle, { color: colors.textSecondary }]}>
                  {stats?.totalUsers?.toLocaleString() || '0'} {t('registeredUsers')}
                </Text>
              </View>
            </View>
            <ArrowRight size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>
      </View>

      {/* Live Map Preview */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('liveRidesMap')}</Text>
        <View style={[styles.mapPreview, { backgroundColor: colors.surface }]}>
          <MapPin size={32} color={colors.primary} />
          <Text style={[styles.mapText, { color: colors.text }]}>{t('interactiveMap')}</Text>
          <Text style={[styles.mapSubtext, { color: colors.textSecondary }]}>{stats?.activeRides || 0} {t('ridesCurrentlyActive')}</Text>
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('recentActivity')}</Text>
        {recentActivity.map((activity) => (
          <View key={activity.id} style={styles.activityItem}>
            <View style={[styles.activityDot, { backgroundColor: activity.color }]} />
            <View style={styles.activityContent}>
              <Text style={styles.activityText}>{activity.message}</Text>
              <Text style={styles.activityTime}>{activity.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity onPress={() => router.push('/users')}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.quickAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <Users size={20} color="#fff" />
              <Text style={[styles.quickActionText, { color: '#fff' }]}>{t('manageUsers')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity>
            <LinearGradient
              colors={[colors.secondary, colors.primary]}
              style={styles.quickAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <AlertTriangle size={20} color="#fff" />
              <Text style={[styles.quickActionText, { color: '#fff' }]}>{t('reviewDisputes')}</Text>
            </LinearGradient>
          </TouchableOpacity>
          <TouchableOpacity>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              style={styles.quickAction}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <CreditCard size={20} color="#fff" />
              <Text style={[styles.quickActionText, { color: '#fff' }]}>{t('processRefunds')}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Create dynamic styles function
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  periodSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    backgroundColor: colors.surface,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  periodButtonActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  periodButtonText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  periodButtonTextActive: {
    color: 'white',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 24,
    gap: 12,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#e0e0e0',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statChangeText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '500',
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 16,
  },
  userManagementCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 20,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  userManagementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  userManagementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userManagementTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 4,
  },
  userManagementSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  mapPreview: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  mapText: {
    fontSize: 16,
    color: colors.text,
    marginTop: 12,
    textAlign: 'center',
  },
  mapSubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: colors.surface,
    marginBottom: 8,
    borderRadius: 8,
    gap: 12,
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: colors.text,
    marginBottom: 2,
  },
  activityTime: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  quickActionText: {
    fontSize: 12,
    color: '#fff',
    textAlign: 'center',
    fontWeight: '500',
  },
});
