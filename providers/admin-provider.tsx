import { API_BASE_URL, KYC_STATUS, USER_ROLES, USER_STATUS } from '@/config/constants';
import {
  AdminStats,
  Booking,
  Dispute,
  KYCDocument,
  Payment,
  RefundRequest,
  Ride,
  User
} from '@/types';
import { ActivityLog } from '@/types/admin';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './auth-provider';

// Type for API response data structure
interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

// Type for paginated response
interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Admin context type
interface AdminContextType {
  // State
  users: User[];
  disputes: Dispute[];
  stats: AdminStats | null;
  refundRequests: RefundRequest[];
  kycDocuments: KYCDocument[];
  payments: Payment[];
  bookings: Booking[];
  rides: Ride[];
  activityLogs: ActivityLog[];
  selectedTab: string;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSelectedTab: (tab: string) => void;
  updateUserStatus: (userId: string, status: typeof USER_STATUS[keyof typeof USER_STATUS]) => Promise<User>;
  updateKYCDocument: (docId: string, status: typeof KYC_STATUS[keyof typeof KYC_STATUS], reviewNotes?: string) => Promise<KYCDocument>;
  updateUserRole: (userId: string, role: typeof USER_ROLES[keyof typeof USER_ROLES]) => Promise<User>;
  fetchDashboardStats: () => Promise<AdminStats>;
  fetchUsers: (params?: Record<string, any>) => Promise<PaginatedResponse<User>>;
  fetchActivityLogs: (params?: Record<string, any>) => Promise<PaginatedResponse<ActivityLog>>;
  fetchPendingRefunds: (params?: Record<string, any>) => Promise<PaginatedResponse<RefundRequest>>;
  fetchKYCDocuments: (params?: Record<string, any>) => Promise<PaginatedResponse<KYCDocument>>;
  refreshAdminData: () => Promise<void>;
  processRefund: (refundId: string, action: 'approve' | 'reject', reason?: string) => Promise<void>;
  suspendUser: (userId: string, reason: string) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateDispute: (disputeId: string, status: 'open' | 'investigating' | 'resolved' | 'closed', resolution?: string) => Promise<void>;
  getFilteredUsers: (filters?: { status?: string; role?: string; search?: string; kycStatus?: string }) => User[];
  getPendingKYC: () => KYCDocument[];
  getOpenDisputes: () => Dispute[];
  getPendingRefunds: () => RefundRequest[];
}

