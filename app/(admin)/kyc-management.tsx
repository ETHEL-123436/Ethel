import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, Image, Alert } from 'react-native';
import { Shield, CheckCircle, XCircle, Eye, FileText, MessageSquare } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';

interface KYCReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onApprove: (notes?: string) => void;
  onReject: (notes?: string) => void;
  document: any;
}

function KYCReviewModal({ visible, onClose, onApprove, onReject, document }: KYCReviewModalProps) {
  const [reviewNotes, setReviewNotes] = useState('');

  const handleApprove = () => {
    onApprove(reviewNotes.trim() || undefined);
    setReviewNotes('');
    onClose();
  };

  const handleReject = () => {
    if (!reviewNotes.trim()) {
      Alert.alert('Review Notes Required', 'Please provide a reason for rejection.');
      return;
    }
    onReject(reviewNotes);
    setReviewNotes('');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Review KYC Document</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.documentInfo}>
            <Text style={styles.documentTitle}>{document?.title}</Text>
            <Text style={styles.documentDescription}>{document?.description}</Text>
            <View style={styles.documentMeta}>
              <Text style={styles.metaText}>User: {document?.userName}</Text>
              <Text style={styles.metaText}>Submitted: {new Date(document?.submittedAt).toLocaleDateString()}</Text>
            </View>
          </View>

          {document?.uri && (
            <View style={styles.imageContainer}>
              <Text style={styles.imageTitle}>Document Image</Text>
              <Image source={{ uri: document.uri }} style={styles.documentImage} />
            </View>
          )}

          <View style={styles.reviewSection}>
            <Text style={styles.reviewTitle}>Review Notes</Text>
            <TextInput
              style={styles.reviewInput}
              value={reviewNotes}
              onChangeText={setReviewNotes}
              placeholder="Add review notes (required for rejection)..."
              multiline
              numberOfLines={4}
            />
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.modalButton, styles.rejectButton]}
              onPress={handleReject}
            >
              <XCircle size={20} color="white" />
              <Text style={styles.modalButtonText}>Reject</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, styles.approveButton]}
              onPress={handleApprove}
            >
              <CheckCircle size={20} color="white" />
              <Text style={styles.modalButtonText}>Approve</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

export default function KYCManagement() {
  const { users, updateKYCDocument, isLoading } = useAdmin();
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);

  // Get users with pending KYC
  useEffect(() => {
    if (users) {
      const usersWithPendingKYC = users.filter(user =>
        user.kycStatus === 'pending' ||
        user.kycStatus === undefined ||
        user.role === 'driver'
      );
      setPendingUsers(usersWithPendingKYC);
    }
  }, [users]);

  const handleReviewDocument = (user: any) => {
    // Create a mock document for review
    const mockDocument = {
      id: `kyc-${user.id}`,
      title: 'KYC Documents',
      description: 'Review user KYC submission',
      userName: user.name,
      userId: user.id,
      submittedAt: new Date().toISOString(),
      uri: null, // In real implementation, this would be the actual document URI
      status: 'pending'
    };

    setSelectedDocument(mockDocument);
    setModalVisible(true);
  };

  const handleApproveKYC = async (userId: string, notes?: string) => {
    try {
      await updateKYCDocument(`kyc-${userId}`, 'approved', notes);
      Alert.alert('Success', 'KYC approved successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to approve KYC. Please try again.');
    }
  };

  const handleRejectKYC = async (userId: string, notes: string) => {
    try {
      await updateKYCDocument(`kyc-${userId}`, 'rejected', notes);
      Alert.alert('Success', 'KYC rejected successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to reject KYC. Please try again.');
    }
  };

  const getKycStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'rejected': return '#f44336';
      default: return '#999';
    }
  };

  const getKycStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle size={16} color="#4CAF50" />;
      case 'pending': return <Shield size={16} color="#ffc107" />;
      case 'rejected': return <XCircle size={16} color="#f44336" />;
      default: return <FileText size={16} color="#999" />;
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>KYC Management</Text>
        <Text style={styles.subtitle}>Review and approve user KYC documents</Text>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading KYC submissions...</Text>
        </View>
      ) : (
        <View style={styles.content}>
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{pendingUsers.length}</Text>
              <Text style={styles.statLabel}>Pending Reviews</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {users?.filter(u => u.kycStatus === 'approved').length || 0}
              </Text>
              <Text style={styles.statLabel}>Approved</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {users?.filter(u => u.kycStatus === 'rejected').length || 0}
              </Text>
              <Text style={styles.statLabel}>Rejected</Text>
            </View>
          </View>

          <View style={styles.usersList}>
            <Text style={styles.sectionTitle}>Pending KYC Reviews</Text>

            {pendingUsers.length === 0 ? (
              <View style={styles.emptyState}>
                <Shield size={48} color="#ccc" />
                <Text style={styles.emptyTitle}>No Pending Reviews</Text>
                <Text style={styles.emptyText}>All KYC submissions have been reviewed</Text>
              </View>
            ) : (
              pendingUsers.map((user) => (
                <View key={user.id} style={styles.userCard}>
                  <View style={styles.userHeader}>
                    <View style={styles.userInfo}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      <Text style={styles.userRole}>Role: {user.role}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      { backgroundColor: getKycStatusColor(user.kycStatus || 'pending') }
                    ]}>
                      {getKycStatusIcon(user.kycStatus || 'pending')}
                      <Text style={styles.statusText}>
                        {user.kycStatus?.toUpperCase() || 'PENDING'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.userActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.reviewButton]}
                      onPress={() => handleReviewDocument(user)}
                    >
                      <Eye size={16} color="#667eea" />
                      <Text style={styles.reviewButtonText}>Review KYC</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      onPress={() => handleApproveKYC(user.id)}
                    >
                      <CheckCircle size={16} color="#4CAF50" />
                      <Text style={styles.approveButtonText}>Quick Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectKYC(user.id, 'KYC rejected by admin')}
                    >
                      <XCircle size={16} color="#f44336" />
                      <Text style={styles.rejectButtonText}>Quick Reject</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </View>
      )}

      <KYCReviewModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onApprove={(notes) => handleApproveKYC(selectedDocument?.userId, notes)}
        onReject={(notes) => handleRejectKYC(selectedDocument?.userId, notes)}
        document={selectedDocument}
      />
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
    paddingTop: 20,
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
  content: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  statCard: {
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
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  usersList: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  userRole: {
    fontSize: 12,
    color: '#999',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  userActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  reviewButton: {
    backgroundColor: '#f0f4ff',
  },
  reviewButtonText: {
    fontSize: 12,
    color: '#667eea',
    fontWeight: '500',
  },
  approveButton: {
    backgroundColor: '#e8f5e8',
  },
  approveButtonText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
  },
  rejectButton: {
    backgroundColor: '#ffebee',
  },
  rejectButtonText: {
    fontSize: 12,
    color: '#f44336',
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },
  modalContent: {
    flex: 1,
    padding: 24,
  },
  documentInfo: {
    marginBottom: 24,
  },
  documentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  documentDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  documentMeta: {
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: '#999',
  },
  imageContainer: {
    marginBottom: 24,
  },
  imageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  documentImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  reviewSection: {
    marginBottom: 24,
  },
  reviewTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  reviewInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
