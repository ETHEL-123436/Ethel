import createContextHook from '@nkzw/create-context-hook';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState, useEffect } from 'react';
import { Ride, Booking, Location } from '@/types';
import { mockRides, mockBookings } from '@/mocks/data';

export const [RideProvider, useRides] = createContextHook(() => {
  const [rides, setRides] = useState<Ride[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const ridesData = await AsyncStorage.getItem('rides');
      const bookingsData = await AsyncStorage.getItem('bookings');
      
      setRides(ridesData ? JSON.parse(ridesData) : mockRides);
      setBookings(bookingsData ? JSON.parse(bookingsData) : mockBookings);
    } catch (error) {
      console.error('Failed to load data:', error);
      setRides(mockRides);
      setBookings(mockBookings);
    }
  };

  const searchRides = async (origin: Location, destination: Location, date: string) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Filter rides based on proximity to origin/destination
      const filteredRides = rides.filter(ride => 
        ride.status === 'active' && 
        ride.seatsAvailable > 0 &&
        new Date(ride.dateTime).toDateString() === new Date(date).toDateString()
      );
      
      return filteredRides;
    } finally {
      setIsLoading(false);
    }
  };

  const createRide = async (rideData: Omit<Ride, 'id' | 'status'>) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const newRide: Ride = {
        ...rideData,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active'
      };
      
      const updatedRides = [...rides, newRide];
      setRides(updatedRides);
      await AsyncStorage.setItem('rides', JSON.stringify(updatedRides));
      
      return newRide;
    } finally {
      setIsLoading(false);
    }
  };

  const bookRide = async (rideId: string, passengerId: string, seats: number) => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const ride = rides.find(r => r.id === rideId);
      if (!ride || ride.seatsAvailable < seats) {
        throw new Error('Ride not available');
      }
      
      const newBooking: Booking = {
        id: Math.random().toString(36).substr(2, 9),
        rideId,
        ride,
        passengerId,
        passenger: {
          id: passengerId,
          name: 'Current User',
          email: 'user@example.com',
          phone: '+237670123456',
          role: 'passenger',
          kycStatus: 'approved',
          rating: 4.5,
          totalRides: 10,
          walletBalance: 15000
        },
        seats,
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: ride.priceXAF * seats,
        createdAt: new Date().toISOString()
      };
      
      const updatedBookings = [...bookings, newBooking];
      setBookings(updatedBookings);
      await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
      
      // Update ride seats
      const updatedRides = rides.map(r => 
        r.id === rideId 
          ? { ...r, seatsAvailable: r.seatsAvailable - seats }
          : r
      );
      setRides(updatedRides);
      await AsyncStorage.setItem('rides', JSON.stringify(updatedRides));
      
      return newBooking;
    } finally {
      setIsLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: Booking['status']) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, status } : b
    );
    setBookings(updatedBookings);
    await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  const updatePaymentStatus = async (bookingId: string, paymentStatus: Booking['paymentStatus']) => {
    const updatedBookings = bookings.map(b => 
      b.id === bookingId ? { ...b, paymentStatus } : b
    );
    setBookings(updatedBookings);
    await AsyncStorage.setItem('bookings', JSON.stringify(updatedBookings));
  };

  return {
    rides,
    bookings,
    isLoading,
    searchRides,
    createRide,
    bookRide,
    updateBookingStatus,
    updatePaymentStatus
  };
});