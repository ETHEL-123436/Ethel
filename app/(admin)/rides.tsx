import { useAdmin } from '@/providers/admin-provider';
import { Car, Clock, DollarSign, MapPin, Search, User } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function RidesScreen() {
  const { rides } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const insets = useSafeAreaInsets();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

  const filteredRides = rides.filter(ride => {
    const searchTerm = searchQuery.toLowerCase();
    const originAddress = ride.origin?.address?.toLowerCase() || '';
    const destinationAddress = ride.destination?.address?.toLowerCase() || '';
    
    const matchesSearch = 
      ride.driver?.name?.toLowerCase().includes(searchTerm) ||
      originAddress.includes(searchTerm) ||
      destinationAddress.includes(searchTerm);
      
    const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });
  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={[styles.header, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Rides Management</Text>
        <Text style={styles.subtitle}>Monitor all rides on the platform</Text>
      </View>

      {/* Search and Filters */}
      <View style={styles.searchSection}>
        <View style={styles.searchContainer}>
          <Search size={20} color="#666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search rides..."
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <View style={styles.filters}>
          <Text style={styles.filterLabel}>Status:</Text>
          <View style={styles.filterButtons}>
            {['all', 'active', 'completed', 'cancelled'].map((status) => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterButton,
                  selectedStatus === status && styles.filterButtonActive
                ]}
                onPress={() => setSelectedStatus(status as any)}
              >
                <Text style={[
                  styles.filterButtonText,
                  selectedStatus === status && styles.filterButtonTextActive
                ]}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      {/* Rides List */}
      <View style={styles.ridesList}>
        <Text style={styles.resultsCount}>
          {filteredRides.length} ride{filteredRides.length !== 1 ? 's' : ''} found
        </Text>

        {filteredRides.map((ride) => (
          <View key={ride.id} style={styles.rideCard}>
            <View style={styles.rideHeader}>
              <View style={styles.driverInfo}>
                <View style={styles.driverAvatar}>
                  <User size={20} color="#667eea" />
                </View>
                <View>
                  <Text style={styles.driverName}>{ride.driver.name}</Text>
                  <Text style={styles.rideId}>Ride #{ride.id.slice(-6)}</Text>
                </View>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(ride.status) }
              ]}>
                <Text style={styles.statusText}>{ride.status}</Text>
              </View>
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.locationRow}>
                <MapPin size={16} color="#4CAF50" />
                <Text style={styles.locationText}>{ride.origin.address}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.locationRow}>
                <MapPin size={16} color="#f44336" />
                <Text style={styles.locationText}>{ride.destination.address}</Text>
              </View>
            </View>

            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.detailText}>
                  {new Date(ride.dateTime).toLocaleDateString()} at {new Date(ride.dateTime).toLocaleTimeString()}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <DollarSign size={16} color="#666" />
                <Text style={styles.detailText}>{ride.priceXAF.toLocaleString()} XAF</Text>
              </View>
              <View style={styles.detailItem}>
                <Car size={16} color="#666" />
                <Text style={styles.detailText}>{ride.seatsAvailable}/{ride.totalSeats} seats available</Text>
              </View>
            </View>

            <View style={styles.rideStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ride.distance.toFixed(1)} km</Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{Math.round(ride.duration)} min</Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{ride.totalSeats - ride.seatsAvailable}</Text>
                <Text style={styles.statLabel}>Bookings</Text>
              </View>
            </View>

            <View style={styles.rideActions}>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>View Details</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionButton}>
                <Text style={styles.actionButtonText}>Track Live</Text>
              </TouchableOpacity>
              {ride.status === 'active' && (
                <TouchableOpacity style={[styles.actionButton, styles.cancelButton]}>
                  <Text style={[styles.actionButtonText, { color: '#f44336' }]}>Cancel Ride</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  filters: {
    gap: 8,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  filterButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  filterButtonActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  ridesList: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  driverAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  driverName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  rideId: {
    fontSize: 12,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
    textTransform: 'uppercase',
  },
  routeInfo: {
    marginBottom: 16,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 4,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#e0e0e0',
    marginLeft: 8,
    marginVertical: 4,
  },
  rideDetails: {
    gap: 8,
    marginBottom: 16,
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
  rideStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 16,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  rideActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#667eea',
    fontWeight: '500',
  },
  cancelButton: {
    backgroundColor: '#ffebee',
  },
});