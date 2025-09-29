import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { useTheme } from "@/providers/theme-provider";
import * as Haptics from "expo-haptics";
import * as ExpoLocation from 'expo-location';
import { router } from "expo-router";
import { MapPin, Plus, Search } from "lucide-react-native";
import { useEffect, useRef, useState } from 'react';
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, Animated } from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE, Region } from "react-native-maps";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from 'expo-linear-gradient';

export default function HomeScreen() {
  const { user } = useAuth();
  const { rides, bookings } = useRides();
  const { colors, t } = useTheme();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const styles = createStyles(colors);

  const [region, setRegion] = useState<Region>({
    latitude: 4.0,
    longitude: 9.7,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const searchScale = useRef(new Animated.Value(1)).current;
  const offerScale = useRef(new Animated.Value(1)).current;
  
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

  const animatePress = (scale: Animated.Value) => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleQuickAction = (action: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }

    switch (action) {
      case 'create-ride':
        animatePress(offerScale);
        setTimeout(() => router.push('../create-ride' as any), 200);
        break;
      case 'search-rides':
        animatePress(searchScale);
        setTimeout(() => router.navigate('search' as any), 200);
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
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: colors.background }]}>
      <View style={[styles.mapContainer, { backgroundColor: colors.surface }]}>
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
                <MapPin size={24} color={colors.primary} fill="#fff" />
                <View style={[styles.markerBadge, { backgroundColor: colors.primary }]}>
                  <Text style={[styles.markerText, { color: '#fff' }]}>{ride.priceXAF} FCFA</Text>
                </View>
              </View>
            </Marker>
          ))}
        </MapView>

        <View style={styles.mapOverlay}>
          <View style={[styles.searchBar, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={20} color={colors.textSecondary} />
            <Text style={[styles.searchText, { color: colors.textSecondary }]}>{t('search')} {t('bookings').toLowerCase()}</Text>
          </View>
        </View>
      </View>
      
      <ScrollView showsVerticalScrollIndicator={false} style={[styles.content, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: colors.primary }]}>{t('hello')}, {user?.name?.split(' ')[0] || 'there'}!</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('whereAreYouHeaded')}</Text>
          </View>
          <LinearGradient
            colors={[colors.primary, colors.secondary]}
            style={styles.avatar}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.avatarText}>
              {user?.name?.charAt(0) || 'U'}
            </Text>
          </LinearGradient>
        </View>

        <View style={styles.quickActions}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('quickActions')}</Text>
          <View style={styles.actionGrid}>
            <TouchableOpacity onPress={() => handleQuickAction('search-rides')}>
              <Animated.View style={[styles.actionCard, { transform: [{ scale: searchScale }] }]}>
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  style={styles.actionCard}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <View style={styles.actionIcon}>
                    <Search size={20} color="#fff" />
                  </View>
                  <Text style={[styles.actionText, { color: '#fff' }]}>{t('findRides')}</Text>
                </LinearGradient>
              </Animated.View>
            </TouchableOpacity>

            {isDriver && (
              <TouchableOpacity onPress={() => handleQuickAction('create-ride')}>
                <Animated.View style={[styles.actionCard, { transform: [{ scale: offerScale }] }]}>
                  <LinearGradient
                    colors={[colors.secondary, colors.primary]}
                    style={styles.actionCard}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.actionIcon}>
                      <Plus size={20} color="#fff" />
                    </View>
                    <Text style={[styles.actionText, { color: '#fff' }]}>{t('offerRide')}</Text>
                  </LinearGradient>
                </Animated.View>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.recentActivity}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{t('yourUpcomingRides')}</Text>
          {userBookings.length > 0 ? (
            userBookings.map((booking, index) => (
              <View key={index} style={[styles.activityCard, { backgroundColor: colors.surface, shadowColor: colors.text }]}>
                <View style={[styles.activityIcon, { backgroundColor: colors.primary + '20' }]}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <View style={styles.activityContent}>
                  <Text style={[styles.activityTitle, { color: colors.text }]}>
                    {booking.ride.origin.name || booking.ride.origin.address} → {booking.ride.destination.name || booking.ride.destination.address}
                  </Text>
                  <Text style={[styles.activitySubtitle, { color: colors.textSecondary }]}>
                    {new Date(booking.ride.dateTime).toLocaleDateString()} at {new Date(booking.ride.dateTime).toLocaleTimeString()}
                  </Text>
                </View>
                <Text style={[styles.activityPrice, { color: colors.primary }]}>{booking.totalAmount} FCFA</Text>
              </View>
            ))
          ) : (
            <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
              <Text style={[styles.emptyText, { color: colors.text }]}>{t('noUpcomingRides')}</Text>
              <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>{t('searchForRides')}</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

// Create dynamic styles function
const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapContainer: {
    height: 250,
    width: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: colors.surface,
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
    backgroundColor: colors.surface,
    padding: 12,
    borderRadius: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchText: {
    marginLeft: 10,
    color: colors.textSecondary,
    fontSize: 16,
  },
  marker: {
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.background,
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
    color: colors.primary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
    color: colors.text,
    marginBottom: 16,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  actionCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: colors.text,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
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
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: colors.text,
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
    backgroundColor: colors.primary + '20',
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
    color: colors.text,
  },
  activitySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  activityPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  emptyState: {
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
    marginTop: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
});