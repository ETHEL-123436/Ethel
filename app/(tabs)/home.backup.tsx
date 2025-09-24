import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Car, MapPin, Star, Plus, Search, Map as MapIcon } from "lucide-react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import * as ExpoLocation from 'expo-location';
import { useEffect, useState, useRef } from 'react';
import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function HomeScreen() {
  const { user } = useAuth();
  const { rides, bookings } = useRides();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  
  const [region, setRegion] = useState<Region>({
    latitude: 4.0,
    longitude: 9.7,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const isDriver = user?.role === 'driver';
  const userRides = isDriver ? rides.filter(r => r.driverId === user?.id) : [];
  const userBookings = bookings.filter(b => b.passengerId === user?.id);
  
  // Get user's current location when component mounts
  useEffect(() => {
    (async () => {
      try {
        let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission to access location was denied');
          return;
        }

        let location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High
        });

        const { latitude, longitude } = location.coords;
        setRegion(prev => ({
          ...prev,
          latitude,
          longitude,
        }));
      } catch (error) {
        console.error('Error getting location', error);
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.userName}>Where are you going today?</Text>
        </View>
      </View>
      
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {/* Show driver's rides if user is a driver */}
          {isDriver && userRides.map((ride, index) => (
            <Marker
              key={`ride-${index}`}
              coordinate={{
                latitude: ride.origin.latitude,
                longitude: ride.origin.longitude,
              }}
              title={`Ride to ${ride.destination.name || 'destination'}`}
              description={`Status: ${ride.status}`}
            />
          ))}
          
          {/* Show user's bookings if not a driver */}
          {!isDriver && userBookings.map((booking, index) => (
            <Marker
              key={`booking-${index}`}
              coordinate={{
                latitude: booking.ride.origin.latitude,
                longitude: booking.ride.origin.longitude,
              }}
              title={`Booking to ${booking.ride.destination.name}`}
              description={`Status: ${booking.status}`}
            />
          ))}
        </MapView>
      </View>
      
      <View style={[styles.footer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={() => router.push('/search')}
        >
          <Search size={20} color="#666" />
          <Text style={styles.searchButtonText}>Search destinations</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    flex: 1,
    width: '100%',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 16,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 4,
  },
  stats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  kycBanner: {
    backgroundColor: '#ffc107',
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginHorizontal: 16,
    marginTop: -12,
    borderRadius: 8,
    zIndex: 1,
  },
  kycText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  content: {
    padding: 24,
    gap: 32,
  },
  quickActions: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  recentActivity: {
    gap: 16,
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f0f4ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 4,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  searchButton: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchButtonText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#666',
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#667eea',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    gap: 8,
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
  },
  header: {
    paddingBottom: 24,
    paddingHorizontal: 24,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  greeting: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
  },
});