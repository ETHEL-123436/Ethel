import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { MapPin, Clock, User, CreditCard, MessageCircle } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { router } from "expo-router";

export default function BookingsScreen() {
  const { user } = useAuth();
  const { bookings, rides } = useRides();
  const insets = useSafeAreaInsets();
  
  const isDriver = user?.role === 'driver';
  
  // For drivers: bookings for their rides
  // For passengers: their own bookings
  const userBookings = isDriver 
    ? bookings.filter(b => rides.some(r => r.id === b.rideId && r.driverId === user?.id))
    : bookings.filter(b => b.passengerId === user?.id);

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

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>
          {isDriver ? 'Ride Bookings' : 'My Bookings'}
        </Text>
      </View>

      <ScrollView style={styles.bookingsList} showsVerticalScrollIndicator={false}>
        {userBookings.length > 0 ? (
          userBookings.map((booking) => (
            <TouchableOpacity
              key={booking.id}
              style={styles.bookingCard}
              onPress={() => router.push(`../booking-details?bookingId=${booking.id}` as any)}
            >
              <View style={styles.bookingHeader}>
                <View style={styles.userInfo}>
                  <User size={20} color="#667eea" />
                  <Text style={styles.userName}>
                    {isDriver ? booking.passenger.name : booking.ride.driver.name}
                  </Text>
                </View>
                <View style={styles.statusBadges}>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(booking.status) }
                  ]}>
                    <Text style={styles.statusText}>{booking.status}</Text>
                  </View>
                  <View style={[
                    styles.statusBadge,
                    { backgroundColor: getPaymentStatusColor(booking.paymentStatus) }
                  ]}>
                    <Text style={styles.statusText}>{booking.paymentStatus}</Text>
                  </View>
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

              <View style={styles.bookingDetails}>
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(booking.ride.dateTime).toLocaleDateString()} at{' '}
                      {new Date(booking.ride.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                </View>
                
                <View style={styles.detailRow}>
                  <View style={styles.detailItem}>
                    <MapPin size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {booking.seats} seat{booking.seats !== 1 ? 's' : ''}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <CreditCard size={16} color="#666" />
                    <Text style={styles.detailText}>{booking.totalAmount} XAF</Text>
                  </View>
                </View>
              </View>

              <View style={styles.bookingActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => router.push(`../chat?userId=${isDriver ? booking.passengerId : booking.ride.driverId}&userName=${encodeURIComponent(isDriver ? booking.passenger.name : booking.ride.driver.name)}` as any)}
                >
                  <MessageCircle size={16} color="#667eea" />
                  <Text style={styles.actionText}>Chat</Text>
                </TouchableOpacity>

                {booking.status === 'confirmed' && (
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => router.push(`../tracking?bookingId=${booking.id}` as any)}
                  >
                    <MapPin size={16} color="#667eea" />
                    <Text style={styles.actionText}>Track</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#ccc" />
            <Text style={styles.emptyText}>
              {isDriver ? 'No bookings yet' : 'No bookings yet'}
            </Text>
            <Text style={styles.emptySubtext}>
              {isDriver 
                ? 'Bookings for your rides will appear here'
                : 'Your ride bookings will appear here'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: 'white',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  bookingsList: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  bookingCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  statusBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  routeInfo: {
    marginBottom: 12,
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
  bookingDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  bookingActions: {
    flexDirection: 'row',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#667eea',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});