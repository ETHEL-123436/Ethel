import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, Car, MapPin, Clock, User, DollarSign } from 'lucide-react-native';
import { useAdmin } from '@/providers/admin-provider';

export default function AdminRides() {
  const insets = useSafeAreaInsets();
  const { rides } = useAdmin();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'completed' | 'cancelled'>('all');

  const filteredRides = rides.filter(ride => {
    const searchTerm = searchQuery.toLowerCase();
    const originAddress = ride.origin?.address?.toLowerCase() || '';
    const destinationAddress = ride.destination?.address?.toLowerCase() || '';
    
    const matchesSearch = 
      (ride.driver?.name?.toLowerCase() || '').includes(searchTerm) ||
      originAddress.includes(searchTerm) ||
      destinationAddress.includes(searchTerm);
      
    const matchesStatus = selectedStatus === 'all' || ride.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#f44336';
      default: return '#999';
    }
  };

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
                  <Text style={styles.driverName}>{ride.driver?.name || 'Unknown Driver'}</Text>
                  <Text style={styles.rideId}>Ride #{ride.id?.slice(-6) || ''}</Text>
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
                <Text style={styles.locationText}>
                  {ride.origin?.address || 'No origin address'}
                </Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.locationRow}>
                <MapPin size={16} color="#f44336" />
                <Text style={styles.locationText}>
                  {ride.destination?.address || 'No destination address'}
                </Text>
              </View>
            </View>

            <View style={styles.rideDetails}>
              <View style={styles.detailItem}>
                <Clock size={16} color="#666" />
                <Text style={styles.detailText}>
                  {ride.dateTime 
                    ? `${new Date(ride.dateTime).toLocaleDateString()} at ${new Date(ride.dateTime).toLocaleTimeString()}`
                    : 'No date/time'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <DollarSign size={16} color="#666" />
                <Text style={styles.detailText}>
                  {ride.priceXAF ? `${ride.priceXAF.toLocaleString()} XAF` : 'Price not set'}
                </Text>
              </View>
              <View style={styles.detailItem}>
                <Car size={16} color="#666" />
                <Text style={styles.detailText}>
                  {ride.seatsAvailable !== undefined && ride.totalSeats !== undefined
                    ? `${ride.seatsAvailable}/${ride.totalSeats} seats available`
                    : 'Seat information not available'}
                </Text>
              </View>
            </View>

            <View style={styles.rideStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {ride.distance ? `${ride.distance.toFixed(1)} km` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Distance</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {ride.duration ? `${Math.round(ride.duration)} min` : 'N/A'}
                </Text>
                <Text style={styles.statLabel}>Duration</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {ride.totalSeats !== undefined && ride.seatsAvailable !== undefined
                    ? ride.totalSeats - ride.seatsAvailable
                    : 'N/A'}
                </Text>
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
  },
  filterButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  ridesList: {
    padding: 16,
    gap: 16,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  rideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 12,
  },
  rideHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
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
    fontWeight: '600',
    color: '#333',
  },
  rideId: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: 'white',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  routeInfo: {
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#333',
  },
  routeLine: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
    marginLeft: 12,
    width: '90%',
  },
  rideDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    minWidth: '48%',
  },
  detailText: {
    fontSize: 13,
    color: '#666',
  },
  rideStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f7ff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  rideActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: '#f0f4ff',
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    color: '#667eea',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButton: {
    backgroundColor: '#fff0f0',
  },
});
