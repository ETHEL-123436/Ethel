'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Star, 
  Car,
  CreditCard,
  Shield,
  ArrowLeft,
  Calendar
} from 'lucide-react';

export default function BookRidePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSeats, setSelectedSeats] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // Mock ride data - in real app, fetch based on rideId
  const ride = {
    id: params.rideId,
    driver: {
      name: 'Sarah Johnson',
      rating: 4.9,
      totalRides: 156,
      phone: '+237 6XX XXX XXX',
      email: 'sarah.j@email.com',
      avatar: 'SJ'
    },
    from: 'Downtown Plaza',
    to: 'International Airport',
    departureTime: '2:30 PM',
    date: 'Today, Dec 15',
    price: 15000, // Updated to XAF
    seatsAvailable: 2,
    duration: '45 min',
    distance: '28 km',
    car: {
      model: 'Toyota Camry',
      color: 'Silver',
      plate: 'CE 1234 AB',
      year: 2022
    },
    amenities: ['AC', 'Music', 'Phone Charger', 'WiFi'],
    pickupLocation: 'Downtown Plaza - Main Entrance',
    dropoffLocation: 'Terminal 2 - Departure Level'
  };

  const totalPrice = ride.price * selectedSeats;
  const serviceFee = Math.round(totalPrice * 0.1);
  const finalTotal = totalPrice + serviceFee;

  const handleBooking = async () => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Redirect to confirmation page
      router.push(`/passenger/booking-confirmation/${ride.id}`);
    } catch (error) {
      console.error('Booking failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
              className="mr-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Book Your Ride</h1>
              <p className="text-sm text-gray-600">Complete your booking</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Trip Details */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Ride Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{ride.from}</p>
                    <p className="text-sm text-gray-700">{ride.pickupLocation}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3 ml-8">
                  <div className="w-px h-8 bg-blue-300"></div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <MapPin className="h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-medium">{ride.to}</p>
                    <p className="text-sm text-gray-700">{ride.dropoffLocation}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span>{ride.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-blue-400" />
                    <span>{ride.departureTime}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Car className="h-4 w-4 text-blue-400" />
                    <span>{ride.duration} • {ride.distance}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-700 font-medium">Available:</span>
                    <span className="font-medium">{ride.seatsAvailable} seats</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Driver Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Your Driver</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-lg">
                      {ride.driver.avatar}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-semibold text-lg">{ride.driver.name}</h3>
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{ride.driver.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{ride.driver.totalRides} rides completed</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <Car className="h-4 w-4 text-gray-600" />
                        <span>{ride.car.year} {ride.car.model}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Color:</span>
                        <span>{ride.car.color}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-gray-600 font-medium">Plate:</span>
                        <span className="font-mono">{ride.car.plate}</span>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 font-medium mb-2">Amenities:</p>
                      <div className="flex flex-wrap gap-2">
                        {ride.amenities.map((amenity, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {amenity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seat Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Seats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="text-sm font-medium">Number of seats:</label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSeats(Math.max(1, selectedSeats - 1))}
                        disabled={selectedSeats <= 1}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-medium">{selectedSeats}</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedSeats(Math.min(ride.seatsAvailable, selectedSeats + 1))}
                        disabled={selectedSeats >= ride.seatsAvailable}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-700">
                    {ride.price.toLocaleString()} XAF per seat • {ride.seatsAvailable} seats available
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="text-black">Payment Method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="card"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-4 h-4 text-blue-600"
                    />
                    <label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                      <CreditCard className="h-4 w-4" />
                      <span>Credit/Debit Card</span>
                    </label>
                  </div>
                </div>
                
                {paymentMethod === 'card' && (
                  <div className="space-y-3 mt-4 p-4 bg-gray-50 rounded-lg border">
                    <Input placeholder="Card Number" />
                    <div className="grid grid-cols-2 gap-3">
                      <Input placeholder="MM/YY" />
                      <Input placeholder="CVC" />
                    </div>
                    <Input placeholder="Cardholder Name" />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Summary */}
          <div className="space-y-6">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="text-black">Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Ride fare ({selectedSeats} seat{selectedSeats > 1 ? 's' : ''})</span>
                    <span>{totalPrice.toLocaleString()} XAF</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Service fee</span>
                    <span>{serviceFee.toLocaleString()} XAF</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{finalTotal.toLocaleString()} XAF</span>
                  </div>
                </div>
                
                <div className="space-y-3 pt-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Shield className="h-4 w-4" />
                    <span>Your payment is protected</span>
                  </div>
                  <div className="text-xs text-gray-600">
                    Free cancellation up to 2 hours before departure
                  </div>
                </div>
                
                <Button 
                  onClick={handleBooking}
                  disabled={isLoading}
                  className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : `Book Ride - ${finalTotal.toLocaleString()} XAF`}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}