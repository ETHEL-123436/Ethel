'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import MapComponent from '@/components/mapComponents';
import { 
  Car, 
  MapPin, 
  Clock, 
  DollarSign, 
  Users,
  Plus,
  Settings,
  Star,
  TrendingUp,
  Calendar
} from 'lucide-react';

export default function DriverDashboard() {
  const { user } = useUser();
  const [isAvailable, setIsAvailable] = useState(false);

  // Mock data for driver's rides
  const activeRides = [
    {
      id: 1,
      from: 'Downtown Plaza',
      to: 'International Airport',
      date: 'Today',
      time: '2:30 PM',
      passengers: ['Sarah M.', 'John D.'],
      seatsBooked: 2,
      totalSeats: 4,
      earnings: 50
    },
    {
      id: 2,
      from: 'University Campus',
      to: 'Business District',
      date: 'Tomorrow',
      time: '8:00 AM',
      passengers: ['Emma W.'],
      seatsBooked: 1,
      totalSeats: 3,
      earnings: 18
    }
  ];

  const rideRequests = [
    {
      id: 1,
      passenger: 'Mike Chen',
      rating: 4.8,
      from: 'Central Station',
      to: 'Shopping Mall',
      requestedTime: '3:45 PM',
      offering: 15
    },
    {
      id: 2,
      passenger: 'Lisa Anderson',
      rating: 4.9,
      from: 'Airport',
      to: 'Downtown',
      requestedTime: '6:20 PM',
      offering: 28
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Car className="h-8 w-8 text-green-600" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">RideConnect</h1>
                <p className="text-sm text-gray-500">Driver Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-700">Available</span>
                <Switch
                  checked={isAvailable}
                  onCheckedChange={setIsAvailable}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <span className="text-sm text-gray-700">
                Welcome, {user?.firstName}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Today's Earnings</p>
                  <p className="text-2xl font-bold text-green-600">$68</p>
                </div>
                <DollarSign className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Rides</p>
                  <p className="text-2xl font-bold text-blue-600">2</p>
                </div>
                <Car className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Rating</p>
                  <p className="text-2xl font-bold text-yellow-600">4.9</p>
                </div>
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Passengers</p>
                  <p className="text-2xl font-bold text-purple-600">147</p>
                </div>
                <Users className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Create New Ride */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center space-x-2">
                    <Plus className="h-5 w-5 text-green-600" />
                    <span>Offer a New Ride</span>
                  </span>
                  <Button className="bg-green-600 hover:bg-green-700">
                    Create Ride
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Starting location" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="Destination" className="pl-10" />
                    </div>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input type="date" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <Input type="time" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Available Seats</label>
                    <Input type="number" placeholder="1" min="1" max="8" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price per Seat</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input placeholder="15" className="pl-10" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Car Model</label>
                    <Input placeholder="e.g., Toyota Camry" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Active Rides */}
            <Card>
              <CardHeader>
                <CardTitle>Your Active Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activeRides.map((ride) => (
                    <div key={ride.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="text-sm font-medium">{ride.from} → {ride.to}</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">
                          ${ride.earnings}
                        </Badge>
                      </div>
                      
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{ride.date}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{ride.time}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="h-4 w-4" />
                            <span>{ride.seatsBooked}/{ride.totalSeats} seats</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Passengers:</span>
                          <div className="flex space-x-2">
                            {ride.passengers.map((passenger, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {passenger}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="space-x-2">
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Message
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Live Map */}
            <Card>
              <CardHeader>
                <CardTitle>Live Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <MapComponent
                  height="350px"
                  showDirections={true}
                  origin={{ lat: 40.7589, lng: -73.9851 }}
                  destination={{ lat: 40.6413, lng: -73.7781 }}
                  markers={[
                    {
                      id: 'pickup',
                      position: { lat: 40.7589, lng: -73.9851 },
                      title: 'Pickup: Downtown Plaza',
                      type: 'pickup'
                    },
                    {
                      id: 'dropoff',
                      position: { lat: 40.6413, lng: -73.7781 },
                      title: 'Dropoff: International Airport',
                      type: 'dropoff'
                    },
                    {
                      id: 'driver',
                      position: { lat: 40.7505, lng: -73.9934 },
                      title: 'Your Current Location',
                      type: 'driver'
                    },
                    {
                      id: 'passenger1',
                      position: { lat: 40.7580, lng: -73.9855 },
                      title: 'Sarah M.',
                      type: 'passenger'
                    }
                  ]}
                  currentLocation={{ lat: 40.7505, lng: -73.9934 }}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Ride Requests */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Ride Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rideRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium text-xs">
                              {request.passenger.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="text-sm font-medium">{request.passenger}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-3 w-3 text-yellow-400 fill-current" />
                              <span className="text-xs text-gray-600">{request.rating}</span>
                            </div>
                          </div>
                        </div>
                        <Badge className="bg-green-100 text-green-800 text-xs">
                          ${request.offering}
                        </Badge>
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-2">
                        {request.from} → {request.to}
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">{request.requestedTime}</span>
                        <div className="space-x-1">
                          <Button size="sm" variant="outline" className="text-xs px-2 py-1">
                            Decline
                          </Button>
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1">
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Earnings Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Earnings</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Week</span>
                    <span className="font-semibold text-green-600">$284</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">This Month</span>
                    <span className="font-semibold text-green-600">$1,127</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Total Earned</span>
                    <span className="font-semibold text-green-600">$5,840</span>
                  </div>
                  <hr />
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Pending</span>
                    <span className="font-semibold">$68</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Car className="h-4 w-4 mr-2" />
                  Vehicle Settings
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Preferences
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Earnings Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}