// Create context
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Admin provider component
export function AdminProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [kycDocuments, setKycDocuments] = useState<KYCDocument[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rides, setRides] = useState<Ride[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<string>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Set up axios instance with auth token
  const api = useMemo(() => {
    const instance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': user?.token ? `Bearer ${user.token}` : ''
      }
    });

    // Add request interceptor for auth
    instance.interceptors.request.use(
      (config) => {
        if (user?.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Add response interceptor for error handling
    instance.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle unauthorized access
          console.error('Authentication error:', error);
        }
        return Promise.reject(error);
      }
    );

    return instance;
  }, [user?.token]);

  // Fetch dashboard stats
  const fetchDashboardStats = useCallback(async (): Promise<AdminStats> => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<AdminStats>>('/api/admin/dashboard-stats');
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch dashboard stats');
      }
      const statsData = response.data.data;
      setStats(statsData);
      return statsData;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to load dashboard stats';
      console.error('Error fetching dashboard stats:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Fetch all users with pagination support
  const fetchUsers = useCallback(async (params: Record<string, any> = {}): Promise<PaginatedResponse<User>> => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<PaginatedResponse<User>>>('/api/admin/users', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch users');
      }
      const usersData = response.data.data;
      setUsers(usersData.data || []);
      return usersData;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to load users';
      console.error('Error fetching users:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Fetch activity logs with pagination and filtering
  const fetchActivityLogs = useCallback(async (params: Record<string, any> = {}): Promise<PaginatedResponse<ActivityLog>> => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<PaginatedResponse<ActivityLog>>>('/api/admin/activity-logs', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch activity logs');
      }
      const logsData = response.data.data;
      setActivityLogs(logsData.data || []);
      return logsData;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to load activity logs';
      console.error('Error fetching activity logs:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Update user role
  const updateUserRole = useCallback(async (
    userId: string,
    role: typeof USER_ROLES[keyof typeof USER_ROLES]
  ): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<User>>(
        `/api/admin/users/${userId}/role`,
        { role }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user role');
      }

      const updatedUser = response.data.data;

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, role } : user
        )
      );

      return updatedUser;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to update user role';
      console.error('Error updating user role:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Update user status
  const updateUserStatus = useCallback(async (
    userId: string,
    status: typeof USER_STATUS[keyof typeof USER_STATUS]
  ): Promise<User> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<User>>(
        `/api/admin/users/${userId}/status`,
        { status }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update user status');
      }

      const updatedUser = response.data.data;

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status } : user
        )
      );

      return updatedUser;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to update user status';
      console.error('Error updating user status:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Update KYC document status
  const updateKYCDocument = useCallback(async (
    docId: string,
    status: typeof KYC_STATUS[keyof typeof KYC_STATUS],
    reviewNotes?: string
  ): Promise<KYCDocument> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<KYCDocument>>(
        `/api/admin/kyc/${docId}`,
        { status, reviewNotes }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update KYC document');
      }

      const updatedDoc = response.data.data;

      // Update local state
      setKycDocuments(prev =>
        prev.map(doc =>
          doc.id === docId ? { ...doc, status, reviewNotes } : doc
        )
      );

      return updatedDoc;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to update KYC document';
      console.error('Error updating KYC document:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Fetch pending refunds with pagination support
  const fetchPendingRefunds = useCallback(async (params: Record<string, any> = {}): Promise<PaginatedResponse<RefundRequest>> => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<PaginatedResponse<RefundRequest>>>(
        '/api/admin/refund-requests',
        { params: { status: 'pending', ...params } }
      );

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch pending refunds');
      }

      const refundsData = response.data.data;
      setRefundRequests(refundsData.data || []);
      return refundsData;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to load pending refunds';
      console.error('Error fetching pending refunds:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Fetch KYC documents with pagination support
  const fetchKYCDocuments = useCallback(async (params: Record<string, any> = {}): Promise<PaginatedResponse<KYCDocument>> => {
    try {
      setIsLoading(true);
      const response = await api.get<ApiResponse<PaginatedResponse<KYCDocument>>>('/api/admin/kyc-documents', { params });
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch KYC documents');
      }
      const kycData = response.data.data;
      setKycDocuments(kycData.data || []);
      return kycData;
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to load KYC documents';
      console.error('Error fetching KYC documents:', err);
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Refresh all admin data
  const refreshAdminData = useCallback(async (): Promise<void> => {
    if (user?.role === 'admin') {
      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch data one by one to handle individual failures
        const promises = [
          fetchDashboardStats().catch(err => console.error('Dashboard stats error:', err)),
          fetchUsers({ page: 1, limit: 100, sort: '-createdAt' }).catch(err => console.error('Users error:', err)),
          fetchActivityLogs({ page: 1, limit: 10, sort: '-createdAt' }).catch(err => console.error('Activity logs error:', err)),
          fetchPendingRefunds({ page: 1, limit: 10, sort: '-createdAt' }).catch(err => console.error('Pending refunds error:', err))
        ];
        
        await Promise.allSettled(promises);
      } catch (error) {
        console.error('Error refreshing admin data:', error);
        setError('Failed to refresh data');
      } finally {
        setIsLoading(false);
      }
    }
  }, [user?.role, fetchDashboardStats, fetchUsers, fetchActivityLogs, fetchPendingRefunds]);
  useEffect(() => {
    const initializeAdminData = async () => {
      if (user?.role === 'admin') {
        try {
          // Fetch data one by one to identify which endpoint is failing
          console.log('Initializing admin data...');
          
          try {
            await fetchDashboardStats();
            console.log('Dashboard stats loaded successfully');
          } catch (error) {
            console.error('Error fetching dashboard stats:', error);
          }
          
          try {
            await fetchUsers({ page: 1, limit: 100, sort: '-createdAt' });
            console.log('Users loaded successfully');
          } catch (error) {
            console.error('Error fetching users:', error);
          }
          
          try {
            await fetchActivityLogs({ page: 1, limit: 10, sort: '-createdAt' });
            console.log('Activity logs loaded successfully');
          } catch (error) {
            console.error('Error fetching activity logs:', error);
          }
          
          try {
            await fetchPendingRefunds({ page: 1, limit: 10, sort: '-createdAt' });
            console.log('Pending refunds loaded successfully');
          } catch (error) {
            console.error('Error fetching pending refunds:', error);
          }
          
          // Temporarily disable KYC documents fetching to avoid 404 errors
          // try {
          //   await fetchKYCDocuments({ page: 1, limit: 50 });
          //   console.log('KYC documents loaded successfully');
          // } catch (error) {
          //   console.error('Error fetching KYC documents:', error);
          // }
          
        } catch (error) {
          console.error('Error initializing admin data:', error);
        }
      }
    };

    initializeAdminData();
  }, [user?.role, fetchDashboardStats, fetchUsers, fetchActivityLogs, fetchPendingRefunds]);

  // Process refund request
  const processRefund = useCallback(async (refundId: string, action: 'approve' | 'reject', reason?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<RefundRequest>>(`/api/admin/refunds/${refundId}`, {
        action,
        reason
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to process refund');
      }

      // Update local state
      setRefundRequests(prev =>
        prev.map(req =>
          req.id === refundId ? { ...req, status: action === 'approve' ? 'approved' : 'rejected' } : req
        )
      );
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to process refund';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Suspend a user
  const suspendUser = useCallback(async (userId: string, reason: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<User>>(`/api/admin/users/${userId}/suspend`, { reason });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to suspend user');
      }

      // Update local state
      setUsers(prev =>
        prev.map(user =>
          user.id === userId ? { ...user, status: 'suspended' } : user
        )
      );
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to suspend user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Delete a user
  const deleteUser = useCallback(async (userId: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.delete<ApiResponse<{ id: string }>>(`/api/admin/users/${userId}`);

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete user');
      }

      // Update local state
      setUsers(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to delete user';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Update dispute status
  const updateDispute = useCallback(async (disputeId: string, status: 'open' | 'investigating' | 'resolved' | 'closed', resolution?: string): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.put<ApiResponse<Dispute>>(`/api/admin/disputes/${disputeId}`, {
        status,
        resolution
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to update dispute');
      }

      // Update local state
      setDisputes(prev =>
        prev.map(dispute =>
          dispute.id === disputeId
            ? {
                ...dispute,
                status,
                ...(resolution && { resolution }),
                updatedAt: new Date().toISOString()
              }
            : dispute
        )
      );
    } catch (error) {
      const err = error as AxiosError<{ message?: string }>;
      const errorMessage = err.response?.data?.message || 'Failed to update dispute';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [api]);

  // Get filtered users
  const getFilteredUsers = useCallback((filters: { status?: string; role?: string; search?: string; kycStatus?: string } = {}) => {
    return users.filter(user => {
      const matchesStatus = !filters.status || user.status === filters.status;
      const matchesRole = !filters.role || user.role === filters.role;
      const matchesSearch = !filters.search ||
        user.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        user.email.toLowerCase().includes(filters.search.toLowerCase());
      const matchesKYCStatus = filters.kycStatus === undefined || user.kycStatus === filters.kycStatus;

      return matchesStatus && matchesRole && matchesSearch && matchesKYCStatus;
    });
  }, [users]);

  // Get pending KYC documents
  const getPendingKYC = useCallback(() => {
    return kycDocuments.filter(doc => doc.status === 'pending');
  }, [kycDocuments]);

  // Get open disputes
  const getOpenDisputes = useCallback(() => {
    return disputes.filter(dispute => dispute.status === 'open' || dispute.status === 'investigating');
  }, [disputes]);

  // Get pending refunds
  const getPendingRefunds = useCallback(() => {
    return refundRequests.filter(request => request.status === 'pending');
  }, [refundRequests]);

  const contextValue: AdminContextType = {
    // State
    users,
    disputes,
    stats,
    refundRequests,
    kycDocuments,
    payments,
    bookings,
    rides,
    activityLogs,
    selectedTab,
    isLoading,
    error,

    // Actions
    setSelectedTab,
    updateUserStatus,
    updateKYCDocument,
    updateUserRole,
    fetchDashboardStats,
    fetchUsers,
    fetchActivityLogs,
    fetchPendingRefunds,
    fetchKYCDocuments,
    refreshAdminData,
    processRefund,
    suspendUser,
    deleteUser,
    updateDispute,
    getFilteredUsers,
    getPendingKYC,
    getOpenDisputes,
    getPendingRefunds,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
}

// Custom hook to use admin context
export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}