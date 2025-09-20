import { UserButton } from '@clerk/nextjs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Car, 
  Users, 
  Shield, 
  Leaf, 
  MapPin, 
  Clock,
  Star,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Car className="h-8 w-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">RideConnect</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/sign-in">
                <Button variant="ghost" className="text-gray-700 hover:text-blue-600">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-12 items-center">
            <div className="max-w-2xl">
              <h1 className="text-4xl sm:text-6xl font-bold text-gray-900 leading-tight">
                Share the ride,{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-green-600">
                  share the savings
                </span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-gray-800 leading-8">
                Connect with fellow travelers going in your direction. Experience safe, 
                affordable, and eco-friendly transportation that brings communities together.
              </p>
              <div className="mt-10 flex items-center gap-4">
                <Link href="/sign-up">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8">
                    Start Your Journey
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="outline" size="lg" className="px-8">
                  Learn More
                </Button>
              </div>
            </div>
            
            <div className="mt-16 lg:mt-0 relative">
              <div className="relative mx-auto w-full max-w-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 rounded-3xl transform rotate-6 opacity-20"></div>
                <div className="relative bg-white rounded-3xl shadow-2xl p-8">
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Available rides nearby</span>
                    </div>
                    <div className="space-y-3">
                      {[
                        { from: 'Downtown', to: 'Airport', time: '2 min', price: '$12' },
                        { from: 'Mall', to: 'University', time: '5 min', price: '$8' },
                        { from: 'Station', to: 'Business District', time: '8 min', price: '$15' }
                      ].map((ride, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <MapPin className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-sm font-medium">{ride.from} → {ride.to}</p>
                              <p className="text-xs text-gray-700">Departing in {ride.time}</p>
                            </div>
                          </div>
                          <span className="text-sm font-bold text-green-600">{ride.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Why Choose RideConnect?
            </h2>
            <p className="text-lg text-gray-800">
              Experience the future of shared transportation with our innovative platform
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: 'Safety First',
                description: 'Verified drivers, real-time tracking, and 24/7 support ensure your safety on every journey.'
              },
              {
                icon: Leaf,
                title: 'Eco-Friendly',
                description: 'Reduce carbon footprint by sharing rides and contributing to a sustainable future.'
              },
              {
                icon: Clock,
                title: 'Time Efficient',
                description: 'Smart matching algorithm connects you with rides that fit your schedule perfectly.'
              },
              {
                icon: Users,
                title: 'Community Driven',
                description: 'Connect with like-minded travelers and build meaningful relationships on the road.'
              },
              {
                icon: Star,
                title: 'Rated Experience',
                description: 'Quality assurance through mutual rating system for drivers and passengers.'
              },
              {
                icon: MapPin,
                title: 'Smart Routing',
                description: 'AI-powered route optimization for efficient and cost-effective travel.'
              }
            ].map((feature, index) => (
              <Card key={index} className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-gray-50 to-white">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-800 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Start Your Journey?
          </h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied users who have made the switch to smarter, 
            more sustainable transportation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/sign-up">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 px-8">
                Sign Up as Passenger
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-600 px-8">
                Sign Up as Driver
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <Car className="h-8 w-8 text-blue-400" />
                <span className="text-2xl font-bold">RideConnect</span>
              </div>
              <p className="text-gray-600 max-w-md">
                Connecting travelers, reducing emissions, and building stronger communities 
                through shared transportation.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Passengers</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#" className="hover:text-white transition-colors">Find a Ride</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Safety</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">For Drivers</h3>
              <ul className="space-y-2 text-gray-600">
                <li><Link href="#" className="hover:text-white transition-colors">Offer a Ride</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Earnings</Link></li>
                <li><Link href="#" className="hover:text-white transition-colors">Requirements</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 RideConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}