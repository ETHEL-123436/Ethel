import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, MessageSquare, AlertTriangle, User, Clock, CheckCircle } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';

export default function AdminDisputes() {
  const insets = useSafeAreaInsets();
  const { disputes, updateDispute } = useAdmin();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'open' | 'investigating' | 'resolved' | 'closed'>('all');
  const [selectedPriority, setSelectedPriority] = useState<'all' | 'low' | 'medium' | 'high' | 'urgent'>('all');

  const filteredDisputes = disputes.filter(dispute => {
    const matchesSearch = dispute.reporter.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         dispute.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || dispute.status === selectedStatus;
    const matchesPriority = selectedPriority === 'all' || dispute.priority === selectedPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#f44336';
      case 'investigating': return '#ff9800';
      case 'resolved': return '#4CAF50';
      case 'closed': return '#666';
      default: return '#999';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return '#d32f2f';
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#4CAF50';
      default: return '#999';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'payment': return '💳';
      case 'service': return '🚗';
      case 'safety': return '🛡️';
      default: return '❓';
    }
  };

  const handleUpdateDispute = (disputeId: string, status: any, resolution?: string) => {
    updateDispute(disputeId, status, resolution, 'admin');
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Disputes Management</Text>
        <Text style={styles.subtitle}>Handle user disputes and complaints</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search disputes..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filters}>
          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Status:</Text>
            <View style={styles.filterButtons}>
              {['all', 'open', 'investigating', 'resolved', 'closed'].map((status) => (
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

          <View style={styles.filterGroup}>
            <Text style={styles.filterLabel}>Priority:</Text>
            <View style={styles.filterButtons}>
              {['all', 'urgent', 'high', 'medium', 'low'].map((priority) => (
                <TouchableOpacity
                  key={priority}
                  style={[
                    styles.filterButton,
                    selectedPriority === priority && styles.filterButtonActive
                  ]}
                  onPress={() => setSelectedPriority(priority as any)}
                >
                  <Text style={[
                    styles.filterButtonText,
                    selectedPriority === priority && styles.filterButtonTextActive
                  ]}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Disputes List */}
      <View style={styles.disputesList}>
        <Text style={styles.resultsCount}>
          {filteredDisputes.length} dispute{filteredDisputes.length !== 1 ? 's' : ''} found
        </Text>

        {filteredDisputes.map((dispute) => (
          <View key={dispute.id} style={styles.disputeCard}>
            <View style={styles.disputeHeader}>
              <View style={styles.disputeInfo}>
                <View style={styles.disputeTitle}>
                  <Text style={styles.typeEmoji}>{getTypeIcon(dispute.type)}</Text>
                  <Text style={styles.disputeId}>Dispute #{dispute.id.slice(-6)}</Text>
                  <View style={[
                    styles.priorityBadge,
                    { backgroundColor: getPriorityColor(dispute.priority) }
                  ]}>
                    <Text style={styles.priorityText}>{dispute.priority}</Text>
                  </View>
                </View>
                <Text style={styles.disputeType}>{dispute.type.charAt(0).toUpperCase() + dispute.type.slice(1)} Issue</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(dispute.status) }
              ]}>
                <Text style={styles.statusText}>{dispute.status}</Text>
              </View>
            </View>

            <View style={styles.reporterInfo}>
              <View style={styles.reporterAvatar}>
                <User size={16} color="#667eea" />
              </View>
              <View>
                <Text style={styles.reporterName}>Reported by {dispute.reporter.name}</Text>
                <Text style={styles.bookingInfo}>Booking #{dispute.bookingId.slice(-6)}</Text>
              </View>
            </View>

            <View style={styles.disputeDescription}>
              <Text style={styles.descriptionText}>{dispute.description}</Text>
            </View>

            <View style={styles.disputeTimeline}>
              <View style={styles.timelineItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.timelineText}>
                  Created {new Date(dispute.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={styles.timelineItem}>
                <Clock size={14} color="#666" />
                <Text style={styles.timelineText}>
                  Updated {new Date(dispute.updatedAt).toLocaleDateString()}
                </Text>
              </View>
              {dispute.assignedTo && (
                <View style={styles.timelineItem}>
                  <User size={14} color="#667eea" />
                  <Text style={styles.timelineText}>Assigned to {dispute.assignedTo}</Text>
                </View>
              )}
            </View>

            {dispute.resolution && (
              <View style={styles.resolution}>
                <CheckCircle size={16} color="#4CAF50" />
                <Text style={styles.resolutionText}>{dispute.resolution}</Text>
              </View>
            )}

            <View style={styles.disputeActions}>
              {dispute.status === 'open' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.investigateButton]}
                  onPress={() => handleUpdateDispute(dispute.id, 'investigating')}
                >
                  <AlertTriangle size={16} color="#ff9800" />
                  <Text style={[styles.actionButtonText, { color: '#ff9800' }]}>Start Investigation</Text>
                </TouchableOpacity>
              )}

              {dispute.status === 'investigating' && (
                <TouchableOpacity 
                  style={[styles.actionButton, styles.resolveButton]}
                  onPress={() => handleUpdateDispute(dispute.id, 'resolved', 'Issue resolved by admin')}
                >
                  <CheckCircle size={16} color="#4CAF50" />
                  <Text style={[styles.actionButtonText, { color: '#4CAF50' }]}>Mark Resolved</Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity style={styles.actionButton}>
                <MessageSquare size={16} color="#667eea" />
                <Text style={styles.actionButtonText}>Contact Reporter</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Booking</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
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
    flexWrap: 'wrap',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  disputesList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  disputeCard: {
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
  disputeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  disputeInfo: {
    flex: 1,
  },
  disputeTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  typeEmoji: {
    fontSize: 16,
  },
  disputeId: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  priorityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  disputeType: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  reporterAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  reporterName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  bookingInfo: {
    fontSize: 12,
    color: '#666',
  },
  disputeDescription: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  disputeTimeline: {
    gap: 4,
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timelineText: {
    fontSize: 12,
    color: '#666',
  },
  resolution: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#e8f5e8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  resolutionText: {
    flex: 1,
    fontSize: 14,
    color: '#2e7d32',
    lineHeight: 20,
  },
  disputeActions: {
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
  investigateButton: {
    backgroundColor: '#fff3e0',
  },
  resolveButton: {
    backgroundColor: '#e8f5e8',
  },
});