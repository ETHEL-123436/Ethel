import { Ride, Booking, User, Dispute, AdminStats, RefundRequest, KYCDocument, Payment } from '@/types';

export const mockDrivers: User[] = [
  {
    id: 'driver1',
    name: 'Jean-Paul Mbarga',
    email: 'jp.mbarga@email.com',
    phone: '+237670123456',
    role: 'driver',
    status: 'active',
    kycStatus: 'approved',
    rating: 4.8,
    totalRides: 245,
    walletBalance: 125000,
    vehicleInfo: {
      make: 'Toyota',
      model: 'Corolla',
      year: 2019,
      color: 'White',
      plateNumber: 'LT-456-CD'
    }
  },
  {
    id: 'driver2',
    name: 'Marie Nguema',
    email: 'marie.nguema@email.com',
    phone: '+237680234567',
    role: 'driver',
    status: 'active',
    kycStatus: 'approved',
    rating: 4.9,
    totalRides: 189,
    walletBalance: 98000,
    vehicleInfo: {
      make: 'Honda',
      model: 'Civic',
      year: 2020,
      color: 'Blue',
      plateNumber: 'CE-789-EF'
    }
  },
  {
    id: 'driver3',
    name: 'Paul Biya Jr',
    email: 'paul.biya@email.com',
    phone: '+237690345678',
    role: 'driver',
    status: 'active',
    kycStatus: 'approved',
    rating: 4.7,
    totalRides: 156,
    walletBalance: 76000,
    vehicleInfo: {
      make: 'Nissan',
      model: 'Sentra',
      year: 2021,
      color: 'Silver',
      plateNumber: 'LT-012-GH'
    }
  }
];

export const mockPassengers: User[] = [
  {
    id: 'passenger1',
    name: 'Alice Kamga',
    email: 'alice.kamga@email.com',
    phone: '+237670987654',
    role: 'passenger',
    status: 'active',
    kycStatus: 'approved',
    rating: 4.6,
    totalRides: 23,
    walletBalance: 45000
  },
  {
    id: 'passenger2',
    name: 'Robert Essomba',
    email: 'robert.essomba@email.com',
    phone: '+237680123789',
    role: 'passenger',
    status: 'active',
    kycStatus: 'pending',
    rating: 4.3,
    totalRides: 12,
    walletBalance: 25000
  },
  {
    id: 'passenger3',
    name: 'Grace Nkomo',
    email: 'grace.nkomo@email.com',
    phone: '+237690456123',
    role: 'passenger',
    status: 'active',
    kycStatus: 'approved',
    rating: 4.8,
    totalRides: 45,
    walletBalance: 67000
  }
];

export const mockAllUsers: User[] = [...mockDrivers, ...mockPassengers];

export const mockRides: Ride[] = [
  {
    id: 'ride1',
    driverId: 'driver1',
    driver: mockDrivers[0],
    origin: {
      latitude: 3.8480,
      longitude: 11.5021,
      address: 'Bastos, Yaoundé'
    },
    destination: {
      latitude: 4.0511,
      longitude: 9.7679,
      address: 'Bonanjo, Douala'
    },
    priceXAF: 8500,
    dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
    seatsAvailable: 3,
    totalSeats: 4,
    status: 'active',
    distance: 245,
    duration: 180
  },
  {
    id: 'ride2',
    driverId: 'driver2',
    driver: mockDrivers[1],
    origin: {
      latitude: 4.0511,
      longitude: 9.7679,
      address: 'Akwa, Douala'
    },
    destination: {
      latitude: 3.8480,
      longitude: 11.5021,
      address: 'Melen, Yaoundé'
    },
    priceXAF: 9000,
    dateTime: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    seatsAvailable: 2,
    totalSeats: 4,
    status: 'active',
    distance: 245,
    duration: 185
  },
  {
    id: 'ride3',
    driverId: 'driver3',
    driver: mockDrivers[2],
    origin: {
      latitude: 3.8480,
      longitude: 11.5021,
      address: 'Essos, Yaoundé'
    },
    destination: {
      latitude: 5.9631,
      longitude: 10.1591,
      address: 'Centre-ville, Bamenda'
    },
    priceXAF: 12000,
    dateTime: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
    seatsAvailable: 4,
    totalSeats: 4,
    status: 'active',
    distance: 367,
    duration: 240
  }
];



