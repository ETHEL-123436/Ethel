import { User, Dispute, RefundRequest, KYCDocument, Payment, Booking, Ride } from './index';

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  status: 'success' | 'failed' | 'pending';
  createdAt: Date;
  updatedAt: Date;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalRides: number;
  totalBookings: number;
  totalRevenue: number;
  activeUsers: number;
  pendingKYC: number;
  openDisputes: number;
  recentActivities: ActivityLog[];
  userGrowth: {
    date: string;
    count: number;
  }[];
  revenueByMonth: {
    month: string;
    amount: number;
  }[];
  rideStats: {
    completed: number;
    cancelled: number;
    inProgress: number;
  };
}

export interface AdminState {
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
}

export interface AdminActions {
  setSelectedTab: (tab: string) => void;
  updateUserStatus: (userId: string, status: 'active' | 'suspended' | 'banned') => Promise<void>;
  updateKYCDocument: (docId: string, status: 'pending' | 'approved' | 'rejected', reviewNotes?: string) => Promise<void>;
  updateUserRole: (userId: string, role: 'user' | 'driver' | 'admin' | 'passenger') => Promise<void>;
  fetchDashboardStats: () => Promise<AdminStats>;
  fetchUsers: () => Promise<User[]>;
  fetchActivityLogs: (params?: Record<string, any>) => Promise<{ data: ActivityLog[]; pagination: any }>;
  fetchPendingRefunds: () => Promise<RefundRequest[]>;
}
