import createContextHook from '@nkzw/create-context-hook';
import { useState, useCallback, useMemo } from 'react';
import { 
  User, 
  Dispute, 
  AdminStats, 
  RefundRequest, 
  KYCDocument, 
  Payment,
  Booking,
  Ride
} from '@/types';
import {
  mockAllUsers,
  mockDisputes,
  mockAdminStats,
  mockRefundRequests,
  mockKYCDocuments,
  mockPayments,
  mockBookings,
  mockRides
} from '@/mocks/data';

export const [AdminProvider, useAdmin] = createContextHook(() => {
  const [users, setUsers] = useState<User[]>(mockAllUsers);
  const [disputes, setDisputes] = useState<Dispute[]>(mockDisputes);
  const [stats] = useState<AdminStats>(mockAdminStats);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>(mockRefundRequests);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>(mockKYCDocuments);
  const [payments] = useState<Payment[]>(mockPayments);
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [rides] = useState<Ride[]>(mockRides);
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');

  const updateUserStatus = useCallback((userId: string, kycStatus: 'pending' | 'approved' | 'rejected') => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, kycStatus } : user
    ));
  }, []);

  const updateKYCDocument = useCallback((docId: string, status: 'pending' | 'approved' | 'rejected', reviewNotes?: string) => {
    setKycDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, status, reviewNotes } : doc
    ));
    
    const doc = kycDocuments.find(d => d.id === docId);
    if (doc) {
      updateUserStatus(doc.userId, status);
    }
  }, [kycDocuments, updateUserStatus]);

  const updateDispute = useCallback((disputeId: string, status: Dispute['status'], resolution?: string, assignedTo?: string) => {
    setDisputes(prev => prev.map(dispute => 
      dispute.id === disputeId 
        ? { ...dispute, status, resolution, assignedTo, updatedAt: new Date().toISOString() }
        : dispute
    ));
  }, []);

  const processRefund = useCallback((refundId: string, status: RefundRequest['status'], processedBy?: string) => {
    setRefundRequests(prev => prev.map(refund => 
      refund.id === refundId 
        ? { 
            ...refund, 
            status, 
            processedBy, 
            processedAt: status === 'processed' ? new Date().toISOString() : undefined 
          }
        : refund
    ));

    if (status === 'processed') {
      const refund = refundRequests.find(r => r.id === refundId);
      if (refund) {
        setBookings(prev => prev.map(booking => 
          booking.id === refund.bookingId 
            ? { ...booking, paymentStatus: 'refunded' }
            : booking
        ));
      }
    }
  }, [refundRequests]);

  const suspendUser = useCallback((userId: string) => {
    console.log(`Suspending user: ${userId}`);
  }, []);

  const deleteUser = useCallback((userId: string) => {
    setUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  const getFilteredUsers = useCallback((role?: 'driver' | 'passenger', kycStatus?: string) => {
    return users.filter(user => {
      if (role && user.role !== role) return false;
      if (kycStatus && user.kycStatus !== kycStatus) return false;
      return true;
    });
  }, [users]);

  const getPendingKYC = useCallback(() => {
    return kycDocuments.filter(doc => doc.status === 'pending');
  }, [kycDocuments]);

  const getOpenDisputes = useCallback(() => {
    return disputes.filter(dispute => dispute.status === 'open' || dispute.status === 'investigating');
  }, [disputes]);

  const getPendingRefunds = useCallback(() => {
    return refundRequests.filter(refund => refund.status === 'pending');
  }, [refundRequests]);

  return useMemo(() => ({
    users,
    disputes,
    stats,
    refundRequests,
    kycDocuments,
    payments,
    bookings,
    rides,
    selectedTab,
    setSelectedTab,
    updateUserStatus,
    updateKYCDocument,
    updateDispute,
    processRefund,
    suspendUser,
    deleteUser,
    getFilteredUsers,
    getPendingKYC,
    getOpenDisputes,
    getPendingRefunds
  }), [
    users,
    disputes,
    stats,
    refundRequests,
    kycDocuments,
    payments,
    bookings,
    rides,
    selectedTab,
    updateUserStatus,
    updateKYCDocument,
    updateDispute,
    processRefund,
    suspendUser,
    deleteUser,
    getFilteredUsers,
    getPendingKYC,
    getOpenDisputes,
    getPendingRefunds
  ]);
});