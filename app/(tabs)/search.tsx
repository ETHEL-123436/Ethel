import { useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView } from "react-native";
import { Calendar, MapPin, Users, Clock, Star } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRides } from "@/providers/ride-provider";
import { router } from "expo-router";
import { Ride, Location } from "@/types";

export default function SearchScreen() {
  const { searchRides, isLoading } = useRides();
  const insets = useSafeAreaInsets();
  const [searchResults, setSearchResults] = useState<Ride[]>([]);
  const [searchForm, setSearchForm] = useState({
    origin: '',
    destination: '',
    date: new Date().toISOString().split('T')[0]
  });

  const handleSearch = async () => {
    if (!searchForm.origin || !searchForm.destination) {
      return;
    }

    try {
      // Mock location data - in real app, you'd use geocoding
      const originLocation: Location = {
        latitude: 3.8480,
        longitude: 11.5021,
        address: searchForm.origin
      };

      const destinationLocation: Location = {
        latitude: 4.0511,
        longitude: 9.7679,
        address: searchForm.destination
      };

      const results = await searchRides(originLocation, destinationLocation, searchForm.date);
      setSearchResults(results);
    } catch {
      // Handle error silently
    }
  };

  const handleBookRide = (ride: Ride) => {
    router.push(`../ride-details?rideId=${ride.id}&fromSearch=true` as any);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.searchForm, { paddingTop: insets.top + 20 }]}>
        <Text style={styles.title}>Find Your Ride</Text>
        
        <View style={styles.inputGroup}>
          <View style={styles.inputIcon}>
            <MapPin size={20} color="#667eea" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="From (e.g., Bastos, Yaoundé)"
            value={searchForm.origin}
            onChangeText={(text) => setSearchForm(prev => ({ ...prev, origin: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputIcon}>
            <MapPin size={20} color="#667eea" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="To (e.g., Bonanjo, Douala)"
            value={searchForm.destination}
            onChangeText={(text) => setSearchForm(prev => ({ ...prev, destination: text }))}
          />
        </View>

        <View style={styles.inputGroup}>
          <View style={styles.inputIcon}>
            <Calendar size={20} color="#667eea" />
          </View>
          <TextInput
            style={styles.input}
            placeholder="Date (YYYY-MM-DD)"
            value={searchForm.date}
            onChangeText={(text) => setSearchForm(prev => ({ ...prev, date: text }))}
          />
        </View>

        <TouchableOpacity
          style={[styles.searchButton, isLoading && styles.disabledButton]}
          onPress={handleSearch}
          disabled={isLoading}
        >
          <Text style={styles.searchButtonText}>
            {isLoading ? 'Searching...' : 'Search Rides'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.results} showsVerticalScrollIndicator={false}>
        {searchResults.length > 0 ? (
          <>
            <Text style={styles.resultsTitle}>
              {searchResults.length} ride{searchResults.length !== 1 ? 's' : ''} found
            </Text>
            {searchResults.map((ride) => (
              <TouchableOpacity
                key={ride.id}
                style={styles.rideCard}
                onPress={() => handleBookRide(ride)}
              >
                <View style={styles.rideHeader}>
                  <View style={styles.driverInfo}>
                    <Text style={styles.driverName}>{ride.driver.name}</Text>
                    <View style={styles.rating}>
                      <Star size={14} color="#ffc107" fill="#ffc107" />
                      <Text style={styles.ratingText}>{ride.driver.rating.toFixed(1)}</Text>
                    </View>
                  </View>
                  <Text style={styles.price}>{ride.priceXAF} XAF</Text>
                </View>

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

                <View style={styles.rideDetails}>
                  <View style={styles.detailItem}>
                    <Clock size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {new Date(ride.dateTime).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Users size={16} color="#666" />
                    <Text style={styles.detailText}>
                      {ride.seatsAvailable} seat{ride.seatsAvailable !== 1 ? 's' : ''} available
                    </Text>
                  </View>
                </View>

                {ride.driver.vehicleInfo && (
                  <Text style={styles.vehicleInfo}>
                    {ride.driver.vehicleInfo.color} {ride.driver.vehicleInfo.make} {ride.driver.vehicleInfo.model} • {ride.driver.vehicleInfo.plateNumber}
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </>
        ) : searchResults.length === 0 && !isLoading && searchForm.origin && searchForm.destination ? (
          <View style={styles.emptyState}>
            <MapPin size={48} color="#ccc" />
            <Text style={styles.emptyText}>No rides found</Text>
            <Text style={styles.emptySubtext}>
              Try adjusting your search criteria or check back later
            </Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  searchForm: {
    backgroundColor: 'white',
    padding: 24,
    paddingTop: 60,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  inputGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#667eea',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  searchButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  results: {
    flex: 1,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
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
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  driverName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
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
  rideDetails: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  vehicleInfo: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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