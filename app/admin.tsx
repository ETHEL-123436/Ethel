import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { 
  Users, 
  AlertTriangle, 
  DollarSign, 
  TrendingUp,
  Car,
  Shield,
  RefreshCw,
  BarChart3,
  UserCheck,
  AlertCircle,
  CreditCard
} from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';
import { AdminStats } from '@/types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  growth?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, growth }) => {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={styles.statHeader}>
        <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
          <Text>{icon}</Text>
        </View>
        <View style={styles.statContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          {growth !== undefined && (
            <View style={styles.growthContainer}>
              <TrendingUp size={12} color={growth >= 0 ? '#10B981' : '#EF4444'} />
              <Text style={[styles.growthText, { color: growth >= 0 ? '#10B981' : '#EF4444' }]}>
                {growth >= 0 ? '+' : ''}{growth}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

interface TabButtonProps {
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  onPress: () => void;
  badge?: number;
}

const TabButton: React.FC<TabButtonProps> = ({ title, icon, isActive, onPress, badge }) => {
  return (
    <TouchableOpacity
      style={[styles.tabButton, isActive && styles.activeTab]}
      onPress={onPress}
    >
      <View style={styles.tabContent}>
        <Text>{icon}</Text>
        <Text style={[styles.tabText, isActive && styles.activeTabText]}>{title}</Text>
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const isWeb = false; // Platform.OS === 'web';

const DashboardOverview: React.FC<{ stats: AdminStats }> = ({ stats }) => (
  <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
    <Text style={styles.sectionTitle}>Overview</Text>
    
    <View style={styles.statsGrid}>
      <StatCard
        title="Total Users"
        value={stats.totalUsers.toLocaleString()}
        icon={<Users size={24} color="#3B82F6" />}
        color="#3B82F6"
        growth={stats.monthlyGrowth.users}
      />
      <StatCard
        title="Active Rides"
        value={stats.activeRides}
        icon={<Car size={24} color="#10B981" />}
        color="#10B981"
        growth={stats.monthlyGrowth.rides}
      />
      <StatCard
        title="Total Revenue"
        value={`${(stats.totalRevenue / 1000000).toFixed(1)}M XAF`}
        icon={<DollarSign size={24} color="#F59E0B" />}
        color="#F59E0B"
        growth={stats.monthlyGrowth.revenue}
      />
      <StatCard
        title="Pending KYC"
        value={stats.pendingKYC}
        icon={<Shield size={24} color="#EF4444" />}
        color="#EF4444"
      />
    </View>

    <View style={styles.quickActions}>
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionGrid}>
        <TouchableOpacity style={styles.actionCard}>
          <UserCheck size={24} color="#3B82F6" />
          <Text style={styles.actionText}>Review KYC</Text>
          <Text style={styles.actionSubtext}>{stats.pendingKYC} pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <AlertCircle size={24} color="#F59E0B" />
          <Text style={styles.actionText}>Handle Disputes</Text>
          <Text style={styles.actionSubtext}>{stats.openDisputes} open</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <CreditCard size={24} color="#10B981" />
          <Text style={styles.actionText}>Process Refunds</Text>
          <Text style={styles.actionSubtext}>View pending</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard}>
          <BarChart3 size={24} color="#8B5CF6" />
          <Text style={styles.actionText}>View Analytics</Text>
          <Text style={styles.actionSubtext}>Detailed reports</Text>
        </TouchableOpacity>
      </View>
    </View>

    <View style={styles.mapContainer}>
      <Text style={styles.sectionTitle}>Live Rides Map</Text>
      <View style={styles.mapWrapper}>
        {isWeb ? (
          <View style={styles.webMapPlaceholder}>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapTitle}>Cameroon Ride Activity</Text>
              <View style={styles.cityStats}>
                <View style={styles.cityItem}>
                  <View style={[styles.cityDot, { backgroundColor: '#10B981' }]} />
                  <Text style={styles.cityName}>Yaoundé - 8 active rides</Text>
                </View>
                <View style={styles.cityItem}>
                  <View style={[styles.cityDot, { backgroundColor: '#3B82F6' }]} />
                  <Text style={styles.cityName}>Douala - 12 active rides</Text>
                </View>
                <View style={styles.cityItem}>
                  <View style={[styles.cityDot, { backgroundColor: '#F59E0B' }]} />
                  <Text style={styles.cityName}>Bamenda - 3 active rides</Text>
                </View>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.nativeMapPlaceholder}>
            <Text style={styles.mapPlaceholderText}>Map view available on mobile devices</Text>
            <Text style={styles.mapPlaceholderSubtext}>Install the mobile app to view live ride tracking</Text>
          </View>
        )}
      </View>
    </View>
  </ScrollView>
);
const UsersManagement: React.FC = () => {
  const { getFilteredUsers, suspendUser, deleteUser } = useAdmin();
  const [filter, setFilter] = useState<'all' | 'drivers' | 'passengers'>('all');
  const [kycFilter, setKycFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const isWeb = false; // Platform.OS === 'web';

  const filteredUsers = getFilteredUsers(
    isWeb ? undefined : filter === 'drivers' ? 'driver' : 'passenger',
    kycFilter === 'all' ? undefined : kycFilter
  );

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>User Management</Text>
      
      <View style={styles.filterContainer}>
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>Role:</Text>
          <View style={styles.filterButtons}>
            {['all', 'drivers', 'passengers'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterButton, filter === f && styles.activeFilter]}
                onPress={() => setFilter(f as any)}
              >
                <Text style={[styles.filterButtonText, filter === f && styles.activeFilterText]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        
        <View style={styles.filterGroup}>
          <Text style={styles.filterLabel}>KYC Status:</Text>
          <View style={styles.filterButtons}>
            {['all', 'pending', 'approved', 'rejected'].map((f) => (
              <TouchableOpacity
                key={f}
                style={[styles.filterButton, kycFilter === f && styles.activeFilter]}
                onPress={() => setKycFilter(f as any)}
              >
                <Text style={[styles.filterButtonText, kycFilter === f && styles.activeFilterText]}>
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <View style={styles.usersList}>
        {filteredUsers.map((user) => (
          <View key={user.id} style={styles.userCard}>
            <View style={styles.userInfo}>
              <View style={styles.userHeader}>
                <Text style={styles.userName}>{user.name}</Text>
                <View style={[
                  styles.roleTag,
                  { backgroundColor: user.role === 'driver' ? '#3B82F6' : '#10B981' }
                ]}>
                  <Text style={styles.roleText}>{user.role}</Text>
                </View>
              </View>
              <Text style={styles.userEmail}>{user.email}</Text>
              <Text style={styles.userPhone}>{user.phone}</Text>
              
              <View style={styles.userStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Rating</Text>
                  <Text style={styles.statValue}>{user.rating.toFixed(1)}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Rides</Text>
                  <Text style={styles.statValue}>{user.totalRides}</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statLabel}>Wallet</Text>
                  <Text style={styles.statValue}>{user.walletBalance.toLocaleString()} XAF</Text>
                </View>
              </View>

              <View style={styles.kycStatus}>
                <Text style={styles.kycLabel}>KYC Status:</Text>
                <View style={[
                  styles.kycBadge,
                  {
                    backgroundColor: user.kycStatus === 'approved' ? '#10B981' :
                                   user.kycStatus === 'rejected' ? '#EF4444' : '#F59E0B'
                  }
                ]}>
                  <Text style={styles.kycText}>{user.kycStatus}</Text>
                </View>
              </View>
            </View>

            <View style={styles.userActions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.suspendButton]}
                onPress={() => suspendUser(user.id)}
              >
                <Text style={styles.actionButtonText}>Suspend</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.actionButton, styles.deleteButton]}
                onPress={() => deleteUser(user.id)}
              >
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const KYCManagement: React.FC = () => {
  const { kycDocuments, updateKYCDocument } = useAdmin();
  const pendingDocs = kycDocuments.filter(doc => doc.status === 'pending');

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>KYC Document Review</Text>
      
      <View style={styles.kycList}>
        {pendingDocs.map((doc) => (
          <View key={doc.id} style={styles.kycCard}>
            <View style={styles.kycHeader}>
              <Text style={styles.kycType}>{doc.type.replace('_', ' ').toUpperCase()}</Text>
              <Text style={styles.kycDate}>
                {new Date(doc.uploadedAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.kycUserId}>User ID: {doc.userId}</Text>
            
            <View style={styles.kycActions}>
              <TouchableOpacity
                style={[styles.kycButton, styles.approveButton]}
                onPress={() => {
                  updateKYCDocument(doc.id, 'approved');
                  Alert.alert('Success', 'KYC document approved successfully!');
                }}
              >
                <Text style={styles.kycButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.kycButton, styles.rejectButton]}
                onPress={() => {
                  updateKYCDocument(doc.id, 'rejected', 'Document quality insufficient');
                  Alert.alert('Success', 'KYC document rejected successfully!');
                }}
              >
                <Text style={styles.kycButtonText}>Reject</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const DisputeManagement: React.FC = () => {
  const { disputes, updateDispute } = useAdmin();
  const openDisputes = disputes.filter(d => d.status === 'open' || d.status === 'investigating');

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Dispute Management</Text>
      
      <View style={styles.disputeList}>
        {openDisputes.map((dispute) => (
          <View key={dispute.id} style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <Text style={styles.disputeType}>{dispute.type.toUpperCase()}</Text>
              <View style={[
                styles.priorityBadge,
                {
                  backgroundColor: dispute.priority === 'urgent' ? '#EF4444' :
                                 dispute.priority === 'high' ? '#F59E0B' :
                                 dispute.priority === 'medium' ? '#3B82F6' : '#6B7280'
                }
              ]}>
                <Text style={styles.priorityText}>{dispute.priority}</Text>
              </View>
            </View>
            
            <Text style={styles.disputeDescription}>{dispute.description}</Text>
            <Text style={styles.disputeReporter}>Reported by: {dispute.reporter.name}</Text>
            
            <View style={styles.disputeActions}>
              <TouchableOpacity
                style={[styles.disputeButton, styles.investigateButton]}
                onPress={() => updateDispute(dispute.id, 'investigating', undefined, 'admin1')}
              >
                <Text style={styles.disputeButtonText}>Investigate</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.disputeButton, styles.resolveButton]}
                onPress={() => updateDispute(dispute.id, 'resolved', 'Issue resolved through mediation')}
              >
                <Text style={styles.disputeButtonText}>Resolve</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const RefundManagement: React.FC = () => {
  const { refundRequests, processRefund } = useAdmin();
  const pendingRefunds = refundRequests.filter(r => r.status === 'pending');

  return (
    <ScrollView style={styles.content}>
      <Text style={styles.sectionTitle}>Refund Management</Text>
      
      <View style={styles.refundList}>
        {pendingRefunds.map((refund) => (
          <View key={refund.id} style={styles.refundCard}>
            <View style={styles.refundHeader}>
              <Text style={styles.refundAmount}>{refund.amount.toLocaleString()} XAF</Text>
              <Text style={styles.refundDate}>
                {new Date(refund.createdAt).toLocaleDateString()}
              </Text>
            </View>
            
            <Text style={styles.refundReason}>{refund.reason}</Text>
            <Text style={styles.refundRequester}>Requested by: {refund.requester.name}</Text>
            
            <View style={styles.refundActions}>
              <TouchableOpacity
                style={[styles.refundButton, styles.approveRefundButton]}
                onPress={() => processRefund(refund.id, 'approved', 'admin1')}
              >
                <Text style={styles.refundButtonText}>Approve</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refundButton, styles.rejectRefundButton]}
                onPress={() => processRefund(refund.id, 'rejected', 'admin1')}
              >
                <Text style={styles.refundButtonText}>Reject</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.refundButton, styles.processRefundButton]}
                onPress={() => processRefund(refund.id, 'processed', 'admin1')}
              >
                <Text style={styles.refundButtonText}>Process</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const { 
    stats, 
    selectedTab, 
    setSelectedTab, 
    getPendingKYC, 
    getOpenDisputes, 
    getPendingRefunds 
  } = useAdmin();

  const pendingKYC = getPendingKYC();
  const openDisputes = getOpenDisputes();
  const pendingRefunds = getPendingRefunds();

  const renderContent = () => {
    switch (selectedTab) {
      case 'dashboard':
        return <DashboardOverview stats={stats} />;
      case 'users':
        return <UsersManagement />;
      case 'kyc':
        return <KYCManagement />;
      case 'disputes':
        return <DisputeManagement />;
      case 'refunds':
        return <RefundManagement />;
      default:
        return <DashboardOverview stats={stats} />;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Admin Dashboard</Text>
        <TouchableOpacity style={styles.refreshButton}>
          <RefreshCw size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TabButton
            title="Dashboard"
            icon={<BarChart3 size={20} color={selectedTab === 'dashboard' ? '#3B82F6' : '#6B7280'} />}
            isActive={selectedTab === 'dashboard'}
            onPress={() => setSelectedTab('dashboard')}
          />
          <TabButton
            title="Users"
            icon={<Users size={20} color={selectedTab === 'users' ? '#3B82F6' : '#6B7280'} />}
            isActive={selectedTab === 'users'}
            onPress={() => setSelectedTab('users')}
          />
          <TabButton
            title="KYC Review"
            icon={<Shield size={20} color={selectedTab === 'kyc' ? '#3B82F6' : '#6B7280'} />}
            isActive={selectedTab === 'kyc'}
            onPress={() => setSelectedTab('kyc')}
            badge={pendingKYC.length}
          />
          <TabButton
            title="Disputes"
            icon={<AlertTriangle size={20} color={selectedTab === 'disputes' ? '#3B82F6' : '#6B7280'} />}
            isActive={selectedTab === 'disputes'}
            onPress={() => setSelectedTab('disputes')}
            badge={openDisputes.length}
          />
          <TabButton
            title="Refunds"
            icon={<CreditCard size={20} color={selectedTab === 'refunds' ? '#3B82F6' : '#6B7280'} />}
            isActive={selectedTab === 'refunds'}
            onPress={() => setSelectedTab('refunds')}
            badge={pendingRefunds.length}
          />
        </ScrollView>
      </View>

      {renderContent()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  refreshButton: {
    padding: 8,
  },
  tabContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 4,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  tabContent: {
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#3B82F6',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    flex: 1,
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  statTitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  growthContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  growthText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  quickActions: {
    marginBottom: 24,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    flex: 1,
    minWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
    textAlign: 'center',
  },
  actionSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  mapContainer: {
    marginBottom: 24,
  },
  mapWrapper: {
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
  },
  map: {
    flex: 1,
  },
  webMapPlaceholder: {
    flex: 1,
    backgroundColor: '#1F2937',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  mapTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  cityStats: {
    alignItems: 'flex-start',
  },
  cityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  cityName: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  nativeMapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  mapPlaceholderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  mapPlaceholderSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  filterContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  filterGroup: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  filterButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  activeFilter: {
    backgroundColor: '#3B82F6',
    borderColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#FFFFFF',
  },
  usersList: {
    gap: 12,
  },
  userCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  userInfo: {
    marginBottom: 12,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  roleTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  kycStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  kycLabel: {
    fontSize: 14,
    color: '#374151',
    marginRight: 8,
  },
  kycBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  suspendButton: {
    backgroundColor: '#F59E0B',
  },
  deleteButton: {
    backgroundColor: '#EF4444',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  kycList: {
    gap: 12,
  },
  kycCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  kycHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kycType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  kycDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  kycUserId: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  kycActions: {
    flexDirection: 'row',
    gap: 8,
  },
  kycButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#10B981',
  },
  rejectButton: {
    backgroundColor: '#EF4444',
  },
  kycButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  disputeList: {
    gap: 12,
  },
  disputeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  disputeType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disputeDescription: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  disputeReporter: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  disputeActions: {
    flexDirection: 'row',
    gap: 8,
  },
  disputeButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  investigateButton: {
    backgroundColor: '#F59E0B',
  },
  resolveButton: {
    backgroundColor: '#10B981',
  },
  disputeButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  refundList: {
    gap: 12,
  },
  refundCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  refundAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  refundDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  refundReason: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  refundRequester: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 12,
  },
  refundActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refundButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  approveRefundButton: {
    backgroundColor: '#10B981',
  },
  rejectRefundButton: {
    backgroundColor: '#EF4444',
  },
  processRefundButton: {
    backgroundColor: '#3B82F6',
  },
  refundButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
});