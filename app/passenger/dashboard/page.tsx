'use client';

import { useState } from 'react';
import { useUser, UserButton } from '@clerk/nextjs';
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import MapComponent from '@/components/mapComponents';
import { 
  MapPin, 
  Search, 
  Clock, 
  Star, 
  Car,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react';
import Link from 'next/link';

export default function PassengerDashboard() {
  const { user } = useUser();
  const [searchFrom, setSearchFrom] = useState('');
  const [searchTo, setSearchTo] = useState('');

  // Mock data for available rides
  const availableRides = [
    {
      id: 1,
      driver: 'Sarah Johnson',
      rating: 4.9,
      from: 'Downtown Plaza',
      to: 'International Airport',
      departureTime: '2:30 PM',
      date: 'Today',
      price: 25,
      seatsAvailable: 2,
      duration: '45 min',
      car: 'Toyota Camry'
    },
    {
      id: 2,
      driver: 'Mike Chen',
      rating: 4.8,
      from: 'University Campus',
      to: 'Shopping Mall',
      departureTime: '4:15 PM',
      date: 'Today',
      price: 12,
      seatsAvailable: 3,
      duration: '25 min',
      car: 'Honda Civic'
    },
    {
      id: 3,
      driver: 'Emma Wilson',
      rating: 5.0,
      from: 'Central Station',
      to: 'Business District',
      departureTime: '8:00 AM',
      date: 'Tomorrow',
      price: 18,
      seatsAvailable: 1,
      duration: '35 min',
      car: 'BMW 3 Series'
    }
  ];

  const recentRides = [
    {
      id: 1,
      driver: 'John Smith',
      route: 'Home → Office',
      date: 'Yesterday',
      amount: 15,
      status: 'completed'
    },
    {
      id: 2,
      driver: 'Lisa Brown',
      route: 'Mall → Home',
      date: '2 days ago',
      amount: 12,
      status: 'completed'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Car className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">RideConnect</h1>
                <p className="text-sm font-medium text-gray-800">Passenger Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm font-bold text-gray-900">
                Welcome, {user?.firstName}
              </span>
              <UserButton afterSignOutUrl="/" />
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Search Section */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-blue-600" />
                  <span>Find Your Ride</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Left: Search controls */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">From</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-700 font-medium" />
                          <Input
                            placeholder="Enter pickup location"
                            value={searchFrom}
                            onChange={(e) => setSearchFrom(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-1">To</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-700 font-medium" />
                          <Input
                            placeholder="Enter destination"
                            value={searchTo}
                            onChange={(e) => setSearchTo(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 items-center">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-gray-700 font-medium" />
                        <Input type="date" className="w-40" />
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-700 font-medium" />
                        <Input type="time" className="w-32" />
                      </div>
                      <Button className="bg-blue-600 hover:bg-blue-700">
                        <Search className="h-4 w-4 mr-2" />
                        Search Rides
                      </Button>
                      <Button variant="outline">
                        <Filter className="h-4 w-4 mr-2" />
                        Filters
                      </Button>
                    </div>
                  </div>
                  {/* Right: Map */}
                  <div className="min-h-[300px]">
                    <MapComponent
                      height="100%"
                      markers={[
                        {
                          id: '1',
                          position: { lat: 40.7589, lng: -73.9851 },
                          title: 'Available Ride to Airport',
                          type: 'driver'
                        },
                        {
                          id: '2',
                          position: { lat: 40.7505, lng: -73.9934 },
                          title: 'Available Ride to Mall',
                          type: 'driver'
                        },
                        {
                          id: '3',
                          position: { lat: 40.7614, lng: -73.9776 },
                          title: 'Your Location',
                          type: 'passenger'
                        }
                      ]}
                      currentLocation={{ lat: 40.7614, lng: -73.9776 }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Available Rides */}
            <Card>
              <CardHeader>
                <CardTitle>Available Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {availableRides.map((ride) => (
                    <div key={ride.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-sm">
                              {ride.driver.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <p className="font-bold text-gray-900">{ride.driver}</p>
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-yellow-400 fill-current" />
                              <span className="text-sm font-bold text-gray-900">{ride.rating}</span>
                              <span className="text-xs font-medium text-gray-700">• {ride.car}</span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-green-600 bg-green-50">
                          {ride.seatsAvailable} seats available
                        </Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2 mb-3">
                        <MapPin className="h-4 w-4 text-gray-700 font-medium" />
                        <span className="text-sm font-bold text-gray-900">{ride.from}</span>
                        <span className="text-gray-700 font-medium">→</span>
                        <span className="text-sm font-bold text-gray-900">{ride.to}</span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 text-sm text-gray-900">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4" />
                            <span>{ride.date} at {ride.departureTime}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="font-bold text-gray-900">${ride.price}</span>
                          </div>
                        </div>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          <Link href={`/passenger/book/${ride.id}`}>
                            Book Ride
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total Rides</span>
                    <span className="font-bold">24</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Money Saved</span>
                    <span className="font-bold text-green-600">$340</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">Rating</span>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="font-bold">4.8</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-gray-900">CO₂ Saved</span>
                    <span className="font-bold text-green-600">125 kg</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Rides */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Rides</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentRides.map((ride) => (
                    <div key={ride.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-gray-900">{ride.route}</p>
                          <p className="font-medium text-gray-800">with {ride.driver}</p>
                          <p className="font-medium text-gray-800">{ride.date}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">${ride.amount}</p>
                          <Badge variant="outline" className="text-xs">
                            {ride.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
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
                  <MapPin className="h-4 w-4 mr-2" />
                  Saved Locations
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Clock className="h-4 w-4 mr-2" />
                  Scheduled Rides
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Star className="h-4 w-4 mr-2" />
                  Rate Your Rides
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}