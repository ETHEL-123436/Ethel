'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  CheckCircle, 
  MapPin, 
  Clock, 
  Car,
  Phone,
  MessageCircle,
  Calendar,
  Download
} from 'lucide-react';

export default function BookingConfirmationPage() {
  const params = useParams();
  const router = useRouter();

  // Mock booking data
  const booking = {
    id: 'BK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    rideId: params.rideId,
    status: 'confirmed',
    driver: {
      name: 'Sarah Johnson',
      phone: '+237 6XX XXX XXX',
      avatar: 'SJ'
    },
    from: 'Downtown Plaza',
    to: 'International Airport',
    date: 'Today, Dec 15',
    time: '2:30 PM',
    seats: 1,
    total: 28000,
    car: {
      model: 'Toyota Camry',
      color: 'Silver',
      plate: 'CE 1234 AB'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-200">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Booking Confirmed!</h1>
          <p className="text-gray-700">Your ride has been successfully booked</p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Booking Details</CardTitle>
              <Badge className="bg-green-100 text-green-800">Confirmed</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Booking ID</span>
                <p className="font-mono font-medium">{booking.id}</p>
              </div>
              <div>
                <span className="text-gray-600">Total Paid</span>
                <p className="font-bold text-lg">{booking.total.toLocaleString()} XAF</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">{booking.from}</p>
                  <p className="text-sm text-gray-600">Pickup location</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 ml-8">
                <div className="w-px h-8 bg-gray-300"></div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium">{booking.to}</p>
                  <p className="text-sm text-gray-600">Drop-off location</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{booking.date}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className="text-sm">{booking.time}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Driver Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Your Driver</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-800 font-semibold">
                  {booking.driver.avatar}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{booking.driver.name}</h3>
                <p className="text-sm text-gray-600">{booking.car.color} {booking.car.model}</p>
                <p className="text-sm text-gray-600">Plate: {booking.car.plate}</p>
              </div>
              <div className="flex space-x-2">
                <Button size="sm" variant="outline">
                  <Phone className="h-4 w-4 mr-1" />
                  Call
                </Button>
                <Button size="sm" variant="outline">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Important Information */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
              <p className="text-gray-700">Please arrive at the pickup location 5 minutes before departure time</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
              <p className="text-gray-700">Your driver will contact you when they arrive at the pickup location</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
              <p className="text-gray-700">Free cancellation up to 2 hours before departure</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-gray-800 rounded-full mt-2"></div>
              <p className="text-gray-700">Keep your booking ID handy for reference</p>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={() => router.push('/passenger/dashboard')}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white"
          >
            Go to Dashboard
          </Button>
          <Button variant="outline" className="w-full">
            <Download className="h-4 w-4 mr-2" />
            Download Receipt
          </Button>
        </div>
      </div>
    </div>
  );
}