import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Search, User, Shield, Ban, Trash2, Eye } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';

export default function AdminUsers() {
  const { users, updateKYCDocument, suspendUser, deleteUser, fetchUsers, isLoading } = useAdmin();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRole, setSelectedRole] = useState<'all' | 'driver' | 'passenger'>('all');
  const [selectedKycStatus, setSelectedKycStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch users when component mounts
  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchUsers({ page: 1, limit: 1000 }); // Fetch more users to see all registered users
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    loadData();
  }, [fetchUsers]);

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await fetchUsers({ page: 1, limit: 1000 }); // Refresh with higher limit
    } catch (error) {
      console.error('Error refreshing users:', error);
    } finally {
      setRefreshing(false);
    }
  };

  const filteredUsers = users ? users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.phone.includes(searchQuery);
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    
    // KYC status filtering logic
    let matchesKyc = true;
    if (selectedKycStatus === 'all') {
      matchesKyc = true; // Show all users when 'all' is selected
    } else if (selectedKycStatus === 'pending') {
      matchesKyc = user.kycStatus === 'pending' || !user.kycStatus; // Show users with pending status or no status
    } else {
      matchesKyc = user.kycStatus === selectedKycStatus; // Show only users with exact status match
    }
    
    return matchesSearch && matchesRole && matchesKyc;
  }) : [];

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const handleKycStatusChange = (userId: string, status: 'pending' | 'approved' | 'rejected') => {
    // For now, we'll use a placeholder KYC document ID - this should be updated to use actual KYC document ID
    updateKYCDocument('placeholder-doc-id', status);
  };

  const handleViewDetails = (user: any) => {
    Alert.alert(
      'User Details',
      `Name: ${user.name}\nEmail: ${user.email}\nPhone: ${user.phone}\nRole: ${user.role}\nKYC Status: ${user.kycStatus || 'pending'}\nRating: ${user.rating?.toFixed(1) || 'N/A'}\nTotal Rides: ${user.totalRides || 0}\nWallet Balance: XAF ${user.walletBalance?.toLocaleString() || '0'}`,
      [{ text: 'OK' }]
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: 20 }]}>
        <Text style={styles.title}>User Management</Text>
        <Text style={styles.subtitle}>Manage drivers and passengers</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading users...</Text>
        </View>
      ) : (
        <>
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Search size={20} color="#666" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search users..."
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            <View style={styles.filters}>
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Role:</Text>
                <View style={styles.filterButtons}>
                  {['all', 'driver', 'passenger'].map((role) => (
                    <TouchableOpacity
                      key={role}
                      style={[
                        styles.filterButton,
                        selectedRole === role && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedRole(role as any)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedRole === role && styles.filterButtonTextActive
                      ]}>
                        {role.charAt(0).toUpperCase() + role.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>KYC Status:</Text>
                <View style={styles.filterButtons}>
                  {['all', 'pending', 'approved', 'rejected'].map((status) => (
                    <TouchableOpacity
                      key={status}
                      style={[
                        styles.filterButton,
                        selectedKycStatus === status && styles.filterButtonActive
                      ]}
                      onPress={() => setSelectedKycStatus(status as any)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedKycStatus === status && styles.filterButtonTextActive
                      ]}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Users List */}
          <View style={styles.usersList}>
            <Text style={styles.resultsCount}>
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
            </Text>

            {filteredUsers.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userAvatar}>
                    <User size={24} color="#667eea" />
                  </View>
                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>{user.name}</Text>
                    <Text style={styles.userEmail}>{user.email}</Text>
                    <Text style={styles.userPhone}>{user.phone}</Text>
                  </View>
                  <View style={styles.userBadges}>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleBadgeText}>{user.role}</Text>
                    </View>
                    <View style={[
                      styles.kycBadge,
                      { backgroundColor: getKycStatusColor(user.kycStatus || 'pending') }
                    ]}>
                      <Shield size={12} color="white" />
                      <Text style={styles.kycBadgeText}>{user.kycStatus || 'pending'}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.userStats}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.rating.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Rating</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.totalRides}</Text>
                    <Text style={styles.statLabel}>Rides</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{user.walletBalance.toLocaleString()}</Text>
                    <Text style={styles.statLabel}>Wallet (XAF)</Text>
                  </View>
                </View>

                {user.role === 'driver' && user.vehicleInfo && (
                  <View style={styles.vehicleInfo}>
                    <Text style={styles.vehicleText}>
                      {user.vehicleInfo.color} {user.vehicleInfo.make} {user.vehicleInfo.model} ({user.vehicleInfo.year})
                    </Text>
                    <Text style={styles.plateNumber}>{user.vehicleInfo.plateNumber}</Text>
                  </View>
                )}

                <View style={styles.userActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleViewDetails(user)}
                  >
                    <Eye size={16} color="#667eea" />
                    <Text style={styles.actionButtonText}>View Details</Text>
                  </TouchableOpacity>

                  {user.kycStatus !== 'approved' && user.kycStatus !== 'rejected' && (
                    <>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.approveButton]}
                        onPress={() => handleKycStatusChange(user.id, 'approved')}
                      >
                        <Shield size={16} color="#4CAF50" />
                        <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Approve KYC</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.actionButton, styles.rejectButton]}
                        onPress={() => handleKycStatusChange(user.id, 'rejected')}
                      >
                        <Ban size={16} color="#f44336" />
                        <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Reject KYC</Text>
                      </TouchableOpacity>
                    </>
                  )}

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.suspendButton]}
                    onPress={() => suspendUser(user.id, 'Suspended by admin')}
                  >
                    <Ban size={16} color="#ff9800" />
                    <Text style={[styles.actionButtonText, { color: '#ff9800' }]}>Suspend</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => deleteUser(user.id)}
                  >
                    <Trash2 size={16} color="#f44336" />
                    <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
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
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filters: {
    gap: 16,
  },
  filterGroup: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  usersList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userBadges: {
    gap: 4,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
  },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  kycBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  userStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  vehicleInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  vehicleText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  plateNumber: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  userActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  approveButton: {
    backgroundColor: '#e8f5e8',
  },
  rejectButton: {
    backgroundColor: '#ffebee',
  },
  suspendButton: {
    backgroundColor: '#fff3e0',
  },
  deleteButton: {
    backgroundColor: '#ffebee',
  },
});