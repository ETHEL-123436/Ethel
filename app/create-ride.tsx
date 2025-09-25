import { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  ActivityIndicator
} from "react-native";
import { Stack, router } from "expo-router";
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Users, 
  DollarSign
} from "lucide-react-native";
import MapView, { 
  Marker, 
  PROVIDER_GOOGLE, 
  Region, 
  MapPressEvent 
} from "react-native-maps";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as ExpoLocation from 'expo-location';
import { useAuth } from "@/providers/auth-provider";
import { useRides } from "@/providers/ride-provider";
import { Location as LocationType } from "@/types";

interface RideFormData {
  origin: string;
  originCoords: { latitude: number; longitude: number };
  destination: string;
  destinationCoords: { latitude: number; longitude: number };
  date: string;
  time: string;
  seats: string;
  price: string;
}

const INITIAL_FORM_STATE: RideFormData = {
  origin: '',
  originCoords: { latitude: 0, longitude: 0 },
  destination: '',
  destinationCoords: { latitude: 0, longitude: 0 },
  date: new Date().toISOString().split('T')[0],
  time: '08:00',
  seats: '4',
  price: ''
};

export default function CreateRideScreen() {
  const { user } = useAuth();
  const { createRide, isLoading } = useRides();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [rideForm, setRideForm] = useState<RideFormData>(INITIAL_FORM_STATE);
  
  const selectedDate = new Date(`${rideForm.date}T${rideForm.time}`);
  
  const [region, setRegion] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  
  const mapRef = useRef<MapView>(null);
  
  // Check if user is a driver - only drivers can create rides
  if (user?.role !== 'driver') {
    return (
      <>
        <Stack.Screen options={{ title: "Access Denied" }} />
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedTitle}>Access Restricted</Text>
          <Text style={styles.accessDeniedMessage}>
            Only drivers can create and offer rides. Please register as a driver to access this feature.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }
  
  // Get user's current location when component mounts
  useEffect(() => {
    (async () => {
      try {
        let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert('Permission to access location was denied');
          return;
        }

        let location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.High
        });

        const { latitude, longitude } = location.coords;
        setRegion({
          latitude,
          longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      } catch (error) {
        console.error('Error getting location', error);
        Alert.alert('Error', 'Could not get your location');
      }
    })();
  }, []);

  const validateForm = (): { isValid: boolean; message?: string } => {
    if (!rideForm.origin || !rideForm.destination) {
      return { isValid: false, message: 'Please enter both origin and destination' };
    }

    if (rideForm.originCoords.latitude === 0 || rideForm.originCoords.longitude === 0) {
      return { isValid: false, message: 'Please select a valid origin on the map' };
    }

    if (rideForm.destinationCoords.latitude === 0 || rideForm.destinationCoords.longitude === 0) {
      return { isValid: false, message: 'Please select a valid destination on the map' };
    }

    const price = parseFloat(rideForm.price);
    if (isNaN(price) || price <= 0) {
      return { isValid: false, message: 'Please enter a valid price' };
    }

    const seats = parseInt(rideForm.seats);
    if (isNaN(seats) || seats <= 0) {
      return { isValid: false, message: 'Please enter a valid number of seats' };
    }

    return { isValid: true };
  };

  const handleCreateRide = async () => {
    const { isValid, message } = validateForm();
    if (!isValid) {
      Alert.alert('Validation Error', message || 'Please check your input');
      return;
    }

    if (!user) {
      Alert.alert('Authentication Error', 'Please log in to create a ride');
      return;
    }

    // Check if driver has completed KYC verification
    if (user.kycStatus !== 'approved') {
      Alert.alert(
        'Verification Required',
        'Please complete your KYC verification before creating a ride.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Verify Now', 
            onPress: () => router.push('/kyc-upload')
          }
        ]
      );
      return;
    }

    try {
      setIsSubmitting(true);
      
      // Use the actual coordinates from the map selection
      const originLocation: LocationType = {
        latitude: rideForm.originCoords.latitude,
        longitude: rideForm.originCoords.longitude,
        address: rideForm.origin
      };

      const destinationLocation: LocationType = {
        latitude: rideForm.destinationCoords.latitude,
        longitude: rideForm.destinationCoords.longitude,
        address: rideForm.destination
      };

      const dateTime = new Date(`${rideForm.date}T${rideForm.time}`).toISOString();

      await createRide({
        driverId: user.id,
        driver: user,
        origin: originLocation,
        destination: destinationLocation,
        priceXAF: parseFloat(rideForm.price),
        dateTime,
        seatsAvailable: parseInt(rideForm.seats),
        totalSeats: parseInt(rideForm.seats),
        distance: 0, // Will be calculated on the server
        duration: 0  // Will be calculated on the server
      });

      Alert.alert('Success', 'Ride created successfully!', [
        { 
          text: 'OK', 
          onPress: () => {
            // Reset form and navigate back
            setRideForm({
              origin: '',
              originCoords: { latitude: 0, longitude: 0 },
              destination: '',
              destinationCoords: { latitude: 0, longitude: 0 },
              date: new Date().toISOString().split('T')[0],
              time: '08:00',
              seats: '4',
              price: ''
            });
            router.back();
          }
        }
      ]);
    } catch (error: any) {
      console.error('Create ride error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create ride. Please try again.';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ... rest of the component remains the same ...
  
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      setRideForm(prev => ({
        ...prev,
        date: formattedDate
      }));
    }
  };

  const handleTimeChange = (event: any, selectedTime?: Date) => {
    setShowTimePicker(false);
    if (selectedTime) {
      const formattedTime = `${String(selectedTime.getHours()).padStart(2, '0')}:${String(selectedTime.getMinutes()).padStart(2, '0')}`;
      setRideForm(prev => ({
        ...prev,
        time: formattedTime
      }));
    }
  };

  const handleMapPress = (e: MapPressEvent) => {
    const { coordinate } = e.nativeEvent;
    if (rideForm.origin === '') {
      setRideForm(prev => ({
        ...prev,
        origin: 'Selected Location',
        originCoords: coordinate
      }));
    } else if (rideForm.destination === '') {
      setRideForm(prev => ({
        ...prev,
        destination: 'Selected Destination',
        destinationCoords: coordinate
      }));
    }
  };

  return (
    <>
      <Stack.Screen options={{ title: "Create New Ride" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.mapContainer}>
            <MapView
              ref={mapRef}
              style={styles.map}
              provider={PROVIDER_GOOGLE}
              region={region}
              onPress={handleMapPress}
              showsUserLocation={true}
              showsMyLocationButton={true}
            >
              {rideForm.originCoords.latitude !== 0 && (
                <Marker
                  coordinate={rideForm.originCoords}
                  title="Pickup Location"
                  pinColor="#4CAF50"
                />
              )}
              {rideForm.destinationCoords.latitude !== 0 && (
                <Marker
                  coordinate={rideForm.destinationCoords}
                  title="Drop-off Location"
                  pinColor="#F44336"
                />
              )}
            </MapView>
            <View style={styles.mapOverlay}>
              <Text style={styles.mapOverlayText}>
                {rideForm.origin === '' ? 'Tap to set pickup location' : 
                 rideForm.destination === '' ? 'Tap to set drop-off location' :
                 'Tap and hold to adjust locations'}
              </Text>
            </View>
          </View>
          <Text style={styles.title}>Create a New Ride</Text>
          <Text style={styles.subtitle}>
            Share your journey and earn money by offering rides to passengers
          </Text>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>From *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Bastos, Yaoundé"
                  value={rideForm.origin}
                  onChangeText={(text) => setRideForm(prev => ({ ...prev, origin: text }))}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>To *</Text>
              <View style={styles.inputContainer}>
                <MapPin size={20} color="#667eea" />
                <TextInput
                  style={styles.input}
                  placeholder="e.g., Bonanjo, Douala"
                  value={rideForm.destination}
                  onChangeText={(text) => setRideForm(prev => ({ ...prev, destination: text }))}
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Date *</Text>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowDatePicker(true)}
                  accessibilityLabel="Select date"
                >
                  <Calendar size={20} color="#667eea" />
                  <Text style={[styles.input, { paddingLeft: 12 }]}>
                    {rideForm.date}
                  </Text>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display="default"
                    minimumDate={new Date()}
                    onChange={handleDateChange}
                  />
                )}
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Time *</Text>
                <TouchableOpacity 
                  style={styles.inputContainer}
                  onPress={() => setShowTimePicker(true)}
                  accessibilityLabel="Select time"
                >
                  <Clock size={20} color="#667eea" />
                  <Text style={[styles.input, { paddingLeft: 12 }]}>
                    {rideForm.time}
                  </Text>
                </TouchableOpacity>
                {showTimePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="time"
                    display="default"
                    onChange={handleTimeChange}
                  />
                )}
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Available Seats *</Text>
                <View style={styles.inputContainer}>
                  <Users size={20} color="#667eea" />
                  <TextInput
                    style={styles.input}
                    placeholder="4"
                    value={rideForm.seats}
                    onChangeText={(text) => setRideForm(prev => ({ ...prev, seats: text.replace(/[^0-9]/g, '') }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Price per Seat (XAF) *</Text>
                <View style={styles.inputContainer}>
                  <DollarSign size={20} color="#667eea" />
                  <TextInput
                    style={styles.input}
                    placeholder="8500"
                    value={rideForm.price}
                    onChangeText={(text) => setRideForm(prev => ({ ...prev, price: text.replace(/[^0-9]/g, '') }))}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>
          </View>

          <View style={styles.summary}>
            <Text style={styles.summaryTitle}>Ride Summary</Text>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Route:</Text>
              <Text style={styles.summaryValue}>
                {rideForm.origin || 'Origin'} → {rideForm.destination || 'Destination'}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Date & Time:</Text>
              <Text style={styles.summaryValue}>
                {rideForm.date} at {rideForm.time}
              </Text>
            </View>
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Total Earnings:</Text>
              <Text style={styles.summaryValue}>
                {rideForm.price && rideForm.seats 
                  ? `${parseInt(rideForm.price) * parseInt(rideForm.seats)} XAF`
                  : '0 XAF'
                } (if all seats booked)
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[
              styles.createButton, 
              (isLoading || isSubmitting) && styles.disabledButton
            ]}
            onPress={handleCreateRide}
            disabled={isLoading || isSubmitting}
            accessibilityRole="button"
            accessibilityState={{ disabled: isLoading || isSubmitting }}
          >
            {isLoading || isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.createButtonText}>Create Ride</Text>
            )}
          </TouchableOpacity>
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
  mapContainer: {
    height: 250,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  mapOverlay: {
    position: 'absolute',
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  mapOverlayText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    height: 48,
    paddingLeft: 12,
    color: '#111827',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  summary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  summaryItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  summaryLabel: {
    width: 120,
    fontSize: 14,
    color: '#6b7280',
  },
  summaryValue: {
    flex: 1,
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  createButton: {
    backgroundColor: '#4f46e5',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f8f9fa',
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
    textAlign: 'center',
  },
  accessDeniedMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  backButton: {
    backgroundColor: '#667eea',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
