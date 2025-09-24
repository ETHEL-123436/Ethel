import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import { Plus, Car, Users, Clock } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { router } from "expo-router";

export default function RidesScreen() {
  const { user } = useAuth();
  const { rides, bookings } = useRides();
  const insets = useSafeAreaInsets();
  
  const myRides = rides.filter(r => r.driverId === user?.id);
  const myBookings = bookings.filter(b => 
    myRides.some(ride => ride.id === b.rideId)
  );

  const totalEarnings = myBookings
    .filter(b => b.paymentStatus === 'paid')
    .reduce((sum, b) => sum + b.totalAmount, 0);

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>My Rides</Text>
        <TouchableOpacity
          style={styles.createButton}
          onPress={() => router.push('../create-ride' as any)}
        >
          <Plus size={20} color="white" />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myRides.length}</Text>
          <Text style={styles.statLabel}>Active Rides</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{myBookings.length}</Text>
          <Text style={styles.statLabel}>Total Bookings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{totalEarnings.toLocaleString()}</Text>
          <Text style={styles.statLabel}>Earnings (XAF)</Text>
        </View>
      </View>

      <ScrollView style={styles.ridesList} showsVerticalScrollIndicator={false}>
        {myRides.length > 0 ? (
          myRides.map((ride) => {
            const rideBookings = myBookings.filter(b => b.rideId === ride.id);
            
            return (
              <TouchableOpacity
                key={ride.id}
                style={styles.rideCard}
                onPress={() => router.push(`../ride-details?rideId=${ride.id}` as any)}
              >
                <View style={styles.rideHeader}>
                  <View style={styles.routeInfo}>
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#4CAF50' }]} />
                      <Text style={styles.routeText}>{ride.origin.address}</Text>
                    </View>
                    <View style={styles.routeLine} />
                    <View style={styles.routePoint}>
                      <View style={[styles.routeDot, { backgroundColor: '#f44336' }]} />
                      <Text style={styles.routeText}>{ride.destination.address}</Text>
                    </View>
                  </View>
                  <Text style={styles.price}>{ride.priceXAF} XAF</Text>
                </View>

                <View style={styles.rideDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(ride.dateTime).toLocaleDateString()} at{' '}
                      {new Date(ride.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Users size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {ride.seatsAvailable}/{ride.totalSeats} seats available
                    </Text>
                  </View>
                </View>

                {rideBookings.length > 0 && (
                  <View style={styles.bookingsInfo}>
                    <Text style={styles.bookingsText}>
                      {rideBookings.length} booking{rideBookings.length !== 1 ? 's' : ''}
                    </Text>
                    <View style={styles.bookingsList}>
                      {rideBookings.slice(0, 2).map((booking) => (
                        <View key={booking.id} style={styles.bookingItem}>
                          <Text style={styles.passengerName}>
                            {booking.passenger.name}
                          </Text>
                          <View style={styles.bookingStatus}>
                            <View style={[
                              styles.statusDot,
                              { backgroundColor: booking.status === 'confirmed' ? '#4CAF50' : '#ffc107' }
                            ]} />
                            <Text style={styles.statusText}>{booking.status}</Text>
                          </View>
                        </View>
                      ))}
                      {rideBookings.length > 2 && (
                        <Text style={styles.moreBookings}>
                          +{rideBookings.length - 2} more
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                <View style={[
                  styles.statusBadge,
                  { backgroundColor: ride.status === 'active' ? '#4CAF50' : '#999' }
                ]}>
                  <Text style={styles.statusBadgeText}>{ride.status}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyState}>
            <Car size={48} color="#ccc" />
            <Text style={styles.emptyText}>No rides created yet</Text>
            <Text style={styles.emptySubtext}>
              Create your first ride to start earning money
            </Text>
            <TouchableOpacity
              style={styles.createFirstRide}
              onPress={() => router.push('../create-ride' as any)}
            >
              <Text style={styles.createFirstRideText}>Create Your First Ride</Text>
            </TouchableOpacity>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  createButton: {
    backgroundColor: '#667eea',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stats: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#667eea',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  ridesList: {
    flex: 1,
    paddingHorizontal: 24,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  routeInfo: {
    flex: 1,
    marginRight: 16,
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
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  rideDetails: {
    gap: 8,
    marginBottom: 12,
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
  bookingsInfo: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginBottom: 8,
  },
  bookingsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  bookingsList: {
    gap: 4,
  },
  bookingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  passengerName: {
    fontSize: 14,
    color: '#333',
  },
  bookingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    textTransform: 'capitalize',
  },
  moreBookings: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
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
  createFirstRide: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  createFirstRideText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});