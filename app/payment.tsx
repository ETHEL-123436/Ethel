import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from "react-native";
import { Stack, router, useLocalSearchParams } from "expo-router";
import { CreditCard, Smartphone, CheckCircle } from "lucide-react-native";
import { useRides } from "@/providers/ride-provider";

export default function PaymentScreen() {
  const { bookingId } = useLocalSearchParams<{ bookingId: string }>();
  const { bookings, updatePaymentStatus } = useRides();
  const [selectedMethod, setSelectedMethod] = useState<'mtn_momo' | 'orange_money'>('mtn_momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const booking = bookings.find(b => b.id === bookingId);

  useEffect(() => {
    if (!booking) {
      Alert.alert('Error', 'Booking not found', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [booking]);

  const handlePayment = async () => {
    if (!booking) return;

    setIsProcessing(true);
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate payment success (90% success rate)
      const isSuccess = Math.random() > 0.1;
      
      if (isSuccess) {
        await updatePaymentStatus(booking.id, 'paid');
        
        Alert.alert(
          'Payment Successful!',
          `Your payment of ${booking.totalAmount} XAF has been processed successfully.`,
          [
            { 
              text: 'OK', 
              onPress: () => {
                router.replace({
                  pathname: '/booking-details',
                  params: { bookingId: booking.id }
                });
              }
            }
          ]
        );
      } else {
        await updatePaymentStatus(booking.id, 'failed');
        Alert.alert('Payment Failed', 'Please try again or use a different payment method.');
      }
    } catch (error) {
      Alert.alert('Error', 'Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
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
      <Stack.Screen options={{ title: "Payment" }} />
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {/* Booking Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.cardTitle}>Booking Summary</Text>
            <View style={styles.summaryDetails}>
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
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Date & Time:</Text>
                <Text style={styles.summaryValue}>
                  {new Date(booking.ride.dateTime).toLocaleDateString()} at{' '}
                  {new Date(booking.ride.dateTime).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Seats:</Text>
                <Text style={styles.summaryValue}>{booking.seats}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Price per seat:</Text>
                <Text style={styles.summaryValue}>{booking.ride.priceXAF} XAF</Text>
              </View>
              
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total Amount:</Text>
                <Text style={styles.totalValue}>{booking.totalAmount} XAF</Text>
              </View>
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.paymentCard}>
            <Text style={styles.cardTitle}>Select Payment Method</Text>
            
            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'mtn_momo' && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod('mtn_momo')}
            >
              <View style={styles.methodInfo}>
                <View style={[styles.methodIcon, { backgroundColor: '#FFCC00' }]}>
                  <Smartphone size={24} color="#333" />
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>MTN Mobile Money</Text>
                  <Text style={styles.methodDescription}>Pay with your MTN MoMo account</Text>
                </View>
              </View>
              {selectedMethod === 'mtn_momo' && (
                <CheckCircle size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.paymentMethod,
                selectedMethod === 'orange_money' && styles.selectedMethod
              ]}
              onPress={() => setSelectedMethod('orange_money')}
            >
              <View style={styles.methodInfo}>
                <View style={[styles.methodIcon, { backgroundColor: '#FF6600' }]}>
                  <Smartphone size={24} color="white" />
                </View>
                <View style={styles.methodDetails}>
                  <Text style={styles.methodName}>Orange Money</Text>
                  <Text style={styles.methodDescription}>Pay with your Orange Money account</Text>
                </View>
              </View>
              {selectedMethod === 'orange_money' && (
                <CheckCircle size={24} color="#4CAF50" />
              )}
            </TouchableOpacity>
          </View>

          {/* Payment Instructions */}
          <View style={styles.instructionsCard}>
            <Text style={styles.cardTitle}>Payment Instructions</Text>
            <View style={styles.instructions}>
              <Text style={styles.instructionStep}>1. Click "Pay Now" below</Text>
              <Text style={styles.instructionStep}>
                2. You will receive a payment prompt on your phone
              </Text>
              <Text style={styles.instructionStep}>
                3. Enter your {selectedMethod === 'mtn_momo' ? 'MTN MoMo' : 'Orange Money'} PIN
              </Text>
              <Text style={styles.instructionStep}>4. Confirm the payment</Text>
            </View>
          </View>

          {/* Pay Button */}
          <TouchableOpacity
            style={[styles.payButton, isProcessing && styles.disabledButton]}
            onPress={handlePayment}
            disabled={isProcessing}
          >
            <CreditCard size={20} color="white" />
            <Text style={styles.payButtonText}>
              {isProcessing ? 'Processing Payment...' : `Pay ${booking.totalAmount} XAF`}
            </Text>
          </TouchableOpacity>

          <Text style={styles.securityNote}>
            🔒 Your payment is secured with end-to-end encryption
          </Text>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 24,
    gap: 20,
  },
  summaryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryDetails: {
    gap: 12,
  },
  routeInfo: {
    marginBottom: 8,
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
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  paymentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginBottom: 12,
  },
  selectedMethod: {
    borderColor: '#667eea',
    backgroundColor: '#f0f4ff',
  },
  methodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  methodDetails: {
    gap: 2,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  methodDescription: {
    fontSize: 14,
    color: '#666',
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  instructions: {
    gap: 8,
  },
  instructionStep: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  payButton: {
    backgroundColor: '#667eea',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 8,
    gap: 8,
  },
  disabledButton: {
    opacity: 0.7,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
  securityNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});