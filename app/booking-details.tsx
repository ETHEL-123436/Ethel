import { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { MapPin, Clock, User, CreditCard, MessageCircle, Navigation, XCircle } from "lucide-react-native";
import { useRides } from "@/providers/ride-provider";
import { useAuth } from "@/providers/auth-provider";

export default function BookingDetailsScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, updateBookingStatus } = useRides();
  const { user } = useAuth();
  
  const booking = bookings.find(b => b.id === bookingId);
  const isDriver = user?.id === booking?.ride.driverId;

  useEffect(() => {
    if (!booking) {
      Alert.alert('Error', 'Booking not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [booking]);

  const handleCancelBooking = () => {
    if (!booking) return;

    Alert.alert(
      'Cancel Booking',
      'Are you sure you want to cancel this booking? This action cannot be undone.',
      [
        { text: 'No', style: 'cancel' },
        { 
          text: 'Yes, Cancel', 
          style: 'destructive',
          onPress: async () => {
            await updateBookingStatus(booking.id, 'cancelled');
            Alert.alert('Booking Cancelled', 'The booking has been cancelled successfully.');
          }
        }
      ]
    );
  };

  const handleConfirmBooking = async () => {
    if (!booking) return;
    
    await updateBookingStatus(booking.id, 'confirmed');
    Alert.alert('Booking Confirmed', 'The booking has been confirmed successfully.');
  };

  const handleStartTracking = () => {
    if (!booking) return;
    
    router.push({
      pathname: '/tracking',
      params: { bookingId: booking.id }
    });
  };

  const handleContactUser = () => {
    if (!booking) return;
    
    const contactUser = isDriver ? booking.passenger : booking.ride.driver;
    
    router.push({
      pathname: '/chat',
      params: {
        userId: contactUser.id,
        userName: contactUser.name
      }
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'cancelled': return '#f44336';
      case 'completed': return '#2196F3';
      default: return '#999';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return '#4CAF50';
      case 'pending': return '#ffc107';
      case 'failed': return '#f44336';
      case 'refunded': return '#9C27B0';
      default: return '#999';
    }
  };

  if (!booking) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: "Booking Details" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Status Header */}
          <View style={styles.statusHeader}>
            <View style={styles.statusBadges}>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(booking.status) }
              ]}>
                <Text style={styles.statusText}>{booking.status.toUpperCase()}</Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getPaymentStatusColor(booking.paymentStatus) }
              ]}>
                <Text style={styles.statusText}>{booking.paymentStatus.toUpperCase()}</Text>
              </View>
            </View>
            <Text style={styles.bookingId}>Booking #{booking.id.slice(-8).toUpperCase()}</Text>
          </View>

          {/* Route Information */}
          <View style={styles.routeCard}>
            <Text style={styles.cardTitle}>Route</Text>
            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>From</Text>
                  <Text style={styles.routeText}>{booking.ride.origin.address}</Text>
                </View>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#f44336' }]} />
                <View style={styles.routeDetails}>
                  <Text style={styles.routeLabel}>To</Text>
                  <Text style={styles.routeText}>{booking.ride.destination.address}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Trip Information */}
          <View style={styles.tripCard}>
            <Text style={styles.cardTitle}>Trip Information</Text>
            <View style={styles.tripDetails}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Clock size={20} color="#667eea" />
                  <View>
                    <Text style={styles.detailLabel}>Date & Time</Text>
                    <Text style={styles.detailValue}>
                      {new Date(booking.ride.dateTime).toLocaleDateString()} at{' '}
                      {new Date(booking.ride.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
              </View>
              
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <MapPin size={20} color="#667eea" />
                  <View>
                    <Text style={styles.detailLabel}>Seats Booked</Text>
                    <Text style={styles.detailValue}>{booking.seats} seat{booking.seats !== 1 ? 's' : ''}</Text>
                  </View>
                </View>
                <View style={styles.priceContainer}>
                  <Text style={styles.priceLabel}>Total Amount</Text>
                  <Text style={styles.price}>{booking.totalAmount} XAF</Text>
                </View>
              </View>
            </View>
          </View>

          {/* User Information */}
          <View style={styles.userCard}>
            <Text style={styles.cardTitle}>
              {isDriver ? 'Passenger' : 'Driver'} Information
            </Text>
            <View style={styles.userInfo}>
              <View style={styles.userAvatar}>
                <User size={24} color="#667eea" />
              </View>
              <View style={styles.userDetails}>
                <Text style={styles.userName}>
                  {isDriver ? booking.passenger.name : booking.ride.driver.name}
                </Text>
                <Text style={styles.userPhone}>
                  {isDriver ? booking.passenger.phone : booking.ride.driver.phone}
                </Text>
                <View style={styles.userRating}>
                  <Text style={styles.ratingText}>
                    ⭐ {(isDriver ? booking.passenger.rating : booking.ride.driver.rating).toFixed(1)} rating
                  </Text>
                  <Text style={styles.ridesCount}>
                    • {isDriver ? booking.passenger.totalRides : booking.ride.driver.totalRides} rides
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={handleContactUser}
              >
                <MessageCircle size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Payment Information */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Payment Details</Text>
            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Price per seat:</Text>
                <Text style={styles.paymentValue}>{booking.ride.priceXAF} XAF</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Number of seats:</Text>
                <Text style={styles.paymentValue}>{booking.seats}</Text>
              </View>
              <View style={[styles.paymentRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>{booking.totalAmount} XAF</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>Payment Status:</Text>
                <Text style={[
                  styles.paymentValue,
                  { color: getPaymentStatusColor(booking.paymentStatus) }
                ]}>
                  {booking.paymentStatus.toUpperCase()}
                </Text>
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            {booking.status === 'confirmed' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleStartTracking}
              >
                <Navigation size={20} color="white" />
                <Text style={styles.primaryButtonText}>Track Live</Text>
              </TouchableOpacity>
            )}

            {isDriver && booking.status === 'pending' && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={handleConfirmBooking}
              >
                <Text style={styles.primaryButtonText}>Confirm Booking</Text>
              </TouchableOpacity>
            )}

            {booking.paymentStatus === 'pending' && !isDriver && (
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push({
                  pathname: '/payment',
                  params: { bookingId: booking.id }
                })}
              >
                <CreditCard size={20} color="white" />
                <Text style={styles.primaryButtonText}>Complete Payment</Text>
              </TouchableOpacity>
            )}

            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancelBooking}
              >
                <XCircle size={20} color="#f44336" />
                <Text style={styles.cancelButtonText}>Cancel Booking</Text>
              </TouchableOpacity>
            )}
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    gap: 16,
  },
  statusHeader: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
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
    marginBottom: 16,
  },
  routeInfo: {
    gap: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  routeLine: {
    width: 2,
    height: 24,
    backgroundColor: '#ddd',
    marginLeft: 5,
  },
  routeDetails: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  routeText: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  tripCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripDetails: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  priceLabel: {
    fontSize: 12,
    color: '#666',
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
    marginTop: 2,
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userDetails: {
    flex: 1,
    gap: 4,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  userPhone: {
    fontSize: 14,
    color: '#666',
  },
  userRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  ridesCount: {
    fontSize: 14,
    color: '#666',
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentDetails: {
    gap: 12,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentLabel: {
    fontSize: 14,
    color: '#666',
  },
  paymentValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  actionButtons: {
    gap: 12,
  },
  primaryButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#f44336',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#f44336',
  },
});