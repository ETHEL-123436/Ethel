import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import * as Haptics from "expo-haptics";
import * as ExpoLocation from 'expo-location';
import { router } from "expo-router";
import { MapPin, Plus, Search } from "lucide-react-native";
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
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
  const userBookings = bookings.filter(b => b.passenger?.id === user?.id || b.passengerId === user?.id);
  
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

  const handleQuickAction = (action: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    
    switch (action) {
      case 'create-ride':
        router.push('../create-ride' as any);
        break;
      case 'search-rides':
        router.navigate('search' as any);
        break;
      case 'my-rides':
        router.navigate('my-rides' as any);
        break;
      case 'history':
        router.navigate('history' as any);
        break;
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          showsUserLocation={true}
          showsMyLocationButton={true}
        >
          {rides.map((ride, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: ride.origin.latitude || 0,
                longitude: ride.origin.longitude || 0,
              }}
              title={`To: ${ride.destination.address || ride.destination.name || 'Unknown destination'}`}
              description={`${ride.seatsAvailable} seats available`}
            >
              <View style={styles.marker}>
                <MapPin size={24} color="#3b82f6" fill="#fff" />
                <View style={styles.markerBadge}>
                  <Text style={styles.markerText}>{ride.priceXAF} FCFA</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>
        
        <View style={styles.mapOverlay}>
          <View style={styles.searchBar}>
            <Search size={20} color="#666" />
            <Text style={styles.searchText}>Search for a destination</Text>
          </View>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {user?.name?.split(' ')[0] || 'there'}!</Text>
            <Text style={styles.subtitle}>Where are you headed today?</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
        </View>

        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity 
              style={styles.actionCard}
              onPress={() => handleQuickAction('search-rides')}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#e0f2fe' }]}>
                <Search size={20} color="#0369a1" />
              </View>
              <Text style={styles.actionText}>Find Rides</Text>
            </TouchableOpacity>
            
            {isDriver && (
              <TouchableOpacity 
                style={styles.actionCard}
                onPress={() => handleQuickAction('create-ride')}
              >
                <View style={[styles.actionIcon, { backgroundColor: '#e0f7fa' }]}>
                  <Plus size={20} color="#0d9488" />
                </View>
                <Text style={styles.actionText}>Offer Ride</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={styles.sectionTitle}>Your Upcoming Rides</Text>
          {userBookings.length > 0 ? (
            userBookings.map((booking, index) => (
              <View key={index} style={styles.activityCard}>
                <View style={styles.activityIcon}>
                  <MapPin size={20} color="#3b82f6" />
                </View>
                <View style={styles.activityContent}>
                  <Text style={styles.activityTitle}>
                    {booking.ride.origin.name || booking.ride.origin.address} → {booking.ride.destination.name || booking.ride.destination.address}
                  </Text>
                  <Text style={styles.activitySubtitle}>
                    {new Date(booking.ride.dateTime).toLocaleDateString()} at {new Date(booking.ride.dateTime).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={styles.activityPrice}>{booking.totalAmount} FCFA</Text>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No upcoming rides</Text>
              <Text style={styles.emptySubtext}>Search for rides to get started</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 20,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchText: {
    marginLeft: 10,
    color: '#666',
    fontSize: 16,
  },
  marker: {
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 4,
  },
  markerText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  quickActions: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    textAlign: 'center',
  },
  recentActivity: {
    marginBottom: 24,
  },
  activityCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
    marginBottom: 12,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e0f2fe',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityContent: {
    flex: 1,
    gap: 2,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  activitySubtitle: {
    fontSize: 14,
    color: '#6b7280',
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3b82f6',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4b5563',
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
  },
});