// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:5000';

// Admin Routes
export const ADMIN_ROUTES = {
  DASHBOARD: '/admin/dashboard',
  USERS: '/admin/users',
  RIDES: '/admin/rides',
  BOOKINGS: '/admin/bookings',
  PAYMENTS: '/admin/payments',
  DISPUTES: '/admin/disputes',
  ACTIVITY_LOGS: '/admin/activity-logs',
  KYC: '/admin/kyc'
};

// User roles
export const USER_ROLES = {
  ADMIN: 'admin',
  DRIVER: 'driver',
  PASSENGER: 'passenger',
  USER: 'user'
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  BANNED: 'banned'
} as const;

export const KYC_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
} as const;
