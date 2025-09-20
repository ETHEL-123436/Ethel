'use client';

import { SignIn } from '@clerk/nextjs';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Car, Users, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SignInPage() {
  const [selectedRole, setSelectedRole] = useState<'driver' | 'passenger' | null>(null);

  if (!selectedRole) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
            <p className="text-gray-800 font-medium">Choose your role to continue signing in</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Passenger Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedRole === 'passenger' 
                  ? 'ring-2 ring-blue-500 shadow-lg bg-blue-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('passenger')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-xl">Passenger</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-800 font-medium text-sm">
                  Looking for rides to your destination
                </p>
              </CardContent>
            </Card>

            {/* Driver Card */}
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-lg ${
                selectedRole === 'driver' 
                  ? 'ring-2 ring-green-500 shadow-lg bg-green-50' 
                  : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedRole('driver')}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Car className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-xl">Driver</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-gray-800 font-medium text-sm">
                  Share your journey and earn money
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign In as {selectedRole === 'driver' ? 'Driver' : 'Passenger'}
          </h1>
          <p className="text-gray-800 font-medium">Enter your credentials to continue</p>
        </div>

        <Card>
          <CardContent className="p-6">
            <SignIn 
              appearance={{
                elements: {
                  formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
                }
              }}
              afterSignInUrl={`/onboarding?role=${selectedRole}`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
