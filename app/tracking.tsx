import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert } from "react-native";
import { Stack, useLocalSearchParams, router } from "expo-router";
import { MapPin, Navigation, Phone, MessageCircle, Clock, User } from "lucide-react-native";
import { useRides } from "@/providers/ride-provider";
import { useAuth } from "@/providers/auth-provider";

export default function TrackingScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings } = useRides();
  const { user } = useAuth();
  const [driverLocation, setDriverLocation] = useState({
    latitude: 3.8480,
    longitude: 11.5021,
    address: 'Bastos, Yaoundé'
  });
  const [estimatedArrival, setEstimatedArrival] = useState(15); // minutes
  
  const booking = bookings.find(b => b.id === bookingId);
  const isDriver = user?.id === booking?.ride.driverId;

  useEffect(() => {
    if (!booking) {
      Alert.alert('Error', 'Booking not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
      return;
    }

    // Simulate real-time location updates
    const interval = setInterval(() => {
      setDriverLocation(prev => ({
        ...prev,
        latitude: prev.latitude + (Math.random() - 0.5) * 0.001,
        longitude: prev.longitude + (Math.random() - 0.5) * 0.001,
      }));
      
      setEstimatedArrival(prev => Math.max(1, prev - Math.random() * 2));
    }, 5000);

    return () => clearInterval(interval);
  }, [booking]);

  const handleContact = (type: 'call' | 'message') => {
    if (!booking) return;
    
    const contactUser = isDriver ? booking.passenger : booking.ride.driver;
    
    if (type === 'message') {
      router.push({
        pathname: '/chat',
        params: {
          userId: contactUser.id,
          userName: contactUser.name
        }
      });
    } else {
      Alert.alert('Call', `Call ${contactUser.name}?`, [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => {
          // In a real app, this would initiate a phone call
          Alert.alert('Calling...', `Calling ${contactUser.name}`);
        }}
      ]);
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
      <Stack.Screen options={{ title: "Live Tracking" }} />
      <View style={styles.container}>
        {/* Map Placeholder */}
        <View style={styles.mapContainer}>
          <View style={styles.mapPlaceholder}>
            <MapPin size={48} color="#667eea" />
            <Text style={styles.mapText}>Live Map View</Text>
            <Text style={styles.mapSubtext}>
              {isDriver ? 'Share your location with passengers' : 'Track your driver in real-time'}
            </Text>
          </View>
          
          {/* Current Location Indicator */}
          <View style={styles.locationIndicator}>
            <View style={styles.locationDot} />
            <Text style={styles.locationText}>{driverLocation.address}</Text>
          </View>
        </View>

        {/* Trip Information */}
        <View style={styles.tripInfo}>
          <View style={styles.tripHeader}>
            <Text style={styles.tripTitle}>
              {isDriver ? 'Your Active Ride' : 'Your Ride'}
            </Text>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>IN PROGRESS</Text>
            </View>
          </View>

          <View style={styles.routeInfo}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
              <Text style={styles.routeText}>{booking.ride.origin.address}</Text>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, { backgroundColor: '#f44336' }]} />
              <Text style={styles.routeText}>{booking.ride.destination.address}</Text>
            </View>
          </View>

          <View style={styles.estimatedArrival}>
            <Clock size={20} color="#667eea" />
            <Text style={styles.arrivalText}>
              Estimated arrival: {Math.round(estimatedArrival)} minutes
            </Text>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.contactCard}>
          <View style={styles.contactHeader}>
            <View style={styles.contactInfo}>
              <View style={styles.avatar}>
                <User size={24} color="#667eea" />
              </View>
              <View style={styles.contactDetails}>
                <Text style={styles.contactName}>
                  {isDriver ? booking.passenger.name : booking.ride.driver.name}
                </Text>
                <Text style={styles.contactRole}>
                  {isDriver ? 'Passenger' : 'Driver'}
                </Text>
              </View>
            </View>
            
            <View style={styles.contactActions}>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('message')}
              >
                <MessageCircle size={20} color="#667eea" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.contactButton}
                onPress={() => handleContact('call')}
              >
                <Phone size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Trip Details */}
        <View style={styles.tripDetails}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Booking ID:</Text>
            <Text style={styles.detailValue}>{booking.id.slice(-8).toUpperCase()}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Seats:</Text>
            <Text style={styles.detailValue}>{booking.seats}</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Total Amount:</Text>
            <Text style={styles.detailValue}>{booking.totalAmount} XAF</Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Payment Status:</Text>
            <Text style={[
              styles.detailValue,
              { color: booking.paymentStatus === 'paid' ? '#4CAF50' : '#ffc107' }
            ]}>
              {booking.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          {isDriver ? (
            <TouchableOpacity style={styles.primaryButton}>
              <Navigation size={20} color="white" />
              <Text style={styles.primaryButtonText}>Share Location</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.primaryButton}>
              <MapPin size={20} color="white" />
              <Text style={styles.primaryButtonText}>Get Directions</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
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
  mapContainer: {
    height: 300,
    backgroundColor: '#e8f4f8',
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  mapText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  locationIndicator: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  tripInfo: {
    backgroundColor: 'white',
    margin: 16,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  statusBadge: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  routeInfo: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#ddd',
    marginLeft: 3,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  estimatedArrival: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  arrivalText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667eea',
  },
  contactCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  contactHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contactDetails: {
    gap: 2,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  contactRole: {
    fontSize: 14,
    color: '#666',
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  contactButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tripDetails: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  actionButtons: {
    paddingHorizontal: 16,
    paddingBottom: 16,
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
});