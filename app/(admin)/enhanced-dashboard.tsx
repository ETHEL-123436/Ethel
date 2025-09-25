import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator,
  RefreshControl,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Users, 
  Car, 
  CreditCard, 
  TrendingUp, 
  AlertTriangle, 
  Clock, 
  UserPlus, 
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart2,
  Shield,
  FileText,
  Activity as ActivityIcon
} from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '@/types/admin';
import { USER_ROLES, KYC_STATUS } from '@/config/constants';

// Stat Card Component
const StatCard = ({ 
  icon: Icon, 
  title, 
  value, 
  color,
  change,
  loading = false
}: { 
  icon: React.ComponentType<{ size: number; color: string }>; 
  title: string; 
  value: number | string; 
  color: string;
  change?: { value: number; isPositive: boolean };
  loading?: boolean;
}) => (
  <View style={[styles.statCard, { borderLeftColor: color }]}>
    <View style={[styles.statIconContainer, { backgroundColor: `${color}15` }]}>
      <Icon size={20} color={color} />
    </View>
    <View style={styles.statContent}>
      {loading ? (
        <ActivityIndicator size="small" color={color} style={styles.loadingIndicator} />
      ) : (
        <Text style={[styles.statValue, { color }]}>{value}</Text>
      )}
      <Text style={styles.statTitle}>{title}</Text>
      {change && !loading && (
        <View style={styles.statChange}>
          <TrendingUp 
            size={12} 
            color={change.isPositive ? '#4CAF50' : '#f44336'} 
            style={{ transform: [{ rotate: change.isPositive ? '0deg' : '180deg' }] }} 
          />
          <Text style={[
            styles.statChangeText, 
            { color: change.isPositive ? '#4CAF50' : '#f44336' }
          ]}>
            {Math.abs(change.value)}% {change.isPositive ? '↑' : '↓'}
          </Text>
        </View>
      )}
    </View>
  </View>
);

// Activity Item Component
const ActivityItem = ({ activity }: { activity: ActivityLog }) => {
  const getActivityIcon = () => {
    switch (activity.action) {
      case 'login':
      case 'logout':
        return <UserPlus size={16} color="#4CAF50" />;
      case 'ride_requested':
      case 'ride_accepted':
      case 'ride_completed':
        return <Car size={16} color="#2196F3" />;
      case 'payment_made':
        return <CreditCard size={16} color="#9C27B0" />;
      case 'document_uploaded':
        return <FileText size={16} color="#FF9800" />;
      case 'account_updated':
        return <Shield size={16} color="#607D8B" />;
      default:
        return <ActivityIcon size={16} color="#666" />;
    }
  };

  const getActionText = () => {
    const userName = activity.user?.name || 'A user';
    const actionMap: Record<string, string> = {
      'login': 'logged in',
      'logout': 'logged out',
      'ride_requested': 'requested a ride',
      'ride_accepted': 'accepted a ride',
      'ride_completed': 'completed a ride',
      'payment_made': 'made a payment',
      'document_uploaded': 'uploaded a document',
      'account_updated': 'updated their account'
    };

    return `${userName} ${actionMap[activity.action] || 'performed an action'}`;
  };

  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIcon}>
        {getActivityIcon()}
      </View>
      <View style={styles.activityContent}>
        <Text style={styles.activityText}>
          <Text style={{ fontWeight: '600' }}>{getActionText()}</Text>
          {activity.details?.rideId && ` (Ride #${activity.details.rideId})`}
          {activity.details?.amount && ` - ${activity.details.amount} XAF`}
        </Text>
        <View style={styles.activityMeta}>
          <Text style={styles.activityTime}>
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </Text>
          {activity.ipAddress && (
            <Text style={styles.activityUser}>• {activity.ipAddress}</Text>
          )}
        </View>
      </View>
      <View style={[
        styles.statusBadge,
        { 
          backgroundColor: activity.status === 'success' ? '#E8F5E9' : 
                         activity.status === 'failed' ? '#FFEBEE' : '#E3F2FD',
          borderColor: activity.status === 'success' ? '#4CAF50' : 
                      activity.status === 'failed' ? '#F44336' : '#2196F3'
        }
      ]}>
        <Text style={[
          styles.statusText,
          { 
            color: activity.status === 'success' ? '#4CAF50' : 
                  activity.status === 'failed' ? '#F44336' : '#2196F3'
          }
        ]}>
          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
        </Text>
      </View>
    </View>
  );
};

// Quick Action Button Component
const QuickAction = ({ 
  icon: Icon, 
  label, 
  color,
  onPress 
}: { 
  icon: React.ComponentType<{ size: number; color: string }>; 
  label: string; 
  color: string;
  onPress: () => void;
}) => (
  <TouchableOpacity 
    style={[styles.quickAction, { borderLeftColor: color }]}
    onPress={onPress}
  >
    <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
      <Icon size={20} color={color} />
    </View>
    <Text style={styles.quickActionText}>{label}</Text>
  </TouchableOpacity>
);