export const mockBookings: Booking[] = [
  {
    id: 'booking1',
    rideId: 'ride1',
    ride: mockRides[0],
    passengerId: 'passenger1',
    passenger: mockPassengers[0],
    seats: 1,
    status: 'confirmed',
    paymentStatus: 'paid',
    totalAmount: 8500,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString()
  },
  {
    id: 'booking2',
    rideId: 'ride2',
    ride: mockRides[1],
    passengerId: 'passenger2',
    passenger: mockPassengers[1],
    seats: 2,
    status: 'pending',
    paymentStatus: 'pending',
    totalAmount: 18000,
    createdAt: new Date(Date.now() - 60 * 60 * 1000).toISOString()
  },
  {
    id: 'booking3',
    rideId: 'ride3',
    ride: mockRides[2],
    passengerId: 'passenger3',
    passenger: mockPassengers[2],
    seats: 1,
    status: 'completed',
    paymentStatus: 'paid',
    totalAmount: 12000,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockPayments: Payment[] = [
  {
    id: 'payment1',
    bookingId: 'booking1',
    provider: 'mtn_momo',
    amountXAF: 8500,
    status: 'completed',
    providerRef: 'MTN123456789',
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'payment2',
    bookingId: 'booking2',
    provider: 'orange_money',
    amountXAF: 18000,
    status: 'pending',
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString()
  },
  {
    id: 'payment3',
    bookingId: 'booking3',
    provider: 'mtn_momo',
    amountXAF: 12000,
    status: 'completed',
    providerRef: 'MTN987654321',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockDisputes: Dispute[] = [
  {
    id: 'dispute1',
    bookingId: 'booking1',
    booking: mockBookings[0],
    reportedBy: 'passenger1',
    reporter: mockPassengers[0],
    type: 'service',
    description: 'Driver was 30 minutes late and did not communicate',
    status: 'open',
    priority: 'medium',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'dispute2',
    bookingId: 'booking3',
    booking: mockBookings[2],
    reportedBy: 'driver3',
    reporter: mockDrivers[2],
    type: 'payment',
    description: 'Passenger requested refund after completing the ride',
    status: 'investigating',
    priority: 'high',
    assignedTo: 'admin1',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
  }
];

export const mockRefundRequests: RefundRequest[] = [
  {
    id: 'refund1',
    bookingId: 'booking3',
    booking: mockBookings[2],
    requestedBy: 'passenger3',
    requester: mockPassengers[2],
    amount: 12000,
    reason: 'Driver cancelled at the last minute',
    status: 'pending',
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

export const mockKYCDocuments: KYCDocument[] = [
  {
    id: 'kyc1',
    userId: 'driver1',
    type: 'drivers_license',
    url: 'https://example.com/docs/license1.jpg',
    status: 'approved',
    uploadedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'kyc2',
    userId: 'passenger2',
    type: 'id_card',
    url: 'https://example.com/docs/id2.jpg',
    status: 'pending',
    uploadedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: 'kyc3',
    userId: 'driver2',
    type: 'vehicle_registration',
    url: 'https://example.com/docs/registration2.jpg',
    status: 'rejected',
    reviewNotes: 'Document is not clear, please upload a better quality image',
    uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  }
];

export const mockAdminStats: AdminStats = {
  totalUsers: 1247,
  totalDrivers: 342,
  totalPassengers: 905,
  totalRides: 2156,
  activeRides: 23,
  totalBookings: 1834,
  totalRevenue: 18450000,
  pendingKYC: 12,
  openDisputes: 5,
  monthlyGrowth: {
    users: 12.5,
    rides: 18.3,
    revenue: 22.1
  }
};