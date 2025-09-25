export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'driver' | 'passenger' | 'admin' | 'user';
  status: 'active' | 'suspended' | 'banned';
  avatar?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  rating: number;
  totalRides: number;
  walletBalance: number;
  token?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    color: string;
    plateNumber: string;
  };
}

export interface Location {
  latitude: number;
  longitude: number;
  name?: string;
  address?: string;
}

export interface Ride {
  id: string;
  driverId: string;
  driver: User;
  origin: Location;
  destination: Location;
  priceXAF: number;
  dateTime: string;
  seatsAvailable: number;
  totalSeats: number;
  status: 'active' | 'completed' | 'cancelled';
  distance: number;
  duration: number;
}

export interface Booking {
  id: string;
  rideId: string;
  ride: Ride;
  passengerId: string;
  passenger: User;
  seats: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  totalAmount: number;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  provider: 'mtn_momo' | 'orange_money';
  amountXAF: number;
  status: 'pending' | 'completed' | 'failed';
  providerRef?: string;
  createdAt: string;
}

export interface Message {
  id: string;
  threadId: string;
  from: string;
  to: string;
  body: string;
  read: boolean;
  createdAt: string;
}

export interface KYCDocument {
  id: string;
  userId: string;
  type: 'id_card' | 'drivers_license' | 'vehicle_registration';
  url: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string;
  uploadedAt: string;
}

export interface Dispute {
  id: string;
  bookingId: string;
  booking: Booking;
  reportedBy: string;
  reporter: User;
  type: 'payment' | 'service' | 'safety' | 'other';
  description: string;
  status: 'open' | 'investigating' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminStats {
  totalUsers: number;
  totalDrivers: number;
  totalPassengers: number;
  totalRides: number;
  activeRides: number;
  totalBookings: number;
  totalRevenue: number;
  pendingKYC: number;
  openDisputes: number;
  monthlyGrowth: {
    users: number;
    rides: number;
    revenue: number;
  };
}

export interface RefundRequest {
  id: string;
  bookingId: string;
  booking: Booking;
  requestedBy: string;
  requester: User;
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'rejected' | 'processed';
  processedBy?: string;
  processedAt?: string;
  createdAt: string;
}