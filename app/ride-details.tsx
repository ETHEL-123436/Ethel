import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { MapPin, Clock, Users, Star, Car, MessageCircle, Phone } from "lucide-react-native";
import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { Ride } from "@/types";

export default function RideDetailsScreen() {
  const { rideId, fromSearch } = useLocalSearchParams<{ rideId: string; fromSearch?: string }>();
  const { user } = useAuth();
  const { rides, bookRide, isLoading } = useRides();
  const [selectedSeats, setSelectedSeats] = useState(1);
  
  const ride = rides.find(r => r.id === rideId);
  const isDriver = user?.id === ride?.driverId;
  const canBook = !isDriver && fromSearch === 'true';

  useEffect(() => {
    if (!ride) {
      Alert.alert('Error', 'Ride not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [ride]);

  const handleBookRide = async () => {
    if (!ride || !user) return;

    // Check if user has completed KYC verification
    if (user.kycStatus !== 'approved') {
      Alert.alert(
        'Verification Required',
        'Please complete your KYC verification before booking a ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Verify Now', 
            onPress: () => router.push('/(settings)/kyc-upload')
          }
        ]
      );
      return;
    }

    if (selectedSeats > ride.seatsAvailable) {
      Alert.alert('Error', 'Not enough seats available');
      return;
    }

    try {
      const booking = await bookRide(ride.id, user.id, selectedSeats);
      
      Alert.alert(
        'Booking Successful!',
        `Your booking has been created. Proceed to payment?`,
        [
          { text: 'Later', style: 'cancel' },
          { 
            text: 'Pay Now', 
            onPress: () => router.push({
              pathname: '/payment',
              params: { bookingId: booking.id }
            })
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to book ride. Please try again.');
    }
  };

  const handleContactDriver = () => {
    if (!ride) return;
    
    router.push({
      pathname: '/chat',
      params: {
        userId: ride.driverId,
        userName: ride.driver.name
      }
    });
  };

  if (!ride) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Ride Details" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Route Information */}
          <View style={styles.routeCard}>
            <Text style={styles.cardTitle}>Route</Text>
            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>From</Text>
                  <Text style={styles.routeText}>{ride.origin.address}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#f44336' }]} />
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>To</Text>
                  <Text style={styles.routeText}>{ride.destination.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Ride Information */}
          <View style={styles.rideCard}>
            <Text style={styles.cardTitle}>Ride Information</Text>
            <View style={styles.rideDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Clock size={20} color="#667eea" />
                  <View>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {new Date(ride.dateTime).toLocaleDateString()} at{' '}
                      {new Date(ride.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Users size={20} color="#667eea" />
                  <View>
                    <Text style={styles.detailLabel}>Available Seats</Text>
                    <Text style={styles.detailValue}>
                      {ride.seatsAvailable} of {ride.totalSeats} seats
                    </Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Price per seat</Text>
                  <Text style={styles.price}>{ride.priceXAF} XAF</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Driver Information */}
          <View style={styles.driverCard}>
            <Text style={styles.cardTitle}>Driver</Text>
            <View style={styles.driverInfo}>
              <View style={styles.driverAvatar}>
                <Text style={styles.driverInitial}>
                  {ride.driver.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.driverDetails}>
                <Text style={styles.driverName}>{ride.driver.name}</Text>
                <View style={styles.driverRating}>
                  <Star size={16} color="#ffc107" fill="#ffc107" />
                  <Text style={styles.ratingText}>
                    {ride.driver.rating.toFixed(1)} ({ride.driver.totalRides} rides)
                  </Text>
                </View>
                {ride.driver.vehicleInfo && (
                  <View style={styles.vehicleInfo}>
                    <Car size={16} color="#666" />
                    <Text style={styles.vehicleText}>
                      {ride.driver.vehicleInfo.color} {ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model}
                    </Text>
                  </View>
                )}
              </View>
              {!isDriver && (
                <TouchableOpacity
                  style={styles.contactButton}
                  onPress={handleContactDriver}
                >
                  <MessageCircle size={20} color="#667eea" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Booking Section */}
          {canBook && ride.seatsAvailable > 0 && (
            <View style={styles.bookingCard}>
              <Text style={styles.cardTitle}>Book This Ride</Text>
              
              <View style={styles.seatSelector}>
                <Text style={styles.seatLabel}>Number of seats:</Text>
                <View style={styles.seatButtons}>
                  {[1, 2, 3, 4].map((num) => (
                    <TouchableOpacity
                      key={num}
                      style={[
                        styles.seatButton,
                        selectedSeats === num && styles.selectedSeat,
                        num > ride.seatsAvailable && styles.disabledSeat
                      ]}
                      onPress={() => setSelectedSeats(num)}
                      disabled={num > ride.seatsAvailable}
                    >
                      <Text style={[
                        styles.seatButtonText,
                        selectedSeats === num && styles.selectedSeatText,
                      ]}>
                        {num}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.bookingSummary}>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>Price per seat:</Text>
                  <Text style={styles.bookingValue}>{ride.priceXAF} XAF</Text>
                </View>
                <View style={styles.bookingRow}>
                  <Text style={styles.bookingLabel}>Seats selected:</Text>
                  <Text style={styles.bookingValue}>{selectedSeats}</Text>
                </View>
                <View style={[styles.bookingRow, styles.totalRow]}>
                  <Text style={styles.totalLabel}>Total:</Text>
                  <Text style={styles.totalValue}>{ride.priceXAF * selectedSeats} XAF</Text>
                </View>
              </View>

              <TouchableOpacity 
                style={[styles.bookButton, isLoading && styles.disabledButton]}
                onPress={handleBookRide}
                disabled={isLoading}
              >
                <Text style={styles.bookButtonText}>
                  {isLoading ? 'Booking...' : 'Book Now'}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  routeInfo: {
    marginTop: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
    marginBottom: 8,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  rideDetails: {
    marginTop: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  driverCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  driverAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e7ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  driverInitial: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  driverDetails: {
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  driverRating: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  vehicleText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  contactButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#eef2ff',
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  seatSelector: {
    marginBottom: 16,
  },
  seatLabel: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  seatButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  seatButton: {
    width: 50,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedSeat: {
    backgroundColor: '#4f46e5',
    borderColor: '#4f46e5',
  },
  disabledSeat: {
    opacity: 0.5,
  },
  seatButtonText: {
    fontSize: 16,
    color: '#4b5563',
    fontWeight: '500',
  },
  selectedSeatText: {
    color: 'white',
  },
  bookingSummary: {
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  bookingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bookingLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  bookingValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#4f46e5',
  },
  bookButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.7,
  },
  bookButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