// Main Dashboard Component
export default function EnhancedAdminDashboard() {
  const insets = useSafeAreaInsets();
  const { 
    stats, 
    activityLogs, 
    fetchDashboardStats, 
    fetchActivityLogs,
    isLoading,
    error
  } = useAdmin();
  
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'rides' | 'payments'>('overview');

  // Load data function
  const loadData = useCallback(async () => {
    try {
      setRefreshing(true);
      await Promise.all([
        fetchDashboardStats(),
        fetchActivityLogs({ limit: 5, sort: '-createdAt' })
      ]);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      Alert.alert('Error', 'Failed to load dashboard data. Please try again.');
    } finally {
      setRefreshing(false);
    }
  }, [fetchDashboardStats, fetchActivityLogs]);

  // Initial data load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle refresh
  const onRefresh = () => {
    loadData();
  };

  // Handle quick action
  const handleQuickAction = (action: string) => {
    // Implement quick actions here
    Alert.alert('Action', `${action} action would be performed here`);
  };

  // Show loading state
  if (isLoading && !stats) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading dashboard data...</Text>
      </View>
    );
  }

  // Show error state
  if (error) {
    return (
      <View style={[styles.container, styles.errorContainer]}>
        <AlertCircle size={48} color="#F44336" />
        <Text style={styles.errorText}>Error loading dashboard</Text>
        <Text style={styles.errorSubtext}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadData}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#667eea']}
          tintColor="#667eea"
        />
      }
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <View>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.adminName}>Admin</Text>
        </View>
        <View style={styles.notificationIcon}>
          <View style={styles.notificationBadge} />
        </View>
      </View>

      {/* Stats Grid */}
      <View style={styles.statsGrid}>
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers?.toLocaleString() || '0'}
          color="#4CAF50"
          change={{ value: 12, isPositive: true }}
          loading={isLoading}
        />
        <StatCard
          icon={Car}
          title="Active Rides"
          value={stats?.rideStats?.inProgress?.toString() || '0'}
          color="#2196F3"
          change={{ value: 8, isPositive: true }}
          loading={isLoading}
        />
        <StatCard
          icon={CreditCard}
          title="Revenue"
          value={`${(stats?.totalRevenue || 0).toLocaleString()} XAF`}
          color="#9C27B0"
          change={{ value: 15, isPositive: true }}
          loading={isLoading}
        />
        <StatCard
          icon={AlertTriangle}
          title="Active Disputes"
          value={stats?.openDisputes?.toString() || '0'}
          color="#F44336"
          change={{ value: 2, isPositive: false }}
          loading={isLoading}
        />
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>
        <View style={styles.quickActions}>
          <QuickAction 
            icon={UserPlus} 
            label="Add User" 
            color="#4CAF50"
            onPress={() => handleQuickAction('Add User')}
          />
          <QuickAction 
            icon={AlertCircle} 
            label="View Issues" 
            color="#F44336"
            onPress={() => handleQuickAction('View Issues')}
          />
          <QuickAction 
            icon={BarChart2} 
            label="Reports" 
            color="#2196F3"
            onPress={() => handleQuickAction('Generate Report')}
          />
        </View>
      </View>

      {/* Recent Activity */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>
          <TouchableOpacity onPress={() => setActiveTab('activity')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.activityList}>
          {isLoading && activityLogs.length === 0 ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#667eea" />
              <Text style={styles.loadingText}>Loading activities...</Text>
            </View>
          ) : activityLogs.length > 0 ? (
            activityLogs.map((activity) => (
              <ActivityItem key={activity.id} activity={activity} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <ActivityIcon size={32} color="#999" />
              <Text style={styles.emptyStateText}>No recent activity</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    padding: 16,
  },
  // Header styles
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 16,
    color: '#666',
  },
  adminName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F44336',
  },
  
  // Stats grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
    marginBottom: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    margin: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderLeftWidth: 4,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statContent: {
    marginTop: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statChange: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statChangeText: {
    fontSize: 12,
    marginLeft: 4,
  },
  loadingIndicator: {
    marginVertical: 8,
  },
  
  // Section styles
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAll: {
    color: '#667eea',
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Quick actions
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  quickAction: {
    width: '32%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  quickActionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  quickActionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  
  // Activity list
  activityList: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  activityItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    alignItems: 'flex-start',
  },
  activityIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#f0f0f0',
  },
  activityContent: {
    flex: 1,
  },
  activityText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    lineHeight: 20,
  },
  activityMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
  activityUser: {
    fontSize: 12,
    color: '#999',
    marginLeft: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
    marginLeft: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  errorSubtext: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyState: {
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    marginTop: 12,
    color: '#999',
    textAlign: 'center',
  },
});
