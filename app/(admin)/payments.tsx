import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, CreditCard, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';

export default function AdminPayments() {
  const insets = useSafeAreaInsets();
  const { payments, refundRequests, processRefund } = useAdmin();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'pending' | 'completed' | 'failed'>('all');
  const [activeTab, setActiveTab] = useState<'payments' | 'refunds'>('payments');

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         payment.bookingId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const filteredRefunds = refundRequests.filter(refund => {
    const matchesSearch = refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         refund.bookingId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         refund.requester.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'failed':
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'processed': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Clock size={16} color="#ffc107" />;
      case 'failed':
      case 'rejected': return <XCircle size={16} color="#f44336" />;
      default: return <Clock size={16} color="#999" />;
    }
  };

  const handleProcessRefund = (refundId: string, status: 'approved' | 'rejected') => {
    processRefund(refundId, status === 'approved' ? 'processed' : 'rejected', 'admin');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Payments & Refunds</Text>
        <Text style={styles.subtitle}>Manage all financial transactions</Text>
      </View>

      {/* Tab Selector */}
      <View style={styles.tabSelector}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'payments' && styles.activeTab]}
          onPress={() => setActiveTab('payments')}
        >
          <CreditCard size={20} color={activeTab === 'payments' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'payments' && styles.activeTabText]}>
            Payments ({payments.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'refunds' && styles.activeTab]}
          onPress={() => setActiveTab('refunds')}
        >
          <RefreshCw size={20} color={activeTab === 'refunds' ? '#667eea' : '#666'} />
          <Text style={[styles.tabText, activeTab === 'refunds' && styles.activeTabText]}>
            Refunds ({refundRequests.length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {activeTab === 'payments' && (
          <View style={styles.filters}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterButtons}>
              {['all', 'pending', 'completed', 'failed'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterButton,
                    selectedStatus === status && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedStatus(status as any)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedStatus === status && styles.filterButtonTextActive
                  ]}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Content */}
      {activeTab === 'payments' ? (
        <View style={styles.paymentsList}>
          <Text style={styles.resultsCount}>
            {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''} found
          </Text>

          {filteredPayments.map((payment) => (
            <View key={payment.id} style={styles.paymentCard}>
              <View style={styles.paymentHeader}>
                <View style={styles.paymentInfo}>
                  <Text style={styles.paymentId}>Payment #{payment.id.slice(-6)}</Text>
                  <Text style={styles.bookingId}>Booking #{payment.bookingId.slice(-6)}</Text>
                </View>
                <View style={styles.paymentAmount}>
                  <Text style={styles.amountText}>{payment.amountXAF.toLocaleString()} XAF</Text>
                  <View style={styles.providerBadge}>
                    <Text style={styles.providerText}>
                      {payment.provider === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.paymentDetails}>
                <View style={styles.statusRow}>
                  {getStatusIcon(payment.status)}
                  <Text style={[styles.statusText, { color: getStatusColor(payment.status) }]}>
                    {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                  </Text>
                </View>
                <Text style={styles.dateText}>
                  {new Date(payment.createdAt).toLocaleDateString()} at {new Date(payment.createdAt).toLocaleTimeString()}
                </Text>
                {payment.providerRef && (
                  <Text style={styles.refText}>Ref: {payment.providerRef}</Text>
                )}
              </View>

              <View style={styles.paymentActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>View Details</Text>
                </TouchableOpacity>
                {payment.status === 'failed' && (
                  <TouchableOpacity style={[styles.actionButton, styles.retryButton]}>
                    <Text style={[styles.actionButtonText, { color: '#ff9800' }]}>Retry Payment</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View style={styles.refundsList}>
          <Text style={styles.resultsCount}>
            {filteredRefunds.length} refund request{filteredRefunds.length !== 1 ? 's' : ''} found
          </Text>

          {filteredRefunds.map((refund) => (
            <View key={refund.id} style={styles.refundCard}>
              <View style={styles.refundHeader}>
                <View style={styles.refundInfo}>
                  <Text style={styles.refundId}>Refund #{refund.id.slice(-6)}</Text>
                  <Text style={styles.requesterName}>Requested by {refund.requester.name}</Text>
                </View>
                <View style={styles.refundAmount}>
                  <Text style={styles.amountText}>{refund.amount.toLocaleString()} XAF</Text>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(refund.status) }
                  ]}>
                    <Text style={styles.statusBadgeText}>{refund.status}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.refundDetails}>
                <Text style={styles.reasonText}>Reason: {refund.reason}</Text>
                <Text style={styles.dateText}>
                  Requested on {new Date(refund.createdAt).toLocaleDateString()}
                </Text>
                {refund.processedAt && (
                  <Text style={styles.processedText}>
                    Processed on {new Date(refund.processedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>

              {refund.status === 'pending' && (
                <View style={styles.refundActions}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.approveButton]}
                    onPress={() => handleProcessRefund(refund.id, 'approved')}
                  >
                    <CheckCircle size={16} color="#4CAF50" />
                    <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Approve</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rejectButton]}
                    onPress={() => handleProcessRefund(refund.id, 'rejected')}
                  >
                    <XCircle size={16} color="#f44336" />
                    <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Reject</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>
      )}
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
  tabSelector: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: 'white',
    gap: 8,
  },
  activeTab: {
    backgroundColor: '#f0f4ff',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#667eea',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingBottom: 16,
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
  paymentsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  refundsList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  paymentCard: {
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
  refundCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  refundHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  paymentInfo: {
    flex: 1,
  },
  refundInfo: {
    flex: 1,
  },
  paymentId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  refundId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingId: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  requesterName: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentAmount: {
    alignItems: 'flex-end',
  },
  refundAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  providerBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#e3f2fd',
  },
  providerText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#1976d2',
    textTransform: 'uppercase',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  paymentDetails: {
    gap: 4,
    marginBottom: 16,
  },
  refundDetails: {
    gap: 4,
    marginBottom: 16,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  processedText: {
    fontSize: 12,
    color: '#4CAF50',
  },
  refText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
  reasonText: {
    fontSize: 14,
    color: '#333',
  },
  paymentActions: {
    flexDirection: 'row',
    gap: 8,
  },
  refundActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    gap: 4,
  },
  actionButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  retryButton: {
    backgroundColor: '#fff3e0',
  },
  approveButton: {
    backgroundColor: '#e8f5e8',
  },
  rejectButton: {
    backgroundColor: '#ffebee',
  },
